import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { AreaPlaceholder } from "@/components/dashboard/area-placeholder";

export const metadata: Metadata = {
  title: "Categorías — Panel TDLF 2026",
  description: "Gestión de categorías del torneo.",
};

export default function DashboardCategoriasPage() {
  return (
    <AreaPlaceholder
      kicker="Gestión"
      titulo="Categorías"
      descripcion="Alta, edición y detalle de Libre, Femenil y Masters +50."
      icono={<Trophy aria-hidden="true" className="h-6 w-6 text-accent" />}
    />
  );
}
