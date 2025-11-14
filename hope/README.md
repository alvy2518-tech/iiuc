<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hope - AI Career Companion with CareerBot Mentor

This contains everything you need to run the Hope AI Companion app locally, featuring empathetic career counseling and an AI-powered CareerBot mentor.

View your app in AI Studio: https://ai.studio/apps/drive/1ovLs3cVqq7EOem8FGllxjIMfkZbdertv

## Features

### 🎤 Hope - Voice-Based AI Companion
- Real-time voice conversation with empathetic AI
- Emotion detection through facial expressions
- Supportive career guidance for job seekers
- Compassionate listener for unemployment challenges

### 🤖 CareerBot - AI Career Mentor (NEW!)
- **Personalized Career Advice**: Get recommendations based on your profile, skills, and experience
- **Role Matching**: Discover which jobs fit your skillset
- **Learning Paths**: Identify what to learn for your dream career
- **Interview Prep**: Tips for landing internships and jobs
- **SDG 8 Alignment**: All guidance aligned with Decent Work & Economic Growth principles

#### CareerBot Can Help You With:
- "Which roles fit my skills?"
- "What should I learn to become a backend developer?"
- "How can I improve my chances of getting an internship?"
- "What are decent work opportunities in my field?"

👉 **[CareerBot Quick Start Guide](./CAREERBOT_QUICKSTART.md)**  
📖 **[Full CareerBot Documentation](./CAREERBOT_DOCUMENTATION.md)**

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in [.env.local](.env.local):
   ```bash
   VITE_API_KEY=your_gemini_api_key_here
   VITE_BACKEND_URL=http://localhost:5000/api  # Optional: for backend integration
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Using CareerBot

1. **Look for the robot icon (🤖)** in the bottom-right corner
2. **Click to open** the chat interface
3. **Ask questions** or use quick prompts
4. **Get personalized advice** based on your profile (when logged in)

### Quick Example:
```
You: "Which roles fit my skills?"
CareerBot: [Analyzes your profile and suggests matching roles]

You: "What should I learn to become a full-stack developer?"
CareerBot: [Provides a learning roadmap with specific skills]
```

## Project Structure

```
hope/
├── components/
│   ├── CareerBot.tsx              # NEW: AI career mentor component
│   ├── ConversationControls.tsx   # Voice conversation controls
│   └── TranscriptDisplay.tsx      # Real-time transcript display
├── utils/
│   ├── careerBotUtils.ts          # NEW: CareerBot helper functions
│   └── audioUtils.ts              # Audio processing utilities
├── types.ts                       # TypeScript type definitions
├── App.tsx                        # Main application component
├── index.html                     # HTML template with styles
├── CAREERBOT_DOCUMENTATION.md     # NEW: Comprehensive CareerBot docs
└── CAREERBOT_QUICKSTART.md        # NEW: Quick start guide for users
```

## Key Features in Detail

### Hope Voice Companion
- **Real-time Audio Processing**: Processes audio at 16kHz input, 24kHz output
- **Emotion Detection**: Uses computer vision to detect facial expressions
- **Empathetic Responses**: AI responds with compassion and understanding
- **Privacy-First**: All processing happens in real-time, no storage

### CareerBot Mentor
- **Context-Aware**: Uses your profile, skills, and experience for personalized advice
- **Job Matching**: Connects you with relevant job opportunities from the platform
- **Skill Gap Analysis**: Identifies what you need to learn for your target role
- **SDG 8 Aligned**: Promotes decent work, economic growth, and equal opportunities
- **No Guarantees**: Clearly communicates that advice is suggestions, not promises

## API Integration

CareerBot can integrate with your backend API to fetch:
- User profile and skills
- Work experience and education
- Job preferences
- Available job listings

Update `VITE_BACKEND_URL` in `.env.local` to connect to your backend.

## Technology Stack

- **React 19** with TypeScript
- **Google Gemini 2.0 Flash** for AI responses
- **Gemini 2.5 Flash Native Audio** for voice processing
- **Tailwind CSS** for styling
- **Vite** for development and building

## Contributing

We welcome contributions! Areas for improvement:
- Multi-language support for CareerBot
- Conversation history persistence
- Resume analysis integration
- Career path visualization
- Voice integration for CareerBot

## SDG 8 Commitment

This project supports **Sustainable Development Goal 8**: Decent Work and Economic Growth by:
- Promoting full and productive employment
- Supporting youth employment initiatives
- Providing equal access to career guidance
- Encouraging continuous skill development
- Fostering economic opportunities for all

## Support

- 📚 Read the [CareerBot Documentation](./CAREERBOT_DOCUMENTATION.md)
- 🚀 Check the [Quick Start Guide](./CAREERBOT_QUICKSTART.md)
- 🐛 Report issues in the project repository
- 💡 Suggest features or improvements

## License

This project is part of the IIUC Career Platform initiative.

---

**Built with ❤️ to support youth employment and career development**
