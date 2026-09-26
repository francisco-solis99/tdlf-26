"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Client-side pager for the admin tables: slices already-loaded rows,
// so search/filter keep working unchanged. Hidden when all rows fit.
export function Paginacion({
  pagina,
  totalPaginas,
  desde,
  hasta,
  total,
  onChange,
}: {
  pagina: number;
  totalPaginas: number;
  desde: number;
  hasta: number;
  total: number;
  onChange: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  // Compact page list: 1 … window … n (window = current ± 1).
  const ventana: number[] = [];
  for (let p = pagina - 1; p <= pagina + 1; p++) {
    if (p > 1 && p < totalPaginas) ventana.push(p);
  }
  const items: (number | "…")[] = [1];
  if (ventana.length > 0 && ventana[0] > 2) items.push("…");
  items.push(...ventana);
  if (
    ventana.length > 0 &&
    ventana[ventana.length - 1] < totalPaginas - 1
  )
    items.push("…");
  if (totalPaginas > 1) items.push(totalPaginas);

  return (
    <nav
      aria-label="Paginación"
      className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-muted">
        Mostrando{" "}
        <span className="countdown-num font-medium tabular-nums text-foreground">
          {desde}–{hasta}
        </span>{" "}
        de{" "}
        <span className="countdown-num font-medium tabular-nums text-foreground">
          {total}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Página anterior"
          aria-label="Página anterior"
          disabled={pagina <= 1}
          onClick={() => onChange(pagina - 1)}
          className="rounded-xl"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        {items.map((p, i) =>
          p === "…" ? (
            <span
              key={`e${i}`}
              aria-hidden="true"
              className="px-1 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Página ${p}`}
              aria-current={p === pagina ? "page" : undefined}
              onClick={() => onChange(p)}
              className={cn(
                "countdown-num rounded-xl tabular-nums",
                p === pagina && "bg-white/[0.07] font-semibold text-foreground",
              )}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Página siguiente"
          aria-label="Página siguiente"
          disabled={pagina >= totalPaginas}
          onClick={() => onChange(pagina + 1)}
          className="rounded-xl"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
