-- ============================================
-- AI ANALYSIS FEATURE - DATABASE SCHEMA
-- ============================================

-- Table to store AI analysis results for job-candidate skill matching
CREATE TABLE job_skill_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    matching_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    skill_match_percentage INTEGER DEFAULT 0,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(job_id, candidate_id)
);

-- Indexes for performance
CREATE INDEX idx_job_skill_analysis_job_id ON job_skill_analysis(job_id);
CREATE INDEX idx_job_skill_analysis_candidate_id ON job_skill_analysis(candidate_id);
CREATE INDEX idx_job_skill_analysis_analysis_date ON job_skill_analysis(analysis_date DESC);

-- Enable RLS
ALTER TABLE job_skill_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Candidates can view their own skill analysis"
    ON job_skill_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = job_skill_analysis.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view analysis for their jobs"
    ON job_skill_analysis FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN recruiter_profiles ON jobs.recruiter_id = recruiter_profiles.id
            WHERE jobs.id = job_skill_analysis.job_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert/update analysis"
    ON job_skill_analysis FOR ALL
    USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_job_skill_analysis_updated_at 
    BEFORE UPDATE ON job_skill_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
