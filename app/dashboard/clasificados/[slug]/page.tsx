import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParejaAvatars } from "@/components/pareja-avatars";
import { getCategoria } from "@/config/categorias";
import { requireAdmin } from "@/lib/actions/auth";
import {
  getCategories,
  getDoublesWithPlayers,
  getDoubleStatus,
  getGroups,
} from "@/lib/actions/torneo";
import { categorySlug, letraDeGrupoNombre } from "@/lib/torneo-view";

export const metadata: Metadata = {
  title: "Clasificados — Panel TDLF 2026",
  description: "Parejas clasificadas por categoría.",
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
  return { category, porGrupo };
}

export default async function DashboardClasificadosDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const data = await loadClasificados(slug);
  if (!data) notFound();

  const presentacion = getCategoria(slug);
  const color = presentacion?.color ?? "#ff4d3d";
  const colorSoft =
    presentacion?.colorSoft ?? "rgba(155,155,150,0.15)";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href="/dashboard/clasificados"
        className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Todas las categorías
      </Link>

      <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Fase final · {data.category.name}
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Clasificados
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Las dos primeras parejas de cada grupo avanzan. Mientras queden
        partidos por jugar, los lugares son provisionales.
      </p>

      {data.porGrupo.length === 0 ? (
        <Card className="mt-8 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Grupos por armarse
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Aún no hay grupos en esta categoría.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid items-start gap-4 sm:grid-cols-2">
          {data.porGrupo.map(({ grupo, top }) => (
            <Card key={grupo.id} className="overflow-hidden rounded-xl">
              <div
                aria-hidden="true"
                className="h-1.5 w-full"
                style={{ backgroundColor: color }}
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
                              color={color}
                              colorSoft={colorSoft}
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
                                    backgroundColor: `${color}1f`,
                                    color,
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
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/clasificados">Todas las categorías</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-xl">
          <Link href={`/clasificados/${slug}`}>Ver página pública</Link>
        </Button>
      </div>
    </div>
  );
}
