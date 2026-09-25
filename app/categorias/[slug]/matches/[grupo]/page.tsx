import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Sparkles, Trophy, type LucideIcon } from "lucide-react";

import { Header } from "@/components/landing/header";
import { ParejaAvatars } from "@/components/pareja-avatars";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  getCategories,
  getDoublesWithPlayers,
  getGroupStandings,
  getGroups,
  getMatches,
  type DoubleWithPlayers,
  type Match,
} from "@/lib/actions/torneo";
import {
  categorySlug,
  grupoPorLetra,
  ordenarGrupos,
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

async function loadGrupo(slug: string, letra: string) {
  const categories = await getCategories();
  const category = categories.find((c) => categorySlug(c.name) === slug);
  if (!category) return null;
  const [doubles, matches, groups] = await Promise.all([
    getDoublesWithPlayers({ categoryId: category.id }),
    getMatches(),
    getGroups(category.id),
  ]);
  const grupo = grupoPorLetra(ordenarGrupos(groups), letra);
  if (!grupo) return null;
  const groupMatches = matches.filter((m) => m.group_id === grupo.id);
  const standings = (await getGroupStandings(grupo.id)).filter(
    (s) => s.group_id === grupo.id,
  );
  const presentacion = PRESENTACION[slug] ?? PRESENTACION_FALLBACK;
  return { category, grupo, doubles, groupMatches, standings, ...presentacion };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; grupo: string }>;
}): Promise<Metadata> {
  const { slug, grupo: letra } = await params;
  const data = await loadGrupo(slug, letra);
  if (!data) return { title: "Grupo no encontrado" };
  return {
    title: `${data.grupo.name} ${data.category.name} — Torneo de las Fresas 2026`,
    description: `Partidos del ${data.grupo.name.toLowerCase()} de ${data.category.name}.`,
  };
}

type Lado = { nombre: string; score: number | null };
type PartidoVista = {
  id: string;
  a: Lado;
  b: Lado;
  win: "A" | "B" | null;
  jugado: boolean;
};

function nombreDoble(d: DoubleWithPlayers): string {
  return `${d.player1.name} / ${d.player2.name}`;
}

function aVista(m: Match, porId: Map<string, DoubleWithPlayers>): PartidoVista {
  const d1 = porId.get(m.double1_id);
  const d2 = porId.get(m.double2_id);
  const jugado = m.winner_double_id !== null;
  const win =
    !jugado || !d1 || !d2
      ? null
      : m.winner_double_id === d1.id
        ? "A"
        : "B";
  return {
    id: m.id,
    a: { nombre: d1 ? nombreDoble(d1) : "?", score: m.score1 },
    b: { nombre: d2 ? nombreDoble(d2) : "?", score: m.score2 },
    win,
    jugado,
  };
}

type FilaPosicion = {
  doubleId: string;
  nombre: string;
  pos: number;
  pj: number;
  pg: number;
  pp: number;
  pf: number;
  pc: number;
  dif: number;
};

