import type { Metadata } from "next";
import { Users } from "lucide-react";

import { AreaPlaceholder } from "@/components/dashboard/area-placeholder";

export const metadata: Metadata = {
  title: "Jugadores — Panel TDLF 2026",
  description: "Gestión de jugadores y parejas del torneo.",
};

export default function DashboardJugadoresPage() {
  return (
    <AreaPlaceholder
      kicker="Gestión"
      titulo="Jugadores"
      descripcion="Registro de jugadores y conformación de parejas por grupo."
      icono={<Users aria-hidden="true" className="h-6 w-6 text-accent" />}
    />
  );
}
