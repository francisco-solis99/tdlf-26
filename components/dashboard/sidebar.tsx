"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Swords,
  Trophy,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icono: LucideIcon;
};

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Inicio", icono: House },
  { href: "/dashboard/categorias", label: "Categorías", icono: Trophy },
  { href: "/dashboard/jugadores", label: "Jugadores", icono: UserRound },
  { href: "/dashboard/parejas", label: "Parejas", icono: Users },
  { href: "/dashboard/partidos", label: "Partidos", icono: Swords },
];

function isActivo(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  colapsado,
  onToggleColapso,
  onNavegar,
  mostrarCerrar = false,
}: {
  colapsado: boolean;
  onToggleColapso: () => void;
  onNavegar?: () => void;
  mostrarCerrar?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      {/* Perfil + logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-line px-4 py-4",
          colapsado && "justify-center px-2",
        )}
      >
        <Link
          href="/"
          onClick={onNavegar}
          aria-label="Volver al sitio"
          className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Image
            src="/sponsors/logo.webp"
            alt="Torneo de las Fresas"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line"
          />
        </Link>
        {!colapsado && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Admin TDLF</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Staff
            </p>
          </div>
        )}
        {mostrarCerrar && (
          <button
            type="button"
            onClick={onNavegar}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Menú del panel" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const Icon = item.icono;
            const activo = isActivo(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavegar}
                  aria-current={activo ? "page" : undefined}
                  title={colapsado ? item.label : undefined}
                  className={cn(
                    "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
                    colapsado && "justify-center px-0",
                    activo
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-muted hover:bg-white/[0.04] hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent transition-opacity",
                      activo ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                  {!colapsado && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Abajo: colapsar + salir */}
      <div className="flex flex-col gap-1 border-t border-line p-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleColapso}
          aria-expanded={!colapsado}
          aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
          title={colapsado ? "Expandir menú" : "Colapsar menú"}
          className={cn(
            "w-full justify-start rounded-xl normal-case tracking-normal",
            colapsado && "justify-center px-0",
          )}
        >
          {colapsado ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" />
              Colapsar
            </>
          )}
        </Button>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            title={colapsado ? "Salir" : undefined}
            aria-label="Cerrar sesión"
            className={cn(
              "w-full justify-start rounded-xl normal-case tracking-normal text-muted hover:text-accent",
              colapsado && "justify-center px-0",
            )}
          >
            <LogOut aria-hidden="true" />
            {!colapsado && "Salir"}
          </Button>
        </form>
      </div>
    </div>
  );
}
