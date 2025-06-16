import { Page } from 'puppeteer';
import { Listing } from '../../types/index';

export interface ForeclosureScraperResult {
  success: boolean;
  listings: Listing[];
  errors: string[];
}

export class ForeclosureScraper {
  async scrape(page: Page, zipCode: string): Promise<ForeclosureScraperResult> {
    const listings: Listing[] = [];
    const errors: string[] = [];

    try {
      // Login first
      await this.login(page);
      
      // Navigate to search page
      const searchUrl = `https://www.foreclosure.com/search?location=${zipCode}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for listings or no results
      await page.waitForSelector('.property-list-item, .no-results', { timeout: 10000 });

      // Check if there are results
      const noResultsElement = await page.$('.no-results');
      if (noResultsElement) {
        return { success: true, listings: [], errors: [] };
      }

      // Get listing elements
      const listingElements = await page.$$('.property-list-item');
      
      for (let i = 0; i < Math.min(listingElements.length, 20); i++) {
        try {
          const element = listingElements[i];
          const listing = await this.extractListing(page, element);
          if (listing) {
            listings.push(listing);
          }
        } catch (error) {
          errors.push(`Error extracting listing ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      errors.push(`Foreclosure.com scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return { success: errors.length === 0, listings, errors };
  }

  private async login(page: Page): Promise<void> {
    const username = process.env.FORECLOSURE_USER;
    const password = process.env.FORECLOSURE_PASS;

    if (!username || !password) {
      throw new Error('Foreclosure.com credentials not configured in environment variables');
    }

    try {
      await page.goto('https://www.foreclosure.com/login', { waitUntil: 'networkidle2' });
      
      await page.waitForSelector('#email', { timeout: 5000 });
      await page.type('#email', username);
      await page.type('#password', password);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]')
      ]);

      // Check for login errors
      const loginError = await page.$('.error-message, .alert-danger');
      if (loginError) {
        throw new Error('Login failed - check credentials');
      }

    } catch (error) {
      throw new Error(`Failed to login to Foreclosure.com: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractListing(page: Page, element: any): Promise<Listing | null> {
    try {
      // Use evaluate to extract data safely
      const listingData = await element.evaluate((el: any) => {
        const address = el.querySelector('.property-address')?.textContent?.trim() || '';
        const priceText = el.querySelector('.property-price')?.textContent?.trim() || '0';
        const url = el.querySelector('a')?.href || '';
        
        return { address, priceText, url };
      });

      if (!listingData.address || !listingData.url) {
        return null;
      }

      const price = this.parsePrice(listingData.priceText);
      
      // Extract additional details if possible
      let detailedInfo = {
        description: '',
        images: [] as string[],
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0
      };

      try {
        // Create new page for details to avoid contaminating main page
        const detailPage = await page.browser().newPage();
        await detailPage.goto(listingData.url, { waitUntil: 'networkidle2', timeout: 15000 });
        
        detailedInfo = await detailPage.evaluate(() => {
          const description = (document as any).querySelector('.property-description')?.textContent?.trim() || '';
          const bedroomText = (document as any).querySelector('.bedrooms')?.textContent?.trim() || '0';
          const bathroomText = (document as any).querySelector('.bathrooms')?.textContent?.trim() || '0';
          const sqftText = (document as any).querySelector('.square-feet')?.textContent?.trim() || '0';
          
          const imageElements = Array.from((document as any).querySelectorAll('.property-images img'));
          const images = imageElements.map((img: any) => img.src).filter(Boolean);

          return {
            description,
            images,
            bedrooms: parseInt(bedroomText) || 0,
            bathrooms: parseFloat(bathroomText) || 0,
            sqft: parseInt(sqftText.replace(/[^\d]/g, '')) || 0
          };
        });

        await detailPage.close();
      } catch (error) {
        console.log('Could not extract detailed info for listing:', error);
      }

      const listing: Listing = {
        id: `foreclosure_${Buffer.from(listingData.url).toString('base64').substring(0, 20)}`,
        address: listingData.address,
        price,
        source: 'foreclosure',
        url: listingData.url,
        description: detailedInfo.description,
        images: detailedInfo.images,
        bedrooms: detailedInfo.bedrooms,
        bathrooms: detailedInfo.bathrooms,
        sqft: detailedInfo.sqft,
        property_type: 'Foreclosure',
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
      console.error('Error extracting foreclosure listing:', error);
      return null;
    }
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  }
}

export const foreclosureScraper = new ForeclosureScraper();