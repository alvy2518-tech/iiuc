-- Add reviewed_at column to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update existing shortlisted applications to have a reviewed_at timestamp
UPDATE job_applications 
SET reviewed_at = updated_at 
WHERE status IN ('shortlisted', 'rejected', 'hired') 
  AND reviewed_at IS NULL;
