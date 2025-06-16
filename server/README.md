# LeoFinder Backend

A Node.js/Express backend for the LeoFinder real estate scraping and analysis application.

## Features

- **Real-time Web Scraping**: Multi-source property scraping with Puppeteer
- **AI-Powered Email Generation**: Anthropic Claude integration for personalized outreach
- **Creative Financing Scoring**: Keyword-based scoring system for investment opportunities
- **Push Notifications**: Firebase Cloud Messaging for real-time alerts
- **PostgreSQL Database**: Robust data storage with full schema
- **RESTful API**: Complete API for frontend integration

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key (for AI features)
- Firebase project (for notifications)
- Foreclosure.com credentials (for foreclosure scraping)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
- Create PostgreSQL database named `leofinder`
- The schema will be initialized automatically on first run

4. Start development server:
```bash
npm run dev
```

## Environment Variables

```env
# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=leofinder
DB_USER=postgres
DB_PASSWORD=your_password

# Scraping Credentials
FORECLOSURE_USER=your_foreclosure_username
FORECLOSURE_PASS=your_foreclosure_password

# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Listings
- `GET /api/listings` - Get all listings with optional filters
- `GET /api/listings/:id` - Get specific listing by ID

### Scraping
- `POST /api/scrape` - Start scraping job for ZIP code

### AI Features
- `POST /api/generate-email` - Generate personalized outreach email

### Outreach Logging
- `POST /api/log-outreach` - Log contact attempts

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/test` - Send test notification

## Architecture

### Services

- **ScraperService**: Main scraping orchestrator
- **ForeclosureScraper**: Foreclosure.com specific scraper
- **ZillowFSBOScraper**: Zillow FSBO scraper
- **ScoringService**: Creative financing keyword scoring
- **AIService**: Anthropic API integration
- **NotificationService**: Firebase push notifications
- **ListingService**: Database operations for listings

### Database Schema

- `listings`: Property listings with full metadata
- `outreach_logs`: Contact attempt tracking
- `search_criteria`: User search preferences
- `users`: User management (future)

## Scoring Algorithm

The scoring system uses weighted keywords to identify creative financing opportunities:

- **Owner Finance**: 25 points
- **No Money Down**: 22 points  
- **Lease to Own**: 20 points
- **No Credit Check**: 20 points
- **Flexible Terms**: 18 points
- **Motivated Seller**: 15 points
- **Foreclosure/Distressed**: 12 points
- **VA Eligible**: 10 points
- **Dog Friendly**: 8 points

## Scraping Sources

### Foreclosure.com
- Requires login credentials
- Extracts foreclosure listings
- Detailed property information

### Zillow FSBO
- Public listings
- For Sale By Owner properties
- Basic property details

## Development

### Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Production server

### Project Structure

```
server/
├── db/
│   ├── index.ts          # Database connection
│   └── schema.sql        # Database schema
├── services/
│   ├── scrapers/
│   │   ├── foreclosureScraper.ts
│   │   └── zillowFSBOScraper.ts
│   ├── ai.ts             # Anthropic API
│   ├── listingService.ts # Database operations
│   ├── notifications.ts  # Firebase messaging
│   ├── scraper.ts        # Main scraper
│   └── scoring.ts        # Keyword scoring
├── types/
│   └── index.ts          # TypeScript interfaces
├── index.ts              # Express server
├── keywords.json         # Scoring keywords
└── package.json
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables for production

3. Start the server:
```bash
npm start
```

4. Set up reverse proxy (nginx recommended)

5. Configure SSL certificates

6. Set up process manager (PM2 recommended)

## Monitoring

- Health check endpoint: `/health`
- Database connection status included in health check
- Comprehensive error logging
- Graceful shutdown handling

## Security Considerations

- Environment variables for all secrets
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- Rate limiting recommended for production

## Performance

- Database connection pooling
- Asynchronous scraping operations
- Efficient keyword matching algorithms
- Image optimization for notifications
- Background job processing

## Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include tests for new features
4. Update documentation
5. Follow existing code patterns