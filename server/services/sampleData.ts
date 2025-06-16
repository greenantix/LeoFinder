import { db } from '../db/firestore';
import { Listing } from '../types/index';

export const sampleListings: Partial<Listing>[] = [
  {
    address: "1234 Veterans Way, Iowa City, IA 52240",
    price: 89000,
    source: 'foreclosure',
    url: "https://www.foreclosure.com/sample1",
    description: "🏠 OWNER FINANCING AVAILABLE! This charming 3-bedroom ranch home is perfect for first-time buyers. Seller is motivated and open to creative financing options including lease-to-own and contract for deed. VA loans welcome! Located in a quiet neighborhood close to schools and shopping. Recent updates include new roof and HVAC system. Don't miss this opportunity - call today!",
    images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"],
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    lot_size: "0.25 acres",
    year_built: 1995,
    property_type: "Single Family",
    listing_date: new Date().toISOString(),
    contact_info: {
      name: "Sarah Johnson",
      phone: "(319) 555-0123",
      email: "sarah.j.realtor@email.com"
    },
    flags: {
      va_eligible: true,
      contract_for_deed: true,
      owner_finance: true,
      lease_to_own: true,
      no_credit_check: false,
      usda_eligible: true
    },
    match_score: 85,
    status: 'new',
    ai_summary: "High potential for veteran with creative financing options. Seller very motivated and open to flexible terms.",
    claudeInsights: {
      noMoneyDown: 'yes',
      flexibleTerms: 'yes',
      dogFriendly: 'yes'
    }
  },
  {
    address: "5678 Maple Street, Cedar Rapids, IA 52402",
    price: 125000,
    source: 'foreclosure',
    url: "https://www.foreclosure.com/sample2",
    description: "💰 NO MONEY DOWN PROGRAM! Beautiful 4-bedroom colonial home with fenced yard perfect for pets. Seller financing available with as little as $500 down. This home features an updated kitchen, hardwood floors, and a large backyard. Seller is relocating and needs quick sale. Veterans welcome - we work with VA loans and can discuss rent-to-own options. Pet-friendly property with dog run already installed!",
    images: ["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop"],
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 1800,
    lot_size: "0.33 acres",
    year_built: 1988,
    property_type: "Single Family",
    listing_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    contact_info: {
      name: "Mike Thompson",
      phone: "(319) 555-0456",
      email: "mthompson.homes@email.com"
    },
    flags: {
      va_eligible: true,
      contract_for_deed: true,
      owner_finance: true,
      lease_to_own: true,
      no_credit_check: true,
      usda_eligible: false
    },
    match_score: 92,
    status: 'new',
    ai_summary: "Excellent match! Seller offers multiple no-money-down options and is pet-friendly. Strong potential for immediate move-in.",
    claudeInsights: {
      noMoneyDown: 'yes',
      flexibleTerms: 'yes',
      dogFriendly: 'yes'
    }
  },
  {
    address: "9876 Oak Avenue, Coralville, IA 52241",
    price: 165000,
    source: 'zillow',
    url: "https://www.zillow.com/sample3",
    description: "🐕 DOG LOVERS WELCOME! Large 3-bedroom ranch with huge fenced yard and dog door already installed. Seller open to lease purchase agreement and will consider all financing options. Home features new carpet, fresh paint, and updated appliances. Located near dog parks and walking trails. Seller motivated due to job relocation - make an offer!",
    images: ["https://images.unsplash.com/photo-1564013434775-f71db2a60512?w=400&h=300&fit=crop"],
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1400,
    lot_size: "0.5 acres",
    year_built: 1992,
    property_type: "Ranch",
    listing_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    contact_info: {
      name: "Lisa Chen",
      phone: "(319) 555-0789",
      email: "lisa.chen.realty@email.com"
    },
    flags: {
      va_eligible: true,
      contract_for_deed: false,
      owner_finance: false,
      lease_to_own: true,
      no_credit_check: false,
      usda_eligible: true
    },
    match_score: 78,
    status: 'new',
    ai_summary: "Good option for dog owner. Lease-to-own available but limited financing flexibility.",
    claudeInsights: {
      noMoneyDown: 'maybe',
      flexibleTerms: 'maybe',
      dogFriendly: 'yes'
    }
  }
];

export async function addSampleListings(): Promise<void> {
  console.log('Adding sample listings for immediate demo...');
  
  try {
    for (const listing of sampleListings) {
      await db.saveListing(listing as Listing);
    }
    console.log(`✅ Added ${sampleListings.length} sample listings`);
  } catch (error) {
    console.error('❌ Failed to add sample listings:', error);
  }
}