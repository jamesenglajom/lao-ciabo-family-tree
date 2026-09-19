-- Incremental migration #3 — run after 002_social_links_and_reminder_link.sql.
-- Adds per-manager scoping: an admin can assign a manager a "root" member.
-- That manager can then create/update/delete only the root, its descendants
-- (found by walking down father_id/mother_id links), and the spouses of any
-- of those people. A manager with no root set is unrestricted (unchanged
-- behavior). Admins are always unrestricted regardless of this field.
--
-- Members/spouses/social-links writes become scope-aware; reminders and the
-- storage buckets (member-photos, reminder-media) are NOT scoped — every
-- manager keeps full access to those, per the original RBAC design.

-- ---------------------------------------------------------------------------
-- profiles.scope_member_id
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column scope_member_id uuid references public.members (id) on delete set null;

-- ---------------------------------------------------------------------------
-- member_scope_ids(root_id) — root + all descendants + their spouses.
-- Plain SQL (no SECURITY DEFINER needed): members/member_spouses are already
-- publicly readable, so this runs fine under the caller's own privileges.
-- ---------------------------------------------------------------------------
create or replace function public.member_scope_ids(root_id uuid)
returns table (id uuid)
language sql
stable
as $$
  with recursive descendants as (
    select m.id from public.members m where m.id = root_id
    union
    select m.id from public.members m
    join descendants d on m.father_id = d.id or m.mother_id = d.id
  )
  select d.id from descendants d
  union
  select ms.spouse_id from public.member_spouses ms where ms.member_id in (select id from descendants)
  union
  select ms.member_id from public.member_spouses ms where ms.spouse_id in (select id from descendants);
$$;

-- ---------------------------------------------------------------------------
-- RBAC helpers for scoped writes (SECURITY DEFINER: they read profiles,
-- which a manager can otherwise only read their own row of).
-- ---------------------------------------------------------------------------
create or replace function public.current_scope_member_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select scope_member_id from public.profiles where id = auth.uid();
$$;

-- May this member (an existing row) be created/updated/deleted by the caller?
create or replace function public.can_manage_member(target_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin()
    or (
      public.is_staff()
      and (
        public.current_scope_member_id() is null
        or target_id in (select id from public.member_scope_ids(public.current_scope_member_id()))
      )
    );
$$;

-- May a brand-new member with this father/mother be created by the caller?
-- Both null (an orphan/spouse-only record, linked via member_spouses right
-- after creation) is allowed — the member_spouses check below is what
-- actually gates whether that link succeeds.
create or replace function public.can_manage_new_member(father uuid, mother uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin()
    or (
      public.is_staff()
      and (
        public.current_scope_member_id() is null
        or (father is null and mother is null)
        or (father is not null and father in (select id from public.member_scope_ids(public.current_scope_member_id())))
        or (mother is not null and mother in (select id from public.member_scope_ids(public.current_scope_member_id())))
      )
    );
$$;

-- May this spouse pairing be created/removed by the caller? Either side
-- being in scope is enough (covers "adding a new in-law" to an in-scope
-- person).
create or replace function public.can_manage_spouse_link(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin()
    or (
      public.is_staff()
      and (
        public.current_scope_member_id() is null
        or a in (select id from public.member_scope_ids(public.current_scope_member_id()))
        or b in (select id from public.member_scope_ids(public.current_scope_member_id()))
      )
    );
$$;

-- ---------------------------------------------------------------------------
-- Replace the blanket staff-write policies with scope-aware ones.
-- ---------------------------------------------------------------------------
drop policy "members_write_staff" on public.members;

create policy "members_insert_scoped" on public.members
for insert with check (public.can_manage_new_member(father_id, mother_id));

create policy "members_update_scoped" on public.members
for update using (public.can_manage_member(id)) with check (public.can_manage_member(id));

create policy "members_delete_scoped" on public.members
for delete using (public.can_manage_member(id));

drop policy "member_spouses_write_staff" on public.member_spouses;

create policy "member_spouses_write_scoped" on public.member_spouses
for all using (public.can_manage_spouse_link(member_id, spouse_id))
with check (public.can_manage_spouse_link(member_id, spouse_id));

drop policy "member_social_links_write_staff" on public.member_social_links;

create policy "member_social_links_write_scoped" on public.member_social_links
for all using (public.can_manage_member(member_id)) with check (public.can_manage_member(member_id));
