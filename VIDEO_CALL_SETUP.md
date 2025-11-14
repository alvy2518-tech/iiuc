# Video Call Feature Setup Guide

## Overview
This document explains how to set up video calling between recruiters and candidates using Agora.io.

## Prerequisites
1. Agora.io account (free tier available)
2. App ID and App Certificate from Agora Console

## Setup Steps

### 1. Create Agora Account
1. Go to [Agora Console](https://console.agora.io/)
2. Sign up for a free account
3. Create a new project
4. Get your **App ID** and **App Certificate**

### 2. Configure Backend Environment Variables
Add these to your `backend/.env` file:

```env
AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_app_certificate_here
```

### 3. Run Database Migration
Run the SQL migration to create the video_calls table:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U your-user -d your-database -f database/video_calls_migration.sql
```

Or run it directly in Supabase SQL Editor:
```sql
-- Copy and paste the contents of database/video_calls_migration.sql
```

### 4. Install Dependencies
Dependencies are already installed, but if needed:

```bash
# Backend
cd backend
npm install agora-access-token

# Frontend
cd ../frontend
npm install agora-rtc-react agora-rtc-sdk-ng
```

### 5. API Endpoints

#### Generate Video Call Token
```
POST /api/v1/video-calls/token
Body: {
  "conversationId": "uuid-here",
  "channelName": "optional-channel-name"
}
Response: {
  "success": true,
  "data": {
    "token": "agora-token",
    "appId": "your-app-id",
    "channelName": "interview-uuid",
    "uid": 0,
    "expirationTime": 1699999999
  }
}
```

#### Start Video Call
```
POST /api/v1/video-calls/start
Body: {
  "conversationId": "uuid-here"
}
Response: {
  "success": true,
  "data": {
    "videoCall": { ... },
    "token": { ... }
  }
}
```

#### End Video Call
```
PUT /api/v1/video-calls/:callId/end
Response: {
  "success": true,
  "message": "Video call ended successfully"
}
```

#### Get Call History
```
GET /api/v1/video-calls/conversation/:conversationId/history
Response: {
  "success": true,
  "data": [ ... ]
}
```

### 6. Frontend Integration Example

```tsx
import VideoCall from '@/components/video-call';
import { videoCallAPI } from '@/lib/api';

function InterviewPage() {
  const [callData, setCallData] = useState(null);
  
  const startCall = async () => {
    // Start the call
    const response = await videoCallAPI.startCall(conversationId);
    setCallData(response.data.token);
  };

  const endCall = async () => {
    // End the call
    await videoCallAPI.endCall(callData.videoCallId);
    setCallData(null);
  };

  return (
    <div>
      {callData ? (
        <VideoCall
          appId={callData.appId}
          channelName={callData.channelName}
          token={callData.token}
          uid={callData.uid}
          onCallEnd={endCall}
        />
      ) : (
        <button onClick={startCall}>Start Video Call</button>
      )}
    </div>
  );
}
```

### 7. Update API Library
Add these functions to `frontend/lib/api.ts`:

```typescript
// Video Call API
export const videoCallAPI = {
  // Generate token
  generateToken: (data: { conversationId: string; channelName?: string }) =>
    api.post('/video-calls/token', data),
  
  // Start call
  startCall: (conversationId: string) =>
    api.post('/video-calls/start', { conversationId }),
  
  // End call
  endCall: (callId: string) =>
    api.put(`/video-calls/${callId}/end`),
  
  // Get history
  getHistory: (conversationId: string) =>
    api.get(`/video-calls/conversation/${conversationId}/history`),
};
```

### 8. Add Video Call Button to Messaging UI

In `components/chat-box.tsx` or your messaging component:

```tsx
import { Video } from 'lucide-react';
import { useState } from 'react';
import VideoCall from '@/components/video-call';
import { videoCallAPI } from '@/lib/api';

// Inside your component:
const [inCall, setInCall] = useState(false);
const [callToken, setCallToken] = useState(null);

const startVideoCall = async () => {
  try {
    const response = await videoCallAPI.startCall(conversationId);
    setCallToken(response.data.token);
    setInCall(true);
  } catch (error) {
    console.error('Failed to start call:', error);
  }
};

// Add button in your UI:
<Button onClick={startVideoCall}>
  <Video className="h-5 w-5" />
  Start Video Call
</Button>

// Render video call component:
{inCall && callToken && (
  <div className="fixed inset-0 z-50">
    <VideoCall
      appId={callToken.appId}
      channelName={callToken.channelName}
      token={callToken.token}
      onCallEnd={() => {
        setInCall(false);
        setCallToken(null);
      }}
    />
  </div>
)}
```

## Features

### ✅ Implemented
- ✅ 1-to-1 video calls
- ✅ Audio mute/unmute
- ✅ Video on/off
- ✅ Screen sharing
- ✅ Call history tracking
- ✅ Automatic token generation
- ✅ Duration calculation
- ✅ Row-level security

### 🎯 Future Enhancements
- 📝 Call recording
- 💬 In-call chat
- 📊 Call quality metrics
- 🎥 Background blur/virtual backgrounds
- 📱 Mobile app support

## Troubleshooting

### Token errors
- Verify AGORA_APP_ID and AGORA_APP_CERTIFICATE are set correctly
- Check token hasn't expired (default: 1 hour)

### Connection issues
- Check firewall settings
- Ensure WebRTC is enabled in browser
- Test with different network

### No video/audio
- Grant camera/microphone permissions
- Check device settings
- Try different browser

## Cost Estimation (Free Tier)
- Agora.io: 10,000 minutes/month free
- Each video call: ~2 minutes average
- **Free tier supports: ~5,000 interviews/month**

## Support
For issues, check:
- [Agora Documentation](https://docs.agora.io/)
- [Agora React SDK](https://github.com/AgoraIO-Community/agora-rtc-react)
- Project issues on GitHub
