-- ============================================
-- EXAMPLE: How to create admin user
-- Copy this and replace with YOUR actual values
-- ============================================

-- EXAMPLE VALUES (Replace these with your actual values):
-- UUID: 123e4567-e89b-12d3-a456-426614174000  (from auth.users)
-- Email: admin@example.com
-- Name: John Admin

-- Step 1: Create/Update profile with admin role
INSERT INTO profiles (id, role, full_name, email)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',  -- Your UUID here
    'admin',
    'John Admin',                              -- Your name here
    'admin@example.com'                        -- Your email here
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- Step 2: Create admin profile
INSERT INTO admin_profiles (user_id, admin_level)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',  -- Same UUID as above
    'super_admin'
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify admin was created successfully
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
WHERE p.id = '123e4567-e89b-12d3-a456-426614174000';  -- Same UUID

