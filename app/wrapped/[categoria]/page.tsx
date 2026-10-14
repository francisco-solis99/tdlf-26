import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/landing/footer";

import {
  esCategoriaValida,
  getWrappedCategoria,
  CATEGORIAS_VALIDAS,
  type CategoriaId,
} from "@/lib/wrapped-data";

import { AperturaCard } from "../_components/AperturaCard";
import { ADiezCard } from "../_components/ADiezCard";
import { ArquetiposCard } from "../_components/ArquetiposCard";
import { AtaqueDefensaCard } from "../_components/AtaqueDefensaCard";
import { CardiacosCard } from "../_components/CardiacosCard";
import { CiudadesCard } from "../_components/CiudadesCard";
import {
  DistanciaCard,
  ExtremosCard,
  ParejaExtremosCard,
} from "../_components/FinalCards";
import { GanarCard } from "../_components/GanarCard";
import { JerarquiaCard } from "../_components/JerarquiaCard";
import { PlaymakersCard } from "../_components/PlaymakersCard";
import { PuntosCard } from "../_components/PuntosCard";
import { WrappedShell, type WrappedCardSpec } from "../_components/WrappedShell";
import "../_components/wrapped.css";

/** Sin slugs dinámicos: solo libre y masters existen; lo demás es 404. */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ categoria: string }> {
  return CATEGORIAS_VALIDAS.map((categoria) => ({ categoria }));
}

const COLORES: Record<CategoriaId, { color: string; titulo: string }> = {
  libre: { color: "#ff4d3d", titulo: "Libre" },
  masters: { color: "#d9a62e", titulo: "Masters" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  if (!esCategoriaValida(categoria)) return { title: "No encontrado" };
  const datos = getWrappedCategoria(categoria);
  return {
    title: `Fase de grupos ${datos.nombre} en historias — Torneo de las Fresas 2026`,
    description: datos.apertura.texto,
  };
}

export default async function WrappedCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  if (!esCategoriaValida(categoria)) notFound();
  // El loader lanza si la forma no coincide: falla el build, nunca un 404.
  const datos = getWrappedCategoria(categoria);
  const { color } = COLORES[categoria];

  // Orden de archivo: los ids ausentes (ganar y pareja_extremos en
  // masters) simplemente no se agregan.
  const cards: WrappedCardSpec[] = [
    {
      id: "apertura",
      node: <AperturaCard slide={datos.apertura} color={color} />,
    },
    {
      id: "ciudades",
      node: <CiudadesCard slide={datos.mapa} color={color} />,
    },
    {
      id: "puntos",
      node: <PuntosCard slide={datos.puntos} color={color} />,
    },
    {
      id: "jerarquia",
      node: <JerarquiaCard slide={datos.jerarquia} color={color} />,
    },
    {
      id: "ataque_defensa",
      node: <AtaqueDefensaCard slide={datos.ataqueDefensa} color={color} />,
    },
    {
      id: "playmakers",
      node: <PlaymakersCard slide={datos.playmakers} color={color} />,
    },
    {
      id: "a_diez",
      node: <ADiezCard slide={datos.aDiez} color={color} />,
    },
    ...(datos.ganar
      ? [
          {
            id: "ganar_no_es_dominar",
            node: <GanarCard slide={datos.ganar} color={color} />,
          },
        ]
      : []),
    {
      id: "arquetipos",
      node: <ArquetiposCard slide={datos.arquetipos} color={color} />,
    },
    {
      id: "cardiacos",
      node: (
        <CardiacosCard
          slide={datos.cardiacos}
          porTiempoDefinicion={datos.porTiempoDefinicion}
          color={color}
        />
      ),
    },
    {
      id: "extremos",
      node: <ExtremosCard slide={datos.extremos} color={color} />,
    },
    ...(datos.parejaExtremos
      ? [
          {
            id: "pareja_extremos",
            node: (
              <ParejaExtremosCard
                slide={datos.parejaExtremos}
                color={color}
              />
            ),
          },
        ]
      : []),
    {
      id: "distancia",
      node: <DistanciaCard slide={datos.distancia} color={color} />,
    },
    {
      id: "cierre",
      fullBleed: true,
      node: <Footer />,
    },
  ];

  return (
    /* La ventana no se desplaza en esta ruta: .wrapped-shell es el único
       desplazador, así no hay doble scroll. El footer cierra la historia
       como última tarjeta. */
    <main className="grain relative h-dvh overflow-hidden bg-background text-foreground">
      <Link
        href="/"
        aria-label="Ir al inicio"
        className="fixed left-4 top-4 z-20 rounded-full ring-1 ring-line transition-opacity hover:opacity-80"
      >
        <Image
          src="/sponsors/logo.webp"
          alt="Torneo de las Fresas"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
          priority
        />
      </Link>
      <WrappedShell
        categoriaNombre={datos.nombre}
        color={color}
        cards={cards}
      />
    </main>
  );
}
