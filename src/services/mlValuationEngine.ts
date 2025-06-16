import { Listing } from '../types/listing';

interface PropertyFeatures {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  zipCode: string;
  propertyType: string;
  hasGarage: boolean;
  hasPool: boolean;
  hasFireplace: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  neighborhood: 'premium' | 'standard' | 'emerging' | 'distressed';
}

interface MarketData {
  medianPrice: number;
  pricePerSqft: number;
  daysOnMarket: number;
  monthlyAppreciation: number;
  demandScore: number;
  supplyScore: number;
}

interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  priceRange: { low: number; high: number };
  compScore: number;
  marketScore: number;
  conditionScore: number;
  locationScore: number;
  dealQuality: 'excellent' | 'good' | 'fair' | 'poor';
  insights: string[];
  comparables: Comparable[];
}

interface Comparable {
  address: string;
  price: number;
  sqft: number;
  similarity: number;
  adjustedPrice: number;
}

export class MLValuationEngine {
  private weights = {
    sqft: 0.35,
    location: 0.25,
    bedrooms: 0.15,
    bathrooms: 0.10,
    yearBuilt: 0.08,
    condition: 0.07
  };

  private marketCache = new Map<string, MarketData>();
  private comparablesCache = new Map<string, Comparable[]>();

  async valuateProperty(listing: Listing): Promise<ValuationResult> {
    const features = this.extractFeatures(listing);
    const marketData = await this.getMarketData(features.zipCode);
    const comparables = await this.findComparables(features);
    
    // ML-style scoring
    const compScore = this.calculateComparableScore(features, comparables);
    const marketScore = this.calculateMarketScore(marketData);
    const conditionScore = this.calculateConditionScore(features);
    const locationScore = this.calculateLocationScore(features, marketData);
    
    // Weighted valuation
    const baseValue = this.calculateBaseValue(features, marketData);
    const adjustedValue = this.applyMLAdjustments(baseValue, {
      compScore,
      marketScore,
      conditionScore,
      locationScore
    });
    
    const confidence = this.calculateConfidence(comparables.length, marketData.demandScore);
    const priceRange = this.calculatePriceRange(adjustedValue, confidence);
    
    return {
      estimatedValue: Math.round(adjustedValue),
      confidence,
      priceRange,
      compScore,
      marketScore,
      conditionScore,
      locationScore,
      dealQuality: this.assessDealQuality(listing.price || 0, adjustedValue),
      insights: this.generateInsights(listing, adjustedValue, marketData),
      comparables: comparables.slice(0, 5)
    };
  }

  private extractFeatures(listing: Listing): PropertyFeatures {
    return {
      sqft: listing.sqft || 1500,
      bedrooms: listing.bedrooms || 3,
      bathrooms: listing.bathrooms || 2,
      yearBuilt: listing.yearBuilt || 2000,
      lotSize: listing.lotSize || 0.25,
      zipCode: listing.zipCode || '85001',
      propertyType: listing.propertyType || 'Single Family',
      hasGarage: listing.description?.toLowerCase().includes('garage') || false,
      hasPool: listing.description?.toLowerCase().includes('pool') || false,
      hasFireplace: listing.description?.toLowerCase().includes('fireplace') || false,
      condition: this.inferCondition(listing.description || ''),
      neighborhood: this.inferNeighborhood(listing.address, listing.zipCode || '')
    };
  }

  private async getMarketData(zipCode: string): Promise<MarketData> {
    if (this.marketCache.has(zipCode)) {
      return this.marketCache.get(zipCode)!;
    }

    // Simulate ML-predicted market data (in production, call real APIs)
    const marketData: MarketData = {
      medianPrice: this.simulateMedianPrice(zipCode),
      pricePerSqft: this.simulatePricePerSqft(zipCode),
      daysOnMarket: 25 + Math.random() * 40,
      monthlyAppreciation: (Math.random() * 2 - 0.5) / 100, // -0.5% to 1.5%
      demandScore: Math.random() * 100,
      supplyScore: Math.random() * 100
    };

    this.marketCache.set(zipCode, marketData);
    return marketData;
  }

