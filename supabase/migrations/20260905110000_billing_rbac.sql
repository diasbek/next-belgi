-- Billing + RBAC hardening for Belgi.ai
-- wallets, ledger, plans, payments; is_admin(); debit/credit RPCs

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- Prevent non-admins from changing role
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    if not public.is_admin() and (auth.jwt()->>'role') is distinct from 'service_role' then
      raise exception 'role_change_forbidden';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- Admin can read all profiles
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
on public.profiles for select
to authenticated
using (public.is_admin() or auth.uid() = id);

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using (public.is_admin() or auth.uid() = id)
with check (public.is_admin() or auth.uid() = id);

-- Admin read leads / checks
drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select"
on public.leads for select
to authenticated
using (public.is_admin());

drop policy if exists "trademark_checks_admin_select" on public.trademark_checks;
create policy "trademark_checks_admin_select"
on public.trademark_checks for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- wallets
-- ---------------------------------------------------------------------------
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.ensure_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_ensure_wallet on public.profiles;
create trigger profiles_ensure_wallet
after insert on public.profiles
for each row execute function public.ensure_wallet();

-- Backfill wallets for existing profiles
insert into public.wallets (user_id, balance)
select id, 0 from public.profiles
on conflict (user_id) do nothing;

alter table public.wallets enable row level security;

drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own"
on public.wallets for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ledger
-- ---------------------------------------------------------------------------
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta int not null,
  balance_after int not null,
  reason text not null check (reason in ('purchase', 'check_debit', 'refund', 'admin_adjust')),
  ref_type text,
  ref_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_user_id_idx
  on public.ledger_entries (user_id, created_at desc);

alter table public.ledger_entries enable row level security;

drop policy if exists "ledger_select_own" on public.ledger_entries;
create policy "ledger_select_own"
on public.ledger_entries for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- billing plans
-- ---------------------------------------------------------------------------
create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title_uz text not null,
  title_ru text not null,
  credits int not null check (credits > 0),
  price_uzs int not null check (price_uzs > 0),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.billing_plans (code, title_uz, title_ru, credits, price_uzs, sort)
values
  ('check_1', '1 tekshiruv', '1 проверка', 1, 15000, 10),
  ('pack_5', '5 tekshiruv', '5 проверок', 5, 65000, 20),
  ('pack_10', '10 tekshiruv', '10 проверок', 10, 120000, 30),
  ('pack_50', '50 tekshiruv', '50 проверок', 50, 500000, 40)
on conflict (code) do nothing;

alter table public.billing_plans enable row level security;

