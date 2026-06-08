# SwapBoard V2 — Setup Guide

## Prerequisites

1. **Node.js** (LTS) — https://nodejs.org
2. **Supabase project** — https://supabase.com/dashboard
3. **Resend account** — https://resend.com (for emails)
4. **Stripe account** — https://stripe.com (for billing, optional in dev)

---

## Step 1: Install dependencies

```bash
npm install
```

---

## Step 2: Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret, server-only) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (`http://localhost:3000` in dev) |
| `RESEND_API_KEY` | Resend → API Keys |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (server-only) |
| `PLATFORM_ADMIN_EMAILS` | Comma-separated admin emails for `/admin` |

---

## Step 3: Set up the database

In **Supabase Dashboard → SQL Editor**, run these migrations **in order**:

| # | File | Purpose |
|---|------|---------|
| 1 | `001_initial_schema.sql` | Core tables |
| 2 | `002_rls_policies.sql` | Row-level security |
| 3 | `003_nullable_invite_email.sql` | Nullable invite emails |
| 4 | `004_storage_logos.sql` | Logo storage bucket |
| 5 | `005_invitations_email_nullable.sql` | (idempotent) nullable emails |
| 6 | `006_add_department_id_to_invitations.sql` | Dept on invites |
| 7 | `007_fix_invitations_role_check.sql` | Role constraint fix |
| 8 | `008_member_login_system.sql` | Member ID login |
| 9 | `011_fix_invitations_rls.sql` | Org read for invites |
| 10 | `013_security_fixes.sql` | Security hardening, storage scoping |

**Skip `012_invite_anon_access.sql`** — it is deprecated. Run `013` instead.

**Never run** scripts in `supabase/dev-only/` against production — they delete data.

---

## Step 4: Configure Supabase Auth

In **Supabase → Authentication → Providers → Email**:

- Disable "Confirm email" (accounts are created server-side with email pre-confirmed)
- Disable built-in email templates for password reset (app uses Resend)

---

## Step 5: Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## First-time setup flow

1. Click **"Start free trial"**
2. Create your admin account (work email required)
3. Choose industry → set up org → invite team
4. Land on the **Manager Dashboard**

---

## App routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Start free trial |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password |
| `/invite?token=...` | Accept invitation |
| `/onboarding/*` | New org setup |
| `/dashboard` | Manager dashboard |
| `/shifts` | Shift management |
| `/swaps` | Swap approvals |
| `/team` | Team + invites |
| `/settings` | Org settings, billing |
| `/my-shifts` | Worker shifts |
| `/swap-requests` | Worker swap offers |
| `/admin` | Platform admin (env-configured emails) |

---

## Email flows (all via Resend)

| Flow | Sender |
|------|--------|
| Team invitations | `no-reply@swapboard.ca` |
| Password reset | `no-reply@swapboard.ca` |
| Welcome on signup | `no-reply@swapboard.ca` |

---

## Build for production

```bash
npm run build
npm start
```

---

## Tech stack

- **Next.js 16** — App Router, Server Actions, proxy auth
- **Supabase** — Auth, Postgres, RLS, Storage
- **Resend** — Transactional email
- **Stripe** — Payments
- **Tailwind CSS** + **shadcn/ui** + **Recharts**
