// Datos de categorías — UI-only por ahora.
// TODO(db): reemplazar listCategorias/getCategoria por queries a Supabase.
// Forma pensada para migrar 1:1 (slug como PK).
import type { LucideIcon } from "lucide-react";
import { Crown, Sparkles, Trophy } from "lucide-react";

export type Categoria = {
  slug: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  grupos: number;
  parejas: number;
  jugadores: number;
  color: string;
  colorSoft: string;
  icono: LucideIcon;
};

export const categorias: Categoria[] = [
  {
    slug: "libre",
    nombre: "Libre",
    tagline: "Abierta a todo jugador, sin importar edad o nivel.",
    descripcion: "Abierta a todo jugador, sin importar edad o nivel.",
    grupos: 6,
    parejas: 24,
    jugadores: 48,
    color: "#ff4d3d",
    colorSoft: "rgba(255, 77, 61, 0.12)",
    icono: Trophy,
  },
  {
    slug: "femenil",
    nombre: "Femenil",
    tagline: "Exclusiva para jugadoras.",
    descripcion: "Exclusiva para jugadoras.",
    grupos: 4,
    parejas: 12,
    jugadores: 24,
    color: "#8b7cf6",
    colorSoft: "rgba(139, 124, 246, 0.12)",
    icono: Sparkles,
  },
  {
    slug: "masters",
    nombre: "Masters +50",
    tagline: "Solo hombres de 50 años o más.",
    descripcion: "Solo hombres de 50 años o más.",
    grupos: 4,
    parejas: 12,
    jugadores: 24,
    color: "#d9a62e",
    colorSoft: "rgba(217, 166, 46, 0.12)",
    icono: Crown,
  },
];

export function listCategorias(): Categoria[] {
  return categorias;
}

export function getCategoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}
