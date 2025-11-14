# CareerBot Deployment & Configuration Guide

## Pre-Deployment Checklist

### ✅ Required Steps

- [ ] **Environment Variables Set**
  - `VITE_API_KEY` configured with valid Gemini API key
  - `VITE_BACKEND_URL` configured (if using backend integration)

- [ ] **Dependencies Installed**
  ```bash
  cd hope
  npm install
  ```

- [ ] **TypeScript Compilation**
  - No TypeScript errors
  - All types properly defined
  - Run: `npm run build` to verify

- [ ] **Testing Completed**
  - CareerBot opens and closes properly
  - Messages send and receive correctly
  - Quick prompts work
  - Error handling tested
  - Mobile responsiveness verified

- [ ] **Backend Integration** (if applicable)
  - API endpoints accessible
  - Authentication working
  - User profile fetching tested
  - Job listings retrieval tested

- [ ] **Content Review**
  - System prompt reviewed for appropriateness
  - Quick prompts relevant to target audience
  - Disclaimers visible and clear
  - SDG 8 alignment verified

### ⚠️ Optional but Recommended

- [ ] Analytics integration for usage tracking
- [ ] Error logging service configured
- [ ] Rate limiting for API calls
- [ ] Conversation history persistence (if desired)
- [ ] Multi-language support (if needed)

## Configuration Options

### 1. Environment Variables

Create or update `.env.local`:

```bash
# Required: Your Google Gemini API Key
VITE_API_KEY=AIzaSy...

# Optional: Backend API URL for user data
VITE_BACKEND_URL=http://localhost:5000/api

# Optional: Analytics tracking ID
VITE_ANALYTICS_ID=GA-XXXXXXXX

# Optional: Sentry DSN for error tracking
VITE_SENTRY_DSN=https://...
```

### 2. CareerBot Behavior

Edit `components/CareerBot.tsx`:

**Change AI Model:**
```typescript
const model = ai.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp', // Change model here
  systemInstruction: buildSystemPrompt(),
});
```

**Adjust System Prompt:**
```typescript
const buildSystemPrompt = (): string => {
  let prompt = `You are CareerBot, an empathetic AI career mentor...`;
  // Customize instructions here
  return prompt;
};
```

**Modify Quick Prompts:**
```typescript
const quickPrompts = [
  "Your custom prompt 1",
  "Your custom prompt 2",
  "Your custom prompt 3",
  "Your custom prompt 4",
];
```

### 3. UI Customization

**Change Colors:**
In `components/CareerBot.tsx`, modify Tailwind classes:
```typescript
// Header gradient
className="bg-gradient-to-r from-blue-600 to-purple-600"
// Change to your brand colors
className="bg-gradient-to-r from-green-600 to-teal-600"

// User message bubbles
className="bg-blue-600 text-white"
// Change to your brand color
className="bg-green-600 text-white"
```

**Adjust Chat Window Size:**
```typescript
// In CareerBot.tsx
<div className="w-full max-w-md h-[600px]">
// Change max-w-md to max-w-lg for wider window
// Change h-[600px] to h-[700px] for taller window
```

**Position of Toggle Button:**
```typescript
// In App.tsx
className="fixed bottom-6 right-6"
// Change to bottom-4 left-4 for bottom-left position
```

### 4. Backend Integration

Edit `utils/careerBotUtils.ts`:

**Configure API Endpoints:**
```typescript
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Update endpoints to match your API
const profileResponse = await fetch(`${baseURL}/profiles/candidate/${userId}`);
const jobsResponse = await fetch(`${baseURL}/jobs?limit=20`);
```

**Add Authentication:**
```typescript
function getAuthToken(): string {
  // Customize based on your auth system
  return localStorage.getItem('authToken') || 
         sessionStorage.getItem('token') ||
         '';
}
```

**Add Custom Headers:**
```typescript
headers: {
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
  'X-App-Version': '1.0.0', // Add custom headers
}
```

### 5. Error Tracking

Add Sentry or similar error tracking:

```typescript
// In CareerBot.tsx
import * as Sentry from "@sentry/react";

try {
  // ... AI request
} catch (error) {
  Sentry.captureException(error);
  console.error('CareerBot error:', error);
}
```

### 6. Analytics

Track CareerBot usage:

