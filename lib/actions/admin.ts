"use server";

import { createClient } from "@/lib/supabase/server";
import { toReadableError } from "@/lib/supabase/db-errors";
import type { Database } from "@/lib/database.types";
import { requireAdmin } from "./auth";
import { getDoublesWithPlayers, getGroups } from "./torneo";
import type { DoubleWithPlayers, Group } from "./torneo";

type Tables = Database["public"]["Tables"];

export type Player = Tables["players"]["Row"];
export type Double = Tables["doubles"]["Row"];
export type Match = Tables["matches"]["Row"];
export type Category = Tables["categories"]["Row"];

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// Empty strings from form inputs become NULL in the database.
function nullIfEmpty(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export type CreatePlayerInput = {
  name: string;
  age?: number | null;
  city?: string | null;
  picture?: string | null;
};

export async function createPlayer(
  input: CreatePlayerInput,
): Promise<ActionResult<Player>> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre del jugador es obligatorio." };
  }
  if (input.age !== undefined && input.age !== null) {
    if (!Number.isInteger(input.age) || input.age <= 0 || input.age >= 120) {
      return { ok: false, error: "La edad debe ser un número entero entre 1 y 119." };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      name,
      age: input.age ?? null,
      city: nullIfEmpty(input.city),
      picture: nullIfEmpty(input.picture),
    })
    .select()
    .single();

  if (error) return { ok: false, error: toReadableError("player", error) };
  return { ok: true, data };
}

export type UpdatePlayerInput = {
  name?: string;
  age?: number | null;
  city?: string | null;
  picture?: string | null;
};

export async function updatePlayer(
  id: string,
  input: UpdatePlayerInput,
): Promise<ActionResult<Player>> {
  await requireAdmin();

  const patch: Tables["players"]["Update"] = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      return { ok: false, error: "El nombre del jugador es obligatorio." };
    }
    patch.name = name;
  }
  if (input.age !== undefined) {
    if (
      input.age !== null &&
      (!Number.isInteger(input.age) || input.age <= 0 || input.age >= 120)
    ) {
      return { ok: false, error: "La edad debe ser un número entero entre 1 y 119." };
    }
    patch.age = input.age;
  }
  if (input.city !== undefined) patch.city = nullIfEmpty(input.city);
  if (input.picture !== undefined) patch.picture = nullIfEmpty(input.picture);

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No hay cambios para guardar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return { ok: false, error: toReadableError("player", error) };
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// Doubles — group_id always stays null at creation (grouping is a later,
// bulk admin step); the column default already handles this.
// ---------------------------------------------------------------------------

export type CreateDoubleInput = {
  category_id: string;
  player1_id: string;
  player2_id: string;
};

export async function createDouble(
  input: CreateDoubleInput,
): Promise<ActionResult<Double>> {
  await requireAdmin();

  if (!input.category_id) {
    return { ok: false, error: "La categoría es obligatoria." };
  }
  if (input.player1_id === input.player2_id) {
    return { ok: false, error: "Una pareja necesita dos jugadores distintos." };
  }

  // Canonical order (player1_id < player2_id) enforced by the database —
  // normalize here so valid pairs never fail on ordering.
  const [player1_id, player2_id] = [input.player1_id, input.player2_id].sort();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doubles")
    .insert({ category_id: input.category_id, player1_id, player2_id })
    .select()
    .single();

  if (error) return { ok: false, error: toReadableError("double", error) };
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// Matches — only the two score columns are ever written. winner_double_id
// and played_at are computed by the set_match_winner trigger. Passing null
// for both scores clears a result (score correction).
// ---------------------------------------------------------------------------

export type UpdateMatchScoreInput = {
  score1: number | null;
  score2: number | null;
};

function validScore(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 0);
}

