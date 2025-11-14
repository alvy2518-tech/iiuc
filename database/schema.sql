-- ============================================
-- JOBSITE DATABASE SCHEMA
-- Student-Friendly Job Portal with AI Features
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('recruiter', 'candidate');

-- Profile type enum
CREATE TYPE profile_type AS ENUM ('Student', 'Recent Graduate', 'Professional', 'Career Break');

-- Job type enum
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Campus Placement');

-- Work mode enum
CREATE TYPE work_mode AS ENUM ('Remote', 'On-site', 'Hybrid');

-- Experience level enum
CREATE TYPE experience_level AS ENUM ('Entry Level', 'Mid Level', 'Senior', 'Lead/Manager');

-- Skill level enum
CREATE TYPE skill_level AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');

-- Job status enum
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed');

-- Experience type enum
CREATE TYPE experience_type AS ENUM ('Full-time Job', 'Internship', 'Part-time Job', 'Freelance', 'Volunteer Work');

-- Education type enum
CREATE TYPE education_type AS ENUM ('High School', 'Undergraduate', 'Masters', 'PhD', 'Diploma', 'Certification');

-- Project type enum
CREATE TYPE project_type AS ENUM ('Academic Project', 'Personal Project', 'Hackathon', 'Open Source', 'Freelance');


-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- RECRUITER TABLES
-- ============================================

-- Recruiter profiles
CREATE TABLE recruiter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    company_website TEXT,
    company_size TEXT,
    industry TEXT,
    company_description TEXT,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- CANDIDATE TABLES
-- ============================================

-- Candidate profiles
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    headline TEXT,
    date_of_birth DATE,
    
    -- Status fields
    profile_type profile_type NOT NULL DEFAULT 'Professional',
    current_education_status TEXT,
    expected_graduation_date DATE,
    
    -- Professional fields
    years_of_experience TEXT,
    current_job_title TEXT,
    current_company TEXT,
    
    -- Location
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    preferred_work_modes TEXT[],
    
    -- About
    bio TEXT,
    
    -- Links
    portfolio_website TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    behance_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate skills
CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_level skill_level NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(candidate_id, skill_name)
);

-- Candidate experience
CREATE TABLE candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    experience_type experience_type NOT NULL DEFAULT 'Full-time Job',
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate projects
CREATE TABLE candidate_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    project_type project_type NOT NULL,
    organization TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    project_url TEXT,
    technologies_used TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate education
CREATE TABLE candidate_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    education_type education_type NOT NULL DEFAULT 'Undergraduate',
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    grade TEXT,
    achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate certifications
CREATE TABLE candidate_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    does_not_expire BOOLEAN DEFAULT FALSE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate other links
CREATE TABLE candidate_other_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Candidate job preferences
CREATE TABLE candidate_job_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL UNIQUE REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    looking_for TEXT[],
    preferred_roles TEXT[],
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    available_from DATE,
    notice_period TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- JOB TABLES
-- ============================================

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
    
    -- Basic info
    job_title TEXT NOT NULL,
    department TEXT,
    
    -- Job details
    job_type job_type NOT NULL,
    work_mode work_mode NOT NULL,
    experience_level experience_level NOT NULL,
    
    -- Location
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    
    -- Compensation
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    salary_period TEXT,
    
    -- Description
    job_description TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    nice_to_have TEXT,
    benefits TEXT,
    
    -- Additional
    application_deadline DATE,
    number_of_positions INTEGER DEFAULT 1,
    
    -- Student-friendly fields
    is_student_friendly BOOLEAN DEFAULT FALSE,
    minimum_experience_years INTEGER,
    
    -- Meta
    status job_status NOT NULL DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Job skills
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(job_id, skill_name)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Recruiter profiles indexes
CREATE INDEX idx_recruiter_profiles_user_id ON recruiter_profiles(user_id);
CREATE INDEX idx_recruiter_profiles_company ON recruiter_profiles(company_name);

-- Candidate profiles indexes
CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_type ON candidate_profiles(profile_type);
CREATE INDEX idx_candidate_profiles_location ON candidate_profiles(country, city);

-- Candidate skills indexes
CREATE INDEX idx_candidate_skills_candidate_id ON candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_name ON candidate_skills(skill_name);

