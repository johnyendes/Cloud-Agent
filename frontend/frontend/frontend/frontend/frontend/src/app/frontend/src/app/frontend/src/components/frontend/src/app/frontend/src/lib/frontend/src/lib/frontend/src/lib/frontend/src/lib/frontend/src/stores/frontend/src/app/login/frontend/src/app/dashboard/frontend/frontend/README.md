# AgentCloudBuilder (Frontend)

Next.js App Router frontend shell for a multi-agent orchestration platform.

## Prereqs

- Node.js 20+
- pnpm (recommended) or npm/yarn

## Setup

1) Install dependencies

```bash
cd frontend
npm install
```

2) Configure environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

> In production (Vercel), set:
> `NEXT_PUBLIC_API_BASE_URL=https://api.agentbuilder.ai`

3) Run dev server

```bash
npm run dev
```

Open http://localhost:3000

## Routes

- `/` home
- `/login` login page (calls `POST /auth/login`)
- `/dashboard` protected page (calls `GET /me`)

## Backend expectations

Minimum endpoints expected by the current UI:

- `POST /auth/login` → `{ "access_token": "..." }`
- `GET /me` (Bearer token) → JSON payload (any shape)
