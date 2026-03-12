-- ============================================================
-- AcadIQ v2 — Supabase Schema (with Auth)
-- Run this entire file in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- 1. Reports table
create table if not exists reports (
  id              uuid default gen_random_uuid() primary key,
  created_at      timestamptz default now(),
  student_name    text not null,
  roll_number     text,
  module          text not null check (module in ('academic', 'career')),
  input_data      jsonb not null,
  result_data     jsonb not null,
  risk_level      text,
  readiness_score integer
);

-- 2. Resources table
create table if not exists resources (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  title         text not null,
  category      text not null check (category in ('syllabus','pyq','notes','timetable','brochure','event','other')),
  description   text,
  file_url      text,
  external_link text,
  semester      text,
  subject       text,
  file_name     text,
  file_size     integer,
  uploaded_by   text default 'admin'
);

-- 3. Admin users table (NEW)
-- Add email addresses here to grant admin access
create table if not exists admin_users (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table reports     enable row level security;
alter table resources   enable row level security;
alter table admin_users enable row level security;

-- Reports: public read/insert, anyone can delete
drop policy if exists "Public read reports"   on reports;
drop policy if exists "Anyone insert reports" on reports;
drop policy if exists "Anyone delete reports" on reports;
create policy "Public read reports"   on reports for select using (true);
create policy "Anyone insert reports" on reports for insert with check (true);
create policy "Anyone delete reports" on reports for delete using (true);

-- Resources: public read, anyone insert/delete
drop policy if exists "Public read resources"   on resources;
drop policy if exists "Anyone insert resources" on resources;
drop policy if exists "Anyone delete resources" on resources;
create policy "Public read resources"   on resources for select using (true);
create policy "Anyone insert resources" on resources for insert with check (true);
create policy "Anyone delete resources" on resources for delete using (true);

-- Admin users: public read only (used by check-role API)
drop policy if exists "Public read admin_users" on admin_users;
create policy "Public read admin_users" on admin_users for select using (true);

-- ============================================================
-- Add your admin emails below — replace with real addresses
-- ============================================================
-- insert into admin_users (email) values ('principal@yourcollege.edu');
-- insert into admin_users (email) values ('hod.cs@yourcollege.edu');
-- insert into admin_users (email) values ('placementofficer@yourcollege.edu');

-- ============================================================
-- Supabase Auth: Enable Google provider
-- Go to: Authentication → Providers → Google → Enable
-- Add your Google OAuth Client ID and Secret
-- ============================================================

-- ============================================================
-- Supabase Storage — for direct file uploads (Resources)
-- ============================================================
-- Run this in Supabase SQL Editor to create the storage bucket:

insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Allow public read of all files in the bucket
drop policy if exists "Public read resources bucket" on storage.objects;
create policy "Public read resources bucket"
  on storage.objects for select
  using (bucket_id = 'resources');

-- Allow authenticated or service role to insert
drop policy if exists "Service insert resources bucket" on storage.objects;
create policy "Service insert resources bucket"
  on storage.objects for insert
  with check (bucket_id = 'resources');

-- Allow delete
drop policy if exists "Service delete resources bucket" on storage.objects;
create policy "Service delete resources bucket"
  on storage.objects for delete
  using (bucket_id = 'resources');
