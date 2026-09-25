-- Group creation: takes every currently-ungrouped double in a category,
-- splits them into N groups (random shuffle, spread as evenly as
-- possible), and generates the full round-robin match set for each group.
-- Runs as one transaction: either everything lands, or nothing does.
--
-- Deliberately SECURITY INVOKER (the default — no "security definer"
-- here): it runs as the calling user, so every insert/update inside it is
-- still checked against the normal RLS policies (which require
-- private.is_admin()). That means even if the app-layer admin check were
-- ever bypassed, a non-admin calling this directly would just get every
-- write inside it rejected by RLS — defense in depth, no special-casing
-- needed. Also why this one doesn't need to live in the `private` schema
-- like is_admin()/handle_new_user() do: being publicly callable via RPC
-- isn't a risk here, since RLS already makes it a no-op for non-admins.
create or replace function create_groups_for_category(
  p_category_id uuid,
  p_group_count integer
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_double_count integer;
begin
  -- group count must be a power of 2, or the knockout bracket built later
  -- won't divide cleanly (see docs/frontenis-ai-context.md)
  if p_group_count is null or p_group_count < 1
     or (p_group_count & (p_group_count - 1)) <> 0 then
    raise exception 'Group count must be a power of 2 (1, 2, 4, 8, 16...), got %', p_group_count;
  end if;

  -- one-time action per category: once groups exist, re-running this
  -- would either duplicate groups or strand later-registered doubles
  -- outside the round-robin they'd need to be part of
  if exists (select 1 from groups where category_id = p_category_id) then
    raise exception 'Groups already exist for this category — group creation only runs once';
  end if;

  select count(*) into v_double_count
  from doubles
  where category_id = p_category_id and group_id is null;

  if v_double_count < p_group_count * 2 then
    raise exception
      'Not enough registered doubles (%) to fill % groups with at least 2 pairs each',
      v_double_count, p_group_count;
  end if;

  -- create the N groups
  insert into groups (category_id, name)
  select p_category_id, 'Grupo ' || n
  from generate_series(1, p_group_count) as n;

  -- randomly shuffle the ungrouped doubles, then spread them evenly
  -- across the new groups — the modulo mapping puts any extra pairs on
  -- the earlier groups rather than piling them all onto the last one
  with shuffled as (
    select id, row_number() over (order by random()) as rn
    from doubles
    where category_id = p_category_id and group_id is null
  ),
  assigned as (
    select s.id as double_id, g.id as group_id
    from shuffled s
    join groups g
      on g.category_id = p_category_id
     and g.name = 'Grupo ' || (((s.rn - 1) % p_group_count) + 1)
  )
  update doubles d
  set group_id = a.group_id
  from assigned a
  where d.id = a.double_id;

  -- generate every pairing within each new group exactly once, already
  -- in canonical order (d1.id < d2.id) so it satisfies the existing
  -- constraint without extra work
  insert into matches (group_id, double1_id, double2_id, stage)
  select d1.group_id, d1.id, d2.id, 'group'
  from doubles d1
  join doubles d2
    on d2.group_id = d1.group_id
   and d1.id < d2.id
  where d1.category_id = p_category_id
    and d1.group_id is not null;
end;
$$;