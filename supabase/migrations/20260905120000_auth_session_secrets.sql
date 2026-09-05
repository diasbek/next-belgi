-- Auth sessions, providers, OTP extensions, integration secrets

-- ---------------------------------------------------------------------------
-- profiles: password flag
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists has_password boolean not null default false;

-- ---------------------------------------------------------------------------
-- otp_challenges: purpose + verified + user
-- ---------------------------------------------------------------------------
alter table public.otp_challenges
  add column if not exists purpose text,
  add column if not exists destination_norm text,
  add column if not exists verified_at timestamptz,
  add column if not exists user_id uuid references public.profiles (id) on delete set null;

update public.otp_challenges
set purpose = coalesce(purpose, 'register'),
    destination_norm = coalesce(destination_norm, lower(trim(destination)))
where purpose is null or destination_norm is null;

alter table public.otp_challenges
  alter column purpose set default 'register',
  alter column purpose set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'otp_challenges_purpose_check'
  ) then
    alter table public.otp_challenges
      add constraint otp_challenges_purpose_check
      check (purpose in ('register', 'login', 'link', 'reset'));
  end if;
end $$;

create index if not exists otp_challenges_norm_idx
  on public.otp_challenges (destination_norm, purpose, created_at desc);
create index if not exists otp_challenges_user_id_idx
  on public.otp_challenges (user_id);

-- ---------------------------------------------------------------------------
-- app_sessions (custom BFF session; no Supabase JWT in browser)
-- ---------------------------------------------------------------------------
create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists app_sessions_user_id_idx
  on public.app_sessions (user_id);
create index if not exists app_sessions_expires_at_idx
  on public.app_sessions (expires_at)
  where revoked_at is null;

alter table public.app_sessions enable row level security;

drop policy if exists "app_sessions_deny_all" on public.app_sessions;
create policy "app_sessions_deny_all"
on public.app_sessions for all to anon, authenticated
using (false) with check (false);

revoke all on table public.app_sessions from anon, authenticated;
grant all on table public.app_sessions to service_role;

-- ---------------------------------------------------------------------------
-- auth_providers (Google OAuth link)
-- ---------------------------------------------------------------------------
create table if not exists public.auth_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('google')),
  provider_user_id text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create index if not exists auth_providers_user_id_idx
  on public.auth_providers (user_id);

alter table public.auth_providers enable row level security;

drop policy if exists "auth_providers_deny_all" on public.auth_providers;
create policy "auth_providers_deny_all"
on public.auth_providers for all to anon, authenticated
using (false) with check (false);

revoke all on table public.auth_providers from anon, authenticated;
grant all on table public.auth_providers to service_role;

-- ---------------------------------------------------------------------------
-- integration_secrets (admin-configured credentials; AES payload)
-- ---------------------------------------------------------------------------
create table if not exists public.integration_secrets (
  provider text primary key check (
    provider in (
      'eskiz',
      'openai',
      'resend',
      'payme',
      'click',
      'google',
      'telegram',
      'adliya'
    )
  ),
  payload_encrypted text not null,
  enabled boolean not null default true,
  meta jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.integration_secrets enable row level security;

drop policy if exists "integration_secrets_deny_all" on public.integration_secrets;
create policy "integration_secrets_deny_all"
on public.integration_secrets for all to anon, authenticated
using (false) with check (false);

revoke all on table public.integration_secrets from anon, authenticated;
grant all on table public.integration_secrets to service_role;

drop trigger if exists integration_secrets_set_updated_at on public.integration_secrets;
create trigger integration_secrets_set_updated_at
before update on public.integration_secrets
for each row execute function public.set_updated_at();
