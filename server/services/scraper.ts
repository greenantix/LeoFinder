import puppeteer, { Browser, Page } from 'puppeteer';
import { Listing } from '../types/index';
import { scoringService } from './scoring';
import { listingService } from './listingService';
import { notificationService } from './notifications';
import { foreclosureScraper } from './scrapers/foreclosureScraper';
import { zillowFSBOScraper } from './scrapers/zillowFSBOScraper';

export interface ScraperConfig {
  headless: boolean;
  userAgent: string;
  viewport: { width: number; height: number };
  timeout: number;
}

export interface ScraperResult {
  success: boolean;
  listings: Listing[];
  errors: string[];
  source: string;
  zipCode: string;
}

export class ScraperService {
  private browser: Browser | null = null;
  private config: ScraperConfig;

  constructor() {
    this.config = {
      headless: process.env.NODE_ENV === 'production',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      timeout: 30000
    };
  }

  async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    await page.setUserAgent(this.config.userAgent);
    await page.setViewport(this.config.viewport);
    
    return page;
  }

  async scrapeMultipleSources(zipCode: string, sources: string[] = ['foreclosure', 'zillow']): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];
    
    for (const source of sources) {
      try {
        console.log(`Starting scrape for ${source} in ${zipCode}`);
        const result = await this.scrapeSingleSource(zipCode, source);
        results.push(result);
        
        // Process and save listings
        if (result.success && result.listings.length > 0) {
          await this.processScrapedListings(result.listings);
        }
      } catch (error) {
        console.error(`Error scraping ${source}:`, error);
        results.push({
          success: false,
          listings: [],
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          source,
          zipCode
        });
      }
    }

    return results;
  }

  private async scrapeSingleSource(zipCode: string, source: string): Promise<ScraperResult> {
    const page = await this.createPage();
    
    try {
      switch (source.toLowerCase()) {
        case 'foreclosure':
          const foreclosureResult = await foreclosureScraper.scrape(page, zipCode);
          return {
            ...foreclosureResult,
            source: 'foreclosure',
            zipCode
          };
        case 'zillow':
          const zillowResult = await zillowFSBOScraper.scrape(page, zipCode);
          return {
            ...zillowResult,
            source: 'zillow',
            zipCode
          };
        default:
          throw new Error(`Unsupported source: ${source}`);
      }
    } finally {
      await page.close();
    }
  }


  private async processScrapedListings(listings: Listing[]): Promise<void> {
    for (const listing of listings) {
      try {
        // Score the listing
        const scoredListing = await scoringService.scoreListing(listing);
        
        // Save to database
        await listingService.saveListing(scoredListing);
        
        // Send notification if high score
        if (scoredListing.match_score >= 70) {
          await notificationService.sendNewListingNotification(scoredListing);
        }
      } catch (error) {
        console.error('Error processing listing:', error);
      }
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const scraperService = new ScraperService();