import type { Metadata } from "next";

import { ParejasAdmin } from "@/components/dashboard/parejas-admin";
import { requireAdmin } from "@/lib/actions/auth";
import {
  getCategories,
  getDoublesWithPlayers,
  getPlayers,
} from "@/lib/actions/torneo";
import { categoryIdToSlug, mapDouble } from "@/lib/torneo-view";

export const metadata: Metadata = {
  title: "Parejas — Panel TDLF 2026",
  description: "Gestión de parejas del torneo.",
};

export default async function DashboardParejasPage() {
  await requireAdmin();
  const [doubles, players, categories] = await Promise.all([
    getDoublesWithPlayers(),
    getPlayers(),
    getCategories(),
  ]);
  const catIdToSlug = categoryIdToSlug(categories);
  const initialParejas = doubles.map((d) => mapDouble(d, catIdToSlug));
  const playerOptions = players.map((p) => ({
    id: p.id,
    nombre: p.name,
    edad: p.age,
    ciudad: p.city,
  }));
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    nombre: c.name,
    slug: catIdToSlug.get(c.id) ?? c.name.toLowerCase(),
  }));
  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Parejas
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Cada pareja une a dos jugadores existentes de la misma categoría.
      </p>

      <div className="mt-8">
        <ParejasAdmin
          initialParejas={initialParejas}
          players={playerOptions}
          categories={categoryOptions}
        />
      </div>
    </div>
  );
}
