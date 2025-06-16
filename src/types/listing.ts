
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
  match_score: number; // 0-100 based on how well it matches criteria
}

export interface OutreachLog {
  id: string;
  listingId: string;
  emailSent: boolean;
  timestamp: string;
  emailContent: string;
  response?: string;
}
