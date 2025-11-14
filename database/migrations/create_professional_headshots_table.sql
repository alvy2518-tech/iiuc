-- Create professional_headshots table for AI-generated headshot history
-- Run this SQL in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own headshots" ON professional_headshots;
DROP POLICY IF EXISTS "Users can insert own headshots" ON professional_headshots;
DROP POLICY IF EXISTS "Users can delete own headshots" ON professional_headshots;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS professional_headshots_updated_at ON professional_headshots;

CREATE TABLE IF NOT EXISTS professional_headshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  generated_image_url TEXT NOT NULL,
  style VARCHAR(50) NOT NULL CHECK (style IN ('formal', 'linkedin', 'corporate', 'casual_professional')),
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_professional_headshots_candidate 
ON professional_headshots(candidate_id);

CREATE INDEX IF NOT EXISTS idx_professional_headshots_created_at 
ON professional_headshots(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE professional_headshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own headshots
CREATE POLICY "Users can view own headshots"
ON professional_headshots
FOR SELECT
USING (
  candidate_id IN (
    SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can insert their own headshots
CREATE POLICY "Users can insert own headshots"
ON professional_headshots
FOR INSERT
WITH CHECK (
  candidate_id IN (
    SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policy: Users can delete their own headshots
CREATE POLICY "Users can delete own headshots"
ON professional_headshots
FOR DELETE
USING (
  candidate_id IN (
    SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
  )
);

-- Add comment to table
COMMENT ON TABLE professional_headshots IS 'Stores AI-generated professional headshot images with history';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_professional_headshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professional_headshots_updated_at
BEFORE UPDATE ON professional_headshots
FOR EACH ROW
EXECUTE FUNCTION update_professional_headshots_updated_at();
