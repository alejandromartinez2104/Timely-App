-- First, disable RLS on both tables
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies for clients table
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
DROP POLICY IF EXISTS "Enable insert for all users" ON clients;
DROP POLICY IF EXISTS "Enable update for all users" ON clients;
DROP POLICY IF EXISTS "Enable delete for all users" ON clients;

-- Drop all existing RLS policies for time_entries table
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Enable read access for all users" ON time_entries;
DROP POLICY IF EXISTS "Enable insert for all users" ON time_entries;
DROP POLICY IF EXISTS "Enable update for all users" ON time_entries;
DROP POLICY IF EXISTS "Enable delete for all users" ON time_entries;

-- Remove user_id columns if they still exist
ALTER TABLE clients DROP COLUMN IF EXISTS user_id;
ALTER TABLE time_entries DROP COLUMN IF EXISTS user_id;

-- Grant full access to anon and authenticated roles
GRANT ALL ON clients TO anon;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON time_entries TO anon;
GRANT ALL ON time_entries TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
