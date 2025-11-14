# Quick Admin Setup Guide

## Complete Step-by-Step Instructions

### Step 1: Create Auth User in Supabase Dashboard

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Fill in:
   - **Email**: `admin@yourdomain.com` (or your preferred email)
   - **Password**: Choose a strong password (e.g., `AdminPass123!`)
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create user"**
6. **IMPORTANT**: Copy the **User ID** (UUID) - it looks like: `123e4567-e89b-12d3-a456-426614174000`

---

### Step 2: Run SQL Command

1. Open **SQL Editor** in Supabase Dashboard
2. Open the file `database/create_admin_user.sql`
3. Replace **3 places** in the SQL:
   - `YOUR_ADMIN_USER_ID_HERE` → Paste the UUID you copied in Step 1
   - `admin@yourdomain.com` → Your admin email
   - `Admin Name` → Your admin's full name
4. Click **"Run"**

---

### Step 3: Verify Admin Created

After running the SQL, you should see a result showing:
- ✅ Admin created successfully!

If you see an error, check:
- Did you replace all 3 placeholders?
- Is the UUID correct?
- Did you create the auth user first?

---

### Step 4: Login and Access Dashboard

1. Go to your frontend login page: `/auth/login`
2. Login with:
   - Email: The email you used in Step 1
   - Password: The password you set in Step 1
3. Navigate to: `/admin/dashboard`
4. You should see the admin dashboard! 🎉

---

## Quick Copy-Paste SQL Template

```sql
-- Replace YOUR_UUID_HERE with UUID from auth.users
-- Replace admin@example.com with your email
-- Replace Admin Name with your name

INSERT INTO profiles (id, role, full_name, email)
VALUES (
    'YOUR_UUID_HERE',
    'admin',
    'Admin Name',
    'admin@example.com'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

INSERT INTO admin_profiles (user_id, admin_level)
VALUES ('YOUR_UUID_HERE', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
```

---

## Troubleshooting

**Error: "role must be one of..."**
- Make sure you ran `admin_migration_step1.sql` first to add 'admin' to the enum

**Error: "duplicate key value violates unique constraint"**
- The user already exists - this is OK, the ON CONFLICT will handle it

**Can't login after creating admin**
- Verify the email matches exactly
- Check that Auto Confirm was checked when creating the user
- Try resetting password if needed

