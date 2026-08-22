-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)
-- Adds the columns needed for the placement portal updates.

-- 1) Structured salary range on jobs, for the Salary Range filter
alter table public.jobs
  add column if not exists salary_min numeric,
  add column if not exists salary_max numeric;

-- 4) Date of birth on placement_records (kept alongside the existing "age" column)
alter table public.placement_records
  add column if not exists date_of_birth date;

-- 5) Fields collected at student registration that previously had no home in placement_records
alter table public.placement_records
  add column if not exists gender text,
  add column if not exists address text,
  add column if not exists institution text,
  add column if not exists year_of_passing text,
  add column if not exists percentage_grade text,
  add column if not exists job_category text,
  add column if not exists travel_preference text;

-- 6) Course/batch fields collected on placement_records (manual entry / CSV import) that
-- had no home on students, so a student self-registering via the portal never recorded them
alter table public.students
  add column if not exists course_name text,
  add column if not exists batch_completion_month text,
  add column if not exists batch_completion_year text;
