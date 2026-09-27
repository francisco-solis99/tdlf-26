import type { Metadata } from "next";

import { EliminatoriaAdmin } from "@/components/dashboard/eliminatoria-admin";
import { requireAdmin } from "@/lib/actions/auth";
import { getCategories } from "@/lib/actions/torneo";

export const metadata: Metadata = {
  title: "Eliminatoria — Panel TDLF 2026",
  description: "Arma ronda por ronda el cuadro final del torneo.",
};

export default async function DashboardEliminatoriaPage() {
  await requireAdmin();
  const categories = await getCategories();
  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Fase final
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Eliminatoria
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Una ronda a la vez: arma los cruces a mano cuando la fase anterior
        quede decidida.
      </p>

      <div className="mt-8">
        <EliminatoriaAdmin
          categories={categories.map((c) => ({ id: c.id, nombre: c.name }))}
        />
      </div>
    </div>
  );
}