export default async function GrupoMatchesPage({
  params,
}: {
  params: Promise<{ slug: string; grupo: string }>;
}) {
  const { slug, grupo: letra } = await params;
  const data = await loadGrupo(slug, letra);
  if (!data) notFound();

  const Icon = data.icono;
  const porId = new Map(data.doubles.map((d) => [d.id, d]));
  const partidos = data.groupMatches.map((m) => aVista(m, porId));
  const jugados = partidos.filter((p) => p.jugado).length;

  // Puntos en contra desde los partidos; el resto sale de group_standings
  // (fuente de verdad del orden: victorias, luego puntos a favor).
  const enContra = new Map<string, number>();
  for (const m of data.groupMatches) {
    if (m.winner_double_id === null) continue;
    enContra.set(
      m.double1_id,
      (enContra.get(m.double1_id) ?? 0) + (m.score2 ?? 0),
    );
    enContra.set(
      m.double2_id,
      (enContra.get(m.double2_id) ?? 0) + (m.score1 ?? 0),
    );
  }
  const posiciones: FilaPosicion[] = data.standings
    .filter((s) => s.double_id !== null)
    .map((s) => {
      const d = porId.get(s.double_id as string);
      const pg = s.wins ?? 0;
      const pp = s.losses ?? 0;
      const pf = s.points_scored ?? 0;
      const pc = enContra.get(s.double_id as string) ?? 0;
      return {
        doubleId: s.double_id as string,
        nombre: d ? nombreDoble(d) : "?",
        pos: s.group_rank ?? 0,
        pj: pg + pp,
        pg,
        pp,
        pf,
        pc,
        dif: pf - pc,
      };
    });
  const podio = posiciones.slice(0, 3);
  const letraMayus = letra.toUpperCase();

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

          <div className="relative mt-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-10 hidden select-none font-display text-[11rem] uppercase leading-none sm:block"
              style={{ color: data.color, opacity: 0.12 }}
            >
              {letraMayus}
            </span>
            <div className="relative flex items-center gap-4">
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
                  {data.category.name} · {data.grupo.name}
                </p>
                <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
                  Grupo{" "}
                  <span style={{ color: data.color }}>{letraMayus}</span>
                </h1>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            {partidos.length} partidos · {jugados} jugados
          </p>

          {partidos.length === 0 ? (
            <Card className="mt-6 rounded-xl p-10 text-center">
              <p className="font-display text-xl uppercase tracking-wide">
                Sin partidos todavía
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Los cruces de este grupo aún no se generan.
              </p>
            </Card>
          ) : (
          <div className="mt-6">
            <Table className="min-w-[620px]">
              <caption className="sr-only">
                Partidos del {data.grupo.name} de {data.category.name}
              </caption>
              <TableHeader>
                <tr>
                  <TableHead className="w-[42%]">Pareja</TableHead>
                  <TableHead className="w-24 text-center">VS</TableHead>
                  <TableHead className="w-[42%] text-right">Pareja</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {partidos.map((partido, i) => {
                  const { win, jugado } = partido;
                  return (
                    <TableRow key={partido.id}>
                      <TableCell
                        style={
                          win === "A"
                            ? { backgroundColor: data.colorSoft }
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-3">
                          <ParejaAvatars
                            jugador1={partido.a.nombre.split(" / ")[0] ?? ""}
                            jugador2={partido.a.nombre.split(" / ")[1] ?? ""}
                            color={data.color}
                            colorSoft={data.colorSoft}
                          />
                          <span
                            className="min-w-0 flex-1 text-sm leading-snug"
                            style={
                              win === "A" ? { color: data.color } : undefined
                            }
                          >
                            {partido.a.nombre}
                          </span>
                          <span
                            aria-label={
                              jugado
                                ? `Puntos: ${partido.a.score}`
                                : "Partido por jugar"
                            }
                            className="countdown-num font-display text-2xl tabular-nums sm:text-3xl"
                            style={
                              win === "A"
                                ? { color: data.color }
                                : { color: "var(--muted)" }
                            }
                          >
                            {jugado ? partido.a.score : "–"}
                          </span>
                        </span>
                        <span className="sr-only">
                          Partido {i + 1}
                          {win === "A" ? ", ganadora" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center rounded-md border border-line bg-white/[0.07] px-3 py-1 font-display text-xs uppercase tracking-[0.2em] text-foreground/85">
                          VS
                        </span>
                      </TableCell>
                      <TableCell
                        style={
                          win === "B"
                            ? { backgroundColor: data.colorSoft }
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-label={
                              jugado
                                ? `Puntos: ${partido.b.score}`
                                : "Partido por jugar"
                            }
                            className="countdown-num font-display text-2xl tabular-nums sm:text-3xl"
                            style={
                              win === "B"
                                ? { color: data.color }
                                : { color: "var(--muted)" }
                            }
                          >
                            {jugado ? partido.b.score : "–"}
                          </span>
                          <span
                            className="min-w-0 flex-1 text-right text-sm leading-snug"
                            style={
                              win === "B" ? { color: data.color } : undefined
                            }
                          >
                            {partido.b.nombre}
                          </span>
                          <ParejaAvatars
                            jugador1={partido.b.nombre.split(" / ")[0] ?? ""}
                            jugador2={partido.b.nombre.split(" / ")[1] ?? ""}
                            color={data.color}
                            colorSoft={data.colorSoft}
                          />
                        </span>
                        <span className="sr-only">
                          {win === "B" ? "Ganadora" : ""}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          )}

          <section aria-label="Posiciones" className="mt-12">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.25em]"
              style={{ color: data.color }}
            >
              Tabla general
            </p>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
              Posiciones
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Orden por partidos ganados, desempate por puntos a favor. Las
              dos primeras avanzan.
            </p>

            {posiciones.length === 0 ? (
              <Card className="mt-6 rounded-xl p-10 text-center">
                <p className="mx-auto max-w-sm text-sm text-muted">
                  Aún no hay posiciones: se calculan cuando se jueguen los
                  partidos.
                </p>
              </Card>
            ) : (
              <>
            {/* Podio: 1º al centro en desktop, apilado en móvil */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {podio.map((fila) => (
                <div
                  key={fila.doubleId}
                  className={`rounded-xl border bg-surface p-5 text-center ${
                    fila.pos === 1
                      ? "order-1 border-transparent sm:order-2"
                      : fila.pos === 2
                        ? "order-2 sm:order-1"
                        : "order-3"
                  }`}
                  style={
                    fila.pos === 1
                      ? {
                          borderColor: data.color,
                          boxShadow: `0 0 40px ${data.colorSoft}`,
                        }
                      : undefined
                  }
                >
                  <p
                    aria-label={`Posición ${fila.pos}`}
                    className="countdown-num font-display text-5xl tabular-nums"
                    style={
                      fila.pos <= 2 ? { color: data.color } : { color: "var(--muted)" }
                    }
                  >
                    {fila.pos}
                  </p>
                  <div className="mt-3 flex justify-center">
                    <ParejaAvatars
                      jugador1={fila.nombre.split(" / ")[0] ?? ""}
                      jugador2={fila.nombre.split(" / ")[1] ?? ""}
                      color={data.color}
                      colorSoft={data.colorSoft}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-snug">
                    {fila.nombre}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                    {fila.pg} PG · {fila.pf} pts
                  </p>
                </div>
              ))}
            </div>

            {/* Tabla completa con corte top-2 */}
            <div className="mt-6">
              <Table className="min-w-[680px]">
                <caption className="sr-only">
                  Posiciones del {data.grupo.name} de {data.category.name}
                </caption>
                <TableHeader>
                  <tr>
                    <TableHead className="w-16">Pos</TableHead>
                    <TableHead>Pareja</TableHead>
                    <TableHead className="text-center">PJ</TableHead>
                    <TableHead className="text-center">PG</TableHead>
                    <TableHead className="text-center">PP</TableHead>
                    <TableHead className="text-center">PF</TableHead>
                    <TableHead className="text-center">PC</TableHead>
                    <TableHead className="text-center">Dif</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {posiciones.map((fila) => {
                    const avanza = fila.pos <= 2;
                    return (
                      <TableRow
                        key={fila.doubleId}
                        style={
                          fila.pos === 2
                            ? { borderBottom: `2px solid ${data.color}` }
                            : undefined
                        }
                      >
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span
                              className="countdown-num font-display text-xl tabular-nums"
                              style={
                                avanza
                                  ? { color: data.color }
                                  : { color: "var(--muted)" }
                              }
                            >
                              {fila.pos}
                            </span>
                            {avanza && (
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                                style={{
                                  backgroundColor: data.colorSoft,
                                  color: data.color,
                                }}
                              >
                                Avanza
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-3">
                            <ParejaAvatars
                              jugador1={fila.nombre.split(" / ")[0] ?? ""}
                              jugador2={fila.nombre.split(" / ")[1] ?? ""}
                              color={data.color}
                              colorSoft={data.colorSoft}
                            />
                            <span className="text-sm leading-snug">
                              {fila.nombre}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="countdown-num text-center tabular-nums">
                          {fila.pj}
                        </TableCell>
                        <TableCell className="countdown-num text-center font-semibold tabular-nums">
                          {fila.pg}
                        </TableCell>
                        <TableCell className="countdown-num text-center tabular-nums text-muted">
                          {fila.pp}
                        </TableCell>
                        <TableCell className="countdown-num text-center tabular-nums">
                          {fila.pf}
                        </TableCell>
                        <TableCell className="countdown-num text-center tabular-nums text-muted">
                          {fila.pc}
                        </TableCell>
                        <TableCell
                          className="countdown-num text-center tabular-nums"
                          style={
                            fila.dif > 0 ? { color: data.color } : undefined
                          }
                        >
                          {fila.dif > 0 ? `+${fila.dif}` : fila.dif}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
