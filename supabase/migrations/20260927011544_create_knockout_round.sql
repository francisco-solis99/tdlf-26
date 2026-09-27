-- Creates one knockout round's matches from admin-picked pairings. Handles
-- both the first knockout round (sourced from group-stage qualifiers) and
-- every round after it (sourced from the previous round's winners) — same
-- function either way, since "admin manually pairs who plays who" is the
-- same operation regardless of which round it is.
--
-- p_pairings shape: a JSON array, one entry per match —
--   [{"double1_id": "...", "double2_id": "..."}, ...]
--
-- Deliberately SECURITY INVOKER, same reasoning as create_groups_for_category:
-- it runs as the calling user, so its insert still goes through the normal
-- admin-only RLS policy on matches — no need to hide it in `private`.
create or replace function create_knockout_round(
  p_category_id uuid,
  p_stage match_stage,
  p_pairings jsonb
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_current_max_stage match_stage;
  v_expected_stage match_stage;
  v_qualifier_count integer;
  v_incomplete_groups integer;
  v_pending_matches integer;
  v_eligible_ids uuid[];
  v_paired_ids uuid[];
begin
  if p_stage = 'group' then
    raise exception 'create_knockout_round is only for knockout stages, not the group stage';
  end if;

  if p_pairings is null or jsonb_array_length(p_pairings) = 0 then
    raise exception 'No pairings provided';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_pairings) elem
    where elem->>'double1_id' is null or elem->>'double2_id' is null
  ) then
    raise exception 'Every pairing must include both double1_id and double2_id';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_pairings) elem
    where (elem->>'double1_id') = (elem->>'double2_id')
  ) then
    raise exception 'A double cannot be paired against itself';
  end if;

  -- find the highest knockout stage already created for this category, if
  -- any — matches has no direct category column, so this joins through
  -- double1_id, which every match (group or knockout) always has
  select max(m.stage) into v_current_max_stage
  from matches m
  join doubles d on d.id = m.double1_id
  where d.category_id = p_category_id
    and m.stage <> 'group';

  if v_current_max_stage is null then
    -- first knockout round: every group in the category must be finished
    if not exists (select 1 from groups where category_id = p_category_id) then
      raise exception 'No groups exist for this category yet';
    end if;

    select count(*) into v_incomplete_groups
    from group_progress gp
    join groups g on g.id = gp.group_id
    where g.category_id = p_category_id
      and not gp.group_stage_complete;

    if v_incomplete_groups > 0 then
      raise exception 'Group stage is not finished for every group in this category yet';
    end if;

    select array_agg(gs.double_id) into v_eligible_ids
    from group_standings gs
    join groups g on g.id = gs.group_id
    where g.category_id = p_category_id
      and gs.group_rank <= 2;

    v_qualifier_count := coalesce(array_length(v_eligible_ids, 1), 0);

    -- starting stage depends on how many qualified — always a power of 2,
    -- since group count is validated as one and qualifiers = 2 × groups
    v_expected_stage := case v_qualifier_count
      when 2 then 'final'
      when 4 then 'semifinal'
      when 8 then 'quarterfinal'
      when 16 then 'round_of_16'
      when 32 then 'round_of_32'
      else null
    end;

    if v_expected_stage is null then
      raise exception
        'Unexpected qualifier count (%) for this category — expected 2, 4, 8, 16 or 32',
        v_qualifier_count;
    end if;
  else
    if v_current_max_stage = 'final' then
      raise exception 'The final has already been created for this category — nothing left to advance';
    end if;

    select count(*) into v_pending_matches
    from matches m
    join doubles d on d.id = m.double1_id
    where d.category_id = p_category_id
      and m.stage = v_current_max_stage
      and m.winner_double_id is null;

    if v_pending_matches > 0 then
      raise exception 'Not every % match has a result yet', v_current_max_stage;
    end if;

    v_expected_stage := case v_current_max_stage
      when 'round_of_32' then 'round_of_16'
      when 'round_of_16' then 'quarterfinal'
      when 'quarterfinal' then 'semifinal'
      when 'semifinal' then 'final'
    end;

    select array_agg(m.winner_double_id) into v_eligible_ids
    from matches m
    join doubles d on d.id = m.double1_id
    where d.category_id = p_category_id
      and m.stage = v_current_max_stage;
  end if;

  if p_stage <> v_expected_stage then
    raise exception 'Expected to create % next for this category, not %', v_expected_stage, p_stage;
  end if;

  if exists (
    select 1 from matches m
    join doubles d on d.id = m.double1_id
    where d.category_id = p_category_id and m.stage = p_stage
  ) then
    raise exception '% matches already exist for this category', p_stage;
  end if;

  -- flatten the pairings into one array of double ids, to validate
  -- against the eligible set
  select array_agg(x) into v_paired_ids
  from (
    select (elem->>'double1_id')::uuid as x from jsonb_array_elements(p_pairings) elem
    union all
    select (elem->>'double2_id')::uuid as x from jsonb_array_elements(p_pairings) elem
  ) all_ids;

  if (select count(distinct x) from unnest(v_paired_ids) x) <> array_length(v_paired_ids, 1) then
    raise exception 'Each double can only appear in one pairing';
  end if;

  if (
    select array_agg(x order by x) from unnest(coalesce(v_eligible_ids, '{}')) x
  ) is distinct from (
    select array_agg(x order by x) from unnest(v_paired_ids) x
  ) then
    raise exception
      'Pairings must include every eligible double exactly once — % eligible, % paired',
      coalesce(array_length(v_eligible_ids, 1), 0), array_length(v_paired_ids, 1);
  end if;

  -- everything checks out
  insert into matches (stage, double1_id, double2_id)
  select
    p_stage,
    least((elem->>'double1_id')::uuid, (elem->>'double2_id')::uuid),
    greatest((elem->>'double1_id')::uuid, (elem->>'double2_id')::uuid)
  from jsonb_array_elements(p_pairings) elem;
end;
$$;