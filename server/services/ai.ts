import Anthropic from '@anthropic-ai/sdk';
import { Listing } from '../types/index';

export interface EmailGenerationRequest {
  listing: Listing;
  userPersona?: string;
  emailType?: 'inquiry' | 'offer' | 'followup';
}

export interface EmailGenerationResponse {
  subject: string;
  body: string;
  tone: string;
  keyPoints: string[];
}

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
  }

  async generateOutreachEmail(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      return this.parseEmailResponse(responseText);
    } catch (error) {
      console.error('Error generating email:', error);
      throw new Error(`Failed to generate email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(request: EmailGenerationRequest): string {
    const { listing, userPersona, emailType = 'inquiry' } = request;
    
    const defaultPersona = "a veteran with two dogs looking for a home with no money down and flexible financing options";
    const persona = userPersona || defaultPersona;

    const creativeFinancingFlags = [];
    if (listing.flags.owner_finance) creativeFinancingFlags.push('Owner Financing Available');
    if (listing.flags.lease_to_own) creativeFinancingFlags.push('Lease-to-Own Available');
    if (listing.flags.no_credit_check) creativeFinancingFlags.push('No Credit Check Required');
    if (listing.flags.contract_for_deed) creativeFinancingFlags.push('Contract for Deed Available');

    const prompt = `
You are a professional real estate communication specialist. Write a personalized email ${emailType} for a property listing.

BUYER PERSONA: ${persona}

PROPERTY DETAILS:
- Address: ${listing.address}
- Price: $${listing.price.toLocaleString()}
- Property Type: ${listing.property_type}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square Feet: ${listing.sqft ? listing.sqft.toLocaleString() : 'Not specified'}
- Description: ${listing.description}
- Creative Financing Options: ${creativeFinancingFlags.length > 0 ? creativeFinancingFlags.join(', ') : 'Standard financing'}
- Match Score: ${listing.match_score}/100

CONTACT INFORMATION:
${listing.contact_info?.name ? `Name: ${listing.contact_info.name}` : ''}
${listing.contact_info?.email ? `Email: ${listing.contact_info.email}` : ''}
${listing.contact_info?.phone ? `Phone: ${listing.contact_info.phone}` : ''}

INSTRUCTIONS:
1. Write a professional but warm email that demonstrates genuine interest
2. Reference specific details about the property that align with the buyer's needs
3. If creative financing options are available, mention interest in those specific options
4. Keep the tone conversational and authentic, not overly salesy
5. Include specific questions about the property or financing that show serious intent
6. If the buyer is a veteran, mention VA loan eligibility where appropriate
7. If dogs are mentioned in persona, ask about pet-friendly policies if relevant

Please format your response as:
SUBJECT: [email subject line]

BODY:
[email body]

TONE: [describe the tone used]

KEY_POINTS:
- [key point 1]
- [key point 2]
- [key point 3]
`;

    return prompt;
  }

  private parseEmailResponse(response: string): EmailGenerationResponse {
    const sections = {
      subject: '',
      body: '',
      tone: '',
      keyPoints: [] as string[]
    };

    const lines = response.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.startsWith('SUBJECT:')) {
        currentSection = 'subject';
        sections.subject = line.replace('SUBJECT:', '').trim();
      } else if (line.startsWith('BODY:')) {
        currentSection = 'body';
      } else if (line.startsWith('TONE:')) {
        currentSection = 'tone';
        sections.tone = line.replace('TONE:', '').trim();
      } else if (line.startsWith('KEY_POINTS:')) {
        currentSection = 'keyPoints';
      } else if (currentSection === 'body' && line.trim()) {
        sections.body += line + '\n';
      } else if (currentSection === 'keyPoints' && line.startsWith('- ')) {
        sections.keyPoints.push(line.replace('- ', '').trim());
      }
    }

    // Clean up body
    sections.body = sections.body.trim();

    // Fallback if parsing fails
    if (!sections.subject || !sections.body) {
      sections.subject = 'Inquiry About Your Property Listing';
      sections.body = response.trim();
      sections.tone = 'Professional and friendly';
      sections.keyPoints = ['Property inquiry', 'Interest in viewing', 'Financing questions'];
    }

    return sections;
  }

  async generatePropertySummary(listing: Listing): Promise<string> {
    try {
      const prompt = `
Analyze this property listing and create a concise summary highlighting its investment potential and creative financing opportunities.

PROPERTY DETAILS:
- Address: ${listing.address}
- Price: $${listing.price.toLocaleString()}
- Description: ${listing.description}
- Match Score: ${listing.match_score}/100

Focus on:
1. Key selling points
2. Investment potential
3. Creative financing opportunities
4. Any red flags or concerns
5. Overall recommendation (1-2 sentences max)

Keep the summary under 150 words and make it actionable for an investor.
`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 300,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate summary';
    } catch (error) {
      console.error('Error generating property summary:', error);
      return 'Error generating property summary';
    }
  }

  async analyzeMeetingNotes(notes: string, listingId: string): Promise<{
    summary: string;
    actionItems: string[];
    nextSteps: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> {
    try {
      const prompt = `
Analyze these meeting/call notes from a real estate conversation and extract key information:

NOTES:
${notes}

Please provide:
1. A brief summary of the conversation
2. Action items that need to be completed
3. Next steps in the process
4. Overall sentiment (positive/neutral/negative)

Format as JSON:
{
  "summary": "Brief summary here",
  "actionItems": ["action 1", "action 2"],
  "nextSteps": ["step 1", "step 2"],
  "sentiment": "positive|neutral|negative"
}
`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 400,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}';
      
      try {
        return JSON.parse(responseText);
      } catch {
        // Fallback if JSON parsing fails
        return {
          summary: responseText,
          actionItems: [],
          nextSteps: [],
          sentiment: 'neutral' as const
        };
      }
    } catch (error) {
      console.error('Error analyzing meeting notes:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();