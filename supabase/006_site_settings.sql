-- Incremental migration #6 — run after 005_keepalive.sql.
--
-- Moves the site's identity (name, titles, meta tags, share image, ...) out
-- of code and into one editable row, so the same app can be deployed for
-- another family by pointing it at a different Supabase project and setting
-- these from /admin/config.
--
-- Every column is optional: NULL / empty means "use the built-in default",
-- which the app derives from the family name (see
-- src/lib/site-settings-resolve.js).

create table public.site_settings (
  -- `check (id)` + a boolean primary key means the table can hold exactly one row.
  id boolean primary key default true check (id),

  -- Identity
  family_name text,
  family_lines text[] not null default '{}',
  site_name text,
  hero_eyebrow text,
  tagline text,

  -- Search & sharing
  meta_title text,
  meta_description text,
  meta_keywords text[] not null default '{}',
  og_image_url text,
  allow_indexing boolean not null default true,

  -- Family Tree page
  tree_title text,
  tree_description text,

  -- Other
  announcements_title text,
  timezone text,

  updated_at timestamptz not null default now(),
  updated_by text
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

-- Visitors need to read these (they're what the public site displays);
-- only admins can change them, and the single row can't be deleted.
create policy "site_settings_select_public" on public.site_settings
for select using (true);

create policy "site_settings_insert_admin" on public.site_settings
for insert with check (public.is_admin());

create policy "site_settings_update_admin" on public.site_settings
for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- `site-assets` storage bucket (share image etc.): public read, admin write.
-- The bucket itself is created through the Storage API (public, 2MB limit),
-- like member-photos and reminder-media — only its policies live here.
-- ---------------------------------------------------------------------------
create policy "site_assets_public_read" on storage.objects
for select using (bucket_id = 'site-assets');

create policy "site_assets_admin_write" on storage.objects
for all using (bucket_id = 'site-assets' and public.is_admin())
with check (bucket_id = 'site-assets' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed THIS deployment (the Lao family) so the live site reads exactly as it
-- does today. Skip this insert when setting up a different family — the app
-- then starts with generic defaults and you fill in the details on
-- /admin/config.
-- ---------------------------------------------------------------------------
insert into public.site_settings (id, family_name, family_lines, timezone)
values (true, 'Lao', array['Ciabo-Lao', 'Bernal-Lao'], 'Asia/Manila')
on conflict (id) do nothing;
