import type { Metadata } from "next";

import { PartidosAdmin } from "@/components/dashboard/partidos-admin";
import { requireAdmin } from "@/lib/actions/auth";
import {
  getCategories,
  getDoublesWithPlayers,
  getGroups,
  getMatches,
} from "@/lib/actions/torneo";
import {
  categoryIdToSlug,
  mapMatch,
  type MatchOpponent,
} from "@/lib/torneo-view";

export const metadata: Metadata = {
  title: "Partidos — Panel TDLF 2026",
  description: "Gestión de partidos del torneo.",
};

export default async function DashboardPartidosPage() {
  await requireAdmin();
  const [matches, doubles, groups, categories] = await Promise.all([
    getMatches(),
    getDoublesWithPlayers(),
    getGroups(),
    getCategories(),
  ]);
  const catIdToSlug = categoryIdToSlug(categories);
  const opponents = new Map<string, MatchOpponent>(
    doubles.map((d) => [
      d.id,
      {
        doubleId: d.id,
        nombreA: d.player1.name,
        nombreB: d.player2.name,
        categoriaSlug: catIdToSlug.get(d.category_id) ?? "",
      },
    ]),
  );
  const groupsById = new Map(groups.map((g) => [g.id, g.name]));
  const initialPartidos = matches.map((m) => mapMatch(m, opponents, groupsById));
  const categoryOptions = categories.map((c) => ({
    slug: catIdToSlug.get(c.id) ?? c.name.toLowerCase(),
    nombre: c.name,
  }));
  const groupOptions = groups.map((g) => ({ id: g.id, nombre: g.name }));
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Partidos
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Todos los cruces generados por grupos. Solo se edita el marcador.
      </p>

      <div className="mt-8">
        <PartidosAdmin
          initialPartidos={initialPartidos}
          categories={categoryOptions}
          groups={groupOptions}
        />
      </div>
    </div>
  );
}
