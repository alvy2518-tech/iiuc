# CareerBot - AI Career Mentor Assistant

## Overview

CareerBot is an AI-powered career mentor integrated into the Hope application. It provides personalized career guidance, job recommendations, and learning paths to help users achieve their employment goals, aligned with SDG 8 (Decent Work and Economic Growth).

## Features

### 1. **Personalized Career Guidance**
- Analyzes user profile, skills, experience, and education
- Provides context-aware recommendations based on user's background
- Offers actionable advice for career development

### 2. **Role Matching**
CareerBot can answer questions like:
- "Which roles fit my skills?"
- "What jobs are suitable for my experience level?"
- "Where can I apply my current skills?"

### 3. **Learning Path Recommendations**
CareerBot helps identify skill gaps and suggests learning paths:
- "What should I learn to become a backend developer?"
- "How can I transition from frontend to full-stack development?"
- "What certifications would boost my career?"

### 4. **Job Application Support**
CareerBot provides tips for improving job prospects:
- "How can I improve my chances of getting an internship?"
- "What makes a strong job application?"
- "How should I prepare for technical interviews?"

### 5. **SDG 8 Alignment**
All recommendations align with:
- Decent work principles
- Economic growth opportunities
- Youth employment initiatives
- Equal opportunities and inclusion

## Architecture

### Components

#### 1. **CareerBot.tsx** (`/hope/components/CareerBot.tsx`)
Main component that handles:
- Chat interface with message history
- Integration with Google Gemini AI
- Real-time conversation management
- Quick prompt suggestions
- User context integration

**Key Features:**
- Floating chat window with modern UI
- Message history with timestamps
- Loading states with animated indicators
- Quick prompt buttons for common questions
- Responsive design for mobile and desktop

#### 2. **Type Definitions** (`/hope/types.ts`)
Extends the existing types with:
- `CareerBotMessage`: Chat message structure
- `UserContext`: Comprehensive user profile data
- `UserProfile`, `UserSkill`, `UserExperience`, `UserEducation`: Profile components
- `JobPreferences`: User's job search preferences
- `AvailableJob`: Job listing structure

#### 3. **Utility Functions** (`/hope/utils/careerBotUtils.ts`)
Provides helper functions for:
- `fetchUserContext()`: Retrieves user profile and job data
- `generateMockUserContext()`: Demo data for testing
- `formatJobsForPrompt()`: Formats job listings for AI
- `formatSkillsForPrompt()`: Formats skills for AI
- `analyzeSkillGaps()`: Identifies missing skills for target roles

### AI Integration

CareerBot uses **Google Gemini 2.0 Flash** model with:
- Dynamic system prompts based on user context
- Conversation history for contextual responses
- Structured guidance aligned with SDG 8 principles

**System Prompt Structure:**
```
1. Role Definition: AI career mentor specializing in youth employment
2. Key Responsibilities: Personalized advice, job matching, learning paths
3. Guidelines: Suggestions not guarantees, cultural sensitivity, actionable advice
4. User Context: Profile, skills, experience, education, preferences
5. Available Jobs: Current job listings for reference
```

## Implementation Guide

### Setup Instructions

1. **Install Dependencies** (if not already installed):
```bash
cd hope
npm install
```

2. **Configure Environment Variables**:
Add to `.env.local`:
```bash
VITE_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:5000/api  # Optional: backend API URL
```

3. **Integration Points**:

The CareerBot is already integrated into `App.tsx`:
- Floating toggle button in bottom-right corner
- Modal overlay when opened
- Passes user ID for authenticated context (when available)

### Usage

#### For Unauthenticated Users:
- CareerBot uses mock data for demonstration
- Still provides general career advice
- Recommends creating a profile for personalized guidance

#### For Authenticated Users:
- Fetches real user profile from backend
- Provides personalized recommendations
- Accesses job listings from the platform

### API Integration

To connect to your backend API, update `careerBotUtils.ts`:

```typescript
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Fetch user profile
const profileResponse = await fetch(`${baseURL}/profiles/candidate/${userId}`, {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
  },
});

// Fetch available jobs
const jobsResponse = await fetch(`${baseURL}/jobs?limit=20`, {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
  },
});
```

## User Interface

### Chat Interface Features

1. **Header**
   - CareerBot branding with icon
   - "AI Career Mentor" subtitle
   - Close button

2. **Message Display**
   - User messages: Blue bubbles on right
   - Bot messages: White bubbles on left
   - Timestamps for each message
   - Smooth scrolling to latest message

3. **Quick Prompts** (shown on first load)
   - "Which roles fit my skills?"
   - "What should I learn to become a backend developer?"
   - "How can I improve my chances of getting an internship?"
   - "What are the best entry-level jobs for me?"

4. **Input Area**
   - Text input with placeholder
   - Send button (disabled when empty)
   - Enter key to send
   - Disclaimer about AI suggestions

5. **Loading States**
   - Animated dots while bot is thinking
   - Disabled input during processing

### Design Principles

