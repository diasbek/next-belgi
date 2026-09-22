-- Allow Nice multiselect classification sources written by the check pipeline.
-- Without this, inserts with classification_source = 'catalog' | 'catalog+openai'
-- violate trademark_checks_classification_source_check and are silently dropped.

alter table public.trademark_checks
  drop constraint if exists trademark_checks_classification_source_check;

alter table public.trademark_checks
  add constraint trademark_checks_classification_source_check
  check (
    classification_source is null
    or classification_source in (
      'openai',
      'cache',
      'fallback',
      'catalog',
      'catalog+openai'
    )
  );
