"use client";

import { useSyncExternalStore } from "react";

const TARGET = new Date("2026-09-27T08:00:00-06:00").getTime();

type Parts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  done: boolean;
};

const PAD = (n: number) => String(n).padStart(2, "0");

function diffFromNow(): Parts {
  const delta = TARGET - Date.now();
  if (delta <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", done: true };
  }
  return {
    days: PAD(Math.floor(delta / 86_400_000)),
    hours: PAD(Math.floor(delta / 3_600_000) % 24),
    minutes: PAD(Math.floor(delta / 60_000) % 60),
    seconds: PAD(Math.floor(delta / 1_000) % 60),
    done: false,
  };
}

const PLACEHOLDER: Parts = {
  days: "--",
  hours: "--",
  minutes: "--",
  seconds: "--",
  done: false,
};

// Cache keyed by wall-clock second so getSnapshot stays referentially
// stable between ticks (required by useSyncExternalStore).
let cachedSecond = -1;
let cachedParts = PLACEHOLDER;

function getSnapshot(): Parts {
  const second = Math.floor(Date.now() / 1_000);
  if (second !== cachedSecond) {
    cachedSecond = second;
    cachedParts = diffFromNow();
  }
  return cachedParts;
}

function getServerSnapshot(): Parts {
  return PLACEHOLDER;
}

function subscribe(onChange: () => void) {
  // Poll faster than 1s so digit flips stay close to real second bounds.
  const id = setInterval(onChange, 250);
  return () => clearInterval(id);
}

const UNITS = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Seg" },
] as const;

export function Countdown() {
  const parts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (parts.done) {
    return (
      <p
        role="timer"
        aria-label="Cuenta regresiva para el torneo"
        className="font-display text-4xl uppercase text-accent sm:text-6xl"
      >
        ¡Es hoy!
      </p>
    );
  }

  return (
    <div
      role="timer"
      aria-label="Cuenta regresiva para el torneo"
      className="grid w-fit max-w-full grid-cols-4 gap-px border border-line bg-line"
    >
      {UNITS.map(({ key, label }) => (
        <div key={key} className="bg-background/80 px-3 py-3 sm:px-5 sm:py-4">
          <div className="countdown-num font-display text-4xl leading-none text-foreground sm:text-6xl">
            {parts[key]}
          </div>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
