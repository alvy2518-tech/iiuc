-- Create video_calls table for tracking video interviews
CREATE TABLE IF NOT EXISTS video_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  channel_name VARCHAR(255) NOT NULL,
  initiated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'ongoing', 'completed', 'cancelled'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Calculated when call ends
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_initiated_by ON video_calls(initiated_by);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_started_at ON video_calls(started_at);

-- Add trigger to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_video_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Calculate duration if call is being ended
  IF NEW.status = 'completed' AND NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_calls_updated_at
  BEFORE UPDATE ON video_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_video_calls_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view video calls for their conversations
CREATE POLICY "Users can view their video calls"
  ON video_calls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.candidate_id = auth.uid() OR conversations.recruiter_id = auth.uid())
    )
  );

-- Policy: Users can create video calls for their conversations
CREATE POLICY "Users can create video calls"
  ON video_calls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.candidate_id = auth.uid() OR conversations.recruiter_id = auth.uid())
    )
    AND initiated_by = auth.uid()
  );

-- Policy: Users can update video calls they're part of
CREATE POLICY "Users can update their video calls"
  ON video_calls
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.candidate_id = auth.uid() OR conversations.recruiter_id = auth.uid())
    )
  );

-- Add comments for documentation
COMMENT ON TABLE video_calls IS 'Stores video call records for interview conversations';
COMMENT ON COLUMN video_calls.channel_name IS 'Agora channel name for the video call';
COMMENT ON COLUMN video_calls.initiated_by IS 'User who started the call';
COMMENT ON COLUMN video_calls.status IS 'Call status: pending, ongoing, completed, cancelled';
COMMENT ON COLUMN video_calls.duration_seconds IS 'Call duration in seconds, calculated automatically';
