import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
import { getCategoria, listCategorias } from "@/config/categorias";
import { listGrupos } from "@/config/grupos";
import { ganador, isJugado, listPartidos, computeStandings } from "@/config/partidos";

export function generateStaticParams() {
  return listCategorias().flatMap((c) =>
    listGrupos(c.slug).map((g) => ({
      slug: c.slug,
      grupo: g.letra.toLowerCase(),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; grupo: string }>;
}): Promise<Metadata> {
  const { slug, grupo } = await params;
  const cat = getCategoria(slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: `Grupo ${grupo.toUpperCase()} ${cat.nombre} — Torneo de las Fresas 2026`,
    description: `Partidos del grupo ${grupo.toUpperCase()} de ${cat.nombre}.`,
  };
}

export default async function GrupoMatchesPage({
  params,
}: {
  params: Promise<{ slug: string; grupo: string }>;
}) {
  const { slug, grupo: grupoParam } = await params;
  const cat = getCategoria(slug);
  const grupo = listGrupos(slug).find(
    (g) => g.letra.toUpperCase() === grupoParam.toUpperCase(),
  );
  if (!cat || !grupo) notFound();

  const Icon = cat.icono;
  const partidos = listPartidos(slug, grupo.letra);
  const jugados = partidos.filter(isJugado).length;
  const posiciones = computeStandings(slug, grupo.letra);
  const podio = posiciones.slice(0, 3);

  return (
    <>
      <Header logoHref="/" navBasePath="/" showNav={false} />
      <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: cat.colorSoft }}
          />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/categorias/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {cat.nombre}
            </Link>
          </div>

          <div className="relative mt-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -top-10 hidden select-none font-display text-[11rem] uppercase leading-none sm:block"
              style={{ color: cat.color, opacity: 0.12 }}
            >
              {grupo.letra}
            </span>
            <div className="relative flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl sm:h-20 sm:w-20"
                style={{ backgroundColor: cat.colorSoft }}
              >
                <Icon
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  style={{ color: cat.color }}
                  strokeWidth={1.5}
                />
              </span>
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.25em]"
                  style={{ color: cat.color }}
                >
                  {cat.nombre} · Fase de grupos
                </p>
                <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
                  Grupo{" "}
                  <span style={{ color: cat.color }}>{grupo.letra}</span>
                </h1>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            {partidos.length} partidos · {jugados} jugados · Datos de ejemplo.
          </p>

          <div className="mt-6">
            <Table className="min-w-[620px]">
              <caption className="sr-only">
                Partidos del {grupo.nombre} de {cat.nombre}
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
                  const win = ganador(partido);
                  const jugado = isJugado(partido);
                  return (
                    <TableRow key={partido.id}>
                      <TableCell
                        style={
                          win === "A"
                            ? { backgroundColor: cat.colorSoft }
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-3">
                          <ParejaAvatars
                            jugador1={partido.parejaA.jugador1}
                            jugador2={partido.parejaA.jugador2}
                            color={cat.color}
                            colorSoft={cat.colorSoft}
                          />
                          <span
                            className="min-w-0 flex-1 text-sm leading-snug"
                            style={
                              win === "A" ? { color: cat.color } : undefined
                            }
                          >
                            {partido.parejaA.jugador1}{" "}
                            <span className="text-muted">/</span>{" "}
                            {partido.parejaA.jugador2}
                          </span>
                          <span
                            aria-label={
                              jugado
                                ? `Puntos: ${partido.scoreA}`
                                : "Partido por jugar"
                            }
                            className="countdown-num font-display text-2xl tabular-nums sm:text-3xl"
                            style={
                              win === "A"
                                ? { color: cat.color }
                                : { color: "var(--muted)" }
                            }
                          >
                            {jugado ? partido.scoreA : "–"}
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
                            ? { backgroundColor: cat.colorSoft }
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-3">
                          <span
                            aria-label={
                              jugado
                                ? `Puntos: ${partido.scoreB}`
                                : "Partido por jugar"
                            }
                            className="countdown-num font-display text-2xl tabular-nums sm:text-3xl"
                            style={
                              win === "B"
                                ? { color: cat.color }
                                : { color: "var(--muted)" }
                            }
                          >
                            {jugado ? partido.scoreB : "–"}
                          </span>
                          <span
                            className="min-w-0 flex-1 text-right text-sm leading-snug"
                            style={
                              win === "B" ? { color: cat.color } : undefined
                            }
                          >
                            {partido.parejaB.jugador1}{" "}
                            <span className="text-muted">/</span>{" "}
                            {partido.parejaB.jugador2}
                          </span>
                          <ParejaAvatars
                            jugador1={partido.parejaB.jugador1}
                            jugador2={partido.parejaB.jugador2}
                            color={cat.color}
                            colorSoft={cat.colorSoft}
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

          <section aria-label="Posiciones" className="mt-12">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.25em]"
              style={{ color: cat.color }}
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

            {/* Podio: 1º al centro en desktop, apilado en móvil */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {podio.map((fila) => (
                <div
                  key={`${fila.pareja.jugador1}-${fila.pareja.jugador2}`}
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
                          borderColor: cat.color,
                          boxShadow: `0 0 40px ${cat.colorSoft}`,
                        }
                      : undefined
                  }
                >
                  <p
                    aria-label={`Posición ${fila.pos}`}
                    className="countdown-num font-display text-5xl tabular-nums"
                    style={
                      fila.pos <= 2 ? { color: cat.color } : { color: "var(--muted)" }
                    }
                  >
                    {fila.pos}
                  </p>
                  <div className="mt-3 flex justify-center">
                    <ParejaAvatars
                      jugador1={fila.pareja.jugador1}
                      jugador2={fila.pareja.jugador2}
                      color={cat.color}
                      colorSoft={cat.colorSoft}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-snug">
                    {fila.pareja.jugador1} <span className="text-muted">/</span>{" "}
                    {fila.pareja.jugador2}
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
                  Posiciones del {grupo.nombre} de {cat.nombre}
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
                    const key = `${fila.pareja.jugador1}-${fila.pareja.jugador2}`;
                    return (
                      <TableRow
                        key={key}
                        style={
                          fila.pos === 2
                            ? { borderBottom: `2px solid ${cat.color}` }
                            : undefined
                        }
                      >
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <span
                              className="countdown-num font-display text-xl tabular-nums"
                              style={
                                avanza
                                  ? { color: cat.color }
                                  : { color: "var(--muted)" }
                              }
                            >
                              {fila.pos}
                            </span>
                            {avanza && (
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                                style={{
                                  backgroundColor: cat.colorSoft,
                                  color: cat.color,
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
                              jugador1={fila.pareja.jugador1}
                              jugador2={fila.pareja.jugador2}
                              color={cat.color}
                              colorSoft={cat.colorSoft}
                            />
                            <span className="text-sm leading-snug">
                              {fila.pareja.jugador1}{" "}
                              <span className="text-muted">/</span>{" "}
                              {fila.pareja.jugador2}
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
                            fila.dif > 0 ? { color: cat.color } : undefined
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
          </section>
        </div>
      </main>
    </>
  );
}
