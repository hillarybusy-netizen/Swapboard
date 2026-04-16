# SwapBoard V2 — Setup Guide

## Prerequisites

1. **Install Node.js** — Download from https://nodejs.org (LTS version recommended)
2. **Supabase project** — https://supabase.com/dashboard (free tier works)

---

## Step 1: Install dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

---

## Step 2: Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these in: **Supabase Dashboard → Your Project → Settings → API**

---

## Step 3: Set up the database

In your **Supabase Dashboard → SQL Editor**, run these files **in order**:

1. Copy and paste `supabase/migrations/001_initial_schema.sql` → Run
2. Copy and paste `supabase/migrations/002_rls_policies.sql` → Run

---

## Step 4: Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 5: First-time setup flow

1. Click **"Start free trial"** on the login page
2. Create your admin account
3. **Step 1**: Choose your industry (Restaurant / Healthcare / Retail)
4. **Step 2**: Name your organization + review pre-filled departments
5. **Step 3**: Invite team members (or skip)
6. Land on the **Manager Dashboard**

---

## App routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Start free trial |
| `/onboarding/industry` | Industry selection |
| `/onboarding/setup` | Org + department setup |
| `/onboarding/invite` | Invite team |
| `/dashboard` | Manager dashboard + ROI analytics |
| `/shifts` | Shifts management |
| `/swaps` | Swap request approvals |
| `/team` | Team members |
| `/settings` | Org settings, departments, billing |
| `/my-shifts` | Worker: view my shifts |
| `/swap-requests` | Worker: offer to cover swaps |
| `/invite?token=...` | Accept invitation link |

---

## Industry department templates

Automatically pre-populated on setup:

| Industry | Departments |
|----------|-------------|
| 🍽️ Restaurant | Front of House, Back of House, Bar, Management |
| 🏥 Healthcare | ICU, Emergency, Med/Surg, Pharmacy, Administration |
| 🛍️ Retail | Sales Floor, Cashier/POS, Stock/Receiving, Management |

---

## ROI metrics (dashboard)

| Metric | Calculation |
|--------|-------------|
| Cost Savings | Swaps fulfilled × 8h × $15 overtime premium |
| Manager Time Saved | Swaps fulfilled × 30 min avg coordination |
| Fulfillment Rate | % of swaps approved / total requested |

---

## Demo tips

1. Register two accounts (manager + worker)
2. As manager: create a few shifts, assign to worker
3. As worker (incognito): log in, request a swap
4. As manager: approve from dashboard or /swaps
5. Watch KPI cards update on the dashboard

---

## Build for production

```bash
npm run build
npm start
```

---

## Tech stack

- **Next.js 14** — App Router, Server Components, Server Actions
- **Supabase** — Auth, Postgres, RLS policies
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Component library
- **Recharts** — Analytics charts
- **date-fns** — Date formatting
