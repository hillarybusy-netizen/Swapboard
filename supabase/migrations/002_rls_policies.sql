-- SwapBoard V2 — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql

-- Helper: get current user's org id
create or replace function get_user_org_id()
returns uuid language sql security definer set search_path = public stable as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- Helper: is current user a manager or admin?
create or replace function is_manager()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce(
    (select user_role in ('manager', 'admin') from profiles where id = auth.uid()),
    false
  )
$$;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table organizations        enable row level security;
alter table departments          enable row level security;
alter table roles                enable row level security;
alter table profiles             enable row level security;
alter table shifts               enable row level security;
alter table swap_requests        enable row level security;
alter table analytics_events     enable row level security;
alter table feedback             enable row level security;
alter table onboarding_progress  enable row level security;
alter table invitations          enable row level security;

-- ============================================================
-- Organizations
-- ============================================================
create policy "Members can read own org" on organizations
  for select using (id = get_user_org_id());

create policy "Admins can update own org" on organizations
  for update using (id = get_user_org_id() and is_manager());

create policy "Authenticated users can create organizations" on organizations
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can read all organizations" on organizations
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Departments
-- ============================================================
create policy "Members read own org depts" on departments
  for select using (organization_id = get_user_org_id());

create policy "Managers manage depts" on departments
  for all using (organization_id = get_user_org_id() and is_manager());

create policy "Authenticated users can create departments" on departments
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can read all departments" on departments
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Roles
-- ============================================================
create policy "Members read own org roles" on roles
  for select using (organization_id = get_user_org_id());

create policy "Managers manage roles" on roles
  for all using (organization_id = get_user_org_id() and is_manager());

create policy "Authenticated users can create roles" on roles
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can read all roles" on roles
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Profiles
-- ============================================================
create policy "Users read own profile" on profiles
  for select using (id = auth.uid());

create policy "Users read others in same org" on profiles
  for select using (organization_id = (select organization_id from profiles where id = auth.uid()));

create policy "Users update own profile" on profiles
  for update using (id = auth.uid());

create policy "Managers update any profile in org" on profiles
  for update using (organization_id = get_user_org_id() and is_manager());

-- Allow profile creation on signup
create policy "Service role can insert profiles" on profiles
  for insert with check (true);

-- ============================================================
-- Shifts
-- ============================================================
create policy "Org members read shifts" on shifts
  for select using (organization_id = get_user_org_id());

create policy "Managers insert/update shifts" on shifts
  for insert with check (organization_id = get_user_org_id() and is_manager());

create policy "Managers update shifts" on shifts
  for update using (organization_id = get_user_org_id() and is_manager());

create policy "Managers delete shifts" on shifts
  for delete using (organization_id = get_user_org_id() and is_manager());

-- ============================================================
-- Swap Requests
-- ============================================================
create policy "Org members read swap requests" on swap_requests
  for select using (organization_id = get_user_org_id());

create policy "Workers create swap requests" on swap_requests
  for insert with check (
    organization_id = get_user_org_id() and
    requester_id = auth.uid()
  );

create policy "Workers/managers update swap requests" on swap_requests
  for update using (
    organization_id = get_user_org_id() and
    (requester_id = auth.uid() or covering_worker_id = auth.uid() or is_manager())
  );

-- ============================================================
-- Analytics Events
-- ============================================================
create policy "Org members read analytics" on analytics_events
  for select using (organization_id = get_user_org_id());

create policy "System inserts analytics" on analytics_events
  for insert with check (organization_id = get_user_org_id());

-- ============================================================
-- Feedback
-- ============================================================
create policy "Users read own feedback" on feedback
  for select using (user_id = auth.uid() or (organization_id = get_user_org_id() and is_manager()));

create policy "Users submit feedback" on feedback
  for insert with check (user_id = auth.uid() and organization_id = get_user_org_id());

-- ============================================================
-- Onboarding Progress
-- ============================================================
create policy "Managers read onboarding" on onboarding_progress
  for select using (organization_id = get_user_org_id());

create policy "Managers write onboarding" on onboarding_progress
  for all using (organization_id = get_user_org_id() and is_manager());

-- ============================================================
-- Invitations
-- ============================================================
create policy "Managers manage invitations" on invitations
  for all using (organization_id = get_user_org_id() and is_manager());

create policy "Anyone can read invitation by token" on invitations
  for select using (true);
