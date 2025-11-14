-- Skill Verification System Migration
-- This migration adds skill verification functionality

-- 1. Create unverified_skills table
CREATE TABLE IF NOT EXISTS public.unverified_skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL,
  skill_name text NOT NULL,
  skill_level text NOT NULL DEFAULT 'Beginner'::text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unverified_skills_pkey PRIMARY KEY (id),
  CONSTRAINT unverified_skills_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id) ON DELETE CASCADE
);

-- 2. Create skill_verification_exams table to store exam questions
CREATE TABLE IF NOT EXISTS public.skill_verification_exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  unverified_skill_id uuid NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_marks integer NOT NULL DEFAULT 10,
  passing_marks integer NOT NULL DEFAULT 7,
  skill_name text NOT NULL,
  skill_level text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone,
  CONSTRAINT skill_verification_exams_pkey PRIMARY KEY (id),
  CONSTRAINT skill_verification_exams_unverified_skill_id_fkey FOREIGN KEY (unverified_skill_id) REFERENCES public.unverified_skills(id) ON DELETE CASCADE
);

-- 3. Create skill_verification_attempts table to track exam attempts
CREATE TABLE IF NOT EXISTS public.skill_verification_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid NOT NULL,
  unverified_skill_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0,
  total_marks integer NOT NULL DEFAULT 10,
  passed boolean NOT NULL DEFAULT false,
  started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  submitted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT skill_verification_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT skill_verification_attempts_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.skill_verification_exams(id) ON DELETE CASCADE,
  CONSTRAINT skill_verification_attempts_unverified_skill_id_fkey FOREIGN KEY (unverified_skill_id) REFERENCES public.unverified_skills(id) ON DELETE CASCADE,
  CONSTRAINT skill_verification_attempts_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(id) ON DELETE CASCADE
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unverified_skills_candidate_id ON public.unverified_skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_skill_verification_exams_unverified_skill_id ON public.skill_verification_exams(unverified_skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_verification_attempts_candidate_id ON public.skill_verification_attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_skill_verification_attempts_exam_id ON public.skill_verification_attempts(exam_id);

-- 5. Add unique constraint to prevent duplicate unverified skills
CREATE UNIQUE INDEX IF NOT EXISTS idx_unverified_skills_unique ON public.unverified_skills(candidate_id, LOWER(skill_name));

-- 6. Enable Row Level Security (RLS) if needed
ALTER TABLE public.unverified_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_verification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_verification_attempts ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (adjust based on your auth setup)
-- Allow candidates to view their own unverified skills
CREATE POLICY "Candidates can view own unverified skills" ON public.unverified_skills
  FOR SELECT USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow candidates to insert their own unverified skills
CREATE POLICY "Candidates can insert own unverified skills" ON public.unverified_skills
  FOR INSERT WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow candidates to delete their own unverified skills
CREATE POLICY "Candidates can delete own unverified skills" ON public.unverified_skills
  FOR DELETE USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow candidates to view their own exams
CREATE POLICY "Candidates can view own exams" ON public.skill_verification_exams
  FOR SELECT USING (
    unverified_skill_id IN (
      SELECT id FROM public.unverified_skills 
      WHERE candidate_id IN (
        SELECT id FROM public.candidate_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Allow candidates to create exams for their own unverified skills
CREATE POLICY "Candidates can create own exams" ON public.skill_verification_exams
  FOR INSERT WITH CHECK (
    unverified_skill_id IN (
      SELECT id FROM public.unverified_skills 
      WHERE candidate_id IN (
        SELECT id FROM public.candidate_profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Allow candidates to view their own attempts
CREATE POLICY "Candidates can view own attempts" ON public.skill_verification_attempts
  FOR SELECT USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow candidates to insert their own attempts
CREATE POLICY "Candidates can insert own attempts" ON public.skill_verification_attempts
  FOR INSERT WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles 
      WHERE user_id = auth.uid()
    )
  );

