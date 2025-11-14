-- ============================================
-- READY-TO-USE ADMIN CREATION SQL
-- ============================================
-- 
-- STEP 1: Get your UUID from Supabase Dashboard:
--   1. Go to Authentication > Users
--   2. Create a new user (or find existing user)
--   3. Copy the User ID (UUID)
--
-- STEP 2: Replace the 3 values below:
--   1. Replace 'PASTE_YOUR_UUID_HERE' with your UUID
--   2. Replace 'your-email@example.com' with your email
--   3. Replace 'Your Name' with your name
--
-- STEP 3: Run this SQL
-- ============================================

INSERT INTO profiles (id, role, full_name, email)
VALUES (
    'PASTE_YOUR_UUID_HERE',
    'admin',
    'Your Name',
    'your-email@example.com'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

INSERT INTO admin_profiles (user_id, admin_level)
VALUES ('PASTE_YOUR_UUID_HERE', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;

-- Verify
SELECT p.id, p.email, p.role, p.full_name, ap.admin_level
FROM profiles p
LEFT JOIN admin_profiles ap ON p.id = ap.user_id
WHERE p.role = 'admin';

