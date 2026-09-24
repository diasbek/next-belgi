-- Services platform: catalog, fee schedules, orders, attorneys sync, orgs/B2B

-- Widen profiles.role for attorney / org_admin
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'attorney', 'org_admin'));

create table if not exists public.service_catalog (
  slug text primary key,
  kind text not null check (kind in ('tool', 'order', 'b2b')),
  title_uz text,
  title_ru text,
  title_en text,
  credit_cost integer not null default 0,
  price_hint text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_catalog (slug, kind, credit_cost) values
  ('nice-classes-fees', 'tool', 0),
  ('trademark-check', 'tool', 1),
  ('filing-package', 'order', 0),
  ('attorney-match', 'order', 0),
  ('ip-protection', 'order', 0),
  ('attorney-access', 'b2b', 0)
on conflict (slug) do nothing;

create table if not exists public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  fee_type text not null check (fee_type in ('filing', 'exam', 'reg', 'class_extra')),
  amount numeric(14, 2) not null,
  currency text not null default 'UZS',
  label text,
  valid_from date not null default current_date,
  valid_to date,
  created_at timestamptz not null default now()
);

create index if not exists fee_schedules_country_idx on public.fee_schedules (country, fee_type);

insert into public.fee_schedules (country, fee_type, amount, currency, label, valid_from) values
  ('uz', 'filing', 1200000, 'UZS', 'filing', '2026-09-01'),
  ('uz', 'exam', 800000, 'UZS', 'examination', '2026-09-01'),
  ('uz', 'reg', 1000000, 'UZS', 'registration', '2026-09-01'),
  ('uz', 'class_extra', 400000, 'UZS', 'extra class', '2026-09-01'),
  ('wipo', 'filing', 653, 'CHF', 'basic fee', '2026-09-01'),
  ('wipo', 'class_extra', 100, 'CHF', 'extra class', '2026-09-01'),
  ('eu', 'filing', 850, 'EUR', 'application', '2026-09-01'),
  ('eu', 'class_extra', 50, 'EUR', '2nd class', '2026-09-01'),
  ('us', 'filing', 350, 'USD', 'TEAS Plus / class', '2026-09-01'),
  ('us', 'class_extra', 350, 'USD', 'per additional class', '2026-09-01'),
  ('au', 'filing', 250, 'AUD', 'application / class', '2026-09-01'),
  ('au', 'class_extra', 250, 'AUD', 'per additional class', '2026-09-01'),
  ('kz', 'filing', 45000, 'KZT', 'filing', '2026-09-01'),
  ('kz', 'class_extra', 15000, 'KZT', 'extra class', '2026-09-01');

create table if not exists public.patent_attorneys_db (
  id text primary key,
  number integer,
  name text not null,
  email text,
  phone text,
  region text,
  district text,
  services text[] not null default '{}',
  profile_user_id uuid references public.profiles(id) on delete set null,
  active boolean not null default true,
  synced_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  status text not null default 'waitlist'
    check (status in ('waitlist', 'active', 'suspended')),
  registries text[] not null default '{}',
  volume_hint text,
  contact_email text,
  contact_name text,
  contact_phone text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table if not exists public.org_api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null default 'default',
  key_prefix text not null,
  key_hash text not null,
  rate_limit_per_min integer not null default 60,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  service_slug text not null references public.service_catalog(slug),
  status text not null default 'submitted'
    check (status in ('draft', 'submitted', 'in_progress', 'done', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  check_id text,
  attorney_id text references public.patent_attorneys_db(id) on delete set null,
  org_id uuid references public.organizations(id) on delete set null,
  locale text not null default 'uz',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_orders_status_idx on public.service_orders (status, created_at desc);
create index if not exists service_orders_user_idx on public.service_orders (user_id, created_at desc);
create index if not exists service_orders_slug_idx on public.service_orders (service_slug);

create table if not exists public.service_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.service_orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists service_order_events_order_idx
  on public.service_order_events (order_id, created_at desc);

-- Storage bucket for filing uploads (metadata only; policies below)
insert into storage.buckets (id, name, public, file_size_limit)
values ('filing-uploads', 'filing-uploads', false, 10485760)
on conflict (id) do nothing;

alter table public.service_catalog enable row level security;
alter table public.fee_schedules enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_order_events enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_api_keys enable row level security;
alter table public.patent_attorneys_db enable row level security;

-- Public read for catalog / fees / attorneys list
create policy service_catalog_read on public.service_catalog
  for select using (active = true);

create policy fee_schedules_read on public.fee_schedules
  for select using (true);

create policy patent_attorneys_db_read on public.patent_attorneys_db
  for select using (active = true);

-- Orders: owners see own; admins/attorneys via service role in app
create policy service_orders_select_own on public.service_orders
  for select using (auth.uid() = user_id);

create policy service_orders_insert_own on public.service_orders
  for insert with check (auth.uid() = user_id or user_id is null);

create policy service_order_events_select_own on public.service_order_events
  for select using (
    exists (
      select 1 from public.service_orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy organizations_select_member on public.organizations
  for select using (
    exists (
      select 1 from public.org_members m
      where m.org_id = id and m.user_id = auth.uid()
    )
  );

create policy org_members_select_own on public.org_members
  for select using (user_id = auth.uid());
