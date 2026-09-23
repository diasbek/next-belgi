-- Multi-jurisdiction hub: Madrid source, external search cache, check jurisdictions

-- 1) Allow madrid (and future registry sources) on trademarks
alter table public.trademarks drop constraint if exists trademarks_source_check;
alter table public.trademarks
  add constraint trademarks_source_check
  check (source in ('adliya', 'manual', 'seed', 'madrid'));

-- Optional IRN / external id for Madrid (stored in number when present)
alter table public.trademarks
  add column if not exists external_id text;

create unique index if not exists trademarks_madrid_external_id_uidx
  on public.trademarks (external_id)
  where source = 'madrid' and external_id is not null;

-- Madrid import state (separate from Adliya sync)
create table if not exists public.madrid_import_state (
  id int primary key default 1 check (id = 1),
  status text not null default 'idle',
  last_file text,
  last_imported_at timestamptz,
  records_total int not null default 0,
  records_uz int not null default 0,
  error text,
  updated_at timestamptz not null default now()
);

insert into public.madrid_import_state (id)
values (1)
on conflict (id) do nothing;

-- 2) External API search cache
create table if not exists public.external_search_cache (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  query_norm text not null,
  classes_key text not null default '',
  payload jsonb not null default '[]'::jsonb,
  unavailable boolean not null default false,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (jurisdiction, query_norm, classes_key)
);

create index if not exists external_search_cache_expires_idx
  on public.external_search_cache (expires_at);

-- 3) Selected jurisdictions on trademark_checks
alter table public.trademark_checks
  add column if not exists jurisdictions jsonb default '["uz"]'::jsonb;

-- 4) Expand integration_secrets providers for office APIs
alter table public.integration_secrets drop constraint if exists integration_secrets_provider_check;
alter table public.integration_secrets
  add constraint integration_secrets_provider_check
  check (
    provider in (
      'eskiz',
      'openai',
      'resend',
      'payme',
      'click',
      'google',
      'telegram',
      'adliya',
      'euipo',
      'uspto',
      'ipaustralia',
      'kazpatent'
    )
  );

-- 5) search_trademarks_similar returns source for report block split
create or replace function public.search_trademarks_similar(
  p_query text,
  p_classes int[] default null,
  p_limit int default 20,
  p_min_sim real default 0.15
)
returns table (
  id uuid,
  adliya_id bigint,
  number text,
  transliteration text,
  owner text,
  applicant text,
  status text,
  logo text,
  registration_date text,
  expired text,
  similarity real,
  classes_text text,
  source text
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select trim(p_query) as query
  ),
  base as (
    select
      t.id,
      t.adliya_id,
      t.number,
      t.transliteration,
      t.owner,
      t.applicant,
      t.status,
      t.logo,
      t.registration_date,
      t.expired,
      t.source,
      greatest(
        coalesce(similarity(coalesce(t.transliteration, ''), (select query from q)), 0),
        case
          when t.number ilike '%' || (select query from q) || '%' then 0.85
          else 0
        end
      ) as sim
    from public.trademarks t
    where t.active = true
      and (select query from q) <> ''
      and (
        t.transliteration % (select query from q)
        or t.number ilike '%' || (select query from q) || '%'
        or coalesce(similarity(coalesce(t.transliteration, ''), (select query from q)), 0) >= p_min_sim
      )
      and (
        p_classes is null
        or cardinality(p_classes) = 0
        or exists (
          select 1
          from public.trademark_mgs m
          where m.trademark_id = t.id
            and m.class_number = any (p_classes)
        )
      )
    order by sim desc
    limit greatest(1, least(coalesce(p_limit, 20), 50))
  )
  select
    b.id,
    b.adliya_id,
    b.number,
    b.transliteration,
    b.owner,
    b.applicant,
    b.status,
    b.logo,
    b.registration_date,
    b.expired,
    b.sim::real as similarity,
    (
      select string_agg('[' || m.class_number::text || '] ' || coalesce(m.text_uz, m.text_ru, ''), E'\n' order by m.class_number)
      from public.trademark_mgs m
      where m.trademark_id = b.id
    ) as classes_text,
    b.source
  from base b;
$$;

revoke all on function public.search_trademarks_similar(text, int[], int, real) from public;
grant execute on function public.search_trademarks_similar(text, int[], int, real) to anon, authenticated, service_role;
