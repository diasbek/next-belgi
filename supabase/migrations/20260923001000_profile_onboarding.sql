-- Profile onboarding fields for SaaS-style user cards

create extension if not exists pg_trgm;

alter table public.profiles
  add column if not exists company_name text,
  add column if not exists job_title text,
  add column if not exists user_intent text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.profiles drop constraint if exists profiles_user_intent_check;
alter table public.profiles
  add constraint profiles_user_intent_check
  check (
    user_intent is null
    or user_intent in ('own_brand', 'agency', 'lawyer', 'other')
  );

create index if not exists profiles_company_name_trgm_idx
  on public.profiles using gin (company_name gin_trgm_ops);
