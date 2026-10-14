import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Card } from "@/components/ui/card";
import {
  getPareja,
  getParejasDirectorio,
  type CategoriaId,
} from "@/lib/wrapped-data";

export const metadata: Metadata = {
  title: "Fichas por pareja — Torneo de las Fresas 2026",
  description:
    "Cada pareja de la fase de grupos con su historia en números, por categoría y grupo.",
};

const COLORES: Record<CategoriaId, { color: string; colorSoft: string }> = {
  libre: { color: "#ff4d3d", colorSoft: "rgba(255, 77, 61, 0.12)" },
  masters: { color: "#d9a62e", colorSoft: "rgba(217, 166, 46, 0.12)" },
};

export default async function ParejasDirectoryPage() {
  const { categorias, mensajeNoJugo } = getParejasDirectorio();
  if (categorias.length === 0) notFound();

  return (
    <>
      <Header logoHref="/" navBasePath="/" showNav={false} />
      <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Fase de grupos · Historias
          </p>
          <h1 className="font-display mt-2 text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Parejas
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Cada pareja con su historia en números. Busca la tuya por
            categoría y grupo.
          </p>

          {categorias.map((cat) => {
            const presentacion = COLORES[cat.categoria];
            return (
              <section
                key={cat.categoria}
                aria-label={`Parejas de ${cat.nombre}`}
                className="mt-10"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-6 w-1.5 rounded-full"
                    style={{ backgroundColor: presentacion.color }}
                  />
                  <h2 className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
                    {cat.nombre}
                  </h2>
                </div>

                {cat.grupos.map((g) => (
                  <div key={g.grupo} className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                      {g.grupo}
                    </h3>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {g.parejas.map((p) => {
                        if (!p.jugo) {
                          return (
                            <li key={p.id}>
                              <Card className="rounded-xl p-4 opacity-60">
                                <p className="text-sm font-medium">
                                  {p.pareja}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted">
                                  {mensajeNoJugo}
                                </p>
                              </Card>
                            </li>
                          );
                        }
                        const ficha = getPareja(p.id);
                        return (
                          <li key={p.id}>
                            <Link
                              href={`/wrapped/parejas/${p.id}`}
                              className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent"
                            >
                              <span className="block text-sm font-medium leading-snug">
                                {p.pareja}
                              </span>
                              <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                                <span
                                  className="rounded-full px-2 py-px font-semibold tabular-nums"
                                  style={{
                                    backgroundColor: presentacion.colorSoft,
                                    color: presentacion.color,
                                  }}
                                >
                                  {ficha.resumen.sinergia}% sinergia
                                </span>
                                <span className="rounded-full border border-line px-2 py-px text-muted">
                                  {ficha.nivel.nombre}
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