export async function updateMatchScore(
  matchId: string,
  input: UpdateMatchScoreInput,
): Promise<ActionResult<Match>> {
  await requireAdmin();

  if (!validScore(input.score1) || !validScore(input.score2)) {
    return { ok: false, error: "Los marcadores deben ser números enteros de 0 en adelante." };
  }
  if (
    input.score1 !== null &&
    input.score2 !== null &&
    input.score1 === input.score2
  ) {
    return { ok: false, error: "Un partido no puede terminar en empate — revisa los marcadores." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .update({ score1: input.score1, score2: input.score2 })
    .eq("id", matchId)
    .select()
    .single();

  if (error) return { ok: false, error: toReadableError("match", error) };
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// Doubles (update) — composition and/or category can change before the group
// stage locks in. Canonical order is re-normalized whenever the pair changes.
// ---------------------------------------------------------------------------

export type UpdateDoubleInput = {
  category_id?: string;
  player1_id?: string;
  player2_id?: string;
};

export async function updateDouble(
  id: string,
  input: UpdateDoubleInput,
): Promise<ActionResult<Double>> {
  await requireAdmin();

  const supabase = await createClient();

  const patch: Tables["doubles"]["Update"] = {};
  if (input.category_id !== undefined) {
    if (!input.category_id) {
      return { ok: false, error: "La categoría es obligatoria." };
    }
    patch.category_id = input.category_id;
  }

  if (input.player1_id !== undefined || input.player2_id !== undefined) {
    // Need the current row to normalize order when only one side changes.
    const { data: current, error: fetchError } = await supabase
      .from("doubles")
      .select("player1_id, player2_id")
      .eq("id", id)
      .single();
    if (fetchError || !current) {
      return {
        ok: false,
        error: toReadableError("double", fetchError ?? { code: "PGRST116" }),
      };
    }
    const p1 = input.player1_id ?? current.player1_id;
    const p2 = input.player2_id ?? current.player2_id;
    if (p1 === p2) {
      return { ok: false, error: "Una pareja necesita dos jugadores distintos." };
    }
    const [player1_id, player2_id] = [p1, p2].sort();
    patch.player1_id = player1_id;
    patch.player2_id = player2_id;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No hay cambios para guardar." };
  }

  const { data, error } = await supabase
    .from("doubles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return { ok: false, error: toReadableError("double", error) };
  return { ok: true, data };
}

// ---------------------------------------------------------------------------
// Deletes — guarded by pre-checks so the UI can explain *why* a delete is
// blocked instead of surfacing a raw foreign-key violation.
// ---------------------------------------------------------------------------

export async function deletePlayer(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const supabase = await createClient();

  // A player in a pair can't be deleted — the pair must go first.
  const { data: pairs, error: pairsError } = await supabase
    .from("doubles")
    .select("id")
    .or(`player1_id.eq.${id},player2_id.eq.${id}`)
    .limit(1);
  if (pairsError) {
    return { ok: false, error: toReadableError("player", pairsError) };
  }
  if (pairs.length > 0) {
    return {
      ok: false,
      error: "Este jugador está en una pareja. Elimina la pareja primero.",
    };
  }

  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { ok: false, error: toReadableError("player", error) };
  return { ok: true, data: { id } };
}

export async function deleteDouble(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const supabase = await createClient();

  // A pair with scheduled/played matches can't be deleted — tournament
  // integrity: matches reference both doubles.
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id")
    .or(`double1_id.eq.${id},double2_id.eq.${id}`)
    .limit(1);
  if (matchesError) {
    return { ok: false, error: toReadableError("double", matchesError) };
  }
  if (matches.length > 0) {
    return {
      ok: false,
      error: "Esta pareja ya tiene partidos registrados y no se puede eliminar.",
    };
  }

  const { error } = await supabase.from("doubles").delete().eq("id", id);
  if (error) return { ok: false, error: toReadableError("double", error) };
  return { ok: true, data: { id } };
}

export async function deleteMatch(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  // Matches have no dependents (standings are a live view), so a plain
  // delete is safe.
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", id);
  if (error) return { ok: false, error: toReadableError("match", error) };
  return { ok: true, data: { id } };
}

// ---------------------------------------------------------------------------
// Group creation — one RPC call runs everything atomically in the database
// (create groups, shuffle + assign doubles, generate round-robin matches).
// Afterwards the fresh groups + assigned doubles are refetched for display.
// ---------------------------------------------------------------------------

export type CreateGroupsInput = {
  category_id: string;
  group_count: number;
};

export type CreatedGroups = {
  groups: Group[];
  doubles: DoubleWithPlayers[];
};

const MAX_GROUPS = 16;

function isValidGroupCount(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_GROUPS && (n & (n - 1)) === 0;
}

export async function createGroupsForCategory(
  input: CreateGroupsInput,
): Promise<ActionResult<CreatedGroups>> {
  await requireAdmin();

  if (!input.category_id) {
    return { ok: false, error: "Elige una categoría." };
  }
  if (!isValidGroupCount(input.group_count)) {
    return {
      ok: false,
      error: `El número de grupos debe ser potencia de 2 (1, 2, 4, 8, 16…).`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_groups_for_category", {
    p_category_id: input.category_id,
    p_group_count: input.group_count,
  });
  if (error) return { ok: false, error: toReadableError("groups", error) };

  try {
    const [groups, doubles] = await Promise.all([
      getGroups(input.category_id),
      getDoublesWithPlayers({ categoryId: input.category_id }),
    ]);
    return { ok: true, data: { groups, doubles } };
  } catch {
    return { ok: false, error: "Grupos creados, pero no se pudieron cargar para mostrar." };
  }
}

// ---------------------------------------------------------------------------
// Categories — plain CRUD. Colors/icons stay presentational (UI-layer),
// only id/name/description live in the database.
// ---------------------------------------------------------------------------

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
};

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ActionResult<Category>> {
  await requireAdmin();

  const name = input.name.trim();
  if (name.length < 3) {
    return { ok: false, error: "El nombre debe tener al menos 3 letras." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, description: nullIfEmpty(input.description) })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esa categoría ya existe." };
    }
    return { ok: false, error: toReadableError("groups", error) };
  }
  return { ok: true, data };
}

export type UpdateCategoryInput = {
  name?: string;
  description?: string | null;
};

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ActionResult<Category>> {
  await requireAdmin();

  const patch: Tables["categories"]["Update"] = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 3) {
      return { ok: false, error: "El nombre debe tener al menos 3 letras." };
    }
    patch.name = name;
  }
  if (input.description !== undefined) {
    patch.description = nullIfEmpty(input.description);
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No hay cambios para guardar." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Esa categoría ya existe." };
    }
    return { ok: false, error: toReadableError("groups", error) };
  }
  return { ok: true, data };
}

export async function deleteCategory(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const supabase = await createClient();

  // Deleting a category cascades to its groups, doubles and matches, so
  // block the delete while any of those exist instead of wiping them.
  const [{ data: groups, error: groupsError }, { data: doubles, error: doublesError }] =
    await Promise.all([
      supabase.from("groups").select("id").eq("category_id", id).limit(1),
      supabase.from("doubles").select("id").eq("category_id", id).limit(1),
    ]);
  if (groupsError) {
    return { ok: false, error: toReadableError("groups", groupsError) };
  }
  if (doublesError) {
    return { ok: false, error: toReadableError("groups", doublesError) };
  }
  if (groups.length > 0 || doubles.length > 0) {
    return {
      ok: false,
      error: "Esta categoría tiene grupos o parejas y no se puede eliminar.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: toReadableError("groups", error) };
  return { ok: true, data: { id } };
}
