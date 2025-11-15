-- Run this SQL in your Supabase SQL Editor

-- Create SDK clients table for developer applications
CREATE TABLE IF NOT EXISTS sdk_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(64) UNIQUE NOT NULL,
    client_secret VARCHAR(128) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    app_url VARCHAR(255),
    redirect_uris TEXT[] NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on client_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sdk_clients_client_id ON sdk_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_sdk_clients_created_by ON sdk_clients(created_by);

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id VARCHAR(64) NOT NULL REFERENCES sdk_clients(client_id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_usage_client_id ON api_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_client_timestamp ON api_usage(client_id, timestamp);

-- Add RLS policies (if using Row Level Security)
ALTER TABLE sdk_clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can create SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can update their own SDK clients" ON sdk_clients;
DROP POLICY IF EXISTS "Users can delete their own SDK clients" ON sdk_clients;

-- Create new policies
CREATE POLICY "Users can view their own SDK clients"
    ON sdk_clients FOR SELECT
    USING (created_by = auth.uid());

CREATE POLICY "Users can create SDK clients"
    ON sdk_clients FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own SDK clients"
    ON sdk_clients FOR UPDATE
    USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own SDK clients"
    ON sdk_clients FOR DELETE
    USING (created_by = auth.uid());

-- Test the tables
SELECT 'SDK tables created successfully!' as status;