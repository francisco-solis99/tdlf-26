import type { Metadata } from "next";

import { Resumen } from "@/components/dashboard/resumen";
import { getCategoria } from "@/config/categorias";
import { requireAdmin } from "@/lib/actions/auth";
import {
  getCategories,
  getDoublesWithPlayers,
  getGroups,
  getMatches,
} from "@/lib/actions/torneo";
import { categorySlug } from "@/lib/torneo-view";

export const metadata: Metadata = {
  title: "Panel — Torneo de las Fresas 2026",
  description: "Panel de administración del Torneo de las Fresas 2026.",
};

export default async function DashboardHomePage() {
  await requireAdmin();
  const [categories, groups, doubles, matches] = await Promise.all([
    getCategories(),
    getGroups(),
    getDoublesWithPlayers(),
    getMatches(),
  ]);
  const categorias = categories.map((cat) => {
    const slug = categorySlug(cat.name);
    const presentacion = getCategoria(slug);
    const grupos = groups.filter((g) => g.category_id === cat.id);
    const idsGrupos = new Set(grupos.map((g) => g.id));
    const parejas = doubles.filter((d) => d.category_id === cat.id).length;
    const partidosCat = matches.filter((m) => m.group_id && idsGrupos.has(m.group_id));
    const jugados = partidosCat.filter((m) => m.winner_double_id !== null).length;
    return {
      slug,
      nombre: cat.name,
      color: presentacion?.color ?? "#9b9b96",
      colorSoft: presentacion?.colorSoft ?? "rgba(155,155,150,0.15)",
      grupos: grupos.length,
      parejas,
      jugadores: parejas * 2,
      partidos: partidosCat.length,
      jugados,
    };
  });
  const suma = (f: (c: (typeof categorias)[number]) => number) =>
    categorias.reduce((a, c) => a + f(c), 0);
  const jugados = suma((c) => c.jugados);
  const partidos = suma((c) => c.partidos);
  const totales = {
    categorias: categorias.length,
    parejas: suma((c) => c.parejas),
    jugadores: suma((c) => c.jugadores),
    partidos,
    jugados,
    pendientes: partidos - jugados,
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Panel general
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Resumen del torneo
      </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Cuarta edición · Datos en vivo de la base de datos.
        </p>

      <Resumen totales={totales} categorias={categorias} />
    </div>
  );
}
