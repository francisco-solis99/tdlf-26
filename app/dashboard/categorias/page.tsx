import type { Metadata } from "next";

import { CategoriasAdmin } from "@/components/dashboard/categorias-admin";
import { requireAdmin } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Categorías — Panel TDLF 2026",
  description: "Gestión de categorías del torneo.",
};

export default async function DashboardCategoriasPage() {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Categorías
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Crea, edita y elimina las categorías del torneo.
      </p>

      <div className="mt-8">
        <CategoriasAdmin />
      </div>
    </div>
  );
}
