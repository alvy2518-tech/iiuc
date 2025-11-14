# AI Professional Headshot Generator Feature

## Overview
The AI Professional Headshot Generator uses Google's Gemini AI to transform casual photos into professional headshots suitable for LinkedIn, corporate profiles, and professional websites.

## Features
- **Multiple Styles**: Choose from 4 professional styles
  - Formal Corporate
  - LinkedIn Style
  - Executive
  - Modern Professional
- **Real-time Progress**: Visual loading bar during generation
- **History Management**: View, download, and delete previous headshots
- **High Quality**: AI-powered professional photo enhancement

## Setup Instructions

### 1. Database Setup
Run the SQL migration in your Supabase SQL Editor:
```bash
# File location: database/migrations/create_professional_headshots_table.sql
```

This creates:
- `professional_headshots` table with RLS policies
- Indexes for performance
- Automatic timestamp updates

### 2. Environment Variables
Ensure your `.env` file contains:
```env
GEMINI_API_KEY=AIzaSyAjSBdJTSHrF3zqPYMmuMDCOt4sF4N7gnk
```

### 3. Backend Routes
Routes are automatically registered at:
- `POST /api/v1/headshots/generate` - Generate headshot
- `GET /api/v1/headshots/history` - Get user's history
- `DELETE /api/v1/headshots/:id` - Delete headshot

### 4. Frontend Integration
The component is integrated into the CV page at:
```
/frontend/app/candidate/cv/page.tsx
```

## API Usage

### Generate Headshot
```typescript
POST /api/v1/headshots/generate
Authorization: Bearer <token>

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "style": "formal" // or linkedin, corporate, casual_professional
}

Response:
{
  "message": "Headshot generated successfully",
  "candidateId": "uuid",
  "generatedImageUrl": "https://...",
  "originalImageUrl": "https://...",
  "style": "formal"
}
```

### Get History
```typescript
GET /api/v1/headshots/history
Authorization: Bearer <token>

Response:
[
  {
    "id": "uuid",
    "original_image_url": "https://...",
    "generated_image_url": "https://...",
    "style": "formal",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Delete Headshot
```typescript
DELETE /api/v1/headshots/:id
Authorization: Bearer <token>

Response:
{
  "message": "Headshot deleted successfully"
}
```

## Component Structure

### Frontend Component
**Location**: `/frontend/components/headshot-generator.tsx`

**Features**:
- Drag & drop image upload
- Style selection radio buttons
- Progress bar with percentage
- Success notifications
- History grid with download/delete actions
- Responsive design (mobile-friendly)

### Backend Controller
**Location**: `/backend/controllers/headshot.controller.js`

**Key Functions**:
- `generateHeadshot`: Main generation endpoint
- `getHeadshotHistory`: Fetch user's headshots
- `deleteHeadshot`: Remove headshot
- `generateHeadshotWithGemini`: Gemini API integration

### Routes
**Location**: `/backend/routes/headshot.routes.js`

All routes require authentication via JWT token.

## Gemini AI Integration

The feature uses Gemini 2.0 Flash Exp model for image generation:

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`

**Style Prompts**:
- **Formal**: Studio lighting, neutral background, business attire
- **LinkedIn**: Professional networking photo with clean background
- **Corporate**: Executive-style with formal suit
- **Casual Professional**: Modern tech professional look

## Security
- JWT authentication required for all endpoints
- Row Level Security (RLS) on database table
- Users can only access their own headshots
- Secure image storage via Supabase Storage

## Performance Optimization
- Database indexes on `candidate_id` and `created_at`
- Efficient image compression
- Progress simulation for better UX
- Lazy loading for history grid

## Testing
1. Navigate to `/candidate/cv` page
2. Scroll to "AI Professional Headshot Generator" section
3. Upload a photo
4. Select a style
5. Click "Generate Professional Headshot"
6. Wait for processing (progress bar shows status)
7. Download or view in history

## Troubleshooting

### Common Issues
1. **500 Error on Generate**
   - Check Gemini API key is valid
   - Verify image is under 10MB
   - Check Supabase storage bucket exists

2. **Image Not Displaying**
   - Verify Supabase storage is publicly accessible
   - Check image URL validity
   - Ensure RLS policies are correct

3. **History Not Loading**
   - Check authentication token
   - Verify database table exists
   - Check RLS policies

### Logs
Check backend logs for detailed error messages:
```bash
# Backend will log Gemini API responses
console.log('Gemini response:', response.data);
```

## Future Enhancements
- [ ] Batch processing for multiple photos
- [ ] More style options (business casual, creative, etc.)
- [ ] AI background removal
- [ ] Photo quality enhancement
- [ ] Custom style prompts
- [ ] Photo editing tools (crop, rotate, adjust)

## Credits
- **AI Model**: Google Gemini 2.0 Flash Exp
- **Image Processing**: Gemini Image Generation API
- **Storage**: Supabase Storage
- **UI Components**: Custom React components with Tailwind CSS

## Support
For issues or questions, please contact the development team.
