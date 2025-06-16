
import { Listing } from '../types/listing';

// Simulated AI processing for now - in production this would use OpenAI/Claude API
export const generateEmailDraft = (listing: Listing): string => {
  const templates = [
    `Hi! I'm a veteran actively searching for housing with my two dogs. I saw your property at ${listing.address} and I'm very interested. While I don't have a traditional down payment, I'm responsible, quiet, and can move immediately. Would you consider seller financing, lease-to-own, or any flexible payment arrangements? I'd love to discuss how we could make this work. Thank you for your time!`,
    
    `Hello, I'm reaching out about your property at ${listing.address}. As a veteran with two well-behaved dogs, I'm urgently seeking housing but don't have funds for a down payment. I'm reliable, have steady income, and take excellent care of properties. Would you be open to alternative financing options like owner financing or a lease-to-own arrangement? I'm ready to move quickly and would appreciate any consideration.`,
    
    `Good day! Your listing at ${listing.address} caught my attention. I'm a veteran looking for a home where I can live peacefully with my two dogs. Due to my circumstances, I'm seeking properties with flexible financing options - no down payment required. I'm responsible, punctual with payments, and would treat your property with respect. Could we explore creative financing solutions? I'm available to discuss details at your convenience.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};

export const analyzeListing = (description: string, price: number): { flags: Listing['flags'], match_score: number, aiSummary: string } => {
  const text = description.toLowerCase();
  
  const flags = {
    va_eligible: text.includes('va') || text.includes('veteran') || text.includes('va loan'),
    contract_for_deed: text.includes('contract for deed') || text.includes('land contract'),
    owner_finance: text.includes('owner finance') || text.includes('seller finance') || text.includes('owner will carry'),
    lease_to_own: text.includes('lease to own') || text.includes('rent to own') || text.includes('lease option'),
    no_credit_check: text.includes('no credit check') || text.includes('bad credit ok'),
    usda_eligible: text.includes('usda') || text.includes('rural development')
  };
  
  // Calculate match score based on flags and price
  let match_score = 0;
  Object.values(flags).forEach(flag => {
    if (flag) match_score += 20;
  });
  
  // Bonus for reasonable price
  if (price < 200000) match_score += 10;
  if (price < 150000) match_score += 10;
  
  const flaggedTerms = Object.entries(flags)
    .filter(([_, value]) => value)
    .map(([key, _]) => key.replace('_', ' '))
    .join(', ');
  
  const aiSummary = flaggedTerms 
    ? `🎯 This listing matches your criteria! Found: ${flaggedTerms}. Price is ${price < 150000 ? 'very' : ''} affordable for zero-down options.`
    : `💡 Standard listing - may still be worth contacting for flexible terms. Consider asking about seller financing options.`;
  
  return { flags, match_score, aiSummary };
};
