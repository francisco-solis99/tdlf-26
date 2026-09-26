-- Merge of the letter-group naming with group-head seeding: the applied
-- add_group_heads migration regressed group names back to numbers
-- ('Grupo 1'...), breaking the letter identity used in public URLs.
-- This recreates the same 3-parameter function with 'Grupo A'...
-- naming in all three places (creation, head seeding, random spread).
--
-- No signature change, so no backup or data migration is needed — only
-- future group creations are affected. Existing groups keep their names.
create or replace function create_groups_for_category(
  p_category_id uuid,
  p_group_count integer,
  p_group_heads uuid[] default '{}'
)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_double_count integer;
  v_head_count integer;
  v_invalid_heads integer;
begin
  if p_group_count is null or p_group_count < 1
     or (p_group_count & (p_group_count - 1)) <> 0 then
    raise exception 'Group count must be a power of 2 (1, 2, 4, 8, 16...), got %', p_group_count;
  end if;

  if exists (select 1 from groups where category_id = p_category_id) then
    raise exception 'Groups already exist for this category — group creation only runs once';
  end if;

  v_head_count := coalesce(array_length(p_group_heads, 1), 0);

  if v_head_count > 0 and v_head_count <> p_group_count then
    raise exception 'Provide one group head per group (%) or none at all — got %',
      p_group_count, v_head_count;
  end if;

  if v_head_count > 0 then
    if (select count(distinct h) from unnest(p_group_heads) as h) <> v_head_count then
      raise exception 'Group heads must all be different doubles';
    end if;

    select count(*) into v_invalid_heads
    from unnest(p_group_heads) as h
    where not exists (
      select 1 from doubles
      where id = h and category_id = p_category_id and group_id is null
    );
    if v_invalid_heads > 0 then
      raise exception 'One or more group heads are not valid, ungrouped doubles in this category';
    end if;
  end if;

  select count(*) into v_double_count
  from doubles
  where category_id = p_category_id and group_id is null;

  if v_double_count < p_group_count * 2 then
    raise exception
      'Not enough registered doubles (%) to fill % groups with at least 2 pairs each',
      v_double_count, p_group_count;
  end if;

  -- create the N groups, named with letters: 'Grupo A', 'Grupo B', ...
  -- (16 groups max, so a single letter always suffices)
  insert into groups (category_id, name)
  select p_category_id, 'Grupo ' || chr((64 + n)::int)
  from generate_series(1, p_group_count) as n;

  -- seed the heads first, one per group — array position N (1-based)
  -- becomes the head of "Grupo N"
  if v_head_count > 0 then
    update doubles d
    set group_id = g.id
    from unnest(p_group_heads) with ordinality as head(double_id, idx)
    join groups g
      on g.category_id = p_category_id
     and g.name = 'Grupo ' || chr((64 + head.idx)::int)
    where d.id = head.double_id;
  end if;

  -- randomly shuffle whatever's still ungrouped (heads are already
  -- grouped, so they're excluded here automatically) and spread evenly
  -- across the groups
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
     and g.name = 'Grupo ' || chr((64 + (((s.rn - 1) % p_group_count) + 1))::int)
  )
  update doubles d
  set group_id = a.group_id
  from assigned a
  where d.id = a.double_id;

  -- generate every pairing within each new group exactly once
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
