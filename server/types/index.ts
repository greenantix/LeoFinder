export interface Listing {
  id: string;
  address: string;
  price: number;
  source: 'zillow' | 'craigslist' | 'foreclosure' | 'other';
  url: string;
  description: string;
  images: string[];
  flags: {
    va_eligible: boolean;
    contract_for_deed: boolean;
    owner_finance: boolean;
    lease_to_own: boolean;
    no_credit_check: boolean;
    usda_eligible: boolean;
  };
  emailDraft?: string;
  emailTemplate?: string;
  contactEmail?: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size?: string;
  year_built?: number;
  property_type: string;
  listing_date: string;
  contact_info?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  ai_summary?: string;
  match_score: number;
  expiresAt?: string;
  claudeInsights?: {
    noMoneyDown: 'yes' | 'maybe' | 'no';
    flexibleTerms: 'yes' | 'maybe' | 'no';
    dogFriendly: 'yes' | 'maybe' | 'no';
  };
  status?: 'new' | 'contacted' | 'archived';
  lastScrapedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OutreachLog {
  id: string;
  listingId: string;
  emailSent: boolean;
  wasSent: boolean;
  timestamp: string;
  emailContent: string;
  response?: string;
  method: 'email' | 'phone';
}

export interface ScrapeRequest {
  zipCode: string;
  sources?: ('zillow' | 'craigslist' | 'foreclosure' | 'other')[];
}

export interface GenerateEmailRequest {
  listingId: string;
  userPersona?: string;
}

export interface LogOutreachRequest {
  listingId: string;
  method: 'email' | 'phone';
  content: string;
  wasSent: boolean;
}