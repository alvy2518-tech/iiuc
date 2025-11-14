# Admin Dashboard Setup Instructions

## Overview
This document provides step-by-step instructions for setting up the admin dashboard feature.

## Prerequisites
- Supabase project with database access
- Backend server running
- Frontend application running

## Step 1: Run Database Migration

**IMPORTANT**: PostgreSQL requires enum values to be committed before use. You must run the migration in TWO separate steps:

### Option A: Use Split Files (Recommended)

1. **First**, run `database/admin_migration_step1.sql`:
   ```sql
   -- This adds 'admin' to the user_role enum
   ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
   ```
   **Click "Run" and wait for it to complete.**

2. **Then**, run `database/admin_migration_step2.sql`:
   - This creates the admin_profiles table
   - Sets up indexes
   - Configures RLS policies

### Option B: Use Single File (Manual Split)

1. Open `database/admin_migration.sql` in Supabase SQL Editor
2. **First**, run ONLY this line:
   ```sql
   ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
   ```
   **Click "Run" and wait for it to complete.**
3. **Then**, run the rest of the file (everything after the ALTER TYPE statement)

This will:
- Add 'admin' to the user_role enum
- Create admin_profiles table
- Create necessary indexes
- Set up RLS policies

## Step 2: Create First Admin User

### Option A: Using Supabase Dashboard (Recommended for first admin)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add User"** > **"Create new user"**
4. Enter:
   - Email: `admin@yourdomain.com`
   - Password: (choose a strong password)
   - Auto Confirm User: ✅ (check this)
5. Click **"Create user"**
6. Copy the **User ID** (UUID) from the created user

7. Go to **SQL Editor** in Supabase Dashboard
8. Run the following SQL (replace placeholders):

```sql
-- Replace YOUR_ADMIN_USER_ID_HERE with the UUID from step 6
-- Replace admin@yourdomain.com and Admin Name with your values

INSERT INTO profiles (id, role, full_name, email)
VALUES (
    'YOUR_ADMIN_USER_ID_HERE',
    'admin',
    'Admin Name',
    'admin@yourdomain.com'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

INSERT INTO admin_profiles (user_id, admin_level)
VALUES ('YOUR_ADMIN_USER_ID_HERE', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
```

9. Verify admin was created:

```sql
SELECT p.id, p.email, p.role, p.full_name, ap.admin_level
FROM profiles p
LEFT JOIN admin_profiles ap ON p.id = ap.user_id
WHERE p.role = 'admin';
```

### Option B: Using API Endpoint (After first admin exists)

Once you have at least one admin user, you can create additional admins via the API:

```bash
POST /api/v1/admin/register
Headers:
  Authorization: Bearer <admin_access_token>
Body:
{
  "email": "newadmin@yourdomain.com",
  "password": "SecurePassword123!",
  "fullName": "New Admin Name"
}
```

## Step 3: Access Admin Dashboard

1. Login with your admin credentials at `/auth/login`
2. Navigate to `/admin/dashboard`
3. You should see the admin dashboard with analytics

## Step 4: Verify Features

The admin dashboard includes:

- **Users Analyzed**: Number of candidates with AI analysis
- **Jobs Suggested**: Total number of job applications
- **Skills Most in Demand**: Top 10 skills from job postings
- **Common Gaps**: Top 10 skill gaps identified from AI analysis
- **AI Insights**: AI-powered recommendations and trends

## Troubleshooting

### Issue: "Access denied" or 403 error
- Verify the user's role is set to 'admin' in the profiles table
- Check that the JWT token is valid and includes the correct user ID

### Issue: Dashboard shows no data
- Ensure there are job applications with AI analysis data
- Check that job_skills table has data
- Verify AI analysis has been run on some applications

### Issue: Admin registration endpoint fails
- Ensure SUPABASE_SERVICE_ROLE_KEY is set in backend .env
- Verify the admin user making the request has admin role
- Check backend logs for detailed error messages

## Security Notes

- Admin endpoints are protected by authentication middleware
- Only users with role='admin' can access admin routes
- Admin registration endpoint requires existing admin authentication
- Store admin credentials securely
- Use strong passwords for admin accounts
- Consider implementing 2FA for admin accounts in the future

## API Endpoints

### GET /api/v1/admin/dashboard
Returns dashboard analytics including:
- Users analyzed count
- Jobs suggested/applications count
- Skills most in demand
- Common skill gaps
- Average analysis score

### GET /api/v1/admin/analytics?period=30
Returns detailed analytics with AI insights for the specified period (days)

### POST /api/v1/admin/register
Creates a new admin user (requires admin authentication)
Body: { email, password, fullName }

