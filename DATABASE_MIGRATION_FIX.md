# Database Migration Fix

## Issue
The migration was failing because some policies for `job_applications` table already existed.

## Solution
Updated the migration file (`/database/interview_messaging_migration.sql`) to include `DROP POLICY IF EXISTS` statements before creating policies. This ensures the migration can be run safely even if some objects already exist.

## Changes Made:
1. Added `DROP POLICY IF EXISTS` for all job_applications policies
2. Added `DROP POLICY IF EXISTS` for all conversations policies  
3. Added `DROP POLICY IF EXISTS` for all messages policies
4. Added `DROP POLICY IF EXISTS` for all calls policies
5. Added `DROP FUNCTION IF EXISTS CASCADE` for trigger functions

## How to Run the Migration:

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Updated Migration**
   - Copy the entire content of `/database/interview_messaging_migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

The migration will now:
- Drop existing policies if they exist
- Recreate them with the correct definitions
- Create new tables (conversations, messages, calls)
- Set up all triggers and functions for the messaging system

## What Gets Created:

### Tables:
- ✅ `job_applications` (enhanced with status column if not exists)
- ✅ `conversations` (new)
- ✅ `messages` (new)
- ✅ `calls` (new)

### Enums:
- ✅ `application_status` (pending, reviewed, shortlisted, interview_scheduled, rejected, accepted)
- ✅ `message_type` (text, system)
- ✅ `call_status` (initiated, ringing, ongoing, completed, missed, declined)

### Automatic Features:
- ✅ Unread message counts
- ✅ Last message tracking
- ✅ Conversation initiation tracking
- ✅ Recruiter-first messaging enforcement via RLS

The migration is now safe to run multiple times!
