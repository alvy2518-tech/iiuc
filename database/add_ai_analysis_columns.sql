-- Add AI analysis columns to job_applications table
-- These columns store the AI compatibility analysis results
-- Analysis is cached and only re-run when candidate or job details change

-- Add AI analysis score column (0-100)
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS ai_analysis_score INTEGER;

-- Add AI analysis data column (full JSON analysis)
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS ai_analysis_data JSONB;

-- Add timestamp for when analysis was performed
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_applications_ai_score 
ON job_applications(ai_analysis_score DESC) 
WHERE ai_analysis_score IS NOT NULL;

-- Add index for analysis timestamp
CREATE INDEX IF NOT EXISTS idx_job_applications_ai_analyzed_at 
ON job_applications(ai_analyzed_at DESC) 
WHERE ai_analyzed_at IS NOT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN job_applications.ai_analysis_score IS 'AI-generated compatibility score (0-100) based on candidate skills, experience, and job requirements';
COMMENT ON COLUMN job_applications.ai_analysis_data IS 'Full AI analysis JSON including score breakdown, strengths, gaps, and recommendations';
COMMENT ON COLUMN job_applications.ai_analyzed_at IS 'Timestamp when the AI analysis was last performed. Used to determine if re-analysis is needed.';
