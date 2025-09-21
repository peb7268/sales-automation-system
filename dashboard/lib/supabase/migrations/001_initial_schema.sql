-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE temperature AS ENUM ('cold', 'warm', 'hot');
CREATE TYPE pipeline_stage AS ENUM ('cold', 'contacted', 'interested', 'qualified');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE campaign_type AS ENUM ('cold_outreach', 'follow_up', 'qualification', 'closing');
CREATE TYPE call_outcome AS ENUM ('no_answer', 'voicemail', 'callback', 'interested', 'not_interested', 'qualified');

-- Create prospects table
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    temperature temperature DEFAULT 'cold',
    pipeline_stage pipeline_stage DEFAULT 'cold',
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    research_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status campaign_status DEFAULT 'draft',
    type campaign_type NOT NULL,
    target_count INTEGER DEFAULT 0 CHECK (target_count >= 0),
    completed_count INTEGER DEFAULT 0 CHECK (completed_count >= 0),
    success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
    script TEXT,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    duration INTEGER DEFAULT 0 CHECK (duration >= 0),
    outcome call_outcome NOT NULL,
    transcript TEXT,
    recording_url VARCHAR(500),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    notes TEXT,
    scheduled_followup TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prospects_pipeline_stage ON prospects(pipeline_stage);
CREATE INDEX idx_prospects_temperature ON prospects(temperature);
CREATE INDEX idx_prospects_industry ON prospects(industry);
CREATE INDEX idx_prospects_created_at ON prospects(created_at DESC);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE INDEX idx_calls_prospect_id ON calls(prospect_id);
CREATE INDEX idx_calls_campaign_id ON calls(campaign_id);
CREATE INDEX idx_calls_outcome ON calls(outcome);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);

CREATE INDEX idx_events_type ON analytics_events(type);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp DESC);

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now - customize based on auth requirements)
CREATE POLICY "Enable all operations for prospects" ON prospects
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for campaigns" ON campaigns
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for calls" ON calls
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for analytics_events" ON analytics_events
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for development
INSERT INTO prospects (business_name, industry, location, contact_name, contact_email, contact_phone, website, temperature, pipeline_stage, score)
VALUES 
    ('Alpine Tech Solutions', 'technology', 'Denver, CO', 'John Smith', 'john@alpinetech.com', '303-555-0100', 'https://alpinetech.com', 'hot', 'qualified', 92),
    ('Mountain View Consulting', 'consulting', 'Boulder, CO', 'Jane Doe', 'jane@mountainview.com', '720-555-0200', 'https://mountainview.com', 'warm', 'interested', 75),
    ('Summit Peak Industries', 'manufacturing', 'Fort Collins, CO', 'Bob Wilson', 'bob@summitpeak.com', '970-555-0300', 'https://summitpeak.com', 'cold', 'contacted', 45),
    ('Rocky Mountain Retail', 'retail', 'Colorado Springs, CO', 'Sarah Johnson', 'sarah@rmretail.com', '719-555-0400', 'https://rmretail.com', 'warm', 'interested', 68),
    ('High Altitude Fitness', 'health', 'Aspen, CO', 'Mike Brown', 'mike@highaltitude.com', '970-555-0500', 'https://highaltitude.com', 'cold', 'cold', 30);

INSERT INTO campaigns (name, status, type, target_count, completed_count, success_count)
VALUES
    ('Q4 Cold Outreach', 'active', 'cold_outreach', 100, 45, 12),
    ('Follow-up Campaign', 'active', 'follow_up', 50, 23, 8),
    ('Qualification Drive', 'paused', 'qualification', 30, 15, 5);

-- Create a view for dashboard metrics
CREATE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM prospects) as total_prospects,
    (SELECT COUNT(*) FROM prospects WHERE pipeline_stage = 'qualified') as qualified_leads,
    (SELECT COUNT(*) FROM calls WHERE DATE(created_at) = CURRENT_DATE) as calls_today,
    (SELECT SUM(CASE WHEN pipeline_stage = 'qualified' THEN 15000 ELSE 0 END) FROM prospects) as estimated_pipeline,
    (SELECT COUNT(*) FROM prospects WHERE temperature = 'cold') as cold_leads,
    (SELECT COUNT(*) FROM prospects WHERE pipeline_stage = 'contacted') as contacted_leads,
    (SELECT COUNT(*) FROM prospects WHERE pipeline_stage = 'interested') as interested_leads;