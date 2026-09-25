import type { Metadata } from "next";

import { CrearGruposAdmin } from "@/components/dashboard/crear-grupos-admin";
import { requireAdmin } from "@/lib/actions/auth";
import { getCategories } from "@/lib/actions/torneo";

export const metadata: Metadata = {
  title: "Crear grupos — Panel TDLF 2026",
  description: "Arma los grupos y genera los cruces de cada categoría.",
};

export default async function DashboardCrearGruposPage() {
  await requireAdmin();
  const categories = await getCategories();
  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Crear grupos
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Reparte las parejas registradas en grupos y genera sus cruces. Las
        parejas se mezclan al azar y se reparten de forma pareja.
      </p>

      <CrearGruposAdmin
        categories={categories.map((c) => ({ id: c.id, nombre: c.name }))}
      />
    </div>
  );
}
