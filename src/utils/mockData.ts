
import { Listing } from '../types/listing';
import { analyzeListing, generateEmailDraft } from './aiProcessor';

export const generateMockListings = (): Listing[] => {
  const baseListings = [
    {
      id: '1',
      address: '1247 Oak Street, Richmond, VA 23223',
      price: 145000,
      source: 'zillow' as const,
      url: 'https://zillow.com/sample1',
      description: 'Charming 3BR/2BA home perfect for veterans! VA loan eligible. Owner willing to work with qualified buyers on financing options. Large fenced yard perfect for pets. Move-in ready condition.',
      images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80'],
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      lot_size: '0.25 acres',
      year_built: 1985,
      property_type: 'Single Family',
      listing_date: '2024-06-14',
      contact_info: {
        name: 'Sarah Johnson',
        phone: '(804) 555-0123',
        email: 'sarah.johnson@email.com'
      },
      contactEmail: 'sarah.johnson@email.com',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      claudeInsights: {
        noMoneyDown: 'yes' as const,
        flexibleTerms: 'yes' as const,
        dogFriendly: 'yes' as const
      }
    },
    {
      id: '2',
      address: '892 Pine Avenue, Norfolk, VA 23504',
      price: 168000,
      source: 'craigslist' as const,
      url: 'https://craigslist.org/sample2',
      description: 'OWNER WILL FINANCE! No bank needed. 2BR/1BA starter home with huge potential. Perfect for someone who needs flexible terms. Pets welcome with deposit. Contract for deed available to right buyer.',
      images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'],
      bedrooms: 2,
      bathrooms: 1,
      sqft: 950,
      year_built: 1978,
      property_type: 'Single Family',
      listing_date: '2024-06-13',
      contact_info: {
        name: 'Mike Rodriguez',
        phone: '(757) 555-0456'
      },
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      claudeInsights: {
        noMoneyDown: 'yes' as const,
        flexibleTerms: 'yes' as const,
        dogFriendly: 'maybe' as const
      }
    },
    {
      id: '3',
      address: '2156 Maple Drive, Virginia Beach, VA 23456',
      price: 189000,
      source: 'foreclosure' as const,
      url: 'https://foreclosure.com/sample3',
      description: 'Lease to own opportunity! 3BR/2BA home in quiet neighborhood. No credit check required. Perfect for veterans transitioning to homeownership. Large backyard, close to base.',
      images: ['https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80'],
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1350,
      lot_size: '0.3 acres',
      year_built: 1992,
      property_type: 'Single Family',
      listing_date: '2024-06-12',
      contact_info: {
        name: 'Hampton Roads Realty',
        phone: '(757) 555-0789',
        email: 'info@hrrealty.com'
      },
      contactEmail: 'info@hrrealty.com',
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
      claudeInsights: {
        noMoneyDown: 'maybe' as const,
        flexibleTerms: 'yes' as const,
        dogFriendly: 'yes' as const
      }
    },
    {
      id: '4',
      address: '543 Cedar Lane, Chesapeake, VA 23320',
      price: 134000,
      source: 'other' as const,
      url: 'https://example.com/sample4',
      description: 'USDA eligible rural property! Beautiful 2BR/2BA home on 1 acre. Seller motivated and open to creative financing. Great for veterans seeking peaceful country living with space for animals.',
      images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80'],
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      lot_size: '1 acre',
      year_built: 1988,
      property_type: 'Single Family',
      listing_date: '2024-06-11',
      contact_info: {
        name: 'Tom Wilson',
        phone: '(757) 555-0234',
        email: 'tom.wilson@email.com'
      },
      contactEmail: 'tom.wilson@email.com',
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
      claudeInsights: {
        noMoneyDown: 'yes' as const,
        flexibleTerms: 'maybe' as const,
        dogFriendly: 'yes' as const
      }
    },
    {
      id: '5',
      address: '3789 Birch Street, Portsmouth, VA 23701',
      price: 156000,
      source: 'zillow' as const,
      url: 'https://zillow.com/sample5',
      description: 'Motivated seller! 3BR/1.5BA home with updates. Open to all reasonable offers and financing arrangements. Bad credit OK with sufficient down payment alternatives. Pet-friendly.',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
      bedrooms: 3,
      bathrooms: 1.5,
      sqft: 1250,
      year_built: 1982,
      property_type: 'Single Family',
      listing_date: '2024-06-10',
      contact_info: {
        name: 'Lisa Chen',
        phone: '(757) 555-0567'
      },
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      claudeInsights: {
        noMoneyDown: 'maybe' as const,
        flexibleTerms: 'maybe' as const,
        dogFriendly: 'yes' as const
      }
    }
  ];

  return baseListings.map(listing => {
    const analysis = analyzeListing(listing.description, listing.price);
    const emailDraft = generateEmailDraft({...listing, ...analysis} as Listing);
    
    return {
      ...listing,
      ...analysis,
      emailDraft,
      emailTemplate: emailDraft // Use the generated draft as the template
    };
  }).sort((a, b) => b.match_score - a.match_score); // Sort by match score
};
