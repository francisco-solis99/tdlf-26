import type { Metadata } from "next";
import { House } from "lucide-react";

import { AreaPlaceholder } from "@/components/dashboard/area-placeholder";

export const metadata: Metadata = {
  title: "Panel — Torneo de las Fresas 2026",
  description: "Panel de administración del Torneo de las Fresas 2026.",
};

export default function DashboardHomePage() {
  return (
    <AreaPlaceholder
      kicker="Panel general"
      titulo="Inicio"
      descripcion="Resumen del torneo: estado de categorías, grupos y partidos."
      icono={<House aria-hidden="true" className="h-6 w-6 text-accent" />}
    />
  );
}