  private async findComparables(features: PropertyFeatures): Promise<Comparable[]> {
    const cacheKey = `${features.zipCode}_${features.sqft}_${features.bedrooms}`;
    
    if (this.comparablesCache.has(cacheKey)) {
      return this.comparablesCache.get(cacheKey)!;
    }

    // Simulate ML-found comparables
    const comparables: Comparable[] = [];
    
    for (let i = 0; i < 8; i++) {
      const sqftVariation = 0.8 + Math.random() * 0.4; // ±20%
      const priceVariation = 0.85 + Math.random() * 0.3; // ±15%
      
      const comp: Comparable = {
        address: this.generateComparableAddress(features.zipCode, i),
        sqft: Math.round(features.sqft * sqftVariation),
        price: Math.round(this.simulateMedianPrice(features.zipCode) * priceVariation),
        similarity: 0.7 + Math.random() * 0.3, // 70-100% similar
        adjustedPrice: 0
      };
      
      comp.adjustedPrice = this.adjustComparable(comp, features);
      comparables.push(comp);
    }

    // Sort by similarity
    comparables.sort((a, b) => b.similarity - a.similarity);
    
    this.comparablesCache.set(cacheKey, comparables);
    return comparables;
  }

  private calculateComparableScore(features: PropertyFeatures, comparables: Comparable[]): number {
    if (comparables.length === 0) return 50;
    
    const avgPrice = comparables.reduce((sum, comp) => sum + comp.adjustedPrice, 0) / comparables.length;
    const priceVariance = this.calculateVariance(comparables.map(c => c.adjustedPrice));
    const avgSimilarity = comparables.reduce((sum, comp) => sum + comp.similarity, 0) / comparables.length;
    
    // Lower variance and higher similarity = higher score
    const varianceScore = Math.max(0, 100 - (priceVariance / avgPrice * 100));
    const similarityScore = avgSimilarity * 100;
    
    return Math.round((varianceScore + similarityScore) / 2);
  }

  private calculateMarketScore(marketData: MarketData): number {
    // High demand + low supply + positive appreciation = high score
    const demandWeight = 0.4;
    const supplyWeight = 0.3; // Inverse relationship
    const appreciationWeight = 0.3;
    
    const demandScore = marketData.demandScore;
    const supplyScore = 100 - marketData.supplyScore; // Invert supply (lower supply = better)
    const appreciationScore = Math.max(0, Math.min(100, (marketData.monthlyAppreciation + 0.005) * 10000));
    
    return Math.round(
      demandScore * demandWeight +
      supplyScore * supplyWeight +
      appreciationScore * appreciationWeight
    );
  }

