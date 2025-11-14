-- ============================================
-- ROADMAP-BASED COURSES - DATABASE SCHEMA
-- ============================================

-- Stores multiple YouTube videos (1-5) per skill for each candidate
CREATE TABLE IF NOT EXISTS candidate_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level TEXT, -- Beginner, Intermediate, Advanced, Expert
    phase_number INTEGER, -- Which roadmap phase this belongs to
    youtube_video_id TEXT NOT NULL,
    video_title TEXT NOT NULL,
    video_description TEXT,
    thumbnail_url TEXT,
    channel_name TEXT,
    duration TEXT,
    published_at TEXT,
    is_watched BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE, -- When roadmap changes and AI says not needed
    watched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(candidate_id, skill_name, skill_level, youtube_video_id) -- Prevent duplicate videos for same skill
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidate_courses_candidate ON candidate_courses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_courses_active ON candidate_courses(candidate_id, is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_candidate_courses_skill ON candidate_courses(skill_name);

-- RLS policies
ALTER TABLE candidate_courses ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own courses
CREATE POLICY "Candidates can view own courses" ON candidate_courses
    FOR SELECT USING (
        candidate_id IN (
            SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
        )
    );

-- Candidates can insert their own courses
CREATE POLICY "Candidates can insert own courses" ON candidate_courses
    FOR INSERT WITH CHECK (
        candidate_id IN (
            SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
        )
    );

-- Candidates can update their own courses
CREATE POLICY "Candidates can update own courses" ON candidate_courses
    FOR UPDATE USING (
        candidate_id IN (
            SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
        )
    );

-- Candidates can delete their own courses
CREATE POLICY "Candidates can delete own courses" ON candidate_courses
    FOR DELETE USING (
        candidate_id IN (
            SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
        )
    );

-- Add comments
COMMENT ON TABLE candidate_courses IS 'Stores roadmap-based learning courses (YouTube videos) for candidates - allows 1-5 videos per skill';
COMMENT ON COLUMN candidate_courses.is_archived IS 'Set to true when roadmap changes and AI determines course is no longer needed';

-- ============================================
-- MIGRATION: Update existing table if it exists
-- ============================================
-- If table already exists, drop old constraint and add new one
DO $$ 
BEGIN
    -- Drop old unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'candidate_courses_candidate_id_skill_name_skill_level_key'
    ) THEN
        ALTER TABLE candidate_courses 
        DROP CONSTRAINT candidate_courses_candidate_id_skill_name_skill_level_key;
    END IF;
    
    -- Add new unique constraint (allows multiple videos per skill)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'candidate_courses_candidate_id_skill_name_skill_level_youtube_video_id_key'
    ) THEN
        ALTER TABLE candidate_courses 
        ADD CONSTRAINT candidate_courses_candidate_id_skill_name_skill_level_youtube_video_id_key 
        UNIQUE(candidate_id, skill_name, skill_level, youtube_video_id);
    END IF;
END $$;

