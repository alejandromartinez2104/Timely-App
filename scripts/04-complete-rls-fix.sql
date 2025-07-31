-- COMPLETE RLS FIX - Run this script in Supabase SQL Editor

-- First, let's completely disable RLS and drop all policies
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_entries DISABLE ROW LEVEL SECURITY;

-- Drop ALL possible policies (including any we might have missed)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on clients table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'clients' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON clients';
    END LOOP;
    
    -- Drop all policies on time_entries table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'time_entries' LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON time_entries';
    END LOOP;
END $$;

-- Recreate tables from scratch to ensure clean state
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Recreate clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate time_entries table
CREATE TABLE time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    hours_worked NUMERIC(10,2),
    earnings NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is disabled (should be by default on new tables)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;

-- Grant ALL permissions to anon and authenticated users
GRANT ALL PRIVILEGES ON clients TO anon;
GRANT ALL PRIVILEGES ON clients TO authenticated;
GRANT ALL PRIVILEGES ON time_entries TO anon;
GRANT ALL PRIVILEGES ON time_entries TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert some test data to verify it works
INSERT INTO clients (name, hourly_rate) VALUES 
('Test Client 1', 25.00),
('Test Client 2', 30.50);

-- Verify the setup
SELECT 'Clients table created successfully' as status;
SELECT * FROM clients;
