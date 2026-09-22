-- Local registry as source of truth: uuid PK + Adliya sync key + provenance
-- Preserves existing Adliya rows via adliya_id backfill.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- trademarks → uuid PK
-- ---------------------------------------------------------------------------

alter table public.trademark_mgs drop constraint if exists trademark_mgs_trademark_id_fkey;

alter table public.trademarks
  add column if not exists uuid_id uuid,
  add column if not exists adliya_id bigint,
  add column if not exists source text,
  add column if not exists active boolean,
  add column if not exists field_locks text[],
  add column if not exists synced_at timestamptz,
  add column if not exists created_by uuid;

update public.trademarks
set
  uuid_id = coalesce(uuid_id, gen_random_uuid()),
  adliya_id = coalesce(adliya_id, id),
  source = coalesce(source, 'adliya'),
  active = coalesce(active, true),
  field_locks = coalesce(field_locks, '{}'::text[]),
  synced_at = coalesce(synced_at, imported_at)
where true;

alter table public.trademarks
  alter column uuid_id set default gen_random_uuid(),
  alter column uuid_id set not null,
  alter column source set default 'adliya',
  alter column source set not null,
  alter column active set default true,
  alter column active set not null,
  alter column field_locks set default '{}'::text[],
  alter column field_locks set not null;

alter table public.trademarks drop constraint if exists trademarks_source_check;
alter table public.trademarks
  add constraint trademarks_source_check
  check (source in ('adliya', 'manual', 'seed'));

-- Swap primary key: drop old bigint id, promote uuid_id
alter table public.trademarks drop constraint if exists trademarks_pkey;
alter table public.trademarks rename column id to legacy_adliya_id;
alter table public.trademarks rename column uuid_id to id;
alter table public.trademarks add primary key (id);

create unique index if not exists trademarks_adliya_id_uidx
  on public.trademarks (adliya_id)
  where adliya_id is not null;

alter table public.trademarks drop column if exists legacy_adliya_id;

create index if not exists trademarks_source_idx on public.trademarks (source);
create index if not exists trademarks_active_idx on public.trademarks (active);

-- public read: only active rows
drop policy if exists "trademarks_public_read" on public.trademarks;
create policy "trademarks_public_read"
on public.trademarks for select
to anon, authenticated
using (active = true);

-- ---------------------------------------------------------------------------
-- trademark_mgs → uuid PK + uuid trademark_id
-- ---------------------------------------------------------------------------

alter table public.trademark_mgs
  add column if not exists uuid_id uuid,
  add column if not exists adliya_mgs_id bigint,
  add column if not exists trademark_uuid uuid;

update public.trademark_mgs m
set
  uuid_id = coalesce(m.uuid_id, gen_random_uuid()),
  adliya_mgs_id = coalesce(m.adliya_mgs_id, m.id),
  trademark_uuid = coalesce(
    m.trademark_uuid,
    (select t.id from public.trademarks t where t.adliya_id = m.trademark_id limit 1)
  )
where true;

-- Drop orphaned mgs rows that could not be remapped
delete from public.trademark_mgs where trademark_uuid is null;

alter table public.trademark_mgs
  alter column uuid_id set default gen_random_uuid(),
  alter column uuid_id set not null,
  alter column trademark_uuid set not null;

alter table public.trademark_mgs drop constraint if exists trademark_mgs_pkey;
alter table public.trademark_mgs rename column id to legacy_mgs_id;
alter table public.trademark_mgs rename column uuid_id to id;
alter table public.trademark_mgs add primary key (id);

alter table public.trademark_mgs drop column if exists trademark_id;
alter table public.trademark_mgs rename column trademark_uuid to trademark_id;

alter table public.trademark_mgs
  add constraint trademark_mgs_trademark_id_fkey
  foreign key (trademark_id) references public.trademarks (id) on delete cascade;

alter table public.trademark_mgs drop column if exists legacy_mgs_id;

create unique index if not exists trademark_mgs_adliya_mgs_id_uidx
  on public.trademark_mgs (adliya_mgs_id)
  where adliya_mgs_id is not null;

create index if not exists trademark_mgs_trademark_id_idx
  on public.trademark_mgs (trademark_id);

-- ---------------------------------------------------------------------------
-- Allow registry source on trademark_checks
-- ---------------------------------------------------------------------------

alter table public.trademark_checks drop constraint if exists trademark_checks_source_check;
alter table public.trademark_checks
  add constraint trademark_checks_source_check
  check (source in ('mock', 'upstream', 'registry'));

-- ---------------------------------------------------------------------------
-- Import RPC: upsert by adliya_id with merge policy
-- ---------------------------------------------------------------------------

