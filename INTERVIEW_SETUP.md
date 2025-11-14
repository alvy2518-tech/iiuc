# Interview and Messaging System Setup

## Database Migration

To enable the Interview and Messaging features, you need to run the database migration:

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the entire content of `/database/interview_messaging_migration.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

This will create the following tables:
- `job_applications` (enhanced with status field)
- `conversations` (for managing chat between recruiters and candidates)
- `messages` (stores all chat messages)
- `calls` (tracks call history)

## Features

### For Recruiters:

1. **Interview Page** (`/recruiter/interview`)
   - View all jobs with selected candidates (shortlisted or interview_scheduled)
   - Select a job to see its candidates
   - Click on a candidate to open the chat
   - Send messages to candidates
   - Initiate calls (Call button in chat header)

2. **Messaging Rules**
   - Recruiters can always send the first message
   - Once initiated, candidates can respond
   - Messages are marked as read automatically
   - Unread message counts are displayed

3. **Call Features**
   - Only recruiters can initiate calls
   - Call button available in chat interface
   - Call history is tracked

### Navigation:

The "Interview" option has been added to the recruiter sidebar between "Job Postings" and "Profile".

## API Endpoints

### Interview Management:
- `GET /api/v1/interviews` - Get all jobs with selected candidates
- `GET /api/v1/interviews/job/:jobId/candidates` - Get candidates for a specific job
- `PUT /api/v1/interviews/application/:applicationId/status` - Update application status
- `GET /api/v1/interviews/application/:applicationId/conversation` - Get or create conversation

### Messaging:
- `POST /api/v1/messages/conversation/:conversationId/send` - Send a message
- `GET /api/v1/messages/conversation/:conversationId` - Get all messages
- `PUT /api/v1/messages/conversation/:conversationId/read` - Mark messages as read
- `GET /api/v1/messages/conversation/:conversationId/details` - Get conversation details
- `POST /api/v1/messages/conversation/:conversationId/call` - Initiate a call
- `PUT /api/v1/messages/call/:callId/status` - Update call status
- `GET /api/v1/messages/conversation/:conversationId/calls` - Get call history

## Testing the Feature

1. **Create a Job** (if you haven't already)
   - Go to `/recruiter/jobs/new`
   - Create a new job posting

2. **Get Applications**
   - Have a candidate apply to your job

3. **Shortlist Candidates**
   - Go to `/recruiter/applications`
   - Find the application
   - Click "Analyze" to get AI compatibility score
   - Change status to "Shortlisted" or "Interview Scheduled"

4. **Access Interview Page**
   - Go to `/recruiter/interview`
   - You should see your job with the shortlisted candidate
   - Click on the candidate to open chat
   - Send messages and test the call button

## Notes

- The backend server has been updated with new routes
- The database migration must be run before using the feature
- Only candidates with status "shortlisted" or "interview_scheduled" appear in the Interview page
- Candidates can only reply after the recruiter sends the first message
