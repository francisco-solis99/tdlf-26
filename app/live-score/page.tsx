"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DEFAULT_MINUTES = 20;
const DEFAULT_SECONDS = 0;
const DEFAULT_WIN_POINTS = 10;

type Side = "A" | "B";
type Phase = "idle" | "running" | "paused";

const PAIRS: Record<
  Side,
  { tag: string; players: [string, string] }
> = {
  A: {
    tag: "Pareja A",
    players: ["Carlos Mendoza", "Luis Torres"],
  },
  B: {
    tag: "Pareja B",
    players: ["Jorge Ramírez", "Miguel Soto"],
  },
};

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

export default function LiveScorePage() {
  const [scores, setScores] = useState<Record<Side, number>>({ A: 0, B: 0 });
  const [pulse, setPulse] = useState<{ side: Side; key: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  function handleConfirmRegister() {
    const snapshot = { a: scores.A, b: scores.B, key: Date.now() };
    setConfirmOpen(false);
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
      ? `Gana ${PAIRS[winner].tag} ${scores.A} – ${scores.B}`
      : winner === "tie"
        ? `Empate a ${scores.A} — punto de oro`
        : modalLeader === "tie"
          ? `Empate parcial ${scores.A} – ${scores.B}`
          : `Va ganando ${PAIRS[modalLeader].tag} ${scores.A} – ${scores.B}`;

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
    <main className="grain relative flex min-h-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Volver al inicio
          </Link>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
            Marcador en vivo
          </p>
        </div>

        <h1 className="mt-4 text-center font-display text-3xl uppercase tracking-wide sm:text-5xl">
          Partido <span className="text-accent">en juego</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Gana la pareja que llegue a {winPoints} puntos o tenga ventaja al
          terminar el tiempo.
        </p>

        {/* Configuración del partido: editable solo antes de iniciar */}
        <section
          aria-label="Configuración del partido"
          className="mt-6 border border-line bg-surface px-4 py-4 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs uppercase tracking-[0.2em] text-muted">
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
                className="w-16 border border-line bg-background px-2 py-1.5 text-center font-display text-2xl tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60"
              />
              <span aria-hidden="true" className="font-display text-2xl text-muted">
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
                className="w-16 border border-line bg-background px-2 py-1.5 text-center font-display text-2xl tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs uppercase tracking-[0.2em] text-muted">
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
                className="w-16 border border-line bg-background px-2 py-1.5 text-center font-display text-2xl tabular-nums outline-none focus:border-accent read-only:cursor-not-allowed read-only:opacity-60"
              />
            </div>
          </div>
          <p className="mt-3 min-h-4 text-center text-xs text-muted">
            {locked
              ? "Bloqueado durante el partido (en juego o en pausa)."
              : "Editable antes de iniciar el partido."}
          </p>
        </section>

        {/* Banner visual de fin de partido (solo UI, sin lógica de registro) */}
        <div aria-live="polite" className="mt-6 min-h-14">
          {winner !== null && (
            <div className="border border-accent/50 bg-accent/10 px-4 py-3 text-center">
              <p className="font-display text-lg uppercase tracking-wide text-accent sm:text-xl">
                {winner === "tie"
                  ? `Empate a ${winPoints} — punto de oro`
                  : `¡Partido terminado! Gana ${PAIRS[winner].tag}`}
              </p>
              <p className="mt-1 text-sm text-muted">
                {winner === "tie"
                  ? "El siguiente punto define al ganador."
                  : `${PAIRS[winner].players[0]} y ${PAIRS[winner].players[1]} llegan a ${winPoints} puntos.`}
              </p>
            </div>
          )}
        </div>

        {/* Cancha: dos lados + reloj al centro */}
        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <PairPanel
            side="A"
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
            className="flex flex-col items-center justify-center gap-4 border border-line bg-surface px-6 py-6 sm:px-10"
          >
            <p className="font-display text-xs uppercase tracking-[0.25em] text-muted">
              Tiempo restante
            </p>

            <div className="flex items-center gap-2">
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

            {/* Altura fija para 2 líneas: el texto cambia por fase sin mover nada */}
            <p
              className={`flex min-h-8 items-center justify-center text-center text-xs ${timeUp ? "text-accent" : "text-muted"}`}
            >
              {statusText}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {!clockRunning ? (
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={phase === "idle" && idleTotal <= 0}
                  className="inline-flex min-h-11 w-36 items-center justify-center gap-2 bg-accent px-5 py-2.5 font-display text-sm uppercase tracking-widest text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlayIcon />
                  Jugar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="inline-flex min-h-11 w-36 items-center justify-center gap-2 bg-accent px-5 py-2.5 font-display text-sm uppercase tracking-widest text-white transition hover:bg-accent-strong"
                >
                  <PauseIcon />
                  Pausar
                </button>
              )}
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex min-h-11 items-center gap-2 border border-line px-5 py-2.5 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent"
              >
                <StopIcon />
                Detener
              </button>
            </div>
          </section>

          <PairPanel
            side="B"
            score={scores.B}
            pulsing={pulse?.side === "B"}
            pulseKey={pulse?.side === "B" ? pulse.key : 0}
            isWinner={winner === "B"}
            onAdd={() => addPoint("B")}
            onRemove={() => removePoint("B")}
          />
        </div>

        {/* Acciones secundarias */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetScores}
            className="inline-flex min-h-11 items-center gap-2 border border-line px-5 py-2.5 font-display text-sm uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent"
          >
            <ResetIcon />
            Reiniciar puntos
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!canRegister}
            title={
              canRegister
                ? "Revisar y registrar el resultado"
                : "Anota al menos un punto para registrar"
            }
            className="inline-flex min-h-11 items-center gap-2 bg-accent px-6 py-2.5 font-display text-sm uppercase tracking-widest text-white transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:active:scale-100"
          >
            <RegisterIcon />
            Registrar resultado
          </button>
        </div>
        {!canRegister && !confirmOpen && (
          <p className="mt-2 text-center text-xs text-muted">
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
                  {PAIRS.A.tag}
                </p>
                <p className="mt-1 truncate text-sm">
                  {PAIRS.A.players[0]} y {PAIRS.A.players[1]}
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
                  {PAIRS.B.tag}
                </p>
                <p className="mt-1 truncate text-sm">
                  {PAIRS.B.players[0]} y {PAIRS.B.players[1]}
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
                      ? `Gana ${PAIRS[registeredWinner].tag} ${registered.a} – ${registered.b}.`
                      : `Marcador ${registered.a} – ${registered.b} guardado.`}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Marcador reiniciado — listo para el siguiente partido.
                </p>
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
    </main>
  );
}

function PairPanel({
  side,
  score,
  pulsing,
  pulseKey,
  isWinner,
  onAdd,
  onRemove,
}: {
  side: Side;
  score: number;
  pulsing: boolean;
  pulseKey: number;
  isWinner: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const pair = PAIRS[side];
  const accentSide = side === "A" ? "border-l-4 border-l-accent" : "border-r-4 border-r-accent lg:text-right";

  return (
    <section
      aria-label={pair.tag}
      className={`flex flex-col border bg-surface p-6 transition-colors sm:p-8 ${
        pulsing ? "pair-pulsing border-line" : "border-line"
      } ${isWinner ? "border-accent/60" : ""} ${accentSide}`}
    >
      <div className={`flex items-center justify-between gap-3 ${side === "B" ? "lg:flex-row-reverse" : ""}`}>
        <p className="font-display text-xs uppercase tracking-[0.25em] text-muted">
          {pair.tag}
        </p>
        {isWinner && (
          <span className="bg-accent px-2 py-0.5 font-display text-[11px] uppercase tracking-widest text-white">
            Ganador
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-1">
        {pair.players.map((player) => (
          <li
            key={player}
            className="font-display text-xl uppercase tracking-wide sm:text-2xl"
          >
            {player}
          </li>
        ))}
      </ul>

      <p
        aria-live="polite"
        aria-label={`Puntos de ${pair.tag}: ${score}`}
        className="countdown-num mt-6 text-center font-display text-8xl leading-none tabular-nums sm:text-9xl"
      >
        <span key={`${side}-${score}-${pulseKey}`} className={pulsing ? "score-digit-pop" : undefined}>
          {score}
        </span>
      </p>
      <p className="mt-2 text-center text-xs uppercase tracking-[0.25em] text-muted">
        Puntos
      </p>

      <div className="mt-6 grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Sumar un punto a ${pair.tag}`}
          className="min-h-16 bg-accent font-display text-2xl uppercase tracking-widest text-white transition hover:bg-accent-strong active:scale-[0.98]"
        >
          + 1 punto
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={score <= 0}
          aria-label={`Restar un punto a ${pair.tag}`}
          className="min-h-12 border border-line font-display text-lg uppercase tracking-widest text-foreground transition hover:border-accent hover:text-accent active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line disabled:hover:text-foreground"
        >
          − 1 punto
        </button>
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
