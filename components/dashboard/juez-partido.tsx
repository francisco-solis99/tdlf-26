"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { updateMatchScore } from "@/lib/actions/admin";
import type { ScoringMatch } from "@/lib/actions/torneo";

const DEFAULT_MINUTES = 20;
const DEFAULT_SECONDS = 0;
const DEFAULT_WIN_POINTS = 10;

type Side = "A" | "B";
type Phase = "idle" | "running" | "paused";

function tag(side: Side): string {
  return `Pareja ${side}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function splitTime(totalSeconds: number) {
  const total = Math.max(0, totalSeconds);
  return {
    m: String(Math.floor(total / 60)).padStart(2, "0"),
    s: String(total % 60).padStart(2, "0"),
  };
}

export function JuezPartido({ scoring }: { scoring: ScoringMatch }) {
  const nombres: Record<Side, [string, string]> = {
    A: [scoring.double1.player1.name, scoring.double1.player2.name],
    B: [scoring.double2.player1.name, scoring.double2.player2.name],
  };
  const [scores, setScores] = useState<Record<Side, number>>({
    A: scoring.match.score1 ?? 0,
    B: scoring.match.score2 ?? 0,
  });
  const [pulse, setPulse] = useState<{ side: Side; key: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<{
    a: number;
    b: number;
    key: number;
  } | null>(null);

  // Borradores de configuración (editables solo antes de iniciar)
  const [minutesDraft, setMinutesDraft] = useState(String(DEFAULT_MINUTES));
  const [secondsDraft, setSecondsDraft] = useState(
    String(DEFAULT_SECONDS).padStart(2, "0"),
  );
  const [winDraft, setWinDraft] = useState(String(DEFAULT_WIN_POINTS));

  // Estado comprometido del partido
  const [durationSec, setDurationSec] = useState(
    DEFAULT_MINUTES * 60 + DEFAULT_SECONDS,
  );
  const [secondsLeft, setSecondsLeft] = useState(
    DEFAULT_MINUTES * 60 + DEFAULT_SECONDS,
  );
  const [winPoints, setWinPoints] = useState(DEFAULT_WIN_POINTS);

  const pulseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const registeredTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  // En pausa o en juego la configuración queda bloqueada
  const locked = phase !== "idle";
  const clockRunning = phase === "running" && secondsLeft > 0;
  const timeUp = phase === "running" && secondsLeft <= 0;
  const clock = splitTime(secondsLeft);

  // Countdown tick: el intervalo solo existe mientras está en juego y queda tiempo
  useEffect(() => {
    if (phase !== "running" || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, secondsLeft]);

  // Limpieza del resaltado de punto y del aviso de registro
  useEffect(() => {
    return () => {
      if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
      if (registeredTimeout.current) clearTimeout(registeredTimeout.current);
    };
  }, []);

  // Foco inicial en confirmar, cierre con Escape y bloqueo de scroll
  useEffect(() => {
    if (!confirmOpen) return;
    confirmButtonRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmOpen]);

  // El aviso de éxito se oculta solo tras unos segundos
  useEffect(() => {
    if (!registered) return;
    if (registeredTimeout.current) clearTimeout(registeredTimeout.current);
    registeredTimeout.current = setTimeout(() => setRegistered(null), 6000);
    return () => {
      if (registeredTimeout.current) clearTimeout(registeredTimeout.current);
    };
  }, [registered]);

  function triggerPulse(side: Side) {
    if (pulseTimeout.current) clearTimeout(pulseTimeout.current);
    setPulse((prev) => ({ side, key: (prev?.key ?? 0) + 1 }));
    pulseTimeout.current = setTimeout(() => setPulse(null), 650);
  }

  function addPoint(side: Side) {
    setScores((prev) => ({ ...prev, [side]: prev[side] + 1 }));
    triggerPulse(side);
  }

  function removePoint(side: Side) {
    setScores((prev) => ({ ...prev, [side]: Math.max(0, prev[side] - 1) }));
  }

  function resetScores() {
    setScores({ A: 0, B: 0 });
    setPulse(null);
  }

  function parseDrafts() {
    const m = clamp(Number(minutesDraft) || 0, 0, 99);
    const s = clamp(Number(secondsDraft) || 0, 0, 59);
    const w = clamp(Number(winDraft) || 0, 1, 99);
    return { total: m * 60 + s, win: w, m, s };
  }

  function normalizeDrafts() {
    const { m, s, win } = parseDrafts();
    setMinutesDraft(String(m));
    setSecondsDraft(String(s).padStart(2, "0"));
    setWinDraft(String(win));
  }

  function handleTimeDraftChange(nextMin: string, nextSec: string) {
    setMinutesDraft(nextMin);
    setSecondsDraft(nextSec);
    if (phase !== "idle") return;
    const m = clamp(Number(nextMin) || 0, 0, 99);
    const s = clamp(Number(nextSec) || 0, 0, 59);
    const total = m * 60 + s;
    setDurationSec(total);
    setSecondsLeft(total);
  }

  function handleWinDraftChange(value: string) {
    setWinDraft(value);
    if (phase !== "idle") return;
    setWinPoints(clamp(Number(value) || 0, 1, 99));
  }

  function handlePlay() {
    if (phase === "idle") {
      const { total, win } = parseDrafts();
      normalizeDrafts();
      setDurationSec(total);
      setSecondsLeft(total);
      setWinPoints(win);
      if (total <= 0) return;
    } else if (secondsLeft <= 0) {
      // Tras agotarse el tiempo, Jugar reinicia el reloj con lo configurado
      if (durationSec <= 0) return;
      setSecondsLeft(durationSec);
    }
    setPhase("running");
  }

  function handlePause() {
    // Pausa congela el reloj: secondsLeft se conserva intacto
    setPhase("paused");
  }

  function handleStop() {
    // Detiene y regresa al estado previo al juego: la configuración
    // vuelve a ser editable y el reloj se restaura a lo configurado
    setPhase("idle");
    setSecondsLeft(durationSec);
  }

  function resetMatch() {
    // Reinicia todo: puntos, reloj, fase y resaltados
    setScores({ A: 0, B: 0 });
    setPulse(null);
    setPhase("idle");
    setSecondsLeft(durationSec);
  }

  async function handleConfirmRegister() {
    const result = await updateMatchScore(scoring.match.id, {
      score1: scores.A,
      score2: scores.B,
    });
    if (!result.ok) {
      setRegisterError(result.error);
      return;
    }
    const snapshot = { a: scores.A, b: scores.B, key: Date.now() };
    setConfirmOpen(false);
    setRegisterError(null);
    resetMatch();
    if (registeredTimeout.current) clearTimeout(registeredTimeout.current);
    setRegistered(snapshot);
  }

  const winner: Side | "tie" | null =
    scores.A >= winPoints || scores.B >= winPoints
      ? scores.A === scores.B
        ? "tie"
        : scores.A > scores.B
          ? "A"
          : "B"
      : null;

  const canRegister = scores.A + scores.B > 0 && !confirmOpen;

  const modalLeader: Side | "tie" | null =
    scores.A === scores.B
      ? "tie"
      : scores.A > scores.B
        ? "A"
        : "B";

  const modalHeadline =
    winner === "A" || winner === "B"
      ? `Gana ${tag(winner)} ${scores.A} – ${scores.B}`
      : winner === "tie"
        ? `Empate a ${scores.A} — punto de oro`
        : modalLeader === "tie"
          ? `Empate parcial ${scores.A} – ${scores.B}`
          : `Va ganando ${tag(modalLeader)} ${scores.A} – ${scores.B}`;

  const registeredWinner: Side | "tie" | null = registered
    ? registered.a === registered.b
      ? "tie"
      : registered.a > registered.b
        ? "A"
        : "B"
    : null;

  const idleTotal = locked ? durationSec : parseDrafts().total;

  const statusText =
    phase === "idle"
      ? "Configura tiempo y puntos arriba, luego presiona Jugar."
      : clockRunning
        ? "En juego… el marcador sigue editable."
        : timeUp
          ? "¡Tiempo! Jugar reinicia el reloj o Detener para reconfigurar."
          : "En pausa — el reloj está congelado. Detener para reconfigurar.";

  return (
    <div className="grain relative flex min-h-dvh flex-1 flex-col bg-background text-foreground lg:min-h-full">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-2 sm:px-6 sm:py-10">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard/partidos"
            className="text-xs text-muted underline-offset-4 hover:text-foreground hover:underline sm:text-sm"
          >
            ← Volver a partidos
          </Link>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
            Juzgando · {scoring.category.name} · {scoring.group?.name ?? "Sin grupo"}
          </p>
        </div>

        <h1 className="mt-1 text-center font-display text-xl uppercase tracking-wide sm:mt-4 sm:text-5xl">
          Partido <span className="text-accent">en juego</span>
        </h1>
        <p className="mt-1 hidden text-center text-sm text-muted sm:mt-2 sm:block">
          Gana la pareja que llegue a {winPoints} puntos o tenga ventaja al
          terminar el tiempo.
        </p>

        {/* Configuración del partido: editable solo antes de iniciar */}
        <section
          aria-label="Configuración del partido"
          className="mt-2 border border-line bg-surface px-2 py-2 sm:mt-6 sm:px-6 sm:py-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-x-10 sm:gap-y-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
                Duración
              </span>
              <input
                type="number"
                min={0}
                max={99}
                value={minutesDraft}
                readOnly={locked}
                onChange={(e) =>
                  handleTimeDraftChange(e.target.value, secondsDraft)
                }
                onBlur={normalizeDrafts}
                aria-label="Minutos por partido"
                className="w-12 border border-line bg-background px-1 py-1 text-center font-display text-lg tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60 sm:w-16 sm:px-2 sm:py-1.5 sm:text-2xl"
              />
              <span aria-hidden="true" className="font-display text-lg text-muted sm:text-2xl">
                :
              </span>
              <input
                type="number"
                min={0}
                max={59}
                value={secondsDraft}
                readOnly={locked}
                onChange={(e) =>
                  handleTimeDraftChange(minutesDraft, e.target.value)
                }
                onBlur={normalizeDrafts}
                aria-label="Segundos por partido"
                className="w-12 border border-line bg-background px-1 py-1 text-center font-display text-lg tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60 sm:w-16 sm:px-2 sm:py-1.5 sm:text-2xl"
              />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
                Puntos para ganar
              </span>
              <input
                type="number"
                min={1}
                max={99}
                value={winDraft}
                readOnly={locked}
                onChange={(e) => handleWinDraftChange(e.target.value)}
                onBlur={normalizeDrafts}
                aria-label="Puntos para ganar el partido"
                className="w-12 border border-line bg-background px-1 py-1 text-center font-display text-lg tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60 sm:w-16 sm:px-2 sm:py-1.5 sm:text-2xl"
              />
            </div>
          </div>
          <p className="mt-2 hidden min-h-4 text-center text-xs text-muted sm:block sm:mt-3">
            {locked
              ? "Bloqueado durante el partido (en juego o en pausa)."
              : "Editable antes de iniciar el partido."}
          </p>
        </section>

        {/* Banner visual de fin de partido (solo UI, sin lógica de registro).
            Sin altura reservada en móvil para no robar viewport; solo ocupa
            espacio cuando hay ganador. */}
        <div aria-live="polite" className="mt-2 min-h-0 sm:mt-6 lg:min-h-14">
          {winner !== null && (
            <div className="border border-accent/50 bg-accent/10 px-3 py-2 text-center sm:px-4 sm:py-3">
              <p className="font-display text-sm uppercase tracking-wide text-accent sm:text-xl">
                {winner === "tie"
                  ? `Empate a ${winPoints} — punto de oro`
                  : `¡Partido terminado! Gana ${tag(winner)}`}
              </p>
              <p className="mt-0.5 hidden text-sm text-muted sm:mt-1 sm:block">
                {winner === "tie"
                  ? "El siguiente punto define al ganador."
                  : `${nombres[winner][0]} y ${nombres[winner][1]} llegan a ${winPoints} puntos.`}
              </p>
            </div>
          )}
        </div>

        {/* Cancha: dos lados + reloj al centro.
            En móvil todo queda en una columna compacta para caber en 100dvh. */}
        <div className="mt-2 grid flex-1 content-start gap-2 sm:mt-6 sm:gap-4 lg:grid-cols-[1fr_auto_1fr] lg:content-stretch lg:items-stretch">
          <PairPanel
            side="A"
            nombres={nombres.A}
            score={scores.A}
            pulsing={pulse?.side === "A"}
            pulseKey={pulse?.side === "A" ? pulse.key : 0}
            isWinner={winner === "A"}
            onAdd={() => addPoint("A")}
            onRemove={() => removePoint("A")}
          />

          {/* Reloj central: mismas cajas en todas las fases, sin cambios de tamaño */}
          <section
            aria-label="Reloj del partido"
            className="flex flex-row items-center justify-between gap-2 border border-line bg-surface px-3 py-2 sm:gap-4 sm:px-6 sm:py-6 lg:flex-col lg:items-center lg:justify-center lg:px-10"
          >
            <div className="flex min-w-0 flex-col items-start gap-0.5 lg:items-center">
              <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted sm:text-xs">
                <span className="sm:hidden">Tiempo</span>
                <span className="hidden sm:inline">Tiempo restante</span>
              </p>
              {/* Móvil: una sola línea compacta para ahorrar alto */}
              <p
                aria-label={`Tiempo restante: ${clock.m} minutos ${clock.s} segundos`}
                className="font-display text-3xl leading-none tabular-nums sm:hidden"
              >
                {clock.m}:{clock.s}
              </p>
              {/* sm+: cajas Min/Seg originales */}
              <div className="hidden items-center gap-2 sm:flex">
                <label className="flex flex-col items-center gap-1">
                  <span className="text-[11px] uppercase tracking-widest text-muted">
                    Min
                  </span>
                  <input
                    value={clock.m}
                    readOnly
                    tabIndex={-1}
                    aria-label="Minutos restantes"
                    className="w-24 cursor-default border border-line bg-background px-2 py-2 text-center font-display text-4xl tabular-nums outline-none sm:w-28 sm:text-5xl"
                  />
                </label>
                <span aria-hidden="true" className="font-display text-4xl text-muted sm:text-5xl">
                  :
                </span>
                <label className="flex flex-col items-center gap-1">
                  <span className="text-[11px] uppercase tracking-widest text-muted">
                    Seg
                  </span>
                  <input
                    value={clock.s}
                    readOnly
                    tabIndex={-1}
                    aria-label="Segundos restantes"
                    className="w-24 cursor-default border border-line bg-background px-2 py-2 text-center font-display text-4xl tabular-nums outline-none sm:w-28 sm:text-5xl"
                  />
                </label>
              </div>
            </div>

            {/* Altura fija para 2 líneas en sm+: el texto cambia por fase sin mover nada.
                Oculto en móvil para caber en el viewport inicial. */}
            <p
              className={`hidden min-h-8 items-center justify-center text-center text-xs sm:flex ${timeUp ? "text-accent" : "text-muted"}`}
            >
              {statusText}
            </p>

            <div className="flex items-center justify-end gap-1.5 sm:flex-wrap sm:justify-center sm:gap-2">
              {!clockRunning ? (
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={phase === "idle" && idleTotal <= 0}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 bg-accent px-3 py-2 font-display text-xs uppercase tracking-widest text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-11 sm:w-36 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <PlayIcon />
                  Jugar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 bg-accent px-3 py-2 font-display text-xs uppercase tracking-widest text-white transition hover:bg-accent-strong sm:min-h-11 sm:w-36 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <PauseIcon />
                  Pausar
                </button>
              )}
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex min-h-10 items-center gap-1.5 border border-line px-3 py-2 font-display text-xs uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent sm:min-h-11 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <StopIcon />
                Detener
              </button>
            </div>
          </section>

          <PairPanel
            side="B"
            nombres={nombres.B}
            score={scores.B}
            pulsing={pulse?.side === "B"}
            pulseKey={pulse?.side === "B" ? pulse.key : 0}
            isWinner={winner === "B"}
            onAdd={() => addPoint("B")}
            onRemove={() => removePoint("B")}
          />
        </div>

        {/* Acciones secundarias */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
          <Link
            href="/dashboard/partidos"
            className="inline-flex min-h-10 items-center gap-2 border border-line px-3 py-2 font-display text-xs uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            ← Partidos
          </Link>
          <button
            type="button"
            onClick={resetScores}
            className="inline-flex min-h-10 items-center gap-2 border border-line px-3 py-2 font-display text-xs uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <ResetIcon />
            Reiniciar puntos
          </button>
          <button
            type="button"
            onClick={() => {
              setRegisterError(null);
              setConfirmOpen(true);
            }}
            disabled={!canRegister}
            title={
              canRegister
                ? "Revisar y registrar el resultado"
                : "Anota al menos un punto para registrar"
            }
            className="inline-flex min-h-10 items-center gap-2 bg-accent px-4 py-2 font-display text-xs uppercase tracking-widest text-white transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:active:scale-100 sm:min-h-11 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            <RegisterIcon />
            Registrar resultado
          </button>
        </div>
        {!canRegister && !confirmOpen && (
          <p className="mt-1 hidden text-center text-xs text-muted sm:mt-2 sm:block">
            Anota al menos un punto para poder registrar el resultado.
          </p>
        )}
      </div>

      {/* Modal de confirmación del resultado */}
      {confirmOpen && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-result-title"
            aria-describedby="confirm-result-desc"
            onClick={(e) => e.stopPropagation()}
            className="modal-card w-full max-w-md border border-line bg-surface p-6 sm:p-8"
          >
            <p className="font-display text-xs uppercase tracking-[0.25em] text-muted">
              Confirmar registro
            </p>
            <h2
              id="confirm-result-title"
              className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl"
            >
              ¿Registrar <span className="text-accent">resultado</span>?
            </h2>
            <p
              id="confirm-result-desc"
              className="mt-2 text-sm text-muted"
            >
              {modalHeadline}. Esta acción guarda el marcador y reinicia el
              partido.
            </p>

            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border border-line bg-background px-4 py-4">
              <div className="min-w-0">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
                  {tag("A")}
                </p>
                <p className="mt-1 truncate text-sm">
                  {nombres.A[0]} y {nombres.A[1]}
                </p>
                <p className="mt-2 font-display text-5xl tabular-nums">
                  {scores.A}
                </p>
              </div>
              <p
                aria-hidden="true"
                className="font-display text-2xl text-muted"
              >
                –
              </p>
              <div className="min-w-0 text-right">
                <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
                  {tag("B")}
                </p>
                <p className="mt-1 truncate text-sm">
                  {nombres.B[0]} y {nombres.B[1]}
                </p>
                <p className="mt-2 font-display text-5xl tabular-nums">
                  {scores.B}
                </p>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-muted">
              Meta: {winPoints} puntos · Duración configurada:{" "}
              {Math.floor(durationSec / 60)}:
              {String(durationSec % 60).padStart(2, "0")}
            </p>
            {registerError && (
              <p role="alert" className="mt-3 text-center text-sm text-accent">
                {registerError}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="inline-flex min-h-11 items-center justify-center border border-line px-5 py-2.5 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent"
              >
                Cancelar
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirmRegister}
                className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-5 py-2.5 font-display text-sm uppercase tracking-widest text-white transition hover:bg-accent-strong active:scale-[0.98]"
              >
                <CheckIcon />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de éxito: el marcador quedó registrado */}
      <div aria-live="polite">
        {registered && (
          <div
            key={registered.key}
            className="registered-toast fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 border border-accent/60 bg-surface px-5 py-4 shadow-[0_0_40px_rgba(255,77,61,0.35)]"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="registered-check flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white"
              >
                <CheckIcon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base uppercase tracking-wide text-accent">
                  ¡Resultado registrado!
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {registeredWinner === "tie"
                    ? `Empate ${registered.a} – ${registered.b}: punto de oro.`
                    : registeredWinner
                      ? `Gana ${tag(registeredWinner)} ${registered.a} – ${registered.b}.`
                      : `Marcador ${registered.a} – ${registered.b} guardado.`}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Marcador reiniciado — listo para el siguiente partido.
                </p>
                <Link
                  href="/dashboard/partidos"
                  className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  Volver a partidos
                  <span aria-hidden="true">→</span>
                </Link>
                <span
                  aria-hidden="true"
                  className="registered-bar mt-3 block h-1 w-full overflow-hidden bg-line"
                />
              </div>
              <button
                type="button"
                onClick={() => setRegistered(null)}
                aria-label="Cerrar aviso de registro"
                className="shrink-0 p-1 text-muted transition hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Efectos: pulse al anotar, entrada del modal y aviso de registro */}
      <style>{`
        @keyframes score-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes score-glow {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 61, 0.55); border-color: rgba(255, 77, 61, 0.9); }
          100% { box-shadow: 0 0 0 22px rgba(255, 77, 61, 0); }
        }
        @keyframes score-digit {
          0% { transform: scale(0.82); color: #ff4d3d; }
          100% { transform: scale(1); }
        }
        @keyframes modal-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-card-in {
          0% { opacity: 0; transform: translateY(14px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-in {
          0% { opacity: 0; transform: translate(-50%, 16px) scale(0.97); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes check-pop {
          0% { transform: scale(0.4); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes toast-bar {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .pair-pulsing {
          animation: score-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1), score-glow 0.65s ease-out;
          border-color: rgba(255, 77, 61, 0.9);
        }
        .score-digit-pop {
          display: inline-block;
          animation: score-digit 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .modal-backdrop { animation: modal-backdrop-in 0.2s ease-out; }
        .modal-card {
          animation: modal-card-in 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 50px rgba(255, 77, 61, 0.25);
        }
        .registered-toast { animation: toast-in 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
        .registered-check { animation: check-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
        .registered-bar { position: relative; }
        .registered-bar::after {
          content: "";
          position: absolute;
          inset: 0;
          background: #ff4d3d;
          animation: toast-bar 6s linear forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .pair-pulsing, .score-digit-pop, .modal-backdrop, .modal-card,
          .registered-toast, .registered-check, .registered-bar::after { animation: none; }
        }
      `}</style>
    </div>
  );
}

function PairPanel({
  side,
  nombres,
  score,
  pulsing,
  pulseKey,
  isWinner,
  onAdd,
  onRemove,
}: {
  side: Side;
  nombres: [string, string];
  score: number;
  pulsing: boolean;
  pulseKey: number;
  isWinner: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const tagName = tag(side);
  const accentSide = side === "A" ? "border-l-4 border-l-accent" : "border-r-4 border-r-accent lg:text-right";

  return (
    <section
      aria-label={tagName}
      className={`flex flex-col border bg-surface p-3 transition-colors sm:p-8 lg:p-8 ${
        pulsing ? "pair-pulsing border-line" : "border-line"
      } ${isWinner ? "border-accent/60" : ""} ${accentSide}`}
    >
      <div className={`flex items-center justify-between gap-3 ${side === "B" ? "lg:flex-row-reverse" : ""}`}>
        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted sm:text-xs">
          {tagName}
        </p>
        {isWinner && (
          <span className="bg-accent px-2 py-0.5 font-display text-[11px] uppercase tracking-widest text-white">
            Ganador
          </span>
        )}
      </div>

      {/* Móvil: fila compacta [marcador | jugadores | botones] para caber en 100dvh.
          lg: vuelve al diseño vertical original centrado. */}
      <div className="mt-1.5 flex items-center gap-3 sm:mt-3 lg:mt-0 lg:flex-col lg:gap-0">
        <p
          aria-live="polite"
          aria-label={`Puntos de ${tagName}: ${score}`}
          className="countdown-num min-w-14 text-center font-display text-6xl leading-none tabular-nums sm:text-8xl lg:mb-0 lg:mt-6 lg:min-w-0 lg:text-9xl"
        >
          <span key={`${side}-${score}-${pulseKey}`} className={pulsing ? "score-digit-pop" : undefined}>
            {score}
          </span>
        </p>

        <div className="min-w-0 flex-1 lg:mt-2 lg:flex lg:flex-col lg:items-center">
          <ul className="space-y-0 truncate sm:space-y-1 lg:text-center">
            {nombres.map((player) => (
              <li
                key={player}
                className="truncate font-display text-sm uppercase tracking-wide sm:text-xl lg:text-2xl"
              >
                {player}
              </li>
            ))}
          </ul>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-muted sm:text-xs lg:mt-2 lg:text-center">
            Puntos
          </p>
        </div>

        <div className="grid w-28 shrink-0 grid-cols-1 gap-1.5 sm:gap-2 lg:mt-6 lg:w-full">
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Sumar un punto a ${tagName}`}
            className="min-h-11 bg-accent font-display text-base uppercase tracking-widest text-white transition hover:bg-accent-strong active:scale-[0.98] sm:text-2xl lg:min-h-16"
          >
            + 1
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={score <= 0}
            aria-label={`Restar un punto a ${tagName}`}
            className="min-h-8 border border-line font-display text-sm uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-foreground sm:text-lg lg:min-h-12"
          >
            − 1
          </button>
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M3 1.8v10.4L12.2 7 3 1.8Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2" width="3.2" height="10" />
      <rect x="8.3" y="2" width="3.2" height="10" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="9" height="9" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 7A5 5 0 1 1 7 2c1.9 0 3.5 1 4.4 2.5" strokeLinecap="round" />
      <path d="M11.7 1.5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 1.5v11M1.5 7h11" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M2.5 8.5 6.5 12.5 13.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
