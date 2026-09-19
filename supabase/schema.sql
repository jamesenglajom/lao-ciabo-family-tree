-- The Lao - Ciabo Family Tree — Supabase schema, RLS, storage, and seed data.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- The two admin auth users referenced below were already created via the
-- Admin API (see scripts/create-user.mjs) — this script only adds their
-- `profiles` rows, it does not touch auth.users.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('admin', 'manager')),
  created_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender text check (gender in ('M', 'F')),
  photo_url text,
  date_of_birth date,
  date_of_death date,
  description text,
  father_id uuid references public.members (id) on delete set null,
  mother_id uuid references public.members (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_spouses (
  member_id uuid not null references public.members (id) on delete cascade,
  spouse_id uuid not null references public.members (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, spouse_id),
  check (member_id < spouse_id)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in (
      'birth_announcement', 'death_announcement', 'birthday', 'wedding',
      'anniversary', 'reunion', 'graduation', 'achievement',
      'general_announcement', 'other'
    )
  ),
  title text not null,
  description text,
  event_date date,
  location text,
  cover_image_url text,
  related_member_id uuid references public.members (id) on delete set null,
  is_published boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_set_updated_at
before update on public.members
for each row execute function public.set_updated_at();

create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RBAC helper functions (SECURITY DEFINER avoids recursive RLS on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'manager')
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.member_spouses enable row level security;
alter table public.reminders enable row level security;

-- profiles: everyone can read their own row; only admins can read/insert/update everything
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
for select using (public.is_admin());

create policy "profiles_insert_admin" on public.profiles
for insert with check (public.is_admin());

create policy "profiles_update_admin" on public.profiles
for update using (public.is_admin());

-- members: public read, admin/manager write
create policy "members_select_public" on public.members
for select using (true);

create policy "members_write_staff" on public.members
for all using (public.is_staff()) with check (public.is_staff());

-- member_spouses: public read, admin/manager write
create policy "member_spouses_select_public" on public.member_spouses
for select using (true);

create policy "member_spouses_write_staff" on public.member_spouses
for all using (public.is_staff()) with check (public.is_staff());

-- reminders (Family Announcements): public read of published items,
-- staff can also read drafts; admin/manager write
create policy "reminders_select_published" on public.reminders
for select using (is_published = true or public.is_staff());

create policy "reminders_write_staff" on public.reminders
for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- Storage buckets (public read, staff write)
-- The `member-photos` and `reminder-media` buckets were already created via
-- the Storage API (public: true) — only their access policies are set here.
-- ---------------------------------------------------------------------------
create policy "member_photos_public_read" on storage.objects
for select using (bucket_id = 'member-photos');

create policy "member_photos_staff_write" on storage.objects
for all using (bucket_id = 'member-photos' and public.is_staff())
with check (bucket_id = 'member-photos' and public.is_staff());

create policy "reminder_media_public_read" on storage.objects
for select using (bucket_id = 'reminder-media');

create policy "reminder_media_staff_write" on storage.objects
for all using (bucket_id = 'reminder-media' and public.is_staff())
with check (bucket_id = 'reminder-media' and public.is_staff());

-- ---------------------------------------------------------------------------
-- Seed: the two admin profiles (auth users already created via
-- `node --env-file=.env.local scripts/create-user.mjs <email>`)
-- ---------------------------------------------------------------------------
insert into public.profiles (id, email, role) values
  ('9cd61a0d-322f-4a96-ade8-83c35fcb521a', 'jamesenglajom@gmail.com', 'admin'),
  ('63aef777-b1af-44f5-8d08-64d2a75fe320', 'c.e.lajom@gmail.com', 'admin')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: sample Lao - Ciabo family (replace/delete once real records are in)
-- ---------------------------------------------------------------------------
insert into public.members (id, full_name, gender, date_of_birth, date_of_death, description) values
  ('f8327e06-320a-4f20-a060-5d96425bed04', 'Gregorio Lao Sr.', 'M', '1936-04-12', '2011-08-03', 'Lao family founder.'),
  ('aaf04f52-baaf-4f67-80cb-4ac9ee7a908e', 'Remedios Lao',     'F', '1939-11-02', '2015-01-20', 'Lao family founder.'),
  ('7ce13fb2-dc21-4476-aa38-112a34ccfca0', 'Bienvenido Ciabo Sr.', 'M', '1934-02-18', '2009-06-30', 'Ciabo family founder.'),
  ('fc0a6fa8-76d3-46c8-b55f-9e3c8ea50721', 'Corazon Ciabo',    'F', '1937-07-09', null,          'Ciabo family founder.'),
  ('c575b39a-47e1-49d9-b15b-d186851dbbfd', 'Ramon Lao',        'M', '1962-05-21', null,          null),
  ('55f67499-5f67-465e-8d2b-e7e5f2564ce6', 'Luz Lao',          'F', '1964-10-15', null,          'Where the Lao and Ciabo lines met.'),
  ('330ee70b-aab6-4c73-b496-ea56133a90ed', 'Teresita Villanueva', 'F', '1965-03-30', null,       null),
  ('73bf703d-b5ff-4961-9286-269cf8237d40', 'Danilo Villanueva', 'M', '1963-12-08', null,         'Married into the Lao family.'),
  ('db2b5ecc-0f6e-45ef-8ae6-cc529b137462', 'Ernesto Ciabo',    'M', '1967-01-25', null,          null),
  ('53523faa-b34d-4c90-9adc-af66eb84064b', 'Marites Ciabo',    'F', '1969-06-17', null,          'Married into the Ciabo family.'),
  ('717b9785-ba8a-433e-af45-7bea8d8ac31d', 'Justin Lao',       'M', '1990-09-02', null,          null),
  ('37dfbb10-c1fa-4d0a-bca3-6c0d2cfaf94e', 'Andrea Domingo',   'F', '1993-08-11', null,          null),
  ('a9de7ae6-050e-46fb-8905-7045a52d44a3', 'Marco Domingo',    'M', '1991-04-04', null,          null),
  ('c20be62e-09e7-45ca-864d-57edcc0c8720', 'Patricia Villanueva', 'F', '1992-02-14', null,       null),
  ('2a6cf78b-7ad7-47c3-a54e-d14eecbcfcb7', 'Miguel Ciabo',     'M', '1995-09-27', null,          null),
  ('1cf1ae23-3ca1-481f-95c9-51f980fd3c3d', 'Isabel Ciabo',     'F', '1998-09-05', null,          null),
  ('929388d0-1154-473a-a89b-e9fc8e15d857', 'Sofia Domingo',    'F', '2026-03-14', null,          'Newest generation.');

-- Parent links are added after the insert above so every id already exists
-- (avoids self-referencing FK ordering issues within a single statement).
update public.members set father_id = 'f8327e06-320a-4f20-a060-5d96425bed04', mother_id = 'aaf04f52-baaf-4f67-80cb-4ac9ee7a908e' where id = 'c575b39a-47e1-49d9-b15b-d186851dbbfd'; -- Ramon
update public.members set father_id = '7ce13fb2-dc21-4476-aa38-112a34ccfca0', mother_id = 'fc0a6fa8-76d3-46c8-b55f-9e3c8ea50721' where id = '55f67499-5f67-465e-8d2b-e7e5f2564ce6'; -- Luz
update public.members set father_id = 'f8327e06-320a-4f20-a060-5d96425bed04', mother_id = 'aaf04f52-baaf-4f67-80cb-4ac9ee7a908e' where id = '330ee70b-aab6-4c73-b496-ea56133a90ed'; -- Teresita
update public.members set father_id = '7ce13fb2-dc21-4476-aa38-112a34ccfca0', mother_id = 'fc0a6fa8-76d3-46c8-b55f-9e3c8ea50721' where id = 'db2b5ecc-0f6e-45ef-8ae6-cc529b137462'; -- Ernesto
update public.members set father_id = 'c575b39a-47e1-49d9-b15b-d186851dbbfd', mother_id = '55f67499-5f67-465e-8d2b-e7e5f2564ce6' where id = '717b9785-ba8a-433e-af45-7bea8d8ac31d'; -- Justin
update public.members set father_id = 'c575b39a-47e1-49d9-b15b-d186851dbbfd', mother_id = '55f67499-5f67-465e-8d2b-e7e5f2564ce6' where id = '37dfbb10-c1fa-4d0a-bca3-6c0d2cfaf94e'; -- Andrea
update public.members set father_id = '73bf703d-b5ff-4961-9286-269cf8237d40', mother_id = '330ee70b-aab6-4c73-b496-ea56133a90ed' where id = 'c20be62e-09e7-45ca-864d-57edcc0c8720'; -- Patricia
update public.members set father_id = 'db2b5ecc-0f6e-45ef-8ae6-cc529b137462', mother_id = '53523faa-b34d-4c90-9adc-af66eb84064b' where id = '2a6cf78b-7ad7-47c3-a54e-d14eecbcfcb7'; -- Miguel
update public.members set father_id = 'db2b5ecc-0f6e-45ef-8ae6-cc529b137462', mother_id = '53523faa-b34d-4c90-9adc-af66eb84064b' where id = '1cf1ae23-3ca1-481f-95c9-51f980fd3c3d'; -- Isabel
update public.members set father_id = 'a9de7ae6-050e-46fb-8905-7045a52d44a3', mother_id = '37dfbb10-c1fa-4d0a-bca3-6c0d2cfaf94e' where id = '929388d0-1154-473a-a89b-e9fc8e15d857'; -- Sofia

insert into public.member_spouses (member_id, spouse_id)
select least(a, b), greatest(a, b) from (
  values
    ('f8327e06-320a-4f20-a060-5d96425bed04'::uuid, 'aaf04f52-baaf-4f67-80cb-4ac9ee7a908e'::uuid), -- Gregorio & Remedios
    ('7ce13fb2-dc21-4476-aa38-112a34ccfca0'::uuid, 'fc0a6fa8-76d3-46c8-b55f-9e3c8ea50721'::uuid), -- Bienvenido & Corazon
    ('c575b39a-47e1-49d9-b15b-d186851dbbfd'::uuid, '55f67499-5f67-465e-8d2b-e7e5f2564ce6'::uuid), -- Ramon & Luz
    ('330ee70b-aab6-4c73-b496-ea56133a90ed'::uuid, '73bf703d-b5ff-4961-9286-269cf8237d40'::uuid), -- Teresita & Danilo
    ('db2b5ecc-0f6e-45ef-8ae6-cc529b137462'::uuid, '53523faa-b34d-4c90-9adc-af66eb84064b'::uuid), -- Ernesto & Marites
    ('37dfbb10-c1fa-4d0a-bca3-6c0d2cfaf94e'::uuid, 'a9de7ae6-050e-46fb-8905-7045a52d44a3'::uuid)   -- Andrea & Marco
) as pairs(a, b);

-- Sample announcements ("Family Announcements" board)
insert into public.reminders (type, title, description, event_date, location, related_member_id, is_published) values
  ('birth_announcement', 'Welcome, Sofia!', 'Sofia Domingo was born to Marco and Andrea. Mother and baby are doing well.', '2026-03-14', null, '929388d0-1154-473a-a89b-e9fc8e15d857', true),
  ('reunion', '2026 Lao-Ciabo Family Reunion', 'Save the date for this year''s family reunion — details to follow.', '2026-12-27', 'Tagaytay', null, true),
  ('death_announcement', 'In loving memory of Gregorio Lao Sr.', 'Remembering the Lao family founder on his anniversary.', '2011-08-03', null, 'f8327e06-320a-4f20-a060-5d96425bed04', true);
