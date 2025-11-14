-- ============================================
-- COMPLETE ADMIN USER CREATION SCRIPT
-- ============================================
-- 
-- ⚠️⚠️⚠️ IMPORTANT: DO NOT RUN THIS AS-IS! ⚠️⚠️⚠️
-- 
-- YOU MUST REPLACE THE PLACEHOLDERS BELOW FIRST!
--
-- INSTRUCTIONS:
-- 1. First, create the auth user in Supabase Dashboard:
--    - Go to Authentication > Users > Add User
--    - Email: admin@yourdomain.com
--    - Password: YourSecurePassword123!
--    - Auto Confirm: ✅ (check this)
--    - Click "Create user"
--    - Copy the User ID (UUID) shown (looks like: 123e4567-e89b-12d3-a456-426614174000)
--
-- 2. Replace ALL placeholders below:
--    - REPLACE '00000000-0000-0000-0000-000000000000' with your UUID
--    - REPLACE 'admin@yourdomain.com' with your email
--    - REPLACE 'Admin Name' with your name
--
-- 3. Then run this SQL script
-- ============================================

-- Step 1: Create/Update profile with admin role
-- ⚠️ REPLACE THE VALUES BELOW BEFORE RUNNING!
INSERT INTO profiles (id, role, full_name, email)
VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ⚠️ REPLACE with UUID from auth.users (e.g., '123e4567-e89b-12d3-a456-426614174000')
    'admin',
    'Admin Name',                             -- ⚠️ REPLACE with your admin's name (e.g., 'John Admin')
    'admin@yourdomain.com'                    -- ⚠️ REPLACE with your admin email (e.g., 'admin@example.com')
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- Step 2: Create admin profile
-- ⚠️ REPLACE THE UUID BELOW (same as above)!
INSERT INTO admin_profiles (user_id, admin_level)
VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ⚠️ REPLACE with same UUID as above
    'super_admin'
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify admin was created successfully
-- ⚠️ REPLACE THE UUID BELOW (same as above)!
SELECT 
    p.id,
    p.email,
    p.role,
    p.full_name,
    ap.admin_level,
    CASE 
        WHEN p.role = 'admin' THEN '✅ Admin created successfully!'
        ELSE '❌ Error: Role not set correctly'
    END as status
FROM profiles p
LEFT JOIN admin_profiles ap ON p.id = ap.user_id
WHERE p.id = '00000000-0000-0000-0000-000000000000';  -- ⚠️ REPLACE with UUID

-- ============================================
-- EXAMPLE (DO NOT RUN - FOR REFERENCE ONLY):
-- ============================================
/*
-- If your UUID is: 123e4567-e89b-12d3-a456-426614174000
-- And email is: admin@example.com
-- And name is: John Admin

INSERT INTO profiles (id, role, full_name, email)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'admin',
    'John Admin',
    'admin@example.com'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

INSERT INTO admin_profiles (user_id, admin_level)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
*/

