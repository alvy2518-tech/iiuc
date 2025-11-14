# Jobsite Backend API

Backend API for Jobsite - Student-friendly AI-powered job portal

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Validation:** Joi

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `../database/schema.sql`
4. Run the SQL commands to create all tables, indexes, and policies

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check server status

### Authentication Routes

#### Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "candidate" | "recruiter"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

---

### Profile Routes

#### Recruiter Profile

**Get Recruiter Profile**
```http
GET /api/v1/profiles/recruiter/:userId
```

**Create/Update Recruiter Profile**
```http
POST /api/v1/profiles/recruiter
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Recruiter",
  "phoneNumber": "+1234567890",
  "companyName": "Tech Corp",
  "companyLogoUrl": "https://example.com/logo.png",
  "companyWebsite": "https://techcorp.com",
  "companySize": "51-200",
  "industry": "Technology",
  "companyDescription": "We build amazing products",
  "country": "USA",
  "city": "San Francisco",
  "address": "123 Tech Street"
}
```

#### Candidate Profile

**Get Candidate Profile**
```http
GET /api/v1/profiles/candidate/:userId
```

**Create/Update Candidate Profile**
```http
POST /api/v1/profiles/candidate
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Candidate",
  "phoneNumber": "+1234567890",
  "profilePictureUrl": "https://example.com/photo.jpg",
  "headline": "Computer Science Student",
  "dateOfBirth": "2000-01-01",
  "profileType": "Student",
  "currentEducationStatus": "Final Year",
  "expectedGraduationDate": "2025-05-01",
  "country": "USA",
  "city": "Boston",
  "willingToRelocate": true,
  "preferredWorkModes": ["Remote", "Hybrid"],
  "bio": "Passionate about software development",
  "portfolioWebsite": "https://janedoe.dev",
  "linkedinUrl": "https://linkedin.com/in/janedoe",
  "githubUrl": "https://github.com/janedoe"
}
```

#### Skills Management

**Add Skill**
```http
POST /api/v1/profiles/candidate/skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "skillName": "React",
  "skillLevel": "Advanced"
}
```

**Update Skill**
```http
PUT /api/v1/profiles/candidate/skills/:skillId
Authorization: Bearer <token>
```

**Delete Skill**
```http
DELETE /api/v1/profiles/candidate/skills/:skillId
Authorization: Bearer <token>
```

#### Experience Management

**Add Experience**
```http
POST /api/v1/profiles/candidate/experience
Authorization: Bearer <token>
Content-Type: application/json

{
  "experienceType": "Internship",
  "jobTitle": "Software Engineering Intern",
  "company": "Tech Company",
  "location": "San Francisco, CA",
  "startDate": "2024-06-01",
  "endDate": "2024-08-31",
  "isCurrent": false,
  "description": "Worked on frontend development"
}
```

**Update Experience**
```http
PUT /api/v1/profiles/candidate/experience/:experienceId
Authorization: Bearer <token>
```

**Delete Experience**
```http
DELETE /api/v1/profiles/candidate/experience/:experienceId
Authorization: Bearer <token>
```

#### Projects Management

**Add Project**
```http
POST /api/v1/profiles/candidate/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectTitle": "E-commerce Website",
  "projectType": "Personal Project",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "isOngoing": false,
  "description": "Built a full-stack e-commerce platform",
  "projectUrl": "https://github.com/user/project",
  "technologiesUsed": ["React", "Node.js", "MongoDB"]
}
```

**Update Project**
```http
PUT /api/v1/profiles/candidate/projects/:projectId
Authorization: Bearer <token>
```

**Delete Project**
```http
DELETE /api/v1/profiles/candidate/projects/:projectId
Authorization: Bearer <token>
```

#### Education Management

**Add Education**
```http
POST /api/v1/profiles/candidate/education
Authorization: Bearer <token>
Content-Type: application/json

{
  "educationType": "Undergraduate",
  "degree": "Bachelor of Science",
  "fieldOfStudy": "Computer Science",
  "institution": "MIT",
  "startDate": "2021-09-01",
  "endDate": "2025-05-31",
  "isCurrent": true,
  "grade": "3.8 GPA",
  "achievements": "Dean's List, Scholarship recipient"
}
```

**Update Education**
```http
PUT /api/v1/profiles/candidate/education/:educationId
Authorization: Bearer <token>
```

**Delete Education**
```http
DELETE /api/v1/profiles/candidate/education/:educationId
Authorization: Bearer <token>
```