drop policy if exists "billing_plans_public_read" on public.billing_plans;
create policy "billing_plans_public_read"
on public.billing_plans for select
to anon, authenticated
using (active = true or public.is_admin());

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('payme', 'click')),
  plan_id uuid references public.billing_plans (id),
  amount_uzs int not null check (amount_uzs > 0),
  credits int not null check (credits > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  provider_payment_id text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payments_user_id_idx on public.payments (user_id, created_at desc);
create index if not exists payments_provider_payment_id_idx
  on public.payments (provider, provider_payment_id);
create unique index if not exists payments_provider_payment_unique
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
on public.payments for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- check entitlement link
-- ---------------------------------------------------------------------------
create table if not exists public.check_entitlements (
  trademark_check_id uuid primary key references public.trademark_checks (id) on delete cascade,
  ledger_entry_id uuid not null references public.ledger_entries (id),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.check_entitlements enable row level security;

drop policy if exists "check_entitlements_select_own" on public.check_entitlements;
create policy "check_entitlements_select_own"
on public.check_entitlements for select
to authenticated
using (public.is_admin() or auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- debit / credit RPCs
-- ---------------------------------------------------------------------------
create or replace function public.debit_check_credit(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance int;
  entry_id uuid;
begin
  if p_user_id is null then
    raise exception 'user_required';
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance = balance - 1, updated_at = now()
  where user_id = p_user_id and balance >= 1
  returning balance into new_balance;

  if new_balance is null then
    raise exception 'insufficient_credits';
  end if;

  insert into public.ledger_entries (user_id, delta, balance_after, reason, ref_type)
  values (p_user_id, -1, new_balance, 'check_debit', 'trademark_check')
  returning id into entry_id;

  return entry_id;
end;
$$;

create or replace function public.credit_purchase(p_payment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  pay record;
  new_balance int;
begin
  select * into pay from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'payment_not_found';
  end if;

  if pay.status = 'paid' then
    return true; -- idempotent
  end if;

  if pay.status <> 'pending' then
    raise exception 'payment_not_pending';
  end if;

  insert into public.wallets (user_id, balance)
  values (pay.user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance = balance + pay.credits, updated_at = now()
  where user_id = pay.user_id
  returning balance into new_balance;

  insert into public.ledger_entries (user_id, delta, balance_after, reason, ref_type, ref_id)
  values (pay.user_id, pay.credits, new_balance, 'purchase', 'payment', pay.id::text);

  update public.payments
  set status = 'paid', paid_at = now(), updated_at = now()
  where id = pay.id;

  return true;
end;
$$;

create or replace function public.admin_adjust_credits(
  p_user_id uuid,
  p_delta int,
  p_note text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance int;
begin
  if not public.is_admin() and (auth.jwt()->>'role') is distinct from 'service_role' then
    raise exception 'admin_required';
  end if;

  if p_delta = 0 then
    raise exception 'delta_zero';
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance = balance + p_delta, updated_at = now()
  where user_id = p_user_id and balance + p_delta >= 0
  returning balance into new_balance;

  if new_balance is null then
    raise exception 'insufficient_credits';
  end if;

  insert into public.ledger_entries (user_id, delta, balance_after, reason, ref_type, meta)
  values (
    p_user_id,
    p_delta,
    new_balance,
    'admin_adjust',
    'admin',
    jsonb_build_object('note', coalesce(p_note, ''))
  );

  return new_balance;
end;
$$;

create or replace function public.refund_check_credit(p_ledger_entry_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ent record;
  new_balance int;
begin
  select * into ent from public.ledger_entries where id = p_ledger_entry_id;
  if not found or ent.reason <> 'check_debit' then
    return false;
  end if;

  -- already refunded?
  if exists (
    select 1 from public.ledger_entries
    where reason = 'refund' and ref_id = p_ledger_entry_id::text
  ) then
    return true;
  end if;

  update public.wallets
  set balance = balance + 1, updated_at = now()
  where user_id = ent.user_id
  returning balance into new_balance;

  insert into public.ledger_entries (user_id, delta, balance_after, reason, ref_type, ref_id)
  values (ent.user_id, 1, new_balance, 'refund', 'ledger_entry', p_ledger_entry_id::text);

  return true;
end;
$$;

revoke all on function public.debit_check_credit(uuid) from public;
revoke all on function public.credit_purchase(uuid) from public;
revoke all on function public.admin_adjust_credits(uuid, int, text) from public;
revoke all on function public.refund_check_credit(uuid) from public;

grant execute on function public.debit_check_credit(uuid) to service_role;
grant execute on function public.credit_purchase(uuid) to service_role;
grant execute on function public.admin_adjust_credits(uuid, int, text) to authenticated, service_role;
grant execute on function public.refund_check_credit(uuid) to service_role;

grant select on table public.wallets to authenticated;
grant select on table public.ledger_entries to authenticated;
grant select on table public.billing_plans to anon, authenticated;
grant select on table public.payments to authenticated;
grant select on table public.check_entitlements to authenticated;
grant all on table public.wallets to service_role;
grant all on table public.ledger_entries to service_role;
grant all on table public.billing_plans to service_role;
grant all on table public.payments to service_role;
grant all on table public.check_entitlements to service_role;
