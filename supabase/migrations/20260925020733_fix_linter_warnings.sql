-- Delta migration: fixes the Supabase linter warnings from the first
-- migration. Safe to run against a database that already has the
-- original schema — nothing here re-creates anything that already exists.

-- 1. Internal SECURITY DEFINER helpers move to a private schema, hidden
--    from PostgREST's auto-generated RPC endpoints. Moving a function's
--    schema doesn't require touching the trigger or policies that already
--    reference it — Postgres tracks that by the function's OID, not its
--    name, so they keep working automatically.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.handle_new_user() set schema private;
revoke execute on function private.handle_new_user() from public;

alter function public.is_admin() set schema private;
alter function private.is_admin() set search_path = public;
revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- 2. Pin search_path on the trigger functions that stay in public — their
--    bodies aren't changing, just this one setting.
alter function public.validate_double_group_category() set search_path = public;
alter function public.validate_player_single_double() set search_path = public;
alter function public.validate_match_group() set search_path = public;

-- 3. set_match_winner's body also changed (clearing winner_double_id /
--    played_at when a score gets nulled out), so it's replaced rather
--    than just altered.
create or replace function set_match_winner()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.score1 is not null and new.score2 is not null then
    if new.score1 = new.score2 then
      raise exception 'A frontenis match cannot end in a tie — check the scores';
    end if;
    new.winner_double_id := case when new.score1 > new.score2
                                  then new.double1_id else new.double2_id end;
    if new.played_at is null then
      new.played_at := now();
    end if;
  else
    new.winner_double_id := null;
    new.played_at := null;
  end if;
  return new;
end;
$$;

-- 4. Drop the storage policy that let clients list/enumerate every file
--    in the public player-photos bucket. The bucket being public already
--    serves objects via their URL without this policy.
drop policy if exists "player_photos_select_all" on storage.objects;