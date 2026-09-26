import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/landing/header";
import { ParejaAvatars } from "@/components/pareja-avatars";
import {
  getCategories,
  getDoublesWithPlayers,
  getDoubleStatus,
  getGroups,
} from "@/lib/actions/torneo";
import {
  categorySlug,
  letraDeGrupoNombre,
} from "@/lib/torneo-view";

export const dynamic = "force-dynamic";

// Presentación por slug (color e icono viven en la UI; la DB da los datos).
const PRESENTACION: Record<
  string,
  { color: string; colorSoft: string; icono: LucideIcon }
> = {
  libre: {
    color: "#ff4d3d",
    colorSoft: "rgba(255, 77, 61, 0.12)",
    icono: Trophy,
  },
  femenil: {
    color: "#8b7cf6",
    colorSoft: "rgba(139, 124, 246, 0.12)",
    icono: Sparkles,
  },
  masters: {
    color: "#d9a62e",
    colorSoft: "rgba(217, 166, 46, 0.12)",
    icono: Crown,
  },
};

const PRESENTACION_FALLBACK = {
  color: "#9b9b96",
  colorSoft: "rgba(155,155,150,0.15)",
  icono: Trophy,
};

async function loadClasificados(slug: string) {
  const categories = await getCategories();
  const category = categories.find((c) => categorySlug(c.name) === slug);
  if (!category) return null;
  const [groups, doubles] = await Promise.all([
    getGroups(category.id),
    getDoublesWithPlayers({ categoryId: category.id }),
  ]);
  const ordenados = [...groups].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
  const porGrupo = await Promise.all(
    ordenados.map(async (grupo) => {
      const estado = await getDoubleStatus({ groupId: grupo.id });
      const top = estado
        .filter((s) => s.double_id !== null && (s.group_rank ?? 99) <= 2)
        .map((s) => {
          const d = doubles.find((x) => x.id === s.double_id);
          return {
            doubleId: s.double_id as string,
            nombre: d ? `${d.player1.name} / ${d.player2.name}` : "?",
            status: s.status ?? "in_progress",
            wins: s.wins ?? 0,
            losses: s.losses ?? 0,
            puntos: s.points_scored ?? 0,
          };
        });
      return { grupo, top };
    }),
  );
  const presentacion = PRESENTACION[slug] ?? PRESENTACION_FALLBACK;
  return { category, porGrupo, ...presentacion };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadClasificados(slug);
  if (!data) return { title: "Categoría no encontrada" };
  return {
    title: `Clasificados ${data.category.name} — Torneo de las Fresas 2026`,
    description: `Parejas clasificadas de ${data.category.name}.`,
  };
}

export default async function ClasificadosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadClasificados(slug);
  if (!data) notFound();

  const Icon = data.icono;

  return (
    <>
      <Header logoHref="/" navBasePath="/" showNav={false} />
      <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: data.colorSoft }}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/categorias/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {data.category.name}
            </Link>
          </div>

          <div className="relative mt-8 flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl sm:h-20 sm:w-20"
              style={{ backgroundColor: data.colorSoft }}
            >
              <Icon
                className="h-8 w-8 sm:h-10 sm:w-10"
                style={{ color: data.color }}
                strokeWidth={1.5}
              />
            </span>
            <div>
              <p
                className="text-[11px] font-medium uppercase tracking-[0.25em]"
                style={{ color: data.color }}
              >
                {data.category.name} · Fase final
              </p>
              <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
                Clasifi<span style={{ color: data.color }}>cados</span>
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Las dos primeras parejas de cada grupo avanzan. Mientras queden
            partidos por jugar, los lugares son provisionales.
          </p>

          {data.porGrupo.length === 0 ? (
            <Card className="mt-8 rounded-xl p-10 text-center">
              <p className="font-display text-xl uppercase tracking-wide">
                Grupos por armarse
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Aún no hay grupos en esta categoría. Vuelve cuando arranque el
                torneo.
              </p>
            </Card>
          ) : (
            <div className="mt-8 grid items-start gap-4 sm:grid-cols-2">
              {data.porGrupo.map(({ grupo, top }) => (
                <Card key={grupo.id} className="overflow-hidden rounded-xl">
                  <div
                    aria-hidden="true"
                    className="h-1.5 w-full"
                    style={{ backgroundColor: data.color }}
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-display text-xl uppercase tracking-wide">
                        {grupo.name}
                      </h2>
                      <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                        Grupo {letraDeGrupoNombre(grupo.name).toUpperCase()}
                      </span>
                    </div>
                    {top.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">
                        Sin parejas en este grupo todavía.
                      </p>
                    ) : (
                      <ul className="mt-4 flex flex-col gap-3">
                        {top.map((t) => {
                          const clasificado = t.status === "advanced";
                          return (
                            <li
                              key={t.doubleId}
                              className="flex items-center gap-3 rounded-xl border border-line bg-background px-3 py-2.5"
                            >
                              <span className="flex shrink-0" aria-hidden="true">
                                <ParejaAvatars
                                  jugador1={t.nombre.split(" / ")[0] ?? ""}
                                  jugador2={t.nombre.split(" / ")[1] ?? ""}
                                  color={data.color}
                                  colorSoft={data.colorSoft}
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium leading-snug">
                                  {t.nombre}
                                </span>
                                <span className="block text-xs text-muted">
                                  {t.wins} G · {t.losses} P · {t.puntos} pts
                                </span>
                              </span>
                              <span
                                className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                                style={
                                  clasificado
                                    ? {
                                        backgroundColor: data.colorSoft,
                                        color: data.color,
                                      }
                                    : undefined
                                }
                              >
                                {clasificado ? "Clasificado" : "Por definirse"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <Button
                      asChild
                      variant="ghost"
                      className="mt-3 rounded-xl text-muted hover:text-accent"
                    >
                      <Link
                        href={`/categorias/${slug}/matches/${letraDeGrupoNombre(grupo.name)}`}
                      >
                        Ver partidos del {grupo.name}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-xl sm:w-auto"
            >
              <Link href={`/categorias/${slug}`}>Volver a la categoría</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
