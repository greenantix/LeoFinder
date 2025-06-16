import fs from 'fs';
import path from 'path';
import { Listing } from '../types/index';

interface KeywordCategory {
  weight: number;
  terms: string[];
}

interface Keywords {
  [key: string]: KeywordCategory;
}

export class ScoringService {
  private keywords: Keywords = {};

  constructor() {
    this.loadKeywords();
  }

  private loadKeywords(): void {
    try {
      // Try multiple possible locations for keywords.json
      const possiblePaths = [
        path.join(__dirname, 'keywords.json'),
        path.join(__dirname, '..', 'keywords.json'),
        path.join(process.cwd(), 'keywords.json'),
        path.join(process.cwd(), 'server', 'keywords.json')
      ];
      
      let keywordsData = '';
      for (const keywordsPath of possiblePaths) {
        try {
          keywordsData = fs.readFileSync(keywordsPath, 'utf8');
          console.log(`Keywords loaded from: ${keywordsPath}`);
          break;
        } catch (error) {
          continue; // Try next path
        }
      }
      
      if (keywordsData) {
        this.keywords = JSON.parse(keywordsData);
      } else {
        throw new Error('Keywords file not found in any location');
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
      // Fallback keywords if file can't be loaded
      this.keywords = {
        owner_finance: { weight: 25, terms: ['owner finance', 'seller finance'] },
        lease_to_own: { weight: 20, terms: ['lease to own', 'rent to own'] },
        motivated_seller: { weight: 15, terms: ['motivated seller', 'must sell'] }
      };
    }
  }

  async scoreListing(listing: Listing): Promise<Listing> {
    const text = this.prepareTextForScoring(listing);
    const matchedKeywords = this.findMatchingKeywords(text);
    const score = this.calculateScore(matchedKeywords);
    const flags = this.determineFlags(matchedKeywords);
    const insights = this.generateInsights(matchedKeywords, text);

    return {
      ...listing,
      match_score: Math.min(100, Math.max(0, score)),
      flags: { ...listing.flags, ...flags },
      claudeInsights: insights
    };
  }

  private prepareTextForScoring(listing: Listing): string {
    const textParts = [
      listing.description || '',
      listing.address || '',
      listing.ai_summary || '',
      listing.emailDraft || '',
    ];

    return textParts.join(' ').toLowerCase();
  }

  private findMatchingKeywords(text: string): { [category: string]: string[] } {
    const matches: { [category: string]: string[] } = {};

    for (const [category, keywordData] of Object.entries(this.keywords)) {
      const foundTerms: string[] = [];
      
      for (const term of keywordData.terms) {
        if (text.includes(term.toLowerCase())) {
          foundTerms.push(term);
        }
      }

      if (foundTerms.length > 0) {
        matches[category] = foundTerms;
      }
    }

    return matches;
  }

  private calculateScore(matchedKeywords: { [category: string]: string[] }): number {
    let totalScore = 0;

    for (const [category, terms] of Object.entries(matchedKeywords)) {
      const categoryData = this.keywords[category];
      if (categoryData) {
        // Base weight for the category
        let categoryScore = categoryData.weight;
        
        // Bonus for multiple terms in the same category
        if (terms.length > 1) {
          categoryScore += Math.min(terms.length - 1, 3) * 2;
        }

        totalScore += categoryScore;
      }
    }

    // Base score for any listing
    const baseScore = 10;
    
    return baseScore + totalScore;
  }

  private determineFlags(matchedKeywords: { [category: string]: string[] }): Partial<Listing['flags']> {
    const flags: Partial<Listing['flags']> = {};

    if (matchedKeywords.owner_finance) {
      flags.owner_finance = true;
    }

    if (matchedKeywords.lease_to_own) {
      flags.lease_to_own = true;
    }

    if (matchedKeywords.no_credit_check) {
      flags.no_credit_check = true;
    }

    if (matchedKeywords.va_eligible) {
      flags.va_eligible = true;
      flags.usda_eligible = true; // Often go together
    }

    // Contract for deed is often mentioned with owner financing
    if (matchedKeywords.owner_finance && 
        matchedKeywords.owner_finance.some(term => 
          term.includes('contract for deed') || term.includes('land contract')
        )) {
      flags.contract_for_deed = true;
    }

    return flags;
  }

  private generateInsights(
    matchedKeywords: { [category: string]: string[] }, 
    text: string
  ): Listing['claudeInsights'] {
    const insights: Listing['claudeInsights'] = {
      noMoneyDown: 'no',
      flexibleTerms: 'no',
      dogFriendly: 'no'
    };

    // No money down analysis
    if (matchedKeywords.no_money_down || matchedKeywords.owner_finance) {
      insights.noMoneyDown = 'yes';
    } else if (matchedKeywords.flexible_terms || matchedKeywords.motivated_seller) {
      insights.noMoneyDown = 'maybe';
    }

    // Flexible terms analysis
    if (matchedKeywords.flexible_terms || matchedKeywords.owner_finance || 
        matchedKeywords.lease_to_own || matchedKeywords.no_credit_check) {
      insights.flexibleTerms = 'yes';
    } else if (matchedKeywords.motivated_seller) {
      insights.flexibleTerms = 'maybe';
    }

    // Dog friendly analysis
    if (matchedKeywords.dog_friendly) {
      insights.dogFriendly = 'yes';
    } else if (text.includes('yard') || text.includes('fence') || text.includes('acre')) {
      insights.dogFriendly = 'maybe';
    }

    return insights;
  }

  getKeywordCategories(): string[] {
    return Object.keys(this.keywords);
  }

  getKeywordsForCategory(category: string): string[] {
    return this.keywords[category]?.terms || [];
  }

  updateKeywords(newKeywords: Keywords): void {
    this.keywords = { ...this.keywords, ...newKeywords };
    this.saveKeywords();
  }

  private saveKeywords(): void {
    try {
      const keywordsPath = path.join(__dirname, '..', 'keywords.json');
      fs.writeFileSync(keywordsPath, JSON.stringify(this.keywords, null, 2));
    } catch (error) {
      console.error('Error saving keywords:', error);
    }
  }
}

export const scoringService = new ScoringService();