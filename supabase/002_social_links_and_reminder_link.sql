-- Incremental migration #2 — run after supabase/schema.sql.
-- Adds: per-member social media links (one member can have many), and a
-- `link` field on reminders for the associated social media post.

-- ---------------------------------------------------------------------------
-- member_social_links — one member can have many accounts
-- ---------------------------------------------------------------------------
create table public.member_social_links (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  platform text not null check (
    platform in (
      'facebook', 'instagram', 'x', 'tiktok', 'youtube',
      'linkedin', 'messenger', 'website', 'other'
    )
  ),
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.member_social_links enable row level security;

create policy "member_social_links_select_public" on public.member_social_links
for select using (true);

create policy "member_social_links_write_staff" on public.member_social_links
for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- reminders.link — the social media post URL for an announcement/event
-- ---------------------------------------------------------------------------
alter table public.reminders add column link text;