-- Jobs indexes
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs(country, city);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_student_friendly ON jobs(is_student_friendly) WHERE is_student_friendly = TRUE;

-- Job skills indexes
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_name ON job_skills(skill_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_other_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Recruiter profiles policies
CREATE POLICY "Recruiter profiles are viewable by everyone"
    ON recruiter_profiles FOR SELECT
    USING (true);

CREATE POLICY "Recruiters can insert their own profile"
    ON recruiter_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
    ON recruiter_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Candidate profiles policies
CREATE POLICY "Candidate profiles are viewable by everyone"
    ON candidate_profiles FOR SELECT
    USING (true);

CREATE POLICY "Candidates can insert their own profile"
    ON candidate_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidates can update own profile"
    ON candidate_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Candidate skills policies
CREATE POLICY "Candidate skills are viewable by everyone"
    ON candidate_skills FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own skills"
    ON candidate_skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_skills.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate experience policies
CREATE POLICY "Candidate experience is viewable by everyone"
    ON candidate_experience FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own experience"
    ON candidate_experience FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_experience.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate projects policies
CREATE POLICY "Candidate projects are viewable by everyone"
    ON candidate_projects FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own projects"
    ON candidate_projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_projects.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate education policies
CREATE POLICY "Candidate education is viewable by everyone"
    ON candidate_education FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own education"
    ON candidate_education FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_education.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate certifications policies
CREATE POLICY "Candidate certifications are viewable by everyone"
    ON candidate_certifications FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own certifications"
    ON candidate_certifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_certifications.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate other links policies
CREATE POLICY "Candidate other links are viewable by everyone"
    ON candidate_other_links FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own other links"
    ON candidate_other_links FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_other_links.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Candidate job preferences policies
CREATE POLICY "Candidate job preferences are viewable by everyone"
    ON candidate_job_preferences FOR SELECT
    USING (true);

CREATE POLICY "Candidates can manage their own job preferences"
    ON candidate_job_preferences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM candidate_profiles
            WHERE candidate_profiles.id = candidate_job_preferences.candidate_id
            AND candidate_profiles.user_id = auth.uid()
        )
    );

-- Jobs policies
CREATE POLICY "Active jobs are viewable by everyone"
    ON jobs FOR SELECT
    USING (status = 'active' OR auth.uid() IN (
        SELECT user_id FROM recruiter_profiles WHERE id = jobs.recruiter_id
    ));

CREATE POLICY "Recruiters can insert their own jobs"
    ON jobs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = jobs.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update their own jobs"
    ON jobs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = jobs.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can delete their own jobs"
    ON jobs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM recruiter_profiles
            WHERE recruiter_profiles.id = jobs.recruiter_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

-- Job skills policies
CREATE POLICY "Job skills are viewable with their jobs"
    ON job_skills FOR SELECT
    USING (true);

CREATE POLICY "Recruiters can manage skills for their jobs"
    ON job_skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM jobs
            JOIN recruiter_profiles ON jobs.recruiter_id = recruiter_profiles.id
            WHERE jobs.id = job_skills.job_id
            AND recruiter_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TRIGGERS
-- ============================================

-- Profiles trigger
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recruiter profiles trigger
CREATE TRIGGER update_recruiter_profiles_updated_at BEFORE UPDATE ON recruiter_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate profiles trigger
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate skills trigger
CREATE TRIGGER update_candidate_skills_updated_at BEFORE UPDATE ON candidate_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate experience trigger
CREATE TRIGGER update_candidate_experience_updated_at BEFORE UPDATE ON candidate_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate projects trigger
CREATE TRIGGER update_candidate_projects_updated_at BEFORE UPDATE ON candidate_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate education trigger
CREATE TRIGGER update_candidate_education_updated_at BEFORE UPDATE ON candidate_education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate certifications trigger
CREATE TRIGGER update_candidate_certifications_updated_at BEFORE UPDATE ON candidate_certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate other links trigger
CREATE TRIGGER update_candidate_other_links_updated_at BEFORE UPDATE ON candidate_other_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Candidate job preferences trigger
CREATE TRIGGER update_candidate_job_preferences_updated_at BEFORE UPDATE ON candidate_job_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Jobs trigger
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Job skills trigger
CREATE TRIGGER update_job_skills_updated_at BEFORE UPDATE ON job_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

