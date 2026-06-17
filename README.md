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