- **Approachable**: Friendly robot emoji and welcoming tone
- **Professional**: Clean, modern interface with proper spacing
- **Accessible**: High contrast, keyboard navigation, ARIA labels
- **Responsive**: Works on mobile, tablet, and desktop
- **Performant**: Smooth animations, optimized rendering

## Best Practices

### 1. **Context Management**
- Always fetch fresh user context on mount
- Cache context to avoid repeated API calls
- Update context when user profile changes

### 2. **Error Handling**
- Gracefully handle API failures
- Provide helpful error messages
- Allow retry without losing conversation

### 3. **Privacy & Ethics**
- Never store sensitive information in logs
- Clearly state AI limitations
- Include disclaimer: "Suggestions, not guarantees"
- Respect user privacy and data

### 4. **Performance**
- Limit job listings to 10-20 for context
- Truncate long messages if needed
- Use debouncing for input if needed
- Lazy load components

### 5. **SDG 8 Alignment**
Ensure all responses:
- Promote decent work conditions
- Encourage skill development
- Support economic growth
- Foster equal opportunities
- Highlight youth employment programs

## Customization Options

### 1. **Modify AI Behavior**
Edit `buildSystemPrompt()` in `CareerBot.tsx`:
```typescript
const buildSystemPrompt = (): string => {
  let prompt = `Your custom instructions here...`;
  // Add user context
  // Add job listings
  return prompt;
};
```

### 2. **Change Quick Prompts**
Update the `quickPrompts` array:
```typescript
const quickPrompts = [
  "Your custom prompt 1",
  "Your custom prompt 2",
  // ...
];
```

### 3. **Customize Appearance**
Modify Tailwind classes in `CareerBot.tsx` or add custom styles in `index.html`.

### 4. **Add Features**
Extend functionality:
- Save conversations to database
- Share conversations with mentors
- Export career advice as PDF
- Schedule follow-up reminders

## Testing

### Manual Testing Checklist

- [ ] Open CareerBot without authentication (uses mock data)
- [ ] Open CareerBot with authentication (uses real data)
- [ ] Send messages and verify responses
- [ ] Test quick prompts
- [ ] Test error handling (invalid API key)
- [ ] Test on mobile device
- [ ] Verify SDG 8 alignment in responses
- [ ] Check disclaimer is visible
- [ ] Test close button
- [ ] Verify conversation persistence during session

### Sample Questions to Test

**Role Matching:**
- "Which roles fit my skills?"
- "Am I qualified for senior positions?"
- "What jobs can I apply for right now?"

**Learning Paths:**
- "What should I learn to become a data scientist?"
- "How do I transition into cybersecurity?"
- "What courses would help me get promoted?"

**Career Advice:**
- "How can I improve my resume?"
- "What are the best practices for remote job interviews?"
- "How do I negotiate salary as a fresh graduate?"

**SDG 8 Related:**
- "What are decent work opportunities in my field?"
- "How can I contribute to economic growth in my community?"
- "What programs support youth employment in Bangladesh?"

## Troubleshooting

### Issue: CareerBot doesn't respond
**Solution:** Check VITE_API_KEY is set correctly in `.env.local`

### Issue: No user context loaded
**Solution:** Verify backend API is running and VITE_BACKEND_URL is correct

### Issue: Responses are generic
**Solution:** Ensure user is authenticated and context is being fetched

### Issue: UI looks broken
**Solution:** Verify Tailwind CSS is loaded (check Network tab)

### Issue: Messages not scrolling
**Solution:** Check if `messagesEndRef` is properly attached to the last element

## Future Enhancements

1. **Conversation History**
   - Save conversations to database
   - Allow users to review past advice
   - Continue previous conversations

2. **Multi-language Support**
   - Detect user language preference
   - Translate responses
   - Support local job markets

3. **Voice Integration**
   - Voice input for questions
   - Voice output for responses
   - Integration with Hope's voice features

4. **Advanced Analytics**
   - Track most asked questions
   - Identify common career concerns
   - Improve responses based on feedback

5. **Mentor Matching**
   - Connect users with human mentors
   - Schedule mentorship sessions
   - Share CareerBot insights with mentors

6. **Resume Analysis**
   - Upload resume for AI review
   - Get improvement suggestions
   - Match resume to job requirements

7. **Career Path Visualization**
   - Generate visual roadmaps
   - Show progression steps
   - Track learning progress

## Compliance & Ethics

### Data Privacy
- User data is processed in-memory only
- No conversation data stored without consent
- Comply with GDPR/local privacy laws

### AI Ethics
- Transparent about AI limitations
- No discriminatory recommendations
- Culturally sensitive responses
- Human oversight recommended

### SDG 8 Commitment
- Promote decent work principles
- Support sustainable economic growth
- Foster full and productive employment
- Protect labor rights
- Encourage safe working environments

## Support & Contribution

For questions, issues, or contributions:
1. Review this documentation
2. Check existing issues in the repository
3. Create detailed issue reports
4. Submit pull requests with tests

## License

This feature is part of the IIUC Career Platform project and follows the same license terms.

---

**Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Contributors:** GitHub Copilot
