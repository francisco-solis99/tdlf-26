import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/landing/footer";
import {
  esUuidPareja,
  getPareja,
  getParejaIds,
  type CategoriaId,
  type ParejaFicha,
} from "@/lib/wrapped-data";

import { ParejaPartidosCard, ParejaPortadaCard, ParejaSlideCard } from "../../_components/ParejaCards";
import { WrappedShell, type WrappedCardSpec } from "../../_components/WrappedShell";
import "../../_components/wrapped.css";

/** Solo los ids con ficha existen; lo demás es 404. */
export const dynamicParams = false;

export function generateStaticParams(): Array<{ id: string }> {
  return getParejaIds().map((id) => ({ id }));
}

const COLORES: Record<CategoriaId, string> = {
  libre: "#ff4d3d",
  masters: "#d9a62e",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!esUuidPareja(id)) return { title: "No encontrado" };
  try {
    const ficha = getPareja(id);
    return {
      title: `${ficha.pareja} en historias — Torneo de las Fresas 2026`,
      description: `La fase de grupos de ${ficha.pareja} en números.`,
    };
  } catch {
    return { title: "No encontrado" };
  }
}

export default async function ParejaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!esUuidPareja(id)) notFound();
  const ficha: ParejaFicha = (() => {
    try {
      return getPareja(id);
    } catch {
      notFound();
    }
  })();
  const color = COLORES[ficha.categoria];

  // La portada abre con el nombre; el saludo (cierre) va al final,
  // después de los partidos y antes del footer.
  const cierre = ficha.slides.find((s) => s.id === "cierre") ?? null;
  const resto = ficha.slides.filter((s) => s.id !== "cierre");

  const cards: WrappedCardSpec[] = [
    {
      id: "portada",
      node: <ParejaPortadaCard ficha={ficha} color={color} />,
    },
    ...resto.map((slide) => ({
      id: slide.id,
      node: <ParejaSlideCard slide={slide} ficha={ficha} color={color} />,
    })),
    {
      id: "partidos",
      node: <ParejaPartidosCard ficha={ficha} color={color} />,
    },
    ...(cierre
      ? [
          {
            id: "cierre",
            node: (
              <ParejaSlideCard slide={cierre} ficha={ficha} color={color} />
            ),
          },
        ]
      : []),
    {
      id: "footer",
      fullBleed: true,
      node: <Footer />,
    },
  ];

  return (
    <main className="grain relative h-dvh overflow-hidden bg-background text-foreground">
      <Link
        href="/wrapped/parejas"
        aria-label="Volver a las parejas"
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
        categoriaNombre={`${ficha.nombreCategoria} · ${ficha.grupo}`}
        color={color}
        cards={cards}
      />
    </main>
  );
}
