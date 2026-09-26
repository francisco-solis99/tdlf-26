-- Fix: the group-stage tiebreak should be wins, then point differential
-- (points scored minus points conceded) — not raw total points scored.
-- group_standings gets new columns (points_conceded, point_differential)
-- ahead of group_rank, which CREATE OR REPLACE VIEW won't allow (it only
-- lets you append columns at the end), so this drops and recreates both
-- views. double_status depends on group_standings, hence the cascade.

drop view if exists double_status;
drop view if exists group_standings;

create view group_standings
with (security_invoker = true) as
select
  d.group_id,
  d.id as double_id,
  count(*) filter (where m.winner_double_id = d.id) as wins,
  count(*) filter (where m.winner_double_id is not null
                    and m.winner_double_id <> d.id)                as losses,
  coalesce(sum(
    case when m.double1_id = d.id then m.score1
         when m.double2_id = d.id then m.score2 end
  ), 0) as points_scored,
  coalesce(sum(
    case when m.double1_id = d.id then m.score2
         when m.double2_id = d.id then m.score1 end
  ), 0) as points_conceded,
  coalesce(sum(
    case when m.double1_id = d.id then m.score1 - m.score2
         when m.double2_id = d.id then m.score2 - m.score1 end
  ), 0) as point_differential,
  row_number() over (
    partition by d.group_id
    order by
      count(*) filter (where m.winner_double_id = d.id) desc,
      coalesce(sum(case when m.double1_id = d.id then m.score1 - m.score2
                         when m.double2_id = d.id then m.score2 - m.score1 end), 0) desc
  ) as group_rank
from doubles d
left join matches m
  on (m.double1_id = d.id or m.double2_id = d.id)
  and m.winner_double_id is not null
  and m.stage = 'group'
where d.group_id is not null
group by d.group_id, d.id;

create view double_status
with (security_invoker = true) as
select
  gs.double_id,
  gs.group_id,
  gs.wins,
  gs.losses,
  gs.points_scored,
  gs.points_conceded,
  gs.point_differential,
  gs.group_rank,
  gp.group_stage_complete,
  case
    when not gp.group_stage_complete then 'in_progress'
    when gs.group_rank <= 2 then 'advanced'
    else 'eliminated'
  end as status
from group_standings gs
join group_progress gp on gp.group_id = gs.group_id;