-- ============================================
-- ADMIN DASHBOARD MIGRATION
-- Adds admin role and creates admin user
-- ============================================
-- 
-- IMPORTANT: PostgreSQL requires enum values to be committed before use.
-- This file combines both steps, but you MUST run them separately:
--
-- OPTION 1: Use the split files (RECOMMENDED)
--   1. Run admin_migration_step1.sql and commit
--   2. Run admin_migration_step2.sql
--
-- OPTION 2: Run this file in two separate transactions
--   1. Run lines 10-12 (ALTER TYPE) and commit
--   2. Run the rest of the file
-- ============================================

-- STEP 1: Add 'admin' to user_role enum
-- Run this FIRST and COMMIT before proceeding
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- ============================================
-- STEP 2: After committing the above, run everything below
-- ============================================

-- Create admin_profiles table (optional, for future admin-specific data)
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    admin_level TEXT DEFAULT 'super_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_job_applications_ai_analyzed ON job_applications(ai_analyzed_at) WHERE ai_analyzed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_skills_skill_name ON job_skills(skill_name);

-- Enable RLS on admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Admins can view admin profiles" ON admin_profiles;

-- RLS Policy: Only admins can view admin profiles
CREATE POLICY "Admins can view admin profiles"
    ON admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = admin_profiles.user_id
            AND profiles.role = 'admin'
            AND profiles.id = auth.uid()
        )
    );

-- ============================================
-- CREATE FIRST ADMIN USER
-- ============================================
-- 
-- METHOD 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Enter email and password
-- 4. Copy the User ID (UUID)
-- 5. Run the SQL below with the User ID
--
-- METHOD 2: Using API Endpoint (After first admin is created)
-- POST /api/v1/admin/register
-- Headers: Authorization: Bearer <admin_token>
-- Body: { "email": "admin@example.com", "password": "SecurePassword123!", "fullName": "Admin Name" }
--
-- ============================================

-- Replace 'YOUR_ADMIN_USER_ID_HERE' with the UUID from auth.users table
-- Replace 'admin@example.com' and 'System Administrator' with your admin details

/*
-- Uncomment and run this SQL after creating the auth user:

-- Step 1: Update or insert profile with admin role
INSERT INTO profiles (id, role, full_name, email)
VALUES (
    'YOUR_ADMIN_USER_ID_HERE', -- Replace with UUID from auth.users
    'admin',
    'System Administrator', -- Replace with admin's full name
    'admin@example.com' -- Replace with admin's email
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- Step 2: Create admin profile
INSERT INTO admin_profiles (user_id, admin_level)
VALUES ('YOUR_ADMIN_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- Verify admin was created
SELECT p.id, p.email, p.role, p.full_name, ap.admin_level
FROM profiles p
LEFT JOIN admin_profiles ap ON p.id = ap.user_id
WHERE p.role = 'admin';
*/

