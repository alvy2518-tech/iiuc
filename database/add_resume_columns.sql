-- Add resume storage columns to candidate_profiles
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS resume_file TEXT,
ADD COLUMN IF NOT EXISTS resume_filename TEXT,
ADD COLUMN IF NOT EXISTS resume_filetype TEXT;
