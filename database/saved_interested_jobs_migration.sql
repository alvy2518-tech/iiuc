-- ============================================
-- SAVED & INTERESTED JOBS FEATURE - DATABASE SCHEMA
-- ============================================

-- Table for saved/bookmarked jobs (simple bookmarking)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(candidate_id, job_id)
);

-- Table for interested jobs (career planning with AI roadmap)
CREATE TABLE IF NOT EXISTS interested_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(candidate_id, job_id)
);

-- Table for AI-generated learning roadmaps
CREATE TABLE IF NOT EXISTS candidate_learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    roadmap_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_job_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    total_skills_needed INTEGER DEFAULT 0,
    total_time_estimate TEXT,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add save_count to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate_id ON saved_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at ON saved_jobs(saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_interested_jobs_candidate_id ON interested_jobs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interested_jobs_job_id ON interested_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_interested_jobs_added_at ON interested_jobs(added_at DESC);

CREATE INDEX IF NOT EXISTS idx_candidate_learning_roadmaps_candidate_id ON candidate_learning_roadmaps(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_learning_roadmaps_generated_date ON candidate_learning_roadmaps(generated_date DESC);

-- Enable RLS
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interested_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_learning_roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_jobs
CREATE POLICY "Candidates can view their own saved jobs"
    ON saved_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = saved_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can insert their own saved jobs"
    ON saved_jobs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = saved_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can delete their own saved jobs"
    ON saved_jobs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = saved_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- RLS Policies for interested_jobs
CREATE POLICY "Candidates can view their own interested jobs"
    ON interested_jobs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = interested_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can insert their own interested jobs"
    ON interested_jobs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = interested_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can delete their own interested jobs"
    ON interested_jobs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = interested_jobs.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- RLS Policies for candidate_learning_roadmaps
CREATE POLICY "Candidates can view their own roadmap"
    ON candidate_learning_roadmaps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_learning_roadmaps.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage roadmaps"
    ON candidate_learning_roadmaps FOR ALL
    USING (true);

-- Trigger for updated_at on candidate_learning_roadmaps
CREATE TRIGGER update_candidate_learning_roadmaps_updated_at 
    BEFORE UPDATE ON candidate_learning_roadmaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update save_count when saved_jobs changes
CREATE OR REPLACE FUNCTION update_job_save_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs SET save_count = save_count + 1 WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update save_count
CREATE TRIGGER update_job_save_count_trigger
    AFTER INSERT OR DELETE ON saved_jobs
    FOR EACH ROW EXECUTE FUNCTION update_job_save_count();

-- Comments for documentation
COMMENT ON TABLE saved_jobs IS 'Stores bookmarked/saved jobs by candidates for easy access';
COMMENT ON TABLE interested_jobs IS 'Stores jobs candidates are interested in for AI-powered learning roadmap generation';
COMMENT ON TABLE candidate_learning_roadmaps IS 'Stores AI-generated learning roadmaps based on interested jobs. Cache invalidated when skills or interested jobs change.';
COMMENT ON COLUMN candidate_learning_roadmaps.roadmap_data IS 'JSONB structure containing linear learning phases with skills, resources, and dependencies';
COMMENT ON COLUMN candidate_learning_roadmaps.source_job_ids IS 'Array of job IDs that were analyzed to generate this roadmap';
COMMENT ON COLUMN jobs.save_count IS 'Number of candidates who have saved/bookmarked this job';

