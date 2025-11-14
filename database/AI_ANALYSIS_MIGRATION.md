# AI Analysis Database Migration

This migration adds intelligent caching for AI compatibility analysis to avoid expensive re-computation.

## What This Migration Does

Adds 3 new columns to the `job_applications` table:
- `ai_analysis_score` (INTEGER): The 0-100 compatibility score
- `ai_analysis_data` (JSONB): Full analysis including strengths, gaps, and recommendations
- `ai_analyzed_at` (TIMESTAMP): When the analysis was performed

## Smart Caching Logic

The system will automatically:
1. Run AI analysis the first time for each application
2. Save results to database
3. Reuse cached results unless:
   - Candidate profile is updated after analysis
   - Job requirements are changed after analysis

This saves expensive AI processing and improves performance!

## How to Run Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `add_ai_analysis_columns.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. You should see "Success. No rows returned"

### Option 2: Command Line (if psql is available)

```bash
cd database
psql $DATABASE_URL < add_ai_analysis_columns.sql
```

### Option 3: Automated Script

```bash
cd database
node run-migration.js
```

Note: The automated script may not work with all Supabase configurations. If it fails, use Option 1.

## Verification

After running the migration, verify the columns were added:

```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'job_applications' 
  AND column_name LIKE 'ai_%';
```

You should see:
- ai_analysis_score | integer
- ai_analysis_data | jsonb
- ai_analyzed_at | timestamp with time zone

## After Migration

Once the migration is complete:

1. The **Applications** page will save AI analysis to database
2. The **Interview Manager** page will display real AI scores
3. Analysis will be cached until candidate/job changes
4. No more fake "85%" scores!

## Rollback (if needed)

To remove these columns:

```sql
ALTER TABLE job_applications DROP COLUMN IF EXISTS ai_analysis_score;
ALTER TABLE job_applications DROP COLUMN IF EXISTS ai_analysis_data;
ALTER TABLE job_applications DROP COLUMN IF EXISTS ai_analyzed_at;
DROP INDEX IF EXISTS idx_job_applications_ai_score;
DROP INDEX IF EXISTS idx_job_applications_ai_analyzed_at;
```

## Questions?

If you encounter issues:
1. Check that backend/.env has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
2. Verify you have permissions to ALTER TABLE in Supabase
3. Try running the SQL manually in Supabase dashboard
