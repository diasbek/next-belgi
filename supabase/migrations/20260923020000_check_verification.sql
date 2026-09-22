-- Public verification for conclusion PDFs (QR authenticity).

alter table public.trademark_checks
  add column if not exists verification_code text,
  add column if not exists payload_hash text,
  add column if not exists conclusion_doc jsonb,
  add column if not exists verification_revoked_at timestamptz;

create unique index if not exists trademark_checks_verification_code_uidx
  on public.trademark_checks (verification_code)
  where verification_code is not null;

comment on column public.trademark_checks.verification_code is
  'Short public code for /v/{code} authenticity checks';
comment on column public.trademark_checks.payload_hash is
  'SHA-256 of canonical conclusion_doc JSON';
comment on column public.trademark_checks.conclusion_doc is
  'Structured expert-style conclusion payload for PDF + verify';
comment on column public.trademark_checks.verification_revoked_at is
  'When set, /v/{code} reports revoked';
