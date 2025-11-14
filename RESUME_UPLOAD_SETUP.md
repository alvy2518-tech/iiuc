# Resume Upload Feature Setup

## Database Migration Required

Before the resume upload feature will work, you need to add columns to the `candidate_profiles` table.

### Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the following SQL:

```sql
-- Add resume storage columns to candidate_profiles
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS resume_file TEXT,
ADD COLUMN IF NOT EXISTS resume_filename TEXT,
ADD COLUMN IF NOT EXISTS resume_filetype TEXT;
```

4. Click **Run** to execute the migration

### Option 2: Using psql (if you have PostgreSQL client installed)

```bash
cd database
psql -h aws-0-ap-southeast-1.pooler.supabase.com \
     -p 6543 \
     -d postgres \
     -U postgres.pnuzufyabyrvtfiruzqx \
     -f add_resume_columns.sql
```

## Features

### For Candidates:
- Upload resume (PDF or DOCX, max 5MB)
- Resume is stored securely in database
- Simple upload interface on profile edit page

### For Recruiters:
- View which candidates have uploaded resumes
- Download candidate resumes with one click
- Resume download button appears on candidate cards

## Testing

1. **Upload a Resume:**
   - Go to http://localhost:3000/candidate/profile/edit
   - Click "Upload Resume" button
   - Select a PDF or DOCX file (max 5MB)
   - Wait for "Resume uploaded successfully!" message

2. **Download Resume (as Recruiter):**
   - Go to http://localhost:3000/recruiter/candidates
   - Find candidates with "Download Resume" button
   - Click to download their resume

## Technical Details

- Resumes are stored as base64 text in PostgreSQL
- File size limit: 5MB
- Supported formats: PDF, DOCX
- Download includes original filename
- Authentication required for both upload and download
