"use client";

import { useEffect, useState } from "react";
import { Swords, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ResumenCategoria = {
  slug: string;
  nombre: string;
  color: string;
  colorSoft: string;
  grupos: number;
  parejas: number;
  jugadores: number;
  partidos: number;
  jugados: number;
};

export type ResumenTotales = {
  categorias: number;
  parejas: number;
  jugadores: number;
  partidos: number;
  jugados: number;
  pendientes: number;
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

// Conteo animado 0 → target con easing. Sin movimiento: valor final directo.
function useCountUp(target: number, start: boolean, duration = 1000) {
  const reduce = useReduceMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, reduce, duration]);
  return reduce ? target : val;
}

const STATS: Array<{ key: keyof ResumenTotales; label: string; icono: LucideIcon }> = [
  { key: "categorias", label: "Categorías", icono: Trophy },
  { key: "parejas", label: "Parejas", icono: Users },
  { key: "jugadores", label: "Jugadores", icono: UserRound },
  { key: "partidos", label: "Partidos", icono: Swords },
];

export function Resumen({
  totales,
  categorias,
}: {
  totales: ResumenTotales;
  categorias: ResumenCategoria[];
}) {
  const mounted = useMounted();
  const pct = totales.partidos === 0 ? 0 : Math.round((totales.jugados / totales.partidos) * 100);
  const pctAnim = useCountUp(pct, mounted, 1200);
  // Dona SVG: círculo de radio 54 → circunferencia ≈ 339.3
  const CIRC = 2 * Math.PI * 54;

  return (
    <>
      {/* Totales */}
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCard
            key={s.key}
            label={s.label}
            icono={s.icono}
            valor={totales[s.key]}
            index={i}
            mounted={mounted}
          />
        ))}
      </div>

      {/* Progreso de partidos */}
      <Card
        className={cn(
          "mt-4 rounded-xl p-6 transition-all duration-700 ease-out motion-reduce:transition-none sm:p-8",
          mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ transitionDelay: mounted ? "360ms" : "0ms" }}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <div
            role="img"
            aria-label={`${totales.jugados} de ${totales.partidos} partidos jugados (${pct} por ciento)`}
            className="relative h-36 w-36 shrink-0"
          >
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="none"
                strokeWidth="12"
                className="stroke-line"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                stroke="var(--accent)"
                strokeDasharray={`${(pctAnim / 100) * CIRC} ${CIRC}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="countdown-num font-display text-3xl tabular-nums">
                {pctAnim}%
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
                jugado
              </span>
            </div>
          </div>
          <div className="w-full min-w-0 flex-1">
            <h2 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
              Avance de partidos
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-muted">Jugados</span>
                  <CountUp
                    value={totales.jugados}
                    start={mounted}
                    className="countdown-num font-display text-2xl tabular-nums text-accent"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
                >
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                    style={{ width: mounted ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-muted">Pendientes</span>
                <CountUp
                  value={totales.pendientes}
                  start={mounted}
                  className="countdown-num font-display text-2xl tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Por categoría */}
      <h2 className="mt-10 font-display text-xl uppercase tracking-wide sm:text-2xl">
        Por categoría
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {categorias.map((cat, i) => {
          const p =
            cat.partidos === 0
              ? 0
              : Math.round((cat.jugados / cat.partidos) * 100);
          return (
            <Card
              key={cat.slug}
              className={cn(
                "overflow-hidden rounded-xl transition-all duration-700 ease-out motion-reduce:transition-none",
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: mounted ? `${440 + i * 90}ms` : "0ms" }}
            >
              <div
                aria-hidden="true"
                className="h-1.5 w-full"
                style={{ backgroundColor: cat.color }}
              />
              <div className="p-5">
                <p
                  className="font-display text-xl uppercase tracking-wide"
                  style={{ color: cat.color }}
                >
                  {cat.nombre}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Parejas", value: cat.parejas },
                    { label: "Jugad.", value: cat.jugadores },
                    { label: "Partidos", value: cat.partidos },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex flex-col rounded-xl border border-line bg-background px-1 py-3"
                    >
                      <dt className="order-2 mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
                        {s.label}
                      </dt>
                      <dd className="countdown-num order-1 font-display text-2xl tabular-nums">
                        <CountUp value={s.value} start={mounted} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-xs text-muted">
                    <span>
                      {cat.jugados} de {cat.partidos} jugados
                    </span>
                    <span className="countdown-num font-display text-sm tabular-nums">
                      <CountUp value={p} start={mounted} suffix="%" />
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${cat.nombre}: ${p} por ciento jugado`}
                    className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                      style={{
                        width: mounted ? `${p}%` : "0%",
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function StatCard({
  label,
  icono: Icon,
  valor,
  index,
  mounted,
}: {
  label: string;
  icono: LucideIcon;
  valor: number;
  index: number;
  mounted: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl p-5 transition-all duration-700 ease-out motion-reduce:transition-none",
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: mounted ? `${index * 90}ms` : "0ms" }}
    >
      {/* fondo fancy: glow + icono fantasma */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1.4px)",
            backgroundSize: "12px 12px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 100% 100%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 90% at 100% 100%, black 30%, transparent 75%)",
          }}
        />
        <Icon
          className="absolute -bottom-5 -right-5 h-24 w-24 -rotate-12 text-accent opacity-10"
          strokeWidth={1.25}
        />
      </div>
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10"
      >
        <Icon className="h-5 w-5 text-accent" />
      </span>
      <p className="countdown-num relative mt-4 font-display text-4xl tabular-nums sm:text-5xl">
        <CountUp value={valor} start={mounted} />
      </p>
      <p className="relative mt-1 text-xs uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
    </Card>
  );
}

function CountUp({
  value,
  start,
  className,
  suffix = "",
}: {
  value: number;
  start: boolean;
  className?: string;
  suffix?: string;
}) {
  const v = useCountUp(value, start);
  return (
    <span className={className}>
      {v}
      {suffix}
    </span>
  );
}
