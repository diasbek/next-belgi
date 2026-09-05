-- Batch import RPC so we can upsert without SUPABASE_SERVICE_ROLE_KEY
-- (anon calls with BELGI_IMPORT_SECRET). service_role can also call it.

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

  insert into public.trademarks as t (
    id, number, application_date, registration_number, registration_date,
    expired, publication_date, logo, vienna_classification, collective,
    transliteration, trademark_type, colors, applicant, owner, owner_address,
    applicant_old, owner_old, address, status, unprotected_element, raw, updated_at
  )
  select
    (r->>'id')::bigint,
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
    coalesce((r->>'updated_at')::timestamptz, now())
  from jsonb_array_elements(p_rows) as r
  where (r->>'id') is not null
  on conflict (id) do update set
    number = excluded.number,
    application_date = excluded.application_date,
    registration_number = excluded.registration_number,
    registration_date = excluded.registration_date,
    expired = excluded.expired,
    publication_date = excluded.publication_date,
    logo = excluded.logo,
    vienna_classification = excluded.vienna_classification,
    collective = excluded.collective,
    transliteration = excluded.transliteration,
    trademark_type = excluded.trademark_type,
    colors = excluded.colors,
    applicant = excluded.applicant,
    owner = excluded.owner,
    owner_address = excluded.owner_address,
    applicant_old = excluded.applicant_old,
    owner_old = excluded.owner_old,
    address = excluded.address,
    status = excluded.status,
    unprotected_element = excluded.unprotected_element,
    raw = excluded.raw,
    updated_at = excluded.updated_at;

  get diagnostics rows_n = row_count;

  if p_mgs is not null and jsonb_typeof(p_mgs) = 'array' and jsonb_array_length(p_mgs) > 0 then
    insert into public.trademark_mgs as m (
      id, trademark_id, class_number, text_uz, text_ru
    )
    select
      (m->>'id')::bigint,
      (m->>'trademark_id')::bigint,
      (m->>'class_number')::int,
      nullif(m->>'text_uz', ''),
      nullif(m->>'text_ru', '')
    from jsonb_array_elements(p_mgs) as m
    where (m->>'id') is not null
      and (m->>'trademark_id') is not null
      and (m->>'class_number')::int between 1 and 45
    on conflict (id) do update set
      trademark_id = excluded.trademark_id,
      class_number = excluded.class_number,
      text_uz = excluded.text_uz,
      text_ru = excluded.text_ru;

    get diagnostics mgs_n = row_count;
  end if;

  return jsonb_build_object('rows', rows_n, 'mgs', mgs_n);
end;
$$;

create or replace function public.import_trademarks_set_state(
  p_secret text,
  p_patch jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text := current_setting('app.belgi_import_secret', true);
begin
  if expected is null or expected = '' then
    expected := 'belgi-import-2026-yfsl';
  end if;
  if p_secret is distinct from expected then
    raise exception 'import_forbidden';
  end if;

  insert into public.trademark_import_state (id, updated_at)
  values (1, now())
  on conflict (id) do nothing;

  update public.trademark_import_state set
    last_page = coalesce((p_patch->>'last_page')::int, last_page),
    total_elements = coalesce((p_patch->>'total_elements')::bigint, total_elements),
    total_pages = coalesce((p_patch->>'total_pages')::int, total_pages),
    imported_count = coalesce((p_patch->>'imported_count')::bigint, imported_count),
    page_size = coalesce((p_patch->>'page_size')::int, page_size),
    status = coalesce(p_patch->>'status', status),
    error = case
      when p_patch ? 'error' then nullif(p_patch->>'error', '')
      else error
    end,
    started_at = coalesce((p_patch->>'started_at')::timestamptz, started_at),
    finished_at = coalesce((p_patch->>'finished_at')::timestamptz, finished_at),
    updated_at = now()
  where id = 1;
end;
$$;

revoke all on function public.import_trademarks_batch(text, jsonb, jsonb) from public;
revoke all on function public.import_trademarks_set_state(text, jsonb) from public;
grant execute on function public.import_trademarks_batch(text, jsonb, jsonb) to anon, authenticated, service_role;
grant execute on function public.import_trademarks_set_state(text, jsonb) to anon, authenticated, service_role;
