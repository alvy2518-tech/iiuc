-- ============================================
-- AI ANALYSIS CACHE OPTIMIZATION MIGRATION
-- Event-Based Cache Invalidation + 7-Day Fallback
-- ============================================

-- Create table for caching AI skill recommendations
CREATE TABLE IF NOT EXISTS job_skill_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(job_id, candidate_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_skill_recommendations_job_id ON job_skill_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skill_recommendations_candidate_id ON job_skill_recommendations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_skill_recommendations_generated_date ON job_skill_recommendations(generated_date DESC);

-- Enable RLS
ALTER TABLE job_skill_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recommendations
CREATE POLICY "Candidates can view their own skill recommendations"
    ON job_skill_recommendations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = job_skill_recommendations.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view recommendations for their jobs"
    ON job_skill_recommendations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN recruiter_profiles ON jobs.recruiter_id = recruiter_profiles.id
            WHERE jobs.id = job_skill_recommendations.job_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert/update recommendations"
    ON job_skill_recommendations FOR ALL
    USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_job_skill_recommendations_updated_at 
    BEFORE UPDATE ON job_skill_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE job_skill_recommendations IS 'Caches AI-generated learning recommendations for missing skills. Cache is invalidated when job or candidate skills change, or after 7 days.';
COMMENT ON COLUMN job_skill_recommendations.generated_date IS 'When recommendations were generated. Used for 7-day fallback expiry.';


