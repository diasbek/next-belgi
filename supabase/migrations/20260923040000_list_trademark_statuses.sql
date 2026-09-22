-- Distinct trademark statuses for admin registry filters.
create or replace function public.list_trademark_statuses()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select distinct btrim(status)
  from public.trademarks
  where status is not null
    and btrim(status) <> ''
  order by 1;
$$;

revoke all on function public.list_trademark_statuses() from public;
grant execute on function public.list_trademark_statuses() to service_role;
grant execute on function public.list_trademark_statuses() to authenticated;
