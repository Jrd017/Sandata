# SanData

SanData is a Filipino-themed, gamified cybersecurity awareness app for learning how to spot phishing, spoofing, OTP scams, fake shopping, AI deepfakes, and related online threats.

## Apps

- `backend/`: Express, Mongoose, JWT auth, rate limiting, server-side XP and badge logic.
- `frontend/`: Next.js App Router, Tailwind, Zustand, Framer Motion, React Hot Toast.

## Run Locally

```powershell
npm install
npm run seed
npm run dev
```

Then open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health

The backend first tries `MONGO_URI` from `backend/.env`. If no local MongoDB service is running in development, it starts an in-memory MongoDB instance so the app can still be run and verified on this Windows machine.

## Supabase Mode

The frontend can use Supabase Auth and a realtime leaderboard when these values are present in `frontend/.env.local`:

```powershell
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Apply the schema in `supabase/migrations/20260610000000_initial_schema.sql`, then enable Realtime for `public.profiles` in the Supabase dashboard if it is not already enabled. If you already applied the first schema before the avatar/tips update, also run `supabase/migrations/20260610010000_initial_state_avatars_tips.sql` in the Supabase SQL Editor.

Without the Supabase variables, the app keeps using the existing local API and built-in visual fallback data.

## Security Notes

- Protected routes require `Authorization: Bearer <token>`.
- Module detail responses strip correct answers.
- Quiz Spirit Shards, score, level, rank, and badges are calculated only on the server.
- Client-sent Spirit Shards, score, level, or badge values are rejected by route validation.
