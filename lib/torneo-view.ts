// Pure view-model helpers for the dashboard: Supabase rows in, UI rows out.
// No Next/Supabase imports — unit-testable in plain Node.

import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];

export type DbPlayer = Tables["players"]["Row"];
export type DbDouble = Tables["doubles"]["Row"];
export type DbMatch = Tables["matches"]["Row"];
export type DbCategory = Tables["categories"]["Row"];
export type DbGroup = Tables["groups"]["Row"];

// DB category names ('Libre', 'Masters', 'Femenil') map to the UI slugs
// ('libre', 'masters', 'femenil') used by badges, links and filters.
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function categoryIdToSlug(
  categories: Pick<DbCategory, "id" | "name">[],
): Map<string, string> {
  return new Map(categories.map((c) => [c.id, categorySlug(c.name)]));
}

// A player's category comes from their double (players carry no category).
export function playerCategorySlug(
  playerId: string,
  doubles: Pick<DbDouble, "player1_id" | "player2_id" | "category_id">[],
  catIdToSlug: Map<string, string>,
): string {
  const d = doubles.find(
    (x) => x.player1_id === playerId || x.player2_id === playerId,
  );
  if (!d) return "";
  return catIdToSlug.get(d.category_id) ?? "";
}

export type PlayerRow = {
  id: string;
  nombre: string;
  edad: number | null;
  ciudad: string | null;
  categoriaSlug: string;
};

export function mapPlayer(
  p: DbPlayer,
  doubles: Pick<DbDouble, "player1_id" | "player2_id" | "category_id">[],
  catIdToSlug: Map<string, string>,
): PlayerRow {
  return {
    id: p.id,
    nombre: p.name,
    edad: p.age,
    ciudad: p.city,
    categoriaSlug: playerCategorySlug(p.id, doubles, catIdToSlug),
  };
}

export type DoubleRow = {
  id: string;
  jugador1Id: string;
  jugador2Id: string;
  categoriaSlug: string;
  grupo: string | null;
};

export function mapDouble(
  d: DbDouble & { group?: Pick<DbGroup, "name"> | null },
  catIdToSlug: Map<string, string>,
): DoubleRow {
  return {
    id: d.id,
    jugador1Id: d.player1_id,
    jugador2Id: d.player2_id,
    categoriaSlug: catIdToSlug.get(d.category_id) ?? "",
    grupo: d.group?.name ?? null,
  };
}

export function stageLabel(
  stage: Database["public"]["Enums"]["match_stage"],
): string {
  switch (stage) {
    case "group":
      return "Fase de grupos";
    case "round_of_32":
      return "Dieciseisavos";
    case "round_of_16":
      return "Octavos";
    case "quarterfinal":
      return "Cuartos";
    case "semifinal":
      return "Semifinal";
    case "final":
      return "Final";
  }
}

export type MatchOpponent = {
  doubleId: string;
  nombreA: string;
  nombreB: string;
  categoriaSlug: string;
};

export type MatchRow = {
  id: string;
  double1Id: string;
  double2Id: string;
  nombreA: string;
  nombreB: string;
  scoreA: number | null;
  scoreB: number | null;
  fase: string;
  groupId: string | null;
  grupo: string | null;
  categoriaSlug: string;
};

export function mapMatch(
  m: DbMatch,
  opponents: Map<string, MatchOpponent>,
  groupsById: Map<string, string>,
): MatchRow {
  const a = opponents.get(m.double1_id);
  const b = opponents.get(m.double2_id);
  return {
    id: m.id,
    double1Id: m.double1_id,
    double2Id: m.double2_id,
    nombreA: a ? `${a.nombreA} / ${a.nombreB}` : "?",
    nombreB: b ? `${b.nombreA} / ${b.nombreB}` : "?",
    scoreA: m.score1,
    scoreB: m.score2,
    fase: stageLabel(m.stage),
    groupId: m.group_id,
    grupo: m.group_id ? (groupsById.get(m.group_id) ?? null) : null,
    categoriaSlug: a?.categoriaSlug ?? b?.categoriaSlug ?? "",
  };
}

export function isJugadoRow(p: Pick<MatchRow, "scoreA" | "scoreB">): boolean {
  return p.scoreA !== null && p.scoreB !== null;
}

export function ganadorRow(p: Pick<MatchRow, "scoreA" | "scoreB">): "A" | "B" | null {
  if (!isJugadoRow(p)) return null;
  const a = p.scoreA as number;
  const b = p.scoreB as number;
  if (a === b) return null;
  return a > b ? "A" : "B";
}