```typescript
// In CareerBot.tsx
import analytics from './analytics';

// Track when CareerBot is opened
useEffect(() => {
  analytics.track('CareerBot Opened', {
    userId: userId,
    timestamp: new Date(),
  });
}, []);

// Track messages sent
const handleSendMessage = async () => {
  analytics.track('CareerBot Message Sent', {
    userId: userId,
    messageLength: inputValue.length,
  });
  // ... rest of function
};
```

## Deployment Steps

### For Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### For Production

#### Option 1: Build and Deploy Static Files

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
```

#### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Option 3: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Environment Variables in Production

**Vercel:**
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add `VITE_API_KEY` and other variables
4. Redeploy

**Netlify:**
1. Go to Site Settings
2. Navigate to Build & Deploy > Environment
3. Add variables
4. Trigger new deploy

**AWS / Custom Server:**
Create `.env.production`:
```bash
VITE_API_KEY=your_production_key
VITE_BACKEND_URL=https://api.yoursite.com
```

## Post-Deployment Verification

### 1. Functional Testing

- [ ] CareerBot opens when clicking toggle button
- [ ] Messages send successfully
- [ ] Responses are received from AI
- [ ] Quick prompts work
- [ ] Close button works
- [ ] Mobile version displays correctly

### 2. Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] CareerBot opens instantly
- [ ] Messages send within 1 second
- [ ] AI responses arrive within 3-5 seconds
- [ ] No memory leaks after extended use

### 3. Security Testing

- [ ] API key not exposed in client code
- [ ] Authentication tokens secure
- [ ] No sensitive data in console logs
- [ ] HTTPS enabled in production
- [ ] CORS properly configured

### 4. User Experience Testing

- [ ] Clear call-to-action to open CareerBot
- [ ] Intuitive chat interface
- [ ] Helpful quick prompts
- [ ] Clear disclaimer visible
- [ ] Professional and friendly tone
- [ ] Accessible with keyboard navigation

## Monitoring & Maintenance

### Key Metrics to Track

1. **Usage Metrics**
   - Number of conversations started
   - Messages per conversation
   - Most common questions
   - Quick prompt click-through rate

2. **Performance Metrics**
   - API response time
   - Error rate
   - User drop-off points
   - Page load time

3. **Quality Metrics**
   - User satisfaction (if collecting feedback)
   - Conversation completion rate
   - Returning users
   - Feature adoption rate

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check API usage and costs
- [ ] Monitor user feedback

**Monthly:**
- [ ] Update system prompts based on feedback
- [ ] Review and update quick prompts
- [ ] Update job listings in mock data
- [ ] Security updates

**Quarterly:**
- [ ] Analyze usage patterns
- [ ] A/B test different approaches
- [ ] Survey users for feedback
- [ ] Update documentation

## Troubleshooting Common Issues

### Issue: "API key not configured" error

**Solution:**
```bash
# Check .env.local file exists
ls -la .env.local

# Verify VITE_API_KEY is set
cat .env.local | grep VITE_API_KEY

# Restart dev server
npm run dev
```

### Issue: CareerBot not fetching user data

**Solutions:**
1. Verify `VITE_BACKEND_URL` is correct
2. Check backend API is running
3. Verify authentication token is valid
4. Check browser console for CORS errors

### Issue: Slow AI responses

**Solutions:**
1. Use faster model: `gemini-2.0-flash-exp`
2. Reduce context length
3. Limit job listings to 10 instead of 20
4. Implement response caching

### Issue: Build fails

**Solutions:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Scaling Considerations

### For High Traffic

1. **API Rate Limiting**
   - Implement per-user rate limits
   - Add request queuing
   - Cache common responses

2. **Cost Optimization**
   - Use cheaper models for simple queries
   - Implement response caching
   - Compress context data

3. **Infrastructure**
   - Use CDN for static assets
   - Implement load balancing
   - Add Redis for session storage

### For Multiple Regions

1. **Localization**
   - Translate system prompts
   - Localize job listings
   - Cultural sensitivity adjustments

2. **Compliance**
   - GDPR compliance for EU users
   - Data residency requirements
   - Privacy law adherence

## Support & Resources

### Getting Help

- 📖 [Full Documentation](./CAREERBOT_DOCUMENTATION.md)
- 🚀 [Quick Start Guide](./CAREERBOT_QUICKSTART.md)
- 💬 Project Issues on GitHub
- 📧 Support Email

### Useful Links

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

**Last Updated:** November 14, 2025  
**Version:** 1.0.0
