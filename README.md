# SwapBoard 1

Shift management and swap coordination for restaurants, healthcare, and retail teams.

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase, Resend, and Stripe keys — see SETUP.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

- **[SETUP.md](./SETUP.md)** — Full setup guide, migrations, env vars, and demo flow

## Tech stack

- **Next.js 16** — App Router, Server Actions
- **Supabase** — Auth, Postgres, RLS, Storage
- **Resend** — Transactional email (invites, password reset, welcome)
- **Stripe** — Subscription billing
- **Tailwind CSS** + **shadcn/ui**

## Website analytics

Google Analytics tracks page views and link/button clicks with measurement ID
`G-G0SKTBTDHP`. Platform super-admins can open Google Analytics from the
password-protected page at `/super-admin/website-analytics`. Reports are viewed
in Google Analytics; no Google Cloud credentials are required. The page
password uses `WEBSITE_ANALYTICS_PASSWORD` and a random
`WEBSITE_ANALYTICS_SESSION_SECRET` of at least 32 characters (generate one with
`openssl rand -hex 32`). Set these only in the server environment, not in
tracked files.

## Key routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Start free trial |
| `/invite?token=...` | Accept team invitation |
| `/dashboard` | Manager dashboard |
| `/my-shifts` | Worker shift view |
| `/settings` | Org settings and billing |
j
j
J
