"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  KNOCKOUT_STAGES,
  nextKnockoutStage,
  startingStageForQualifiers,
  type KnockoutStage,
} from "@/lib/torneo-view";

type Tables = Database["public"]["Tables"];
type Views = Database["public"]["Views"];

export type Category = Tables["categories"]["Row"];
export type Group = Tables["groups"]["Row"];
export type Player = Tables["players"]["Row"];
export type Match = Tables["matches"]["Row"];
export type GroupStanding = Views["group_standings"]["Row"];
export type DoubleStatus = Views["double_status"]["Row"];

// A double with both players resolved plus its group/category names.
// `group` is null until the admin runs "create groups" for the category.
export type DoubleWithPlayers = Tables["doubles"]["Row"] & {
  player1: Player;
  player2: Player;
  group: Pick<Group, "id" | "name"> | null;
  category: Pick<Category, "id" | "name">;
};

function throwQueryError(context: string, message: string): never {
  throw new Error(`Supabase query failed (${context}): ${message}`);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throwQueryError("categories", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Groups (optionally scoped to one category)
// ---------------------------------------------------------------------------

export async function getGroups(categoryId?: string): Promise<Group[]> {
  const supabase = await createClient();
  let query = supabase.from("groups").select("*").order("name");

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query;
  if (error) throwQueryError("groups", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Players (registration order)
// ---------------------------------------------------------------------------

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at");

  if (error) throwQueryError("players", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Doubles with both players (optionally scoped by category and/or group)
// ---------------------------------------------------------------------------

export async function getDoublesWithPlayers(filters?: {
  categoryId?: string;
  groupId?: string | null;
}): Promise<DoubleWithPlayers[]> {
  const supabase = await createClient();
  let query = supabase.from("doubles").select(`
    *,
    player1:players!doubles_player1_id_fkey(id, name, age, city, picture),
    player2:players!doubles_player2_id_fkey(id, name, age, city, picture),
    group:groups(id, name),
    category:categories!doubles_category_id_fkey(id, name)
  `);

  if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
  // Explicit null matches ungrouped doubles (registered but not grouped yet).
  if (filters?.groupId !== undefined)
    query =
      filters.groupId === null
        ? query.is("group_id", null)
        : query.eq("group_id", filters.groupId);

  const { data, error } = await query.order("created_at");
  if (error) throwQueryError("doubles", error.message);
  return data as DoubleWithPlayers[];
}

// ---------------------------------------------------------------------------
// Matches (optionally scoped by group and/or stage; defaults to group stage)
// ---------------------------------------------------------------------------

export async function getMatches(filters?: {
  groupId?: string;
  stage?: Database["public"]["Enums"]["match_stage"];
}): Promise<Match[]> {
  const supabase = await createClient();
  let query = supabase
    .from("matches")
    .select("*")
    .eq("stage", filters?.stage ?? "group")
    .order("created_at");

  if (filters?.groupId) query = query.eq("group_id", filters.groupId);

  const { data, error } = await query;
  if (error) throwQueryError("matches", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Group standings (wins first, points scored as tiebreak).
// group_rank <= 2 is exactly "the top two pairs that advance".
// ---------------------------------------------------------------------------

export async function getGroupStandings(
  groupId?: string,
): Promise<GroupStanding[]> {
  const supabase = await createClient();
  let query = supabase
    .from("group_standings")
    .select("*")
    .order("group_rank");

  if (groupId) query = query.eq("group_id", groupId);

  const { data, error } = await query;
  if (error) throwQueryError("group_standings", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Double status: 'in_progress' | 'advanced' | 'eliminated'.
// Always computed fresh from group_standings + group_progress, never stored.
// ---------------------------------------------------------------------------

export async function getDoubleStatus(filters?: {
  groupId?: string;
  doubleId?: string;
}): Promise<DoubleStatus[]> {
  const supabase = await createClient();
  let query = supabase.from("double_status").select("*");

  if (filters?.groupId) query = query.eq("group_id", filters.groupId);
  if (filters?.doubleId) query = query.eq("double_id", filters.doubleId);

  const { data, error } = await query;
  if (error) throwQueryError("double_status", error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Knockout matches of one category (any non-group stage). matches has no
// category column, so this filters through the category's doubles.
// ---------------------------------------------------------------------------

export async function getKnockoutMatches(
  categoryId: string,
): Promise<Match[]> {
  const supabase = await createClient();
  const [{ data: matches, error }, doubles] = await Promise.all([
    supabase.from("matches").select("*").neq("stage", "group"),
    getDoublesWithPlayers({ categoryId }),
  ]);
  if (error) throwQueryError("matches", error.message);
  const ids = new Set(doubles.map((d) => d.id));
  return (matches ?? []).filter(
    (m) => ids.has(m.double1_id) && ids.has(m.double2_id),
  );
}

// ---------------------------------------------------------------------------
// Knockout state for the admin section: what exists, what's next, who's
// eligible. Mirrors create_knockout_round's derivation for display — the
// function's own validation stays the source of truth on submit.
// ---------------------------------------------------------------------------

export type KnockoutContender = {
  doubleId: string;
  nombre: string;
  grupo: string | null;
};

export type KnockoutState = {
  hasGroups: boolean;
  groupStageComplete: boolean;
  pendingGroups: number;
  qualifierCount: number;
  currentMaxStage: KnockoutStage | null;
  stages: Array<{
    stage: KnockoutStage;
    matches: Match[];
  }>;
  expectedStage: KnockoutStage | null;
  eligible: KnockoutContender[];
  champion: KnockoutContender | null;
};

export async function getKnockoutState(
  categoryId: string,
): Promise<KnockoutState> {
  const [groups, doubles, statuses, koMatches] = await Promise.all([
    getGroups(categoryId),
    getDoublesWithPlayers({ categoryId }),
    getDoubleStatus(),
    getKnockoutMatches(categoryId),
  ]);

  const groupIds = new Set(groups.map((g) => g.id));
  const nombrePorId = new Map(
    doubles.map((d) => [
      d.id,
      {
        nombre: `${d.player1.name} / ${d.player2.name}`,
        grupo: d.group?.name ?? null,
      },
    ]),
  );
  const contendiente = (doubleId: string): KnockoutContender => ({
    doubleId,
    nombre: nombrePorId.get(doubleId)?.nombre ?? "?",
    grupo: nombrePorId.get(doubleId)?.grupo ?? null,
  });

  const empty: KnockoutState = {
    hasGroups: groups.length > 0,
    groupStageComplete: false,
    pendingGroups: groups.length,
    qualifierCount: 0,
    currentMaxStage: null,
    stages: [],
    expectedStage: null,
    eligible: [],
    champion: null,
  };
  if (groups.length === 0) return empty;

  const groupComplete = new Map<string, boolean>();
  for (const g of groups) {
    const rows = statuses.filter((s) => s.group_id === g.id);
    const played = rows.filter((s) => s.status !== "in_progress").length;
    groupComplete.set(g.id, rows.length > 0 && played === rows.length);
  }
  // A group with no played matches at all reports every row in_progress;
  // completion means every double resolved (advanced or eliminated).
  const pendingGroups = [...groupComplete.values()].filter((c) => !c).length;
  const groupStageComplete = pendingGroups === 0;

  const byStage = new Map<string, Match[]>();
  for (const m of koMatches) {
    const list = byStage.get(m.stage) ?? [];
    list.push(m);
    byStage.set(m.stage, list);
  }
  const stages = KNOCKOUT_STAGES.filter((s) => byStage.has(s)).map(
    (stage) => ({ stage, matches: byStage.get(stage) ?? [] }),
  );
  const currentMaxStage =
    stages.length > 0 ? stages[stages.length - 1].stage : null;

  if (!currentMaxStage) {
    const qualifiers = statuses.filter(
      (s) =>
        s.double_id !== null &&
        s.status === "advanced" &&
        s.group_id !== null &&
        groupIds.has(s.group_id),
    );
    return {
      ...empty,
      groupStageComplete,
      pendingGroups,
      qualifierCount: qualifiers.length,
      expectedStage: groupStageComplete
        ? startingStageForQualifiers(qualifiers.length)
        : null,
      eligible: groupStageComplete
        ? qualifiers.map((s) => contendiente(s.double_id as string))
        : [],
    };
  }

  const current = byStage.get(currentMaxStage) ?? [];
  const allDecided = current.every((m) => m.winner_double_id !== null);
  const winners = current
    .filter((m) => m.winner_double_id !== null)
    .map((m) => contendiente(m.winner_double_id as string));
  const expectedStage = allDecided
    ? nextKnockoutStage(currentMaxStage)
    : currentMaxStage;
  const champion =
    currentMaxStage === "final" && allDecided && winners.length === 1
      ? winners[0]
      : null;

  return {
    ...empty,
    groupStageComplete,
    pendingGroups,
    qualifierCount: winners.length,
    currentMaxStage,
    stages,
    expectedStage: champion ? null : expectedStage,
    eligible: champion ? [] : allDecided ? winners : [],
    champion,
  };
}

// ---------------------------------------------------------------------------
// Single match with full scoring context (both doubles with players,
// group and category). Powers the judge view.
// ---------------------------------------------------------------------------

export type ScoringMatch = {
  match: Match;
  double1: DoubleWithPlayers;
  double2: DoubleWithPlayers;
  group: Pick<Group, "id" | "name"> | null;
  category: Pick<Category, "id" | "name">;
};

export async function getScoringMatch(matchId: string): Promise<ScoringMatch> {
  const supabase = await createClient();
  const { data: match, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error || !match) throwQueryError("matches", "Partido no encontrado.");

  const { data: doubles, error: doublesError } = await supabase
    .from("doubles")
    .select(`
      *,
      player1:players!doubles_player1_id_fkey(id, name, age, city, picture),
      player2:players!doubles_player2_id_fkey(id, name, age, city, picture),
      group:groups(id, name),
      category:categories!doubles_category_id_fkey(id, name)
    `)
    .in("id", [match.double1_id, match.double2_id]);

  if (doublesError || !doubles) {
    throwQueryError("doubles", doublesError?.message ?? "Parejas no encontradas.");
  }

  const double1 = (doubles as DoubleWithPlayers[]).find(
    (d) => d.id === match.double1_id,
  );
  const double2 = (doubles as DoubleWithPlayers[]).find(
    (d) => d.id === match.double2_id,
  );
  if (!double1 || !double2) {
    throwQueryError("doubles", "Parejas no encontradas.");
  }

  return { match, double1, double2, group: double1.group, category: double1.category };
}
