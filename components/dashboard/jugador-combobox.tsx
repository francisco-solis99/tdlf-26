"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

function normaliza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Combobox con búsqueda y debounce (200ms): filtra mientras escribes.
// TODO(db): con base de datos, el padre pasa solo jugadores sin pareja
// (aquí llegan todos porque el seed ya está emparejado).
export function JugadorCombobox({
  id,
  value,
  options,
  onChange,
  placeholder = "Selecciona jugador…",
}: {
  id: string;
  value: string;
  options: ComboOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [activo, setActivo] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const seleccionado = options.find((o) => o.value === value);

  // Debounce del filtrado para no recalcular en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const visibles = options.filter((o) =>
    normaliza(o.label).includes(normaliza(debounced)),
  );

  function abrir() {
    setQuery("");
    setDebounced("");
    setActivo(-1);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setActivo(-1);
  }

  function elegir(v: string) {
    onChange(v);
    cerrar();
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!abierto) {
        abrir();
        return;
      }
      setActivo((i) => (i + 1) % Math.max(visibles.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (abierto) {
        setActivo((i) =>
          i <= 0 ? visibles.length - 1 : i - 1,
        );
      }
    } else if (e.key === "Enter") {
      if (abierto && visibles[activo] && !visibles[activo].disabled) {
        e.preventDefault();
        elegir(visibles[activo].value);
      }
    } else if (e.key === "Escape") {
      cerrar();
    }
  }

  return (
    // Al abrirse sube sobre los campos siguientes del modal.
    <div className={cn("relative", abierto && "z-30")}>
      {abierto && (
        <div
          aria-hidden="true"
          onClick={cerrar}
          className="fixed inset-0 z-10 cursor-default"
        />
      )}
      <div className="relative z-20">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          type="text"
          autoComplete="off"
          placeholder={seleccionado?.label ?? placeholder}
          value={abierto ? query : (seleccionado?.label ?? "")}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!abierto) abrir();
          }}
          onFocus={abrir}
          onKeyDown={onKeyDown}
          aria-expanded={abierto}
          aria-controls={listId}
          aria-activedescendant={
            activo >= 0 ? `${listId}-${activo}` : undefined
          }
          className="min-h-11 w-full cursor-pointer rounded-xl border border-line bg-background py-2.5 pl-3.5 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus-visible:border-accent"
        />
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform",
            abierto && "rotate-180",
          )}
        />
        {abierto && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Jugadores"
            className="absolute inset-x-0 top-full z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-[0_0_40px_rgba(0,0,0,0.5)] [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-track]:bg-transparent"
          >
            {visibles.length === 0 && (
              <li className="px-3 py-2.5 text-sm text-muted">
                Sin resultados para «{query}».
              </li>
            )}
            {visibles.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!o.disabled) elegir(o.value);
                }}
                onMouseEnter={() => setActivo(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none",
                  o.disabled && "cursor-not-allowed opacity-40",
                  !o.disabled &&
                    i === activo &&
                    "bg-accent/10 text-accent",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center",
                    o.value === value
                      ? "text-accent opacity-100"
                      : "opacity-0",
                  )}
                >
                  <Check aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{o.label}</span>
                  {o.hint && (
                    <span className="block truncate text-xs text-muted">
                      {o.hint}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
