# Skill Verification System Setup

## Overview
This system implements skill verification through AI-generated exams. When a candidate adds a skill, it goes to an "unverified skills" section. To verify it, they must pass a 10-mark exam. If they pass (7/10 or higher), the skill moves to verified skills. If they fail, they can retry.

## Database Migration

Run the following SQL in your Supabase SQL Editor:

```sql
-- See database/skill_verification_migration.sql for the complete migration
```

Or run the file directly:
```bash
# The migration file is located at:
database/skill_verification_migration.sql
```

## Key Features

1. **Unverified Skills**: New skills are added to `unverified_skills` table
2. **AI-Generated Exams**: OpenAI generates 10 questions based on skill name and level
3. **Verification**: Passing score is 7/10 (70%)
4. **Re-verification**: Editing skill name or level requires re-verification
5. **Exam Caching**: Exams are cached for 24 hours to avoid regeneration

## API Endpoints

### Backend Routes Added:
- `GET /api/v1/profiles/candidate/skills/unverified` - Get unverified skills
- `POST /api/v1/profiles/candidate/skills/unverified/:unverifiedSkillId/exam` - Generate exam
- `POST /api/v1/profiles/candidate/skills/unverified/submit-exam` - Submit exam answers

### Frontend API Methods:
- `profileAPI.getUnverifiedSkills()`
- `profileAPI.generateSkillExam(unverifiedSkillId)`
- `profileAPI.submitSkillExam({ examId, answers })`

## Database Tables

1. **unverified_skills**: Stores skills pending verification
2. **skill_verification_exams**: Stores exam questions (expires in 24 hours)
3. **skill_verification_attempts**: Tracks all exam attempts

## Frontend Components

- **Skills Page** (`frontend/app/candidate/profile/skills/page.tsx`): Shows verified and unverified skills separately
- **Exam Component** (`frontend/components/skill-exam.tsx`): Handles exam taking and results display

## Workflow

1. User adds a skill → Goes to unverified_skills
2. User clicks "Take Exam" → AI generates 10 questions
3. User answers questions → Submits exam
4. System evaluates answers:
   - **Pass (≥7/10)**: Skill moves to candidate_skills (verified)
   - **Fail (<7/10)**: Skill stays in unverified_skills, user can retry
5. Editing skill name/level → Requires re-verification

## Important Notes

- Exams expire after 24 hours
- Passing score is 7 out of 10 (configurable in code)
- Questions are generated based on skill level (Beginner/Intermediate/Advanced/Expert)
- Only verified skills are used in job matching and AI analysis

## Testing

1. Add a new skill → Should appear in "Unverified Skills" section
2. Click "Take Exam" → Should generate 10 questions
3. Answer questions and submit → Should show results
4. If passed → Skill should move to "Verified Skills"
5. If failed → Skill should remain unverified with option to retry
6. Edit a verified skill → Should move to unverified and require re-verification

