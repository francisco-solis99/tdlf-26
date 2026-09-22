"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listCategorias } from "@/config/categorias";
import { cn } from "@/lib/utils";

export function CategoriasFan() {
  const cats = listCategorias();
  const [selected, setSelected] = useState(cats[0]?.slug ?? "libre");
  const active = cats.find((c) => c.slug === selected) ?? cats[0];

  return (
    <div>
      {/* Cartas separadas con gap: stack en móvil, grilla de 3 en desktop */}
      <div
        role="group"
        aria-label="Categorías del torneo"
        className="grid gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6"
      >
        {cats.map((cat) => {
          const Icon = cat.icono;
          const isActive = cat.slug === selected;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelected(cat.slug)}
              aria-pressed={isActive}
              aria-label={`Seleccionar categoría ${cat.nombre}`}
              className={cn(
                "group relative w-full cursor-pointer rounded-xl border bg-surface text-left outline-none transition-transform duration-500 ease-out will-change-transform focus-visible:ring-2 focus-visible:ring-[var(--cat)]",
                "border-line",
                // hover/foco: elevación sutil, sin escala para evitar saltos
                "motion-safe:hover:-translate-y-2 motion-safe:focus-visible:-translate-y-2",
                isActive && "motion-safe:-translate-y-2",
              )}
              // CSS var por carta para el anillo de foco
              style={{ "--cat": cat.color } as CSSProperties}
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
            Datos de ejemplo — se leerán de la base de datos.
          </p>
        </Card>
      )}
    </div>
  );
}
