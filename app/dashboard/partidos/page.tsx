import type { Metadata } from "next";

import { PartidosAdmin } from "@/components/dashboard/partidos-admin";

export const metadata: Metadata = {
  title: "Partidos — Panel TDLF 2026",
  description: "Gestión de partidos del torneo.",
};

export default function DashboardPartidosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Partidos
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Todos los cruces generados por grupos. Solo se editan marcador y fase.
      </p>

      <div className="mt-8">
        <PartidosAdmin />
      </div>
    </div>
  );
}
