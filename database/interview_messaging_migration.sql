-- ============================================
-- INTERVIEW AND MESSAGING SYSTEM - DATABASE SCHEMA
-- ============================================

-- Application status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'rejected', 'accepted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message type enum (if not exists)
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Call status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'ringing', 'ongoing', 'completed', 'missed', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- JOB APPLICATIONS TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(job_id, candidate_id)
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Conversation state
    is_initiated BOOLEAN DEFAULT FALSE,
    initiated_by_recruiter BOOLEAN DEFAULT FALSE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_content TEXT,
    
    -- Unread counts
    recruiter_unread_count INTEGER DEFAULT 0,
    candidate_unread_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(application_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Sender information
    sender_type user_role NOT NULL, -- 'recruiter' or 'candidate'
    sender_id UUID NOT NULL, -- Can be recruiter_profile.id or candidate_profile.id
    
    -- Message content
    message_type message_type NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    
    -- Message metadata
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- CALLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Call information
    caller_type user_role NOT NULL, -- Only 'recruiter' for now
    caller_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    
    -- Call state
    status call_status NOT NULL DEFAULT 'initiated',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    
    -- Call metadata
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Job applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_application_id ON conversations(application_id);
CREATE INDEX IF NOT EXISTS idx_conversations_recruiter_id ON conversations(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_candidate_id ON conversations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_conversations_job_id ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type_id ON messages(sender_type, sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Calls indexes
CREATE INDEX IF NOT EXISTS idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Drop existing job_applications policies if they exist
DROP POLICY IF EXISTS "Candidates can view their own applications" ON job_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON job_applications;
DROP POLICY IF EXISTS "Candidates can create their own applications" ON job_applications;
DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON job_applications;

-- Job applications policies
CREATE POLICY "Candidates can view their own applications"
    ON job_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = job_applications.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can view applications for their jobs"
    ON job_applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN recruiter_profiles ON jobs.recruiter_id = recruiter_profiles.id
            WHERE jobs.id = job_applications.job_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can create their own applications"
    ON job_applications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = job_applications.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update applications for their jobs"
    ON job_applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN recruiter_profiles ON jobs.recruiter_id = recruiter_profiles.id
            WHERE jobs.id = job_applications.job_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

-- Drop existing conversation policies if they exist
DROP POLICY IF EXISTS "Recruiters can view conversations for their jobs" ON conversations;
DROP POLICY IF EXISTS "Candidates can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Recruiters can create conversations" ON conversations;
DROP POLICY IF EXISTS "Recruiters and candidates can update their conversations" ON conversations;

-- Conversations policies
CREATE POLICY "Recruiters can view conversations for their jobs"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = conversations.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Candidates can view their own conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = conversations.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = conversations.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters and candidates can update their conversations"
    ON conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = conversations.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = conversations.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Drop existing message policies if they exist
DROP POLICY IF EXISTS "Conversation participants can view messages" ON messages;
DROP POLICY IF EXISTS "Conversation participants can create messages" ON messages;
DROP POLICY IF EXISTS "Message recipients can update read status" ON messages;

-- Messages policies
CREATE POLICY "Conversation participants can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN recruiter_profiles ON conversations.recruiter_id = recruiter_profiles.id
            WHERE conversations.id = messages.conversation_id
            AND recruiter_profiles.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM conversations
            JOIN candidate_profiles ON conversations.candidate_id = candidate_profiles.id
            WHERE conversations.id = messages.conversation_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Conversation participants can create messages"
    ON messages FOR INSERT
    WITH CHECK (
        -- Recruiter can always send first message
        (
            sender_type = 'recruiter' AND
            EXISTS (
                SELECT 1 FROM conversations
                JOIN recruiter_profiles ON conversations.recruiter_id = recruiter_profiles.id
                WHERE conversations.id = messages.conversation_id
                AND recruiter_profiles.user_id = auth.uid()
            )
        )
        OR
        -- Candidate can only send if conversation is already initiated
        (
            sender_type = 'candidate' AND
            EXISTS (
                SELECT 1 FROM conversations
                JOIN candidate_profiles ON conversations.candidate_id = candidate_profiles.id
                WHERE conversations.id = messages.conversation_id
                AND candidate_profiles.user_id = auth.uid()
                AND conversations.is_initiated = TRUE
            )
        )
    );

CREATE POLICY "Message recipients can update read status"
    ON messages FOR UPDATE
    USING (
        -- Recruiters can mark messages as read
        EXISTS (
            SELECT 1 FROM conversations
            JOIN recruiter_profiles ON conversations.recruiter_id = recruiter_profiles.id
            WHERE conversations.id = messages.conversation_id
            AND recruiter_profiles.user_id = auth.uid()
            AND messages.sender_type = 'candidate'
        )
        OR
        -- Candidates can mark messages as read
        EXISTS (
            SELECT 1 FROM conversations
            JOIN candidate_profiles ON conversations.candidate_id = candidate_profiles.id
            WHERE conversations.id = messages.conversation_id
            AND candidate_profiles.user_id = auth.uid()
            AND messages.sender_type = 'recruiter'
        )
    );

-- Drop existing call policies if they exist
DROP POLICY IF EXISTS "Conversation participants can view calls" ON calls;
DROP POLICY IF EXISTS "Only recruiters can initiate calls" ON calls;
DROP POLICY IF EXISTS "Call participants can update call status" ON calls;

-- Calls policies
CREATE POLICY "Conversation participants can view calls"
    ON calls FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN recruiter_profiles ON conversations.recruiter_id = recruiter_profiles.id
            WHERE conversations.id = calls.conversation_id
            AND recruiter_profiles.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM conversations
            JOIN candidate_profiles ON conversations.candidate_id = candidate_profiles.id
            WHERE conversations.id = calls.conversation_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Only recruiters can initiate calls"
    ON calls FOR INSERT
    WITH CHECK (
        caller_type = 'recruiter' AND
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = calls.caller_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Call participants can update call status"
    ON calls FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN recruiter_profiles ON conversations.recruiter_id = recruiter_profiles.id
            WHERE conversations.id = calls.conversation_id
            AND recruiter_profiles.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM conversations
            JOIN candidate_profiles ON conversations.candidate_id = candidate_profiles.id
            WHERE conversations.id = calls.conversation_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- TRIGGERS
-- ============================================

-- Job applications trigger
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Conversations trigger
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Messages trigger
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Calls trigger
DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_conversation_on_message() CASCADE;
DROP FUNCTION IF EXISTS update_unread_count_on_read() CASCADE;

-- Function to update conversation when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation's last message info
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_content = NEW.content,
        is_initiated = TRUE,
        initiated_by_recruiter = (NEW.sender_type = 'recruiter'),
        -- Increment unread count for the recipient
        recruiter_unread_count = CASE 
            WHEN NEW.sender_type = 'candidate' THEN recruiter_unread_count + 1 
            ELSE recruiter_unread_count 
        END,
        candidate_unread_count = CASE 
            WHEN NEW.sender_type = 'recruiter' THEN candidate_unread_count + 1 
            ELSE candidate_unread_count 
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- Function to update unread count when message is marked as read
CREATE OR REPLACE FUNCTION update_unread_count_on_read()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if is_read changed from false to true
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        UPDATE conversations
        SET 
            recruiter_unread_count = CASE 
                WHEN NEW.sender_type = 'candidate' THEN GREATEST(0, recruiter_unread_count - 1)
                ELSE recruiter_unread_count 
            END,
            candidate_unread_count = CASE 
                WHEN NEW.sender_type = 'recruiter' THEN GREATEST(0, candidate_unread_count - 1)
                ELSE candidate_unread_count 
            END,
            read_at = NEW.read_at
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update unread count when message is read
CREATE TRIGGER trigger_update_unread_count_on_read
    AFTER UPDATE OF is_read ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_count_on_read();

