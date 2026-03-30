# MealRiot Web

Frontend for MealRiot — a nutrition tracking app with social and gamification features.

## Tech Stack

- React 19 with TypeScript
- Vite 8
- Tailwind CSS v4
- TanStack React Query
- React Router v7
- i18next (English + Hebrew with RTL)
- Recharts
- Supabase Auth (Google OAuth)

## Prerequisites

- Node.js 18+

## Getting Started

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Type-check and build     |
| `npm run lint`    | Run ESLint               |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/   # Shared UI components
├── pages/        # Route-level page components
├── services/     # API client and service modules
├── contexts/     # React context providers (auth, theme)
├── hooks/        # Custom React hooks
├── themes/       # Theme definitions and CSS custom properties
├── i18n/         # Translation files (en.json, he.json)
├── types/        # TypeScript type definitions
├── lib/          # Utility functions
├── assets/       # Static assets
└── test/         # Test setup and test files
```

## Testing

Run all tests:

```bash
npx vitest
```

Run a single test file:

```bash
npx vitest run src/test/themes.test.ts
```

## Related

- [MealRiot API](../mealriot-api) — Backend service
