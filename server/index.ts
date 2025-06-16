import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/firestore';
import { listingService } from './services/listingService';
import { scraperService } from './services/scraper';
import { aiService } from './services/ai';
import { notificationService } from './services/notifications';
import { ScrapeRequest, GenerateEmailRequest, LogOutreachRequest } from './types/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  try {
    // Test database connection only if Firebase is configured
    if (process.env.FIREBASE_PROJECT_ID) {
      await db.testConnection();
    }
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: process.env.FIREBASE_PROJECT_ID ? 'connected' : 'not_configured',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Health check failed'
    });
  }
});

app.get('/api/listings', async (req, res) => {
  try {
    const filters = {
      zipCode: req.query.zipCode as string,
      minScore: req.query.minScore ? parseInt(req.query.minScore as string) : undefined,
      maxScore: req.query.maxScore ? parseInt(req.query.maxScore as string) : undefined,
      source: req.query.source as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    let listings;
    
    // If Firebase is configured, get real data; otherwise return sample data
    if (process.env.FIREBASE_PROJECT_ID) {
      listings = await listingService.getAllListings(filters);
    } else {
      // Return sample data for demo
      listings = [
        {
          id: 'sample-1',
          address: '123 Veterans Way, Phoenix, AZ 85001',
          price: 285000,
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1850,
          lotSize: 0.25,
          yearBuilt: 2018,
          propertyType: 'Single Family',
          listingType: 'Foreclosure',
          mlsNumber: 'DEMO001',
          description: 'VA-eligible home with owner financing available. Recently renovated with modern appliances.',
          images: ['/placeholder.svg'],
          creativeFinancing: {
            ownerFinancing: true,
            downPaymentPercent: 3,
            terms: '3% down, seller financing at 6.5% for 30 years'
          },
          score: 85,
          source: 'foreclosure.com',
          zipCode: '85001',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    res.json({ 
      success: true, 
      data: listings,
      count: listings.length,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch listings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await listingService.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Listing not found' 
      });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch listing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/scrape', async (req, res) => {
  try {
    const { zipCode, sources }: ScrapeRequest = req.body;
    
    if (!zipCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'ZIP code is required' 
      });
    }

    // Start scraping job asynchronously
    const scrapePromise = scraperService.scrapeMultipleSources(
      zipCode, 
      sources || ['foreclosure', 'zillow']
    );

    // Don't wait for completion - return immediately
    res.json({ 
      success: true, 
      message: 'Scrape job started',
      zipCode,
      sources: sources || ['foreclosure', 'zillow']
    });

    // Handle the scraping results in the background
    scrapePromise.then(results => {
      console.log('Scraping completed:', results.map(r => 
        `${r.source}: ${r.listings.length} listings, ${r.errors.length} errors`
      ));
    }).catch(error => {
      console.error('Scraping failed:', error);
    });

  } catch (error) {
    console.error('Error starting scrape job:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start scrape job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/generate-email', async (req, res) => {
  try {
    const { listingId, userPersona }: GenerateEmailRequest = req.body;
    
    if (!listingId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Listing ID is required' 
      });
    }

    const listing = await listingService.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Listing not found' 
      });
    }

    const emailResponse = await aiService.generateOutreachEmail({
      listing,
      userPersona,
      emailType: 'inquiry'
    });

    // Update the listing with the generated email
    await listingService.saveListing({
      ...listing,
      emailDraft: emailResponse.body
    });

    res.json({ 
      success: true, 
      data: emailResponse
    });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/log-outreach', async (req, res) => {
  try {
    const { listingId, method, content, wasSent }: LogOutreachRequest = req.body;
    
    if (!listingId || !method || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const log = await listingService.logOutreach({
      listingId,
      method,
      emailContent: content,
      emailSent: wasSent,
      wasSent
    });

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Error logging outreach:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to log outreach',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Notification endpoints
app.post('/api/notifications/subscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;
    
    if (!token || !topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and topic are required' 
      });
    }

    const success = await notificationService.subscribeToTopic(token, topic);
    res.json({ success, message: success ? 'Subscribed successfully' : 'Subscription failed' });
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to subscribe to notifications' 
    });
  }
});

app.post('/api/notifications/test', async (req, res) => {
  try {
    const { listingId } = req.body;
    
    const listing = listingId ? await listingService.getListingById(listingId) : null;
    
    if (listing) {
      const success = await notificationService.sendNewListingNotification(listing);
      res.json({ success, message: success ? 'Test notification sent' : 'Failed to send notification' });
    } else {
      res.json({ success: false, message: 'Listing not found or no listing ID provided' });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test notification' 
    });
  }
});

// Server shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await scraperService.closeBrowser();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await scraperService.closeBrowser();
  await db.close();
  process.exit(0);
});

async function startServer() {
  // Start server first
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  });

  // Try database connection (non-blocking)
  try {
    await db.testConnection();
    console.log('✅ Database connected successfully');
    
    await db.initializeSchema();
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('⚠️ Database connection failed, but server is running:', error);
    console.log('📋 Please check your DATABASE_URL environment variable');
    console.log('🔧 Server will continue running for debugging');
  }

  // Schedule automatic scraping for production
  if (process.env.NODE_ENV === 'production') {
    console.log('🤖 Setting up periodic scraping...');
    setInterval(async () => {
      try {
        console.log('🤖 LEO running scheduled scraping...');
        const popularZipCodes = ['85001', '85701', '85201'];
        
        for (const zipCode of popularZipCodes) {
          try {
            const results = await scraperService.scrapeMultipleSources(zipCode, ['foreclosure']);
            console.log(`✅ Scraped ${zipCode}: ${results[0]?.listings.length || 0} listings`);
          } catch (error) {
            console.error(`❌ Failed to scrape ${zipCode}:`, error);
          }
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error('Periodic scraping error:', error);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }
}

startServer();