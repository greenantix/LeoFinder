import { db } from '../db/firestore';
import { Listing, OutreachLog } from '../types/index';

export class ListingService {
  async getAllListings(filters?: {
    zipCode?: string;
    minScore?: number;
    status?: string;
    limit?: number;
  }): Promise<Listing[]> {
    return await db.getAllListings(filters || {});
  }

  async getListingById(id: string): Promise<Listing | null> {
    return await db.getListingById(id);
  }

  async saveListing(listing: Listing): Promise<Listing> {
    return await db.saveListing(listing);
  }

  async logOutreach(log: Omit<OutreachLog, 'id' | 'timestamp'>): Promise<OutreachLog> {
    return await db.logOutreach(log);
  }
}

export const listingService = new ListingService();