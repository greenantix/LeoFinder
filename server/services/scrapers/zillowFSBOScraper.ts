import { Page } from 'puppeteer';
import { Listing } from '../../types/index';

export interface ZillowScraperResult {
  success: boolean;
  listings: Listing[];
  errors: string[];
}

export class ZillowFSBOScraper {
  async scrape(page: Page, zipCode: string): Promise<ZillowScraperResult> {
    const listings: Listing[] = [];
    const errors: string[] = [];

    try {
      // Navigate to Zillow FSBO search
      const searchUrl = `https://www.zillow.com/homes/for_sale/${zipCode}_rb/?fsbo=1&sort=newest`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for listings or no results
      await page.waitForSelector('[data-testid="result-list-container"] article, .NoResultsMessage', { timeout: 10000 });

      // Check if there are results
      const noResultsElement = await page.$('.NoResultsMessage');
      if (noResultsElement) {
        return { success: true, listings: [], errors: [] };
      }

      // Get listing elements
      const listingElements = await page.$$('[data-testid="result-list-container"] article');
      
      for (let i = 0; i < Math.min(listingElements.length, 20); i++) {
        try {
          const element = listingElements[i];
          const listing = await this.extractListing(element);
          if (listing) {
            listings.push(listing);
          }
        } catch (error) {
          errors.push(`Error extracting listing ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`Zillow FSBO scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { success: errors.length === 0, listings, errors };
  }

  private async extractListing(element: any): Promise<Listing | null> {
    try {
      // Use evaluate to extract data safely
      const listingData = await element.evaluate((el: any) => {
        const address = el.querySelector('[data-test="property-card-addr"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-test="property-card-price"]')?.textContent?.trim() || '0';
        const url = el.querySelector('a')?.href || '';
        
        const bedsText = el.querySelector('[data-test="property-card-meta-beds"]')?.textContent?.trim() || '0';
        const bathsText = el.querySelector('[data-test="property-card-meta-baths"]')?.textContent?.trim() || '0';
        const sqftText = el.querySelector('[data-test="property-card-meta-sqft"]')?.textContent?.trim() || '0';
        
        const imgSrc = el.querySelector('img')?.src || '';
        
        return { 
          address, 
          priceText, 
          url, 
          bedsText, 
          bathsText, 
          sqftText, 
          imgSrc 
        };
      });

      if (!listingData.address || !listingData.url) {
        return null;
      }

      const price = this.parsePrice(listingData.priceText);
      const bedrooms = parseInt(listingData.bedsText) || 0;
      const bathrooms = parseFloat(listingData.bathsText) || 0;
      const sqft = parseInt(listingData.sqftText.replace(/[^\d]/g, '')) || 0;
      const images = listingData.imgSrc ? [listingData.imgSrc] : [];

      const listing: Listing = {
        id: `zillow_${Buffer.from(listingData.url).toString('base64').substring(0, 20)}`,
        address: listingData.address,
        price,
        source: 'zillow',
        url: listingData.url,
        description: 'For Sale By Owner (FSBO) listing from Zillow',
        images,
        bedrooms,
        bathrooms,
        sqft,
        property_type: 'Single Family',
        listing_date: new Date().toISOString(),
        flags: {
          va_eligible: false,
          contract_for_deed: false,
          owner_finance: false,
          lease_to_own: false,
          no_credit_check: false,
          usda_eligible: false
        },
        match_score: 0
      };

      return listing;
    } catch (error) {
      console.error('Error extracting Zillow listing:', error);
      return null;
    }
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  }
}

export const zillowFSBOScraper = new ZillowFSBOScraper();