-- SwapBoard V2 — Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- Organizations
-- ============================================================
create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  industry      text not null check (industry in ('restaurant', 'healthcare', 'retail', 'hospitality')),
  subdomain     text unique,
  plan          text not null default 'trial' check (plan in ('trial', 'starter', 'pro', 'enterprise')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at    timestamptz not null default (now() + interval '14 days'),
  settings      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- Departments (customizable per org)
-- ============================================================
create table departments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  color           text not null default '#6366f1',
  requires_certification boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Roles (within departments)
-- ============================================================
create table roles (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  department_id       uuid not null references departments(id) on delete cascade,
  name                text not null,
  min_hours_notice    integer not null default 2,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  department_id   uuid references departments(id) on delete set null,
  role_id         uuid references roles(id) on delete set null,
  full_name       text,
  phone           text,
  hourly_rate     numeric(10, 2) not null default 0,
  user_role       text not null default 'worker' check (user_role in ('worker', 'manager', 'admin')),
  is_active       boolean not null default true,
  certifications  text[] not null default '{}',
  avatar_url      text,
  invite_token    text unique,
  onboarding_complete boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Shifts
-- ============================================================
create table shifts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  department_id   uuid references departments(id) on delete set null,
  role_id         uuid references roles(id) on delete set null,
  assigned_to     uuid references profiles(id) on delete set null,
  title           text not null,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  status          text not null default 'scheduled'
                    check (status in ('scheduled', 'open', 'swap_pending', 'swapped', 'cancelled')),
  notes           text,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- Swap Requests
-- ============================================================
create table swap_requests (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references organizations(id) on delete cascade,
  requester_id          uuid not null references profiles(id) on delete cascade,
  shift_id              uuid not null references shifts(id) on delete cascade,
  covering_worker_id    uuid references profiles(id) on delete set null,
  status                text not null default 'pending'
                          check (status in (
                            'pending',
                            'worker_accepted',
                            'manager_approved',
                            'rejected',
                            'cancelled'
                          )),
  reason                text,
  manager_notes         text,
  approved_by           uuid references profiles(id) on delete set null,
  requested_at          timestamptz not null default now(),
  worker_responded_at   timestamptz,
  manager_responded_at  timestamptz,
  created_at            timestamptz not null default now()
);

-- ============================================================
-- Analytics Events (for ROI tracking)
-- ============================================================
create table analytics_events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  event_type      text not null,
  shift_id        uuid references shifts(id) on delete set null,
  swap_request_id uuid references swap_requests(id) on delete set null,
  user_id         uuid references profiles(id) on delete set null,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Feedback
-- ============================================================
create table feedback (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  swap_request_id uuid references swap_requests(id) on delete set null,
  rating          integer check (rating between 1 and 5),
  comment         text,
  feedback_type   text not null default 'swap'
                    check (feedback_type in ('swap', 'nps', 'general')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Onboarding Progress
-- ============================================================
create table onboarding_progress (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  step            text not null,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Team Invitations
-- ============================================================
create table invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email           text not null,
  user_role       text not null default 'worker',
  department_id   uuid references departments(id) on delete set null,
  token           text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by      uuid references profiles(id) on delete set null,
  accepted_at     timestamptz,
  expires_at      timestamptz not null default (now() + interval '7 days'),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Triggers: updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at before update on organizations
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger shifts_updated_at before update on shifts
  for each row execute function update_updated_at();

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
