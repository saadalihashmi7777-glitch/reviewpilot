-- ReviewPilot — business profiles
-- Adds one business profile per authenticated user.
-- Safe to re-run: every statement is idempotent.
-- This migration does not touch user_plans or review_replies.

-- ---------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------

create table if not exists public.business_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique
                         references auth.users (id) on delete cascade,
  business_name        text not null,
  business_type        text not null,
  location             text not null,
  brand_voice          text not null,
  special_instructions text,
  website              text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- user_id is UNIQUE on purpose: one profile per user, which is what
-- makes the client-side upsert (onConflict: "user_id") work.

create index if not exists business_profiles_user_id_idx
  on public.business_profiles (user_id);

-- ---------------------------------------------------------------
-- 2. Keep updated_at accurate
-- ---------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists business_profiles_set_updated_at
  on public.business_profiles;

create trigger business_profiles_set_updated_at
  before update on public.business_profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------
-- A user can read, create and update ONLY their own profile.
-- There is no policy that can ever expose another user's row.

alter table public.business_profiles enable row level security;

drop policy if exists "business_profiles_select_own"
  on public.business_profiles;
create policy "business_profiles_select_own"
  on public.business_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "business_profiles_insert_own"
  on public.business_profiles;
create policy "business_profiles_insert_own"
  on public.business_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- USING controls which rows can be targeted, WITH CHECK controls what
-- they may be changed to. Both are required, or a user could reassign
-- their row to another user_id.
drop policy if exists "business_profiles_update_own"
  on public.business_profiles;
create policy "business_profiles_update_own"
  on public.business_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "business_profiles_delete_own"
  on public.business_profiles;
create policy "business_profiles_delete_own"
  on public.business_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 4. Verify (optional — run these to confirm)
-- ---------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename = 'business_profiles';
-- select policyname, cmd, qual, with_check from pg_policies
--   where schemaname = 'public' and tablename = 'business_profiles';
