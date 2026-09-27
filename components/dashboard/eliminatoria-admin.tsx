"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createKnockoutRound,
  updateMatchScore,
} from "@/lib/actions/admin";
import {
  getDoublesWithPlayers,
  getKnockoutState,
  type KnockoutState,
  type Match,
} from "@/lib/actions/torneo";
import { stageLabel } from "@/lib/torneo-view";

export type EliminatoriaCategory = {
  id: string;
  nombre: string;
};

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

function parseScore(v: string): number | null | "invalido" {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 30) return "invalido";
  return n;
}

export function EliminatoriaAdmin({
  categories,
}: {
  categories: EliminatoriaCategory[];
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [estado, setEstado] = useState<KnockoutState | null>(null);
  const [nombres, setNombres] = useState<Map<string, string>>(new Map());
  const [cargando, setCargando] = useState(categoryId !== "");
  const [recarga, setRecarga] = useState(0);
  const [cruces, setCruces] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Match | null>(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [errorScore, setErrorScore] = useState<string | null>(null);
  const [guardandoScore, setGuardandoScore] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    let vivo = true;
    Promise.all([
      getKnockoutState(categoryId),
      getDoublesWithPlayers({ categoryId }),
    ])
      .then(([st, doubles]) => {
        if (!vivo) return;
        setEstado(st);
        setNombres(
          new Map(
            doubles.map((d) => [
              d.id,
              `${d.player1.name} / ${d.player2.name}`,
            ]),
          ),
        );
        setCruces(
          st.eligible.length > 0 && st.expectedStage
            ? Array.from({ length: st.eligible.length / 2 }, () => ["", ""])
            : [],
        );
      })
      .catch(() => {
        if (vivo) setError("No se pudo cargar el estado de la eliminatoria.");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [categoryId, recarga]);

  function nombreDe(doubleId: string): string {
    return nombres.get(doubleId) ?? "?";
  }

  function setCruce(i: number, lado: 0 | 1, value: string) {
    setCruces((prev) => {
      const next = prev.map((c) => [...c]);
      next[i][lado] = value;
      return next;
    });
    setError(null);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!estado?.expectedStage) return;
    if (cruces.some(([a, b]) => !a || !b)) {
      setError("Completa todos los cruces antes de crear la ronda.");
      return;
    }
    const pairings = cruces.map(([a, b]) => ({
      double1_id: a,
      double2_id: b,
    }));
    const ids = pairings.flatMap((p) => [p.double1_id, p.double2_id]);
    if (new Set(ids).size !== ids.length) {
      setError("Cada pareja solo puede aparecer en un cruce.");
      return;
    }
    setCreando(true);
    setError(null);
    const result = await createKnockoutRound({
      category_id: categoryId,
      stage: estado.expectedStage,
      pairings,
    });
    setCreando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRecarga((k) => k + 1);
  }

  async function guardarMarcador(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    const a = parseScore(scoreA);
    const b = parseScore(scoreB);
    if (a === "invalido" || b === "invalido") {
      setErrorScore("Marcadores enteros entre 0 y 30.");
      return;
    }
    if ((a === null) !== (b === null)) {
      setErrorScore("Llena ambos marcadores o vacía los dos (pendiente).");
      return;
    }
    if (a !== null && b !== null && a === b) {
      setErrorScore("Sin empates: un lado debe ganar.");
      return;
    }
    setGuardandoScore(true);
    const result = await updateMatchScore(editando.id, {
      score1: a,
      score2: b,
    });
    setGuardandoScore(false);
    if (!result.ok) {
      setErrorScore(result.error);
      return;
    }
    const actualizado = result.data;
    setEstado((prev) =>
      prev
        ? {
            ...prev,
            stages: prev.stages.map((s) => ({
              ...s,
              matches: s.matches.map((m) =>
                m.id === actualizado.id ? actualizado : m,
              ),
            })),
          }
        : prev,
    );
    setEditando(null);
    setRecarga((k) => k + 1);
  }

  return (
    <div>
      <Card className="mt-8 max-w-xl rounded-xl p-6">
        <div className="grid gap-2">
          <Label htmlFor="elim-cat">Categoría</Label>
          <select
            id="elim-cat"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setEstado(null);
              setCruces([]);
              setError(null);
              setCargando(e.target.value !== "");
            }}
            required
            className={SELECT_CLASS}
          >
            <option value="">Selecciona categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {cargando && (
        <p className="mt-6 text-sm text-muted">Cargando eliminatoria…</p>
      )}

      {!cargando && estado && !estado.hasGroups && (
        <Card className="mt-6 max-w-xl rounded-xl p-6 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Sin grupos todavía
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Primero arma los grupos de esta categoría.
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/dashboard/crear-grupos">Ir a crear grupos</Link>
          </Button>
        </Card>
      )}

      {!cargando &&
        estado &&
        estado.hasGroups &&
        !estado.groupStageComplete &&
        !estado.currentMaxStage && (
          <Card className="mt-6 max-w-xl rounded-xl p-6 text-center">
            <p className="font-display text-xl uppercase tracking-wide">
              Fase de grupos en curso
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {estado.pendingGroups}{" "}
              {estado.pendingGroups === 1 ? "grupo" : "grupos"} aún sin
              terminar. La eliminatoria se arma cuando todos cierren.
            </p>
          </Card>
        )}

      {!cargando &&
        estado &&
        estado.champion && (
          <Card className="mt-6 rounded-xl border-accent/50 bg-accent/10 p-6 text-center sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
              Campeón · {categories.find((c) => c.id === categoryId)?.nombre ?? ""}
            </p>
            <p className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
              {estado.champion.nombre}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Ganó la final. El torneo de esta categoría terminó.
            </p>
          </Card>
        )}

      {!cargando &&
        estado &&
        estado.expectedStage &&
        estado.eligible.length > 0 && (
          <Card className="mt-6 max-w-2xl rounded-xl p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              <Swords aria-hidden="true" className="h-3.5 w-3.5" />
              Ronda a crear: {stageLabel(estado.expectedStage)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Arma los cruces manualmente. Cada pareja elegible juega
              exactamente una vez. La función valida la ronda al enviar.
            </p>
            <form onSubmit={crear} className="mt-5 flex flex-col gap-5">
              {cruces.map((cruce, i) => {
                const elegidosEnOtros = new Set(
                  cruces.flatMap((c, j) => (j === i ? [] : c)),
                );
                return (
                  <div
                    key={i}
                    className="grid gap-3 rounded-xl border border-line p-4 sm:grid-cols-2"
                  >
                    {[0, 1].map((lado) => (
                      <div key={lado} className="grid gap-2">
                        <Label htmlFor={`elim-cruce-${i}-${lado}`}>
                          Cruce {i + 1} · Pareja {lado === 0 ? "1" : "2"}
                        </Label>
                        <select
                          id={`elim-cruce-${i}-${lado}`}
                          value={cruce[lado] ?? ""}
                          onChange={(e) =>
                            setCruce(i, lado as 0 | 1, e.target.value)
                          }
                          disabled={creando}
                          className={SELECT_CLASS}
                        >
                          <option value="">Elige pareja…</option>
                          {estado.eligible
                            .filter(
                              (d) =>
                                d.doubleId === cruce[lado] ||
                                !elegidosEnOtros.has(d.doubleId),
                            )
                            .map((d) => (
                              <option key={d.doubleId} value={d.doubleId}>
                                {d.nombre}
                                {d.grupo ? ` · ${d.grupo}` : ""}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                );
              })}
              {error && (
                <p role="alert" className="text-sm text-accent">
                  {error}
                </p>
              )}
              <div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={creando}
                  className="rounded-xl"
                >
                  <Swords aria-hidden="true" />
                  {creando
                    ? "Creando…"
                    : `Crear ${stageLabel(estado.expectedStage)}`}
                </Button>
              </div>
            </form>
          </Card>
        )}

      {!cargando && estado && estado.stages.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
            Rondas jugadas
          </h2>
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            {estado.stages.map((s) => {
              const pendientes = s.matches.filter(
                (m) => m.winner_double_id === null,
              ).length;
              return (
                <Card key={s.stage} className="rounded-xl p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xl uppercase tracking-wide">
                      {stageLabel(s.stage)}
                    </p>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                      {pendientes === 0
                        ? "Decidida"
                        : `${pendientes} pendiente${pendientes === 1 ? "" : "s"}`}
                    </span>
                  </div>
                  <ul className="mt-4 flex flex-col gap-2">
                    {s.matches.map((m) => {
                      const jugado = m.winner_double_id !== null;
                      return (
                        <li
                          key={m.id}
                          className="flex items-center gap-3 rounded-xl border border-line bg-background px-3 py-2.5"
                        >
                          <span className="min-w-0 flex-1 text-sm leading-snug">
                            {nombreDe(m.double1_id)}{" "}
                            <span className="countdown-num font-display text-lg tabular-nums">
                              {jugado ? m.score1 : "–"}
                            </span>{" "}
                            <span className="text-muted">vs</span>{" "}
                            <span className="countdown-num font-display text-lg tabular-nums">
                              {jugado ? m.score2 : "–"}
                            </span>{" "}
                            {nombreDe(m.double2_id)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setEditando(m);
                              setScoreA(
                                m.score1 === null ? "" : String(m.score1),
                              );
                              setScoreB(
                                m.score2 === null ? "" : String(m.score2),
                              );
                              setErrorScore(null);
                            }}
                            className="rounded-xl"
                          >
                            {jugado ? "Editar" : "Anotar"}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal editar marcador (misma semántica que fase de grupos) */}
      <Dialog
        open={editando !== null}
        onOpenChange={(v) => !v && setEditando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar <span className="text-accent">marcador</span>
            </DialogTitle>
            <DialogDescription>
              {editando &&
                `${nombreDe(editando.double1_id)} contra ${nombreDe(editando.double2_id)}. Vacía ambos para dejarlo pendiente.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardarMarcador} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="elim-score-a">Marcador 1</Label>
                <Input
                  id="elim-score-a"
                  type="number"
                  value={scoreA}
                  onChange={(e) => {
                    setScoreA(e.target.value);
                    setErrorScore(null);
                  }}
                  placeholder="–"
                  min={0}
                  max={30}
                  disabled={guardandoScore}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="elim-score-b">Marcador 2</Label>
                <Input
                  id="elim-score-b"
                  type="number"
                  value={scoreB}
                  onChange={(e) => {
                    setScoreB(e.target.value);
                    setErrorScore(null);
                  }}
                  placeholder="–"
                  min={0}
                  max={30}
                  disabled={guardandoScore}
                  className="rounded-xl"
                />
              </div>
            </div>
            {errorScore && (
              <p role="alert" className="text-sm text-accent">
                {errorScore}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditando(null)}
                disabled={guardandoScore}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={guardandoScore}
                className="rounded-xl"
              >
                {guardandoScore ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
