"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colapsado, setColapsado] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Cierra el drawer con Escape
  useEffect(() => {
    if (!drawer) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Menú lateral desktop (15%) */}
      <aside
        aria-label="Menú lateral"
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 border-r border-line transition-[width] duration-300 ease-out motion-reduce:transition-none lg:block",
          colapsado ? "w-20" : "w-[15%] min-w-56",
        )}
      >
        <Sidebar
          colapsado={colapsado}
          onToggleColapso={() => setColapsado((v) => !v)}
        />
      </aside>

      {/* Columna derecha (85%) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top-bar solo móvil */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-background/85 px-4 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Abrir menú"
            aria-expanded={drawer}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-muted transition-colors hover:text-foreground"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
          <p className="font-display text-lg uppercase tracking-wide">
            TDLF<span className="text-accent">·26</span>
          </p>
          <p className="ml-auto text-[11px] uppercase tracking-[0.2em] text-muted">
            Panel
          </p>
        </div>

        <main className="grain relative flex-1 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>

      {/* Drawer móvil */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/70"
          />
          <aside
            aria-label="Menú del panel"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line"
          >
            <Sidebar
              colapsado={false}
              onToggleColapso={() => setDrawer(false)}
              onNavegar={() => setDrawer(false)}
              mostrarCerrar
            />
          </aside>
        </div>
      )}
    </div>
  );
}
