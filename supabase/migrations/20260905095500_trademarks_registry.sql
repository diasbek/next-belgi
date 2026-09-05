-- Official trademark registry (Adliya IM) mirror
-- Source: https://im.adliya.uz/register/TRADEMARK
-- Logos: https://api-ip.adliya.uz/v1/file/application/open-source/{logo}

create extension if not exists pg_trgm;

create table if not exists public.trademarks (
  id bigint primary key,
  number text,
  application_date text,
  registration_number text,
  registration_date text,
  expired text,
  publication_date text,
  logo text,
  vienna_classification text,
  collective boolean not null default false,
  transliteration text,
  trademark_type text,
  colors text,
  applicant text,
  owner text,
  owner_address text,
  applicant_old text,
  owner_old text,
  address text,
  status text,
  unprotected_element text,
  raw jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trademarks_number_idx on public.trademarks (number);
create index if not exists trademarks_status_idx on public.trademarks (status);
create index if not exists trademarks_type_idx on public.trademarks (trademark_type);
create index if not exists trademarks_transliteration_trgm_idx
  on public.trademarks using gin (transliteration gin_trgm_ops);
create index if not exists trademarks_applicant_trgm_idx
  on public.trademarks using gin (applicant gin_trgm_ops);
create index if not exists trademarks_owner_trgm_idx
  on public.trademarks using gin (owner gin_trgm_ops);
create index if not exists trademarks_updated_at_idx
  on public.trademarks (updated_at desc);

create table if not exists public.trademark_mgs (
  id bigint primary key,
  trademark_id bigint not null references public.trademarks (id) on delete cascade,
  class_number int not null check (class_number between 1 and 45),
  text_uz text,
  text_ru text
);

create index if not exists trademark_mgs_trademark_id_idx
  on public.trademark_mgs (trademark_id);
create index if not exists trademark_mgs_class_number_idx
  on public.trademark_mgs (class_number);
create index if not exists trademark_mgs_text_uz_trgm_idx
  on public.trademark_mgs using gin (text_uz gin_trgm_ops);
create index if not exists trademark_mgs_text_ru_trgm_idx
  on public.trademark_mgs using gin (text_ru gin_trgm_ops);

create table if not exists public.trademark_import_state (
  id int primary key default 1 check (id = 1),
  object_type text not null default 'TRADEMARK',
  page_size int not null default 100,
  last_page int not null default -1,
  total_elements bigint,
  total_pages int,
  imported_count bigint not null default 0,
  status text not null default 'idle'
    check (status in ('idle', 'running', 'paused', 'done', 'error')),
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.trademark_import_state (id)
values (1)
on conflict (id) do nothing;

alter table public.trademarks enable row level security;
alter table public.trademark_mgs enable row level security;
alter table public.trademark_import_state enable row level security;

-- Public read for check UI; writes via service_role only
drop policy if exists "trademarks_public_read" on public.trademarks;
create policy "trademarks_public_read"
on public.trademarks for select
to anon, authenticated
using (true);

drop policy if exists "trademark_mgs_public_read" on public.trademark_mgs;
create policy "trademark_mgs_public_read"
on public.trademark_mgs for select
to anon, authenticated
using (true);

drop policy if exists "trademark_import_state_deny" on public.trademark_import_state;
create policy "trademark_import_state_deny"
on public.trademark_import_state for select
to anon, authenticated
using (false);

grant select on table public.trademarks to anon, authenticated;
grant select on table public.trademark_mgs to anon, authenticated;
revoke all on table public.trademark_import_state from anon, authenticated;
grant all on table public.trademarks to service_role;
grant all on table public.trademark_mgs to service_role;
grant all on table public.trademark_import_state to service_role;