#### Certifications Management

**Add Certification**
```http
POST /api/v1/profiles/candidate/certifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificationName": "AWS Certified Developer",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2024-01-15",
  "expiryDate": "2027-01-15",
  "doesNotExpire": false,
  "credentialId": "ABC123XYZ",
  "credentialUrl": "https://aws.amazon.com/verify/ABC123XYZ"
}
```

**Update Certification**
```http
PUT /api/v1/profiles/candidate/certifications/:certificationId
Authorization: Bearer <token>
```

**Delete Certification**
```http
DELETE /api/v1/profiles/candidate/certifications/:certificationId
Authorization: Bearer <token>
```

#### Job Preferences

**Create/Update Job Preferences**
```http
POST /api/v1/profiles/candidate/job-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "lookingFor": ["Full-time", "Internship"],
  "preferredRoles": ["Frontend Developer", "Full Stack Developer"],
  "expectedSalaryMin": 60000,
  "expectedSalaryMax": 80000,
  "salaryCurrency": "USD",
  "availableFrom": "2025-06-01",
  "noticePeriod": "Immediate"
}
```

---

### Job Routes

#### Public Job Routes

**Get All Jobs (with filters)**
```http
GET /api/v1/jobs?search=developer&jobType=Full-time&workMode=Remote&page=1&limit=20
```

Query Parameters:
- `search` - Search in job title and description
- `jobType` - Filter by job type
- `workMode` - Filter by work mode
- `experienceLevel` - Filter by experience level
- `country` - Filter by country
- `city` - Filter by city
- `isStudentFriendly` - Filter student-friendly jobs (true/false)
- `sortBy` - Sort field (default: created_at)
- `order` - Sort order (asc/desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Get Job By ID**
```http
GET /api/v1/jobs/:jobId
```

**Increment View Count**
```http
POST /api/v1/jobs/:jobId/view
```

#### Recruiter Job Routes

**Get My Jobs**
```http
GET /api/v1/jobs/recruiter/my-jobs?status=active&page=1&limit=20
Authorization: Bearer <token>
```

**Create Job**
```http
POST /api/v1/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobTitle": "Senior React Developer",
  "department": "Engineering",
  "jobType": "Full-time",
  "workMode": "Remote",
  "experienceLevel": "Senior",
  "country": "USA",
  "city": "San Francisco",
  "salaryMin": 120000,
  "salaryMax": 160000,
  "salaryCurrency": "USD",
  "salaryPeriod": "per year",
  "jobDescription": "We are looking for...",
  "responsibilities": "- Lead frontend development\n- Mentor junior developers",
  "qualifications": "- 5+ years React experience\n- Strong TypeScript skills",
  "niceToHave": "- GraphQL experience",
  "benefits": "- Health insurance\n- 401k",
  "requiredSkills": ["React", "TypeScript", "Node.js"],
  "applicationDeadline": "2025-12-31",
  "numberOfPositions": 2,
  "isStudentFriendly": false,
  "minimumExperienceYears": 5,
  "status": "active"
}
```

**Update Job**
```http
PUT /api/v1/jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json
```

**Delete Job**
```http
DELETE /api/v1/jobs/:jobId
Authorization: Bearer <token>
```

**Update Job Status**
```http
PATCH /api/v1/jobs/:jobId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active" | "draft" | "closed"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Project Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client configuration
├── controllers/
│   ├── auth.controller.js   # Authentication logic
│   ├── profile.controller.js # Profile management logic
│   └── job.controller.js     # Job management logic
├── middleware/
│   ├── auth.middleware.js    # Authentication & authorization
│   └── validate.middleware.js # Request validation
├── routes/
│   ├── auth.routes.js        # Auth endpoints
│   ├── profile.routes.js     # Profile endpoints
│   └── job.routes.js         # Job endpoints
├── validators/
│   ├── auth.validator.js     # Auth validation schemas
│   ├── profile.validator.js  # Profile validation schemas
│   └── job.validator.js      # Job validation schemas
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Example environment variables
├── package.json              # Dependencies
├── server.js                 # Entry point
└── README.md                 # This file
```

---

## Development Notes

- All timestamps are in UTC
- Images are stored as URLs (no file upload for MVP)
- Row Level Security (RLS) is enabled on all tables
- JWT tokens are managed by Supabase Auth
- API uses RESTful conventions

---

## Support

For issues or questions, please contact the development team.

