-- ============================================
-- UPDATE EXISTING candidate_courses TABLE
-- Run this if you already created the table
-- ============================================

-- Drop old unique constraint (allows only 1 video per skill)
DO $$ 
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'candidate_courses_candidate_id_skill_name_skill_level_key'
    ) THEN
        ALTER TABLE candidate_courses 
        DROP CONSTRAINT candidate_courses_candidate_id_skill_name_skill_level_key;
        RAISE NOTICE 'Dropped old unique constraint';
    ELSE
        RAISE NOTICE 'Old constraint does not exist, skipping';
    END IF;
END $$;

-- Add new unique constraint (allows multiple videos per skill, but prevents duplicates)
DO $$ 
BEGIN
    -- Add new constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'candidate_courses_candidate_id_skill_name_skill_level_youtube_video_id_key'
    ) THEN
        ALTER TABLE candidate_courses 
        ADD CONSTRAINT candidate_courses_candidate_id_skill_name_skill_level_youtube_video_id_key 
        UNIQUE(candidate_id, skill_name, skill_level, youtube_video_id);
        RAISE NOTICE 'Added new unique constraint (allows multiple videos per skill)';
    ELSE
        RAISE NOTICE 'New constraint already exists, skipping';
    END IF;
END $$;

-- Update table comment
COMMENT ON TABLE candidate_courses IS 'Stores roadmap-based learning courses (YouTube videos) for candidates - allows 1-5 videos per skill';

