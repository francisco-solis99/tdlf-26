"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Solo UI: sin auth ni DB. Simulamos envío para mostrar el estado de carga.
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setTimeout(() => setPending(false), 1200);
  }

  return (
    <Card className="relative w-full overflow-hidden rounded-xl shadow-[0_0_60px_rgba(255,77,61,0.12)]">
      {/* franja superior estilo marcador */}
      <div aria-hidden="true" className="flex h-1.5 w-full">
        <span className="h-full w-2/3 bg-accent" />
        <span className="h-full w-1/6 bg-foreground/80" />
        <span className="h-full flex-1 bg-line" />
      </div>

      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/85">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rotate-45 bg-accent" />
            Acceso staff
          </p>
          <p className="font-display text-[11px] uppercase tracking-[0.25em] text-muted">
            / Entrar
          </p>
        </div>
        <CardTitle className="pt-4">
          Entrar al sistema del<span className="text-accent">torneo</span>
        </CardTitle>
        <CardDescription>
          Zona operativa del TDLF·26. Solo usuarios con cuenta.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="username">Usuario</Label>
            <div className="relative">
              <User
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="p. ej. juez_cancha3"
                required
                minLength={3}
                disabled={pending}
                className="rounded-xl pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={pending}
                className="rounded-xl pl-10 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={pending}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Eye aria-hidden="true" className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-xl"
            size="lg"
          >
            {pending ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" />
                Entrando…
              </>
            ) : (
              <>
                Entrar
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            <span className="h-px flex-1 bg-line" />
          </div>

          <p className="text-center text-xs leading-relaxed text-muted">
            Solo UI — sin autenticación todavía.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
