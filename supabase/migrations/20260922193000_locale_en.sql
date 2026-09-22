-- Allow English locale on profiles; add English billing plan titles.

alter table public.profiles
  drop constraint if exists profiles_locale_check;

alter table public.profiles
  add constraint profiles_locale_check
  check (locale in ('uz', 'ru', 'en'));

alter table public.billing_plans
  add column if not exists title_en text;

update public.billing_plans
set title_en = case code
  when 'check_1' then '1 check'
  when 'pack_5' then '5 checks'
  when 'pack_10' then '10 checks'
  when 'pack_50' then '50 checks'
  else coalesce(title_en, title_uz)
end
where title_en is null;

alter table public.billing_plans
  alter column title_en set default '';

update public.billing_plans set title_en = title_uz where title_en is null or title_en = '';

alter table public.billing_plans
  alter column title_en set not null;
