import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "No encontrado — Torneo de las Fresas 2026",
  description: "Esta página se salió de la cancha.",
};

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* fondo editorial */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-140 w-170 max-w-[140vw] -translate-x-1/2 -translate-y-1/2">
          <div
            className="halftone-blob absolute inset-0 opacity-[0.16]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
            }}
          />
        </div>
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[38vw] uppercase leading-none tracking-tight text-transparent sm:text-[26vw] [-webkit-text-stroke:2px_var(--accent)] opacity-20">
          404
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-foreground/85">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rotate-45 bg-accent"
          />
          Error 404
        </p>
        <h1 className="mt-5 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Fuera de <span className="text-accent">la cancha</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Esta página se voló la barda. La ruta no existe o se movió a otro
          lado del torneo.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl"
          >
            <Link href="/categorias">Ver categorías</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">
          TDLF26 · Irapuato
        </p>
      </div>
    </main>
  );
}
