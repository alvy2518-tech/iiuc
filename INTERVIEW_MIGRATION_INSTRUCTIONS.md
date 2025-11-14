# Interview System - Database Migration Instructions

## Issue
The interview page shows "No Selected Candidates" even after moving candidates to interview because the required database tables (`conversations`, `messages`, `calls`) don't exist yet.

## Solution
You need to run the database migration file to create these tables.

## Steps to Fix

### 1. Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)

### 2. Run the Migration
1. Click **"New Query"**
2. Copy the entire contents of `/database/interview_messaging_migration.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** or press `Ctrl+Enter`

### 3. Verify Tables Were Created
After running the migration, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'calls');
```

You should see 3 rows returned with these table names.

### 4. Test the Interview System
1. Go to **Applications** page
2. Click **"Move to Interview"** on a candidate
3. The candidate should now appear in the **Interview** page
4. You can now chat with the candidate

## What the Migration Creates

### Tables
- ✅ `conversations` - Stores chat conversations between recruiters and candidates
- ✅ `messages` - Stores individual messages in conversations
- ✅ `calls` - Stores call history and metadata

### Features
- ✅ Row Level Security (RLS) policies for data access control
- ✅ Automatic triggers for unread message counts
- ✅ Enforces "recruiter messages first" rule
- ✅ Indexes for performance optimization

## Troubleshooting

### If you get "policy already exists" errors
The migration file has been updated with `DROP POLICY IF EXISTS` statements, so it's safe to run multiple times.

### If you get "type does not exist" errors
Make sure the `user_role` enum exists in your database. If not, create it:

```sql
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
```

### If applications still don't show
1. Check the browser console for errors
2. Check the backend terminal for logs (look for "Found X shortlisted candidates")
3. Make sure you actually clicked "Move to Interview" and the status changed to 'shortlisted'

## Current Status
- ✅ Backend API updated to fetch conversations
- ✅ Frontend ready to display interview candidates
- ⏳ **Need to run migration SQL file** ← You are here
- ⏳ Test the complete flow

## Next Steps After Migration
1. Refresh your frontend application
2. Go to Applications page
3. Move a candidate to interview
4. Check the Interview page - you should now see the candidate!
