-- LeoFinder Database Schema

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search criteria table
CREATE TABLE IF NOT EXISTS search_criteria (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    zip_code VARCHAR(10) NOT NULL,
    last_run_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
    id VARCHAR(255) PRIMARY KEY,
    address TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('zillow', 'craigslist', 'foreclosure', 'other')),
    url TEXT NOT NULL,
    description TEXT,
    images TEXT[], -- Array of image URLs
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft INTEGER,
    lot_size VARCHAR(100),
    year_built INTEGER,
    property_type VARCHAR(100),
    listing_date TIMESTAMP,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    
    -- Flags for creative financing
    va_eligible BOOLEAN DEFAULT false,
    contract_for_deed BOOLEAN DEFAULT false,
    owner_finance BOOLEAN DEFAULT false,
    lease_to_own BOOLEAN DEFAULT false,
    no_credit_check BOOLEAN DEFAULT false,
    usda_eligible BOOLEAN DEFAULT false,
    
    -- AI-generated content
    email_draft TEXT,
    email_template TEXT,
    ai_summary TEXT,
    match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
    
    -- Claude insights
    no_money_down VARCHAR(10) CHECK (no_money_down IN ('yes', 'maybe', 'no')),
    flexible_terms VARCHAR(10) CHECK (flexible_terms IN ('yes', 'maybe', 'no')),
    dog_friendly VARCHAR(10) CHECK (dog_friendly IN ('yes', 'maybe', 'no')),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'archived')),
    expires_at TIMESTAMP,
    last_scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outreach logs table
CREATE TABLE IF NOT EXISTS outreach_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id VARCHAR(255) REFERENCES listings(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('email', 'phone')),
    content TEXT,
    email_sent BOOLEAN DEFAULT false,
    was_sent BOOLEAN DEFAULT false,
    response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_source ON listings(source);
CREATE INDEX IF NOT EXISTS idx_listings_match_score ON listings(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outreach_logs_listing_id ON outreach_logs(listing_id);
CREATE INDEX IF NOT EXISTS idx_search_criteria_zip_code ON search_criteria(zip_code);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_criteria_updated_at BEFORE UPDATE ON search_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();