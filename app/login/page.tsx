import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login — Torneo de las Fresas 2026",
  description: "Acceso staff del Torneo de las Fresas 2026.",
};

export default function LoginPage() {
  return (
    <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* fondo editorial */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-140 w-170 max-w-[140vw] -translate-x-1/2 -translate-y-1/2">
          <div
            className="halftone-blob absolute inset-0 opacity-[0.2]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
            }}
          />
        </div>
        <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 select-none whitespace-nowrap font-display text-[13vw] uppercase leading-none tracking-tight text-foreground/4 lg:block">
          TDLF·26
        </p>
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            ← Volver al inicio
          </Link>
          <span className="inline-flex items-center gap-2.5">
            <Image
              src="/sponsors/logo.webp"
              alt="Torneo de las Fresas"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <span className="font-display text-lg uppercase tracking-wide">
              TDLF<span className="text-accent">·26</span>
            </span>
          </span>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-muted">
          TDLF26 · Irapuato
        </p>
      </div>
    </main>
  );
}
