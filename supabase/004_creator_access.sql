-- Incremental migration #4 — run after 003_manager_scope.sql.
--
-- Closes an edge case in manager scoping: a scoped manager stays able to
-- edit/delete a member (and their spouse links) they personally created,
-- even in the rare case that member ends up unconnected to the manager's
-- assigned branch (e.g. created with no father/mother and no spouse link
-- yet). The common cases — adding a child under an in-scope parent, or a
-- new spouse linked to an in-scope person — already worked, since
-- member_scope_ids() is recomputed live and immediately includes them;
-- this just makes "you can always manage what you added" an explicit,
-- unconditional guarantee instead of an implicit side effect.
--
-- The app now sets members.created_by on insert (src/app/admin/(protected)/
-- members/actions.js) — existing rows created before this change have
-- created_by = null and are unaffected by the new clause.

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
        or exists (select 1 from public.members m where m.id = target_id and m.created_by = auth.uid())
      )
    );
$$;

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
        or exists (select 1 from public.members m where m.id = a and m.created_by = auth.uid())
        or exists (select 1 from public.members m where m.id = b and m.created_by = auth.uid())
      )
    );
$$;
