"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface WrappedCardSpec {
  id: string;
  node: ReactNode;
  /** La tarjeta usa todo el ancho (p. ej. el footer de cierre). */
  fullBleed?: boolean;
}

interface WrappedShellProps {
  cards: WrappedCardSpec[];
  categoriaNombre: string;
  color: string;
}

/**
 * Contenedor genérico de historia: snap por proximidad (nunca atrapa),
 * avance por desplazamiento nativo + teclado + chevrón visible, barra de
 * progreso e insignia persistente. Reutilizable para las páginas por pareja.
 */
export function WrappedShell({
  cards,
  categoriaNombre,
  color,
}: WrappedShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const total = cards.length;

  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor) return;
    let raf = 0;
    const alDesplazar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hijos = [...contenedor.querySelectorAll("[data-card]")];
        let mejor = 0;
        let mejorDist = Infinity;
        const arriba = contenedor.getBoundingClientRect().top;
        hijos.forEach((h, i) => {
          const d = Math.abs(h.getBoundingClientRect().top - arriba);
          if (d < mejorDist) {
            mejorDist = d;
            mejor = i;
          }
        });
        setIndice(mejor);
      });
    };
    contenedor.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      contenedor.removeEventListener("scroll", alDesplazar);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irA = (i: number) => {
    const contenedor = ref.current;
    if (!contenedor) return;
    const destino = contenedor.querySelector(
      `[data-card="${cards[i]?.id}"]`,
    );
    if (!(destino instanceof HTMLElement)) return;
    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Desplaza el contenedor, no la ventana: las tarjetas pueden crecer.
    contenedor.scrollTo({
      top: destino.offsetTop,
      behavior: reducido ? "auto" : "smooth",
    });
    destino.focus({ preventScroll: true });
    setIndice(i);
  };

  useEffect(() => {
    const alTeclar = (e: KeyboardEvent) => {
      if (
        e.key !== "ArrowDown" &&
        e.key !== "ArrowUp" &&
        e.key !== " " &&
        e.key !== "PageDown" &&
        e.key !== "PageUp" &&
        e.key !== "Home" &&
        e.key !== "End"
      ) {
        return;
      }
      const contenedor = ref.current;
      if (!contenedor) return;
      const rect = contenedor.getBoundingClientRect();
      const enVista =
        rect.top < window.innerHeight && rect.bottom > 0;
      if (!enVista) return;
      e.preventDefault();
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        irA(Math.min(indice + 1, total - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        irA(Math.max(indice - 1, 0));
      } else if (e.key === "Home") {
        irA(0);
      } else {
        irA(total - 1);
      }
    };
    window.addEventListener("keydown", alTeclar);
    return () => window.removeEventListener("keydown", alTeclar);
  });

  return (
    <div className="relative">
      {/* Profundidad: auras fijas por categoría, expresivas pero contenidas.
          Estáticas (sin costo de movimiento) y no interactivas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(55vmax 55vmax at 88% -8%, ${color}38, transparent 70%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(40vmax 40vmax at 8% 108%, rgba(42,47,58,0.55), transparent 70%)",
        }}
      />
      {/* Barra superior persistente */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 pl-16 pr-4 pt-4 sm:max-w-3xl">
          <span
            className="rounded-full border border-line bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur"
            style={{ color }}
          >
            Fase de grupos
          </span>
          <span className="text-xs text-muted">
            {categoriaNombre} · {indice + 1}/{total}
          </span>
        </div>
        <div
          className="mx-auto mt-2 h-1 w-full max-w-xl overflow-hidden rounded-full bg-surface px-4 sm:max-w-3xl"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={indice + 1}
          aria-label="Progreso de la historia"
        >
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${((indice + 1) / total) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <div ref={ref} className="wrapped-shell">
        {cards.map((card, i) => (
          <section
            key={card.id}
            data-card={card.id}
            tabIndex={-1}
            aria-label={`Tarjeta ${i + 1} de ${total}`}
            className={
              card.fullBleed
                ? "wrapped-card wrapped-card-fullbleed w-full px-0 outline-none"
                : "wrapped-card mx-auto w-full max-w-xl outline-none sm:max-w-3xl"
            }
          >
            {card.node}
          </section>
        ))}
      </div>

      {/* Control vertical de tarjetas */}
      <nav
        aria-label="Ir a tarjeta"
        className="fixed right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2.5 rounded-full border bg-background/85 px-2 py-3 backdrop-blur sm:right-6"
        style={{ borderColor: "rgba(255,255,255,0.14)" }}
      >
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => irA(i)}
            aria-label={`Ir a la tarjeta ${i + 1}`}
            aria-current={i === indice ? "true" : undefined}
            className="h-2.5 w-2.5 cursor-pointer rounded-full transition-all"
            style={
              i === indice
                ? {
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                    transform: "scale(1.25)",
                  }
                : { backgroundColor: "rgba(155,155,150,0.5)" }
            }
          />
        ))}
      </nav>

      {/* Chevrón visible para avanzar */}
      {indice < total - 1 && (
        <button
          type="button"
          onClick={() => irA(indice + 1)}
          aria-label="Siguiente tarjeta"
          className="fixed inset-x-0 bottom-4 z-10 mx-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border bg-background/80 text-2xl leading-none backdrop-blur transition-colors hover:text-foreground"
          style={{ color, borderColor: "rgba(255,255,255,0.14)" }}
        >
          <span aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}
