-- Golden expert conclusion references (YURISER-style PDFs).
-- Used so known marks / similar queries produce matching verdicts.

create extension if not exists pg_trgm;

create table if not exists public.expert_conclusion_refs (
  id uuid primary key default gen_random_uuid(),
  mark text not null,
  mark_normalized text not null,
  nice_classes int[] not null default '{}',
  activity_raw text,
  appearance text not null default 'so‘zli',
  issued_at text,
  report_at text,
  source_file text,
  agency text not null default 'YURISER LLC',
  verdicts jsonb not null default '[]'::jsonb,
  adliya_matches jsonb not null default '[]'::jsonb,
  madrid_matches jsonb not null default '[]'::jsonb,
  internet_items jsonb not null default '[]'::jsonb,
  madrid_empty boolean not null default false,
  internet_empty boolean not null default false,
  disclaimer text,
  raw_excerpt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists expert_conclusion_refs_mark_norm_uidx
  on public.expert_conclusion_refs (mark_normalized);

create index if not exists expert_conclusion_refs_mark_trgm_idx
  on public.expert_conclusion_refs using gin (mark_normalized gin_trgm_ops);

alter table public.expert_conclusion_refs enable row level security;

drop policy if exists "expert_refs_public_read" on public.expert_conclusion_refs;
create policy "expert_refs_public_read"
on public.expert_conclusion_refs for select
to anon, authenticated
using (true);

comment on table public.expert_conclusion_refs is
  'Expert PDF golden refs for conclusion verdict calibration';
