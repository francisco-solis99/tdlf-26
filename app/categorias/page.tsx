import type { Metadata } from "next";

import { CategoriasFan } from "@/components/categorias-fan";
import { Header } from "@/components/landing/header";
import {
  getCategories,
  getDoublesWithPlayers,
  getGroups,
} from "@/lib/actions/torneo";
import { categorySlug } from "@/lib/torneo-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categorías — Torneo de las Fresas 2026",
  description:
    "Categorías del Torneo de las Fresas 2026: Libre, Femenil y Masters +50.",
};

export default async function CategoriasPage() {
  const [categories, groups, doubles] = await Promise.all([
    getCategories(),
    getGroups(),
    getDoublesWithPlayers(),
  ]);
  const categorias = categories.map((c) => {
    const parejas = doubles.filter((d) => d.category_id === c.id).length;
    return {
      slug: categorySlug(c.name),
      nombre: c.name,
      descripcion: c.description ?? "",
      grupos: groups.filter((g) => g.category_id === c.id).length,
      parejas,
      jugadores: parejas * 2,
    };
  });
  return (
    <>
      <Header logoHref="/" navBasePath="/" showNav={false} />
      <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* fondo editorial */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute left-1/2 top-40 h-[520px] w-[660px] max-w-[140vw] -translate-x-1/2">
          <div
            className="halftone-blob absolute inset-0 opacity-[0.18]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="mt-2 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-foreground/85">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rotate-45 bg-accent"
            />
            Cuarta edición · Irapuato
          </p>
          <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Elige tu <span className="text-accent">categoría</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Tres torneos en uno. Pasa el cursor para enfocar, toca para ver el
            detalle de cada categoría.
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          <CategoriasFan categorias={categorias} />
        </div>
      </div>
      </main>
    </>
  );
}
