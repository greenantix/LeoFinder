import { db } from '../db/index';
import { Listing, OutreachLog } from '../types/index';

export class ListingService {
  async getAllListings(filters?: {
    zipCode?: string;
    minScore?: number;
    maxScore?: number;
    source?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Listing[]> {
    try {
      let query = `
        SELECT 
          id, address, price, source, url, description, images,
          bedrooms, bathrooms, sqft, lot_size, year_built, property_type,
          listing_date, contact_name, contact_phone, contact_email,
          va_eligible, contract_for_deed, owner_finance, lease_to_own,
          no_credit_check, usda_eligible, email_draft, email_template,
          ai_summary, match_score, no_money_down, flexible_terms, dog_friendly,
          status, expires_at, last_scraped_at, created_at, updated_at
        FROM listings
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.zipCode) {
        query += ` AND address ILIKE $${paramIndex}`;
        params.push(`%${filters.zipCode}%`);
        paramIndex++;
      }

      if (filters?.minScore !== undefined) {
        query += ` AND match_score >= $${paramIndex}`;
        params.push(filters.minScore);
        paramIndex++;
      }

      if (filters?.maxScore !== undefined) {
        query += ` AND match_score <= $${paramIndex}`;
        params.push(filters.maxScore);
        paramIndex++;
      }

      if (filters?.source) {
        query += ` AND source = $${paramIndex}`;
        params.push(filters.source);
        paramIndex++;
      }

      if (filters?.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      query += ` ORDER BY match_score DESC, created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
        paramIndex++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(filters.offset);
      }

      const result = await db.query(query, params);
      return result.rows.map(this.mapRowToListing);
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  async getListingById(id: string): Promise<Listing | null> {
    try {
      const query = `
        SELECT 
          id, address, price, source, url, description, images,
          bedrooms, bathrooms, sqft, lot_size, year_built, property_type,
          listing_date, contact_name, contact_phone, contact_email,
          va_eligible, contract_for_deed, owner_finance, lease_to_own,
          no_credit_check, usda_eligible, email_draft, email_template,
          ai_summary, match_score, no_money_down, flexible_terms, dog_friendly,
          status, expires_at, last_scraped_at, created_at, updated_at
        FROM listings
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToListing(result.rows[0]) : null;
    } catch (error) {
      console.error('Error fetching listing by ID:', error);
      throw error;
    }
  }

  async saveListing(listing: Listing): Promise<Listing> {
    try {
      const query = `
        INSERT INTO listings (
          id, address, price, source, url, description, images,
          bedrooms, bathrooms, sqft, lot_size, year_built, property_type,
          listing_date, contact_name, contact_phone, contact_email,
          va_eligible, contract_for_deed, owner_finance, lease_to_own,
          no_credit_check, usda_eligible, email_draft, email_template,
          ai_summary, match_score, no_money_down, flexible_terms, dog_friendly,
          status, expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
        ON CONFLICT (id) DO UPDATE SET
          address = EXCLUDED.address,
          price = EXCLUDED.price,
          description = EXCLUDED.description,
          images = EXCLUDED.images,
          match_score = EXCLUDED.match_score,
          last_scraped_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const params = [
        listing.id, listing.address, listing.price, listing.source, listing.url,
        listing.description, listing.images, listing.bedrooms, listing.bathrooms,
        listing.sqft, listing.lot_size, listing.year_built, listing.property_type,
        listing.listing_date, listing.contact_info?.name, listing.contact_info?.phone,
        listing.contact_info?.email, listing.flags.va_eligible, listing.flags.contract_for_deed,
        listing.flags.owner_finance, listing.flags.lease_to_own, listing.flags.no_credit_check,
        listing.flags.usda_eligible, listing.emailDraft, listing.emailTemplate,
        listing.ai_summary, listing.match_score, listing.claudeInsights?.noMoneyDown,
        listing.claudeInsights?.flexibleTerms, listing.claudeInsights?.dogFriendly,
        listing.status || 'new', listing.expiresAt
      ];

      const result = await db.query(query, params);
      return this.mapRowToListing(result.rows[0]);
    } catch (error) {
      console.error('Error saving listing:', error);
      throw error;
    }
  }

  async logOutreach(log: Omit<OutreachLog, 'id' | 'timestamp'>): Promise<OutreachLog> {
    try {
      const query = `
        INSERT INTO outreach_logs (listing_id, method, content, email_sent, was_sent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const params = [
        log.listingId, log.method, log.emailContent, log.emailSent, log.wasSent
      ];

      const result = await db.query(query, params);
      return {
        id: result.rows[0].id,
        listingId: result.rows[0].listing_id,
        method: result.rows[0].method,
        emailContent: result.rows[0].content,
        emailSent: result.rows[0].email_sent,
        wasSent: result.rows[0].was_sent,
        timestamp: result.rows[0].timestamp,
        response: result.rows[0].response
      };
    } catch (error) {
      console.error('Error logging outreach:', error);
      throw error;
    }
  }

  private mapRowToListing(row: any): Listing {
    return {
      id: row.id,
      address: row.address,
      price: parseFloat(row.price),
      source: row.source,
      url: row.url,
      description: row.description,
      images: row.images || [],
      bedrooms: row.bedrooms,
      bathrooms: parseFloat(row.bathrooms),
      sqft: row.sqft,
      lot_size: row.lot_size,
      year_built: row.year_built,
      property_type: row.property_type,
      listing_date: row.listing_date,
      contact_info: {
        name: row.contact_name,
        phone: row.contact_phone,
        email: row.contact_email
      },
      flags: {
        va_eligible: row.va_eligible,
        contract_for_deed: row.contract_for_deed,
        owner_finance: row.owner_finance,
        lease_to_own: row.lease_to_own,
        no_credit_check: row.no_credit_check,
        usda_eligible: row.usda_eligible
      },
      emailDraft: row.email_draft,
      emailTemplate: row.email_template,
      ai_summary: row.ai_summary,
      match_score: row.match_score,
      claudeInsights: {
        noMoneyDown: row.no_money_down,
        flexibleTerms: row.flexible_terms,
        dogFriendly: row.dog_friendly
      },
      status: row.status,
      expiresAt: row.expires_at,
      lastScrapedAt: row.last_scraped_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const listingService = new ListingService();