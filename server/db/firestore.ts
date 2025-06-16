import admin from 'firebase-admin';
import { Listing, OutreachLog } from '../types/index';

class FirestoreDatabase {
  private db: admin.firestore.Firestore;
  private initialized = false;

  constructor() {
    try {
      if (admin.apps.length === 0) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, '\n');

        if (!projectId || !privateKey || !clientEmail) {
          throw new Error("Firebase credentials not found");
        }

        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          projectId,
        });
      }

      this.db = admin.firestore();
      this.initialized = true;
      console.log('✅ Firestore initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firestore:', error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firestore not initialized');
    }
    // Test connection by trying to access settings
    await this.db.settings({});
    console.log('✅ Firestore connection test successful');
  }

  async initializeSchema(): Promise<void> {
    // Firestore doesn't need schema initialization
    console.log('✅ Firestore schema ready (NoSQL)');
  }

  async getAllListings(filters: {
    zipCode?: string;
    minScore?: number;
    status?: string;
    limit?: number;
  } = {}): Promise<Listing[]> {
    try {
      let query = this.db.collection('listings') as admin.firestore.Query;

      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }

      if (filters.minScore) {
        query = query.where('match_score', '>=', filters.minScore);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      const listings: Listing[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          address: data.address || '',
          price: data.price || 0,
          source: data.source || '',
          url: data.url || '',
          description: data.description || '',
          images: data.images || [],
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          sqft: data.sqft,
          lot_size: data.lot_size,
          year_built: data.year_built,
          property_type: data.property_type || '',
          listing_date: data.listing_date,
          contact_info: data.contact_info,
          flags: data.flags || {},
          emailDraft: data.emailDraft,
          emailTemplate: data.emailTemplate,
          ai_summary: data.ai_summary,
          match_score: data.match_score || 0,
          claudeInsights: data.claudeInsights,
          status: data.status || 'new',
          expiresAt: data.expiresAt,
          created_at: data.created_at?.toDate?.() || new Date(),
          updated_at: data.updated_at?.toDate?.() || new Date(),
        });
      });

      // Apply zipCode filter in memory (Firestore doesn't support LIKE queries)
      if (filters.zipCode) {
        return listings.filter(listing => 
          listing.address?.toLowerCase().includes(filters.zipCode!.toLowerCase())
        );
      }

      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    try {
      const doc = await this.db.collection('listings').doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      return {
        id: doc.id,
        address: data.address || '',
        price: data.price || 0,
        source: data.source || '',
        url: data.url || '',
        description: data.description || '',
        images: data.images || [],
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        sqft: data.sqft,
        lot_size: data.lot_size,
        year_built: data.year_built,
        property_type: data.property_type || '',
        listing_date: data.listing_date,
        contact_info: data.contact_info,
        flags: data.flags || {},
        emailDraft: data.emailDraft,
        emailTemplate: data.emailTemplate,
        ai_summary: data.ai_summary,
        match_score: data.match_score || 0,
        claudeInsights: data.claudeInsights,
        status: data.status || 'new',
        expiresAt: data.expiresAt,
        created_at: data.created_at?.toDate?.() || new Date(),
        updated_at: data.updated_at?.toDate?.() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }

  async saveListing(listing: Listing): Promise<Listing> {
    try {
      const listingData = {
        ...listing,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (listing.id) {
        // Update existing
        await this.db.collection('listings').doc(listing.id).set(listingData, { merge: true });
        return { ...listing, id: listing.id };
      } else {
        // Create new
        const docRef = await this.db.collection('listings').add(listingData);
        return { ...listing, id: docRef.id };
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      throw error;
    }
  }

  async logOutreach(log: Omit<OutreachLog, 'id' | 'timestamp'>): Promise<OutreachLog> {
    try {
      const logData = {
        ...log,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await this.db.collection('outreach_logs').add(logData);
      
      return {
        id: docRef.id,
        listing_id: log.listing_id,
        recipient_email: log.recipient_email,
        subject: log.subject,
        body: log.body,
        status: log.status,
        response: log.response || '',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error logging outreach:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    // Firebase admin doesn't need explicit cleanup
    console.log('Firestore connection closed');
  }
}

export const db = new FirestoreDatabase();