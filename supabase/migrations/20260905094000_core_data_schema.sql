-- Belgi.ai core data schema
-- profiles, leads, trademark_checks, otp_challenges, notification_log, media_assets

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text unique,
  locale text not null default 'uz' check (locale in ('uz', 'ru')),
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_phone_idx on public.profiles (phone);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'locale', 'uz')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id text primary key,
  type text not null check (type in ('contact', 'lawyer', 'check')),
  locale text not null default 'uz',
  page_url text,
  utm jsonb not null default '{}'::jsonb,
  request_id text unique,
  payload jsonb not null,
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'new' check (status in ('new', 'sent', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_user_id_idx on public.leads (user_id);

alter table public.leads enable row level security;

drop policy if exists "leads_deny_anon" on public.leads;
create policy "leads_deny_anon"
on public.leads for select to anon using (false);

drop policy if exists "leads_deny_authenticated" on public.leads;
create policy "leads_deny_authenticated"
on public.leads for all to authenticated using (false) with check (false);

revoke all on table public.leads from anon, authenticated;
grant all on table public.leads to service_role;

-- ---------------------------------------------------------------------------
-- trademark_checks
-- ---------------------------------------------------------------------------
create table if not exists public.trademark_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  query text not null,
  activity_raw text not null,
  activity_normalized text,
  locale text not null default 'uz',
  nice_classes jsonb not null default '[]'::jsonb,
  classification_source text check (
    classification_source is null
    or classification_source in ('openai', 'cache', 'fallback')
  ),
  report jsonb,
  source text not null check (source in ('mock', 'upstream')),
  created_at timestamptz not null default now()
);

create index if not exists trademark_checks_created_at_idx
  on public.trademark_checks (created_at desc);
create index if not exists trademark_checks_user_id_idx
  on public.trademark_checks (user_id);
create index if not exists trademark_checks_query_idx
  on public.trademark_checks (lower(query));

alter table public.trademark_checks enable row level security;

drop policy if exists "trademark_checks_select_own" on public.trademark_checks;
create policy "trademark_checks_select_own"
on public.trademark_checks for select
to authenticated
using (auth.uid() = user_id);

-- inserts/updates only via service_role (BFF)
revoke insert, update, delete on table public.trademark_checks from anon, authenticated;
grant select on table public.trademark_checks to authenticated;
grant all on table public.trademark_checks to service_role;

-- ---------------------------------------------------------------------------
-- otp_challenges
-- ---------------------------------------------------------------------------
create table if not exists public.otp_challenges (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('sms', 'email')),
  destination text not null,
  code_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists otp_challenges_destination_idx
  on public.otp_challenges (destination, created_at desc);
create index if not exists otp_challenges_expires_at_idx
  on public.otp_challenges (expires_at);

alter table public.otp_challenges enable row level security;

drop policy if exists "otp_deny_anon" on public.otp_challenges;
create policy "otp_deny_anon"
on public.otp_challenges for select to anon using (false);

drop policy if exists "otp_deny_authenticated" on public.otp_challenges;
create policy "otp_deny_authenticated"
on public.otp_challenges for all to authenticated using (false) with check (false);

revoke all on table public.otp_challenges from anon, authenticated;
grant all on table public.otp_challenges to service_role;

-- ---------------------------------------------------------------------------
-- notification_log
-- ---------------------------------------------------------------------------
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('resend', 'eskiz', 'telegram')),
  kind text not null check (kind in ('lead', 'otp', 'report', 'system')),
  destination text,
  status text not null check (status in ('queued', 'sent', 'failed')),
  provider_message_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_created_at_idx
  on public.notification_log (created_at desc);
create index if not exists notification_log_provider_idx
  on public.notification_log (provider, kind);

alter table public.notification_log enable row level security;

drop policy if exists "notification_log_deny_anon" on public.notification_log;
create policy "notification_log_deny_anon"
on public.notification_log for select to anon using (false);

drop policy if exists "notification_log_deny_authenticated" on public.notification_log;
create policy "notification_log_deny_authenticated"
on public.notification_log for all to authenticated using (false) with check (false);

revoke all on table public.notification_log from anon, authenticated;
grant all on table public.notification_log to service_role;

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'images',
  path text not null unique,
  mime text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_uploaded_by_idx
  on public.media_assets (uploaded_by);

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets for select
to anon, authenticated
using (true);

drop policy if exists "media_assets_owner_insert" on public.media_assets;
create policy "media_assets_owner_insert"
on public.media_assets for insert
to authenticated
with check (auth.uid() = uploaded_by);

grant select on table public.media_assets to anon, authenticated;
grant insert on table public.media_assets to authenticated;
grant all on table public.media_assets to service_role;