create or replace function public.import_trademarks_batch(
  p_secret text,
  p_rows jsonb,
  p_mgs jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text := current_setting('app.belgi_import_secret', true);
  rows_n int := 0;
  mgs_n int := 0;
  r jsonb;
  v_adliya_id bigint;
  v_tm_id uuid;
  v_locks text[];
  v_source text;
  v_mgs jsonb;
begin
  if expected is null or expected = '' then
    expected := 'belgi-import-2026-yfsl';
  end if;

  if p_secret is distinct from expected then
    raise exception 'import_forbidden';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows must be a json array';
  end if;

  for r in select * from jsonb_array_elements(p_rows)
  loop
    v_adliya_id := (r->>'adliya_id')::bigint;
    if v_adliya_id is null then
      continue;
    end if;

    select id, source, field_locks
      into v_tm_id, v_source, v_locks
    from public.trademarks
    where adliya_id = v_adliya_id
    limit 1;

    if v_tm_id is not null and v_source = 'manual' then
      -- never overwrite manual rows on sync
      continue;
    end if;

    v_locks := coalesce(v_locks, '{}'::text[]);

    if v_tm_id is null then
      insert into public.trademarks (
        adliya_id, number, application_date, registration_number, registration_date,
        expired, publication_date, logo, vienna_classification, collective,
        transliteration, trademark_type, colors, applicant, owner, owner_address,
        applicant_old, owner_old, address, status, unprotected_element, raw,
        source, active, synced_at, updated_at
      ) values (
        v_adliya_id,
        nullif(r->>'number', ''),
        nullif(r->>'application_date', ''),
        nullif(r->>'registration_number', ''),
        nullif(r->>'registration_date', ''),
        nullif(r->>'expired', ''),
        nullif(r->>'publication_date', ''),
        nullif(r->>'logo', ''),
        nullif(r->>'vienna_classification', ''),
        coalesce((r->>'collective')::boolean, false),
        nullif(r->>'transliteration', ''),
        nullif(r->>'trademark_type', ''),
        nullif(r->>'colors', ''),
        nullif(r->>'applicant', ''),
        nullif(r->>'owner', ''),
        nullif(r->>'owner_address', ''),
        nullif(r->>'applicant_old', ''),
        nullif(r->>'owner_old', ''),
        nullif(r->>'address', ''),
        nullif(r->>'status', ''),
        nullif(r->>'unprotected_element', ''),
        coalesce(r->'raw', '{}'::jsonb),
        'adliya',
        true,
        now(),
        now()
      )
      returning id into v_tm_id;
    else
      update public.trademarks set
        number = case when 'number' = any(v_locks) then number else nullif(r->>'number', '') end,
        application_date = case when 'application_date' = any(v_locks) then application_date else nullif(r->>'application_date', '') end,
        registration_number = case when 'registration_number' = any(v_locks) then registration_number else nullif(r->>'registration_number', '') end,
        registration_date = case when 'registration_date' = any(v_locks) then registration_date else nullif(r->>'registration_date', '') end,
        expired = case when 'expired' = any(v_locks) then expired else nullif(r->>'expired', '') end,
        publication_date = case when 'publication_date' = any(v_locks) then publication_date else nullif(r->>'publication_date', '') end,
        logo = case when 'logo' = any(v_locks) then logo else nullif(r->>'logo', '') end,
        vienna_classification = case when 'vienna_classification' = any(v_locks) then vienna_classification else nullif(r->>'vienna_classification', '') end,
        collective = case when 'collective' = any(v_locks) then collective else coalesce((r->>'collective')::boolean, false) end,
        transliteration = case when 'transliteration' = any(v_locks) then transliteration else nullif(r->>'transliteration', '') end,
        trademark_type = case when 'trademark_type' = any(v_locks) then trademark_type else nullif(r->>'trademark_type', '') end,
        colors = case when 'colors' = any(v_locks) then colors else nullif(r->>'colors', '') end,
        applicant = case when 'applicant' = any(v_locks) then applicant else nullif(r->>'applicant', '') end,
        owner = case when 'owner' = any(v_locks) then owner else nullif(r->>'owner', '') end,
        owner_address = case when 'owner_address' = any(v_locks) then owner_address else nullif(r->>'owner_address', '') end,
        applicant_old = case when 'applicant_old' = any(v_locks) then applicant_old else nullif(r->>'applicant_old', '') end,
        owner_old = case when 'owner_old' = any(v_locks) then owner_old else nullif(r->>'owner_old', '') end,
        address = case when 'address' = any(v_locks) then address else nullif(r->>'address', '') end,
        status = case when 'status' = any(v_locks) then status else nullif(r->>'status', '') end,
        unprotected_element = case when 'unprotected_element' = any(v_locks) then unprotected_element else nullif(r->>'unprotected_element', '') end,
        raw = case when 'raw' = any(v_locks) then raw else coalesce(r->'raw', '{}'::jsonb) end,
        source = 'adliya',
        synced_at = now(),
        updated_at = now()
      where id = v_tm_id;
    end if;

    rows_n := rows_n + 1;

    -- Replace Adliya-sourced MGS for this trademark; keep manual (adliya_mgs_id is null)
    if p_mgs is not null and jsonb_typeof(p_mgs) = 'array' then
      delete from public.trademark_mgs
      where trademark_id = v_tm_id
        and adliya_mgs_id is not null;

      for v_mgs in
        select * from jsonb_array_elements(p_mgs) m
        where (m->>'adliya_id')::bigint = v_adliya_id
           or (m->>'trademark_adliya_id')::bigint = v_adliya_id
      loop
        if (v_mgs->>'class_number')::int between 1 and 45 then
          insert into public.trademark_mgs (
            adliya_mgs_id, trademark_id, class_number, text_uz, text_ru
          ) values (
            nullif(v_mgs->>'adliya_mgs_id', '')::bigint,
            v_tm_id,
            (v_mgs->>'class_number')::int,
            nullif(v_mgs->>'text_uz', ''),
            nullif(v_mgs->>'text_ru', '')
          );
          mgs_n := mgs_n + 1;
        end if;
      end loop;
    end if;
  end loop;

  return jsonb_build_object('rows', rows_n, 'mgs', mgs_n);
end;
$$;

-- Similarity search helper for checks
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
  classes_text text
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
    ) as classes_text
  from base b;
$$;

revoke all on function public.search_trademarks_similar(text, int[], int, real) from public;
grant execute on function public.search_trademarks_similar(text, int[], int, real) to anon, authenticated, service_role;

grant execute on function public.import_trademarks_batch(text, jsonb, jsonb) to anon, authenticated, service_role;
grant execute on function public.import_trademarks_set_state(text, jsonb) to anon, authenticated, service_role;
