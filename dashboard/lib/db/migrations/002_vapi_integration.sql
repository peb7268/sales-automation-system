-- Migration: Add Vapi integration columns to calls table
-- Version: 002
-- Date: 2024-01-20

-- Add Vapi-specific columns to existing calls table
ALTER TABLE calls 
ADD COLUMN IF NOT EXISTS vapi_call_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS vapi_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS vapi_metadata JSONB,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
ADD COLUMN IF NOT EXISTS call_type VARCHAR(20) CHECK (call_type IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS assistant_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS temperature VARCHAR(20);

-- Create indexes for Vapi-specific queries
CREATE INDEX IF NOT EXISTS idx_calls_vapi_call_id ON calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_status ON calls(vapi_status);
CREATE INDEX IF NOT EXISTS idx_calls_qualification_score ON calls(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_calls_call_type ON calls(call_type);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_customer_number ON calls(customer_number);

-- Create a function to match prospects by phone number
CREATE OR REPLACE FUNCTION match_prospect_by_phone(phone VARCHAR)
RETURNS UUID AS $$
DECLARE
    prospect_uuid UUID;
BEGIN
    -- Normalize phone number (remove non-digits)
    phone := regexp_replace(phone, '[^0-9]', '', 'g');
    
    -- Try to match with various formats
    SELECT id INTO prospect_uuid
    FROM prospects
    WHERE regexp_replace(contact_phone, '[^0-9]', '', 'g') = phone
    OR regexp_replace(contact_phone, '[^0-9]', '', 'g') = '1' || phone
    OR '1' || regexp_replace(contact_phone, '[^0-9]', '', 'g') = phone
    LIMIT 1;
    
    RETURN prospect_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically match prospect when inserting call
CREATE OR REPLACE FUNCTION auto_match_prospect_on_call_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- If prospect_id is null but we have a customer_number, try to match
    IF NEW.prospect_id IS NULL AND NEW.customer_number IS NOT NULL THEN
        NEW.prospect_id := match_prospect_by_phone(NEW.customer_number);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_match_prospect_trigger
    BEFORE INSERT ON calls
    FOR EACH ROW
    EXECUTE FUNCTION auto_match_prospect_on_call_insert();

-- Create view for Vapi call analytics
CREATE OR REPLACE VIEW vapi_call_analytics AS
SELECT 
    DATE(started_at) as call_date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN vapi_status = 'completed' THEN 1 END) as completed_calls,
    COUNT(CASE WHEN vapi_status = 'failed' THEN 1 END) as failed_calls,
    AVG(duration) as avg_duration,
    SUM(cost) as total_cost,
    AVG(qualification_score) as avg_qualification_score,
    COUNT(CASE WHEN qualification_score >= 70 THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN outcome = 'meeting_scheduled' THEN 1 END) as meetings_scheduled
FROM calls
WHERE vapi_call_id IS NOT NULL
GROUP BY DATE(started_at)
ORDER BY call_date DESC;