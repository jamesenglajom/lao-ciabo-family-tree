-- Incremental migration #5 — run after 004_creator_access.sql.
--
-- Supabase's free tier pauses a project after about a week with no activity.
-- Each row here is one "keep-alive" ping: a real write to the database,
-- recorded either by an admin pressing the button on /admin/config
-- ('manual') or by the scheduled Vercel Cron job ('cron'). The config page
-- reads the newest row to show when the project was last pinged.
--
-- Admin-only. The cron route uses the service-role key, which bypasses RLS,
-- so it needs no policy of its own.

create table public.keepalive_pings (
  id uuid primary key default gen_random_uuid(),
  triggered_at timestamptz not null default now(),
  source text not null check (source in ('manual', 'cron')),
  triggered_by text
);

create index keepalive_pings_triggered_at_idx
  on public.keepalive_pings (triggered_at desc);

alter table public.keepalive_pings enable row level security;

create policy "keepalive_pings_select_admin" on public.keepalive_pings
for select using (public.is_admin());

create policy "keepalive_pings_insert_admin" on public.keepalive_pings
for insert with check (public.is_admin());