  private calculateConditionScore(features: PropertyFeatures): number {
    const conditionScores = {
      excellent: 95,
      good: 80,
      fair: 60,
      poor: 30
    };
    
    let score = conditionScores[features.condition];
    
    // Adjust for age
    const age = new Date().getFullYear() - features.yearBuilt;
    if (age < 10) score += 5;
    else if (age > 30) score -= 10;
    
    // Adjust for features
    if (features.hasPool) score += 3;
    if (features.hasFireplace) score += 2;
    if (features.hasGarage) score += 2;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateLocationScore(features: PropertyFeatures, marketData: MarketData): number {
    const neighborhoodScores = {
      premium: 90,
      standard: 70,
      emerging: 60,
      distressed: 40
    };
    
    let score = neighborhoodScores[features.neighborhood];
    
    // Adjust for market conditions
    if (marketData.monthlyAppreciation > 0.01) score += 10;
    if (marketData.daysOnMarket < 20) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateBaseValue(features: PropertyFeatures, marketData: MarketData): number {
    // Start with price per sqft
    let value = features.sqft * marketData.pricePerSqft;
    
    // Bedroom/bathroom premium
    value += (features.bedrooms - 3) * 15000;
    value += (features.bathrooms - 2) * 10000;
    
    // Lot size premium
    if (features.lotSize > 0.5) {
      value += (features.lotSize - 0.5) * 20000;
    }
    
    return value;
  }

  private applyMLAdjustments(baseValue: number, scores: {
    compScore: number;
    marketScore: number;
    conditionScore: number;
    locationScore: number;
  }): number {
    // Neural network-style weighted adjustments
    const compAdjustment = (scores.compScore - 50) / 100 * 0.15;
    const marketAdjustment = (scores.marketScore - 50) / 100 * 0.20;
    const conditionAdjustment = (scores.conditionScore - 50) / 100 * 0.10;
    const locationAdjustment = (scores.locationScore - 50) / 100 * 0.25;
    
    const totalAdjustment = 1 + compAdjustment + marketAdjustment + conditionAdjustment + locationAdjustment;
    
    return baseValue * totalAdjustment;
  }

  private calculateConfidence(comparableCount: number, demandScore: number): number {
    const countScore = Math.min(100, comparableCount * 12.5); // Max at 8 comparables
    const demandConfidence = demandScore;
    
    return Math.round((countScore + demandConfidence) / 2);
  }

  private calculatePriceRange(value: number, confidence: number): { low: number; high: number } {
    const margin = (100 - confidence) / 100 * 0.15; // 0-15% margin based on confidence
    
    return {
      low: Math.round(value * (1 - margin)),
      high: Math.round(value * (1 + margin))
    };
  }

  private assessDealQuality(listPrice: number, estimatedValue: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (listPrice === 0) return 'fair';
    
    const discount = (estimatedValue - listPrice) / estimatedValue;
    
    if (discount > 0.20) return 'excellent';
    if (discount > 0.10) return 'good';
    if (discount > -0.05) return 'fair';
    return 'poor';
  }

  private generateInsights(listing: Listing, estimatedValue: number, marketData: MarketData): string[] {
    const insights: string[] = [];
    const listPrice = listing.price || 0;
    
    if (listPrice > 0) {
      const discount = (estimatedValue - listPrice) / estimatedValue;
      if (discount > 0.15) {
        insights.push(`🎯 Exceptional deal! Listed ${Math.round(discount * 100)}% below estimated value`);
      } else if (discount < -0.10) {
        insights.push(`⚠️ Overpriced by ${Math.round(Math.abs(discount) * 100)}%`);
      }
    }
    
    if (marketData.monthlyAppreciation > 0.01) {
      insights.push(`📈 Strong appreciation trend: ${(marketData.monthlyAppreciation * 100).toFixed(1)}%/month`);
    }
    
    if (marketData.daysOnMarket < 20) {
      insights.push(`🔥 Hot market: Properties selling in ${Math.round(marketData.daysOnMarket)} days`);
    }
    
    if (listing.creativeFinancing?.ownerFinancing) {
      insights.push(`💰 Owner financing reduces effective cost by 15-25%`);
    }
    
    if (listing.score && listing.score > 80) {
      insights.push(`⭐ High LEO score indicates excellent investment potential`);
    }
    
    return insights;
  }

  // Helper methods
  private simulateMedianPrice(zipCode: string): number {
    const seed = parseInt(zipCode) % 1000;
    return 200000 + seed * 300 + Math.random() * 100000;
  }

  private simulatePricePerSqft(zipCode: string): number {
    const seed = parseInt(zipCode) % 1000;
    return 120 + seed * 0.2 + Math.random() * 50;
  }

  private generateComparableAddress(zipCode: string, index: number): string {
    const streets = ['Oak St', 'Main Ave', 'Elm Dr', 'Pine Blvd', 'Cedar Way', 'Maple Ln', 'Birch Ct', 'Ash Pl'];
    const number = 1000 + index * 100 + Math.floor(Math.random() * 99);
    return `${number} ${streets[index % streets.length]}, ${zipCode}`;
  }

  private adjustComparable(comp: Comparable, features: PropertyFeatures): number {
    let adjusted = comp.price;
    
    // Adjust for size difference
    const sizeDiff = (features.sqft - comp.sqft) / comp.sqft;
    adjusted *= (1 + sizeDiff * 0.5);
    
    // Add similarity-based confidence
    adjusted *= comp.similarity;
    
    return adjusted;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private inferCondition(description: string): 'excellent' | 'good' | 'fair' | 'poor' {
    const excellent = ['renovated', 'updated', 'new', 'pristine', 'immaculate'];
    const good = ['well maintained', 'good condition', 'move-in ready'];
    const poor = ['needs work', 'fixer', 'as-is', 'tlc', 'handyman'];
    
    const desc = description.toLowerCase();
    
    if (excellent.some(word => desc.includes(word))) return 'excellent';
    if (poor.some(word => desc.includes(word))) return 'poor';
    if (good.some(word => desc.includes(word))) return 'good';
    
    return 'fair';
  }

  private inferNeighborhood(address: string, zipCode: string): 'premium' | 'standard' | 'emerging' | 'distressed' {
    // Simulate neighborhood classification based on ZIP patterns
    const zip = parseInt(zipCode);
    const lastDigit = zip % 10;
    
    if (lastDigit >= 7) return 'premium';
    if (lastDigit >= 4) return 'standard';
    if (lastDigit >= 2) return 'emerging';
    return 'distressed';
  }
}

export const mlValuationEngine = new MLValuationEngine();