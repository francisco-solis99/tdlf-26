import type { Metadata } from "next";

import { JugadoresAdmin } from "@/components/dashboard/jugadores-admin";
import { requireAdmin } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Jugadores — Panel TDLF 2026",
  description: "Gestión de jugadores del torneo.",
};

export default async function DashboardJugadoresPage() {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Gestión
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Jugadores
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        La categoría de cada jugador se define al armar su pareja.
      </p>

      <div className="mt-8">
        <JugadoresAdmin />
      </div>
    </div>
  );
}
