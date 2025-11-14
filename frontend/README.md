# Jobsite Frontend

Modern Next.js frontend for the Jobsite AI-powered job portal.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Theme:** next-themes

## Features

- Mobile-first responsive design
- Light/Dark mode support
- Glassmorphism UI effects
- Student-friendly interface
- Role-based routing (Recruiter/Candidate)
- Real-time form validation
- Clean, modern UI based on design system

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on http://localhost:5000

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── candidate/           # Candidate pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── jobs/
│   ├── recruiter/           # Recruiter pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── jobs/
│   ├── globals.css          # Global styles & design system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── header.tsx           # App header
│   ├── bottom-nav.tsx       # Mobile bottom navigation
│   └── theme-provider.tsx   # Theme context
├── lib/                     # Utilities
│   ├── api.ts              # API client & endpoints
│   └── utils.ts            # Helper functions
└── public/                  # Static assets
```

## Pages

### Public Pages
- `/` - Landing page with role selection
- `/auth/login` - Login page
- `/auth/signup` - Sign up page

### Candidate Pages
- `/candidate/dashboard` - Candidate dashboard
- `/candidate/profile/setup` - Initial profile setup
- `/candidate/profile/edit` - Edit profile
- `/candidate/jobs` - Browse jobs
- `/candidate/jobs/[id]` - Job details

### Recruiter Pages
- `/recruiter/dashboard` - Recruiter dashboard
- `/recruiter/profile/setup` - Initial profile setup
- `/recruiter/profile/edit` - Edit profile
- `/recruiter/jobs` - Manage jobs
- `/recruiter/jobs/new` - Post new job
- `/recruiter/jobs/[id]/edit` - Edit job

## Design System

The design system is based on `referance/referance.json` with:

### Colors
- **Primary:** `#633ff3` (Purple)
- **Background (Light):** `#fcfcfd`
- **Background (Dark):** `#121421`

### Typography
- **Font:** Inter
- **Sizes:** Compact (xs: 12px, sm: 14px, base: 16px)

### Components
- **Buttons:** 40px height, rounded-xl
- **Inputs:** 40px height, rounded-lg
- **Cards:** rounded-xl with subtle shadows
- **Bottom Nav:** 56px height, glassmorphism effect

### Mobile-First
- Bottom navigation for mobile
- Compact spacing for more content
- Touch-friendly button sizes
- Safe area handling for notched devices

## API Integration

The frontend connects to the backend API via Axios:

```typescript
import { authAPI, profileAPI, jobsAPI } from '@/lib/api'

// Example: Login
const response = await authAPI.login({ email, password })

// Example: Fetch jobs
const jobs = await jobsAPI.getAll({ search: 'developer', limit: 20 })
```

## Authentication

- JWT tokens stored in localStorage
- Auto-redirect on authentication failure
- Role-based access control
- Profile completion check after login

## Styling

Using Tailwind CSS 4 with custom design tokens:

```tsx
// Primary button
<Button className="w-full">Click me</Button>

// Card with glassmorphism
<div className="glass rounded-xl p-4">Content</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Dark Mode

Toggle between light and dark mode:

```tsx
import { ThemeToggle } from '@/components/theme-toggle'

<ThemeToggle />
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Keep components small and focused
4. Follow mobile-first approach
5. Test on both light and dark modes

## Performance

- Server components by default
- Client components only when needed
- Optimized images and fonts
- Code splitting per route

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
