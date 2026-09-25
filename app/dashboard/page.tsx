import type { Metadata } from "next";

import { Resumen } from "@/components/dashboard/resumen";
import { listCategorias } from "@/config/categorias";
import { listGrupos } from "@/config/grupos";
import { isJugado, listPartidos } from "@/config/partidos";
import { requireAdmin } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Panel — Torneo de las Fresas 2026",
  description: "Panel de administración del Torneo de las Fresas 2026.",
};

export default async function DashboardHomePage() {
  await requireAdmin();
  const categorias = listCategorias().map((cat) => {
    const grupos = listGrupos(cat.slug);
    let partidos = 0;
    let jugados = 0;
    for (const g of grupos) {
      const ps = listPartidos(cat.slug, g.letra);
      partidos += ps.length;
      jugados += ps.filter(isJugado).length;
    }
    return {
      slug: cat.slug,
      nombre: cat.nombre,
      color: cat.color,
      colorSoft: cat.colorSoft,
      grupos: grupos.length,
      parejas: cat.parejas,
      jugadores: cat.jugadores,
      partidos,
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
        Cuarta edición · Datos de ejemplo hasta conectar la base de datos.
      </p>

      <Resumen totales={totales} categorias={categorias} />
    </div>
  );
}
