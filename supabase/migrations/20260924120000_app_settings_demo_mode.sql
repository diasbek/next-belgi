-- Global app settings (admin Demo Mode, etc.)

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_deny_all" on public.app_settings;
create policy "app_settings_deny_all"
on public.app_settings for all to anon, authenticated
using (false) with check (false);

revoke all on table public.app_settings from anon, authenticated;
grant all on table public.app_settings to service_role;

insert into public.app_settings (key, value)
values ('demo_mode', '{"enabled": false}'::jsonb)
on conflict (key) do nothing;
