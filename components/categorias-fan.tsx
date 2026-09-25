"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

export type FanCategoria = {
  slug: string;
  nombre: string;
  descripcion: string;
  grupos: number;
  parejas: number;
  jugadores: number;
};

// Posición del fan superpuesto (solo desktop): desplazamiento + rotación.
// El overlap se logra con transform (GPU), así abrir/cerrar el fan anima suave.
const FAN = [
  { x: "72px", rot: "-6deg" },
  { x: "0px", rot: "0deg" },
  { x: "-72px", rot: "6deg" },
] as const;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export function CategoriasFan({
  categorias,
}: {
  categorias: FanCategoria[];
}) {
  const cats = categorias.map((c) => ({
    ...c,
    tagline: c.descripcion,
    ...(PRESENTACION[c.slug] ?? PRESENTACION_FALLBACK),
  }));
  const [selected, setSelected] = useState(cats[0]?.slug ?? "");
  const [hovered, setHovered] = useState<string | null>(null);
  const desktop = useMediaQuery("(min-width: 640px)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const active = cats.find((c) => c.slug === selected) ?? cats[0];
  // El fan solo anima en desktop con movimiento permitido; si no, cartas quietas.
  const animate = desktop && !reduceMotion;
  const fanning = animate && hovered !== null;

  if (cats.length === 0) {
    return (
      <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-muted">
        Las categorías están por publicarse. Vuelve pronto.
      </p>
    );
  }

  return (
    <div>
      {/* Fan superpuesto en desktop (gap constante, overlap con transform);
          stack separado en móvil */}
      <div
        role="group"
        aria-label="Categorías del torneo"
        className="grid gap-4 sm:flex sm:items-stretch sm:justify-center sm:gap-5"
      >
        {cats.map((cat, i) => {
          const Icon = cat.icono;
          const isActive = cat.slug === selected;
          const isHovered = hovered === cat.slug;
          const fan = FAN[i % FAN.length];
          // Sin hover: fan cerrado (overlap). Con hover en una carta: todas se
          // enderezan y separan, la activa se eleva. Todo vía transform.
          const transform = !animate
            ? undefined
            : fanning
              ? isHovered
                ? "translateY(-8px)"
                : "none"
              : `translateX(${fan.x}) rotate(${fan.rot})${isActive ? " translateY(-8px)" : ""}`;
          const zIndex = !animate
            ? undefined
            : fanning
              ? isHovered
                ? 20
                : 1
              : i === 1
                ? 10
                : 1;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelected(cat.slug)}
              onMouseEnter={() => setHovered(cat.slug)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(cat.slug)}
              onBlur={() => setHovered(null)}
              aria-pressed={isActive}
              aria-label={`Seleccionar categoría ${cat.nombre}`}
              className={cn(
                "group relative w-full cursor-pointer rounded-xl border bg-surface text-left outline-none transition-[transform,opacity] duration-500 ease-out will-change-transform focus-visible:ring-2 focus-visible:ring-[var(--cat)]",
                "border-line sm:w-60 sm:shrink-0 lg:w-64",
                isActive || isHovered ? "opacity-100" : "opacity-80",
              )}
              // CSS var por carta para el anillo de foco
              style={{ "--cat": cat.color, transform, zIndex } as CSSProperties}
            >
              <span
                aria-hidden="true"
                className="block overflow-hidden rounded-t-[10px] border-b border-line transition-colors"
                style={{
                  backgroundColor: cat.colorSoft,
                  borderTop: `3px solid ${cat.color}`,
                }}
              >
                <span className="flex h-36 items-center justify-center sm:h-44">
                  <Icon
                    className="h-16 w-16 transition-transform duration-500 ease-out group-hover:scale-105 sm:h-20 sm:w-20"
                    style={{ color: cat.color }}
                    strokeWidth={1.5}
                  />
                </span>
              </span>
              <span className="block p-5">
                <span
                  className="font-display text-xl uppercase tracking-wide sm:text-2xl"
                  style={isActive ? { color: cat.color } : undefined}
                >
                  {cat.nombre}
                </span>
                <span className="mt-1.5 block min-h-10 text-sm leading-snug text-muted">
                  {cat.tagline}
                </span>
                <span
                  className="mt-3 block text-[11px] font-medium uppercase tracking-[0.22em] transition-colors"
                  style={{ color: isActive ? cat.color : undefined }}
                >
                  {isActive ? "● Seleccionada" : "Ver info"}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="block h-1 rounded-b-[10px] transition-opacity"
                style={{
                  backgroundColor: cat.color,
                  opacity: isActive ? 1 : 0.35,
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl border-2 transition-opacity"
                style={{
                  borderColor: cat.color,
                  opacity: isActive ? 1 : 0,
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Panel de la categoría seleccionada */}
      {active && (
        <Card
          key={active.slug}
          className="mx-auto mt-8 w-full max-w-2xl rounded-xl p-6 sm:p-8"
        >
          <p
            className="text-[11px] font-medium uppercase tracking-[0.25em]"
            style={{ color: active.color }}
          >
            {active.nombre}
          </p>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
            {active.nombre} <span style={{ color: active.color }}>·26</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {active.descripcion}
          </p>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Grupos", value: active.grupos },
              { label: "Parejas", value: active.parejas },
              { label: "Jugadores", value: active.jugadores },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-line bg-background px-3 py-4 text-center"
              >
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">
                  {stat.label}
                </dt>
                <dd className="countdown-num mt-1 font-display text-3xl tabular-nums sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            asChild
            size="lg"
            className="mt-6 w-full rounded-xl sm:w-auto"
          >
            <Link href={`/categorias/${active.slug}`}>
              Abrir categoría {active.nombre}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted">
            Grupos, parejas y resultados en vivo durante el torneo.
          </p>
        </Card>
      )}
    </div>
  );
}
