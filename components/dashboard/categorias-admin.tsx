"use client";

import { useState } from "react";
import {
  Crown,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/admin";
import { categorySlug } from "@/lib/torneo-view";

export type CategoriaInicial = {
  id: string;
  nombre: string;
  tagline: string;
};

type AdminCategoria = CategoriaInicial & {
  slug: string;
  color: string;
  colorSoft: string;
  icono: LucideIcon;
};

// Presentación fija para las categorías conocidas; el resto rota la paleta.
// Color e icono viven solo en la UI: la DB guarda id/nombre/descripción.
const CONOCIDAS: Record<
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

// Paleta rotativa para categorías nuevas (el form solo pide 2 campos).
const PALETA = [
  { color: "#ff4d3d", colorSoft: "rgba(255, 77, 61, 0.12)" },
  { color: "#8b7cf6", colorSoft: "rgba(139, 124, 246, 0.12)" },
  { color: "#d9a62e", colorSoft: "rgba(217, 166, 46, 0.12)" },
  { color: "#34d399", colorSoft: "rgba(52, 211, 153, 0.12)" },
  { color: "#38bdf8", colorSoft: "rgba(56, 189, 248, 0.12)" },
];

function presentar(c: CategoriaInicial, indice: number): AdminCategoria {
  const slug = categorySlug(c.nombre);
  const conocida = CONOCIDAS[slug];
  if (conocida) return { ...c, slug, ...conocida };
  const paleta = PALETA[indice % PALETA.length];
  return { ...c, slug, ...paleta, icono: Trophy };
}

const DESC_MAX = 120;

export function CategoriasAdmin({
  initial,
}: {
  initial: CategoriaInicial[];
}) {
  const [cats, setCats] = useState<AdminCategoria[]>(() =>
    initial.map((c, i) => presentar(c, i)),
  );
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<AdminCategoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState<AdminCategoria | null>(null);
  const [eliminando, setEliminando] = useState(false);

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setError(null);
    setFormAbierto(true);
  }

  function abrirEditar(cat: AdminCategoria) {
    setEditando(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.tagline);
    setError(null);
    setFormAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 3) {
      setError("El nombre debe tener al menos 3 letras.");
      return;
    }
    const descLimpia = descripcion.trim() === "" ? null : descripcion.trim();
    setGuardando(true);
    const result = editando
      ? await updateCategory(editando.id, {
          name: limpio,
          description: descLimpia,
        })
      : await createCategory({ name: limpio, description: descLimpia });
    setGuardando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const base = {
      id: result.data.id,
      nombre: result.data.name,
      tagline: result.data.description ?? "",
    };
    if (editando) {
      setCats((prev) =>
        prev.map((c, i) => (c.id === base.id ? presentar(base, i) : c)),
      );
    } else {
      setCats((prev) => [...prev, presentar(base, prev.length)]);
    }
    setFormAbierto(false);
  }

  async function eliminar() {
    if (!porEliminar || eliminando) return;
    setEliminando(true);
    const result = await deleteCategory(porEliminar.id);
    setEliminando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCats((prev) => prev.filter((c) => c.id !== porEliminar.id));
    setPorEliminar(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {cats.length} {cats.length === 1 ? "categoría" : "categorías"}
        </p>
        <Button
          type="button"
          size="lg"
          onClick={abrirCrear}
          className="w-full rounded-xl sm:w-auto"
        >
          <Plus aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>

      {cats.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Sin categorías
          </p>
          <p className="max-w-sm text-sm text-muted">
            Se eliminaron todas. Crea la primera para empezar.
          </p>
          <Button type="button" onClick={abrirCrear} className="mt-2 rounded-xl">
            <Plus aria-hidden="true" />
            Nueva categoría
          </Button>
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cats.map((cat) => {
            const Icon = cat.icono;
            return (
              <Card key={cat.id} className="overflow-hidden rounded-xl">
                <div
                  aria-hidden="true"
                  className="h-1.5 w-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: cat.colorSoft }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: cat.color }}
                        strokeWidth={1.75}
                      />
                    </span>
                    <h2
                      className="font-display text-xl uppercase tracking-wide"
                      style={{ color: cat.color }}
                    >
                      {cat.nombre}
                    </h2>
                  </div>
                  <p className="mt-3 min-h-10 text-sm leading-snug text-muted">
                    {cat.tagline || "Sin descripción."}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => abrirEditar(cat)}
                      aria-label={`Editar ${cat.nombre}`}
                      className="rounded-xl"
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setError(null);
                        setPorEliminar(cat);
                      }}
                      aria-label={`Eliminar ${cat.nombre}`}
                      className="rounded-xl text-muted hover:text-accent"
                    >
                      <Trash2 aria-hidden="true" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal crear / editar */}
      <Dialog
        open={formAbierto}
        onOpenChange={(v) => {
          setFormAbierto(v);
          if (!v) setEditando(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar" : "Nueva"} <span className="text-accent">categoría</span>
            </DialogTitle>
            <DialogDescription>
              {editando
                ? `Actualiza los datos de «${editando.nombre}».`
                : "Nombre y descripción corta de la categoría."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="cat-nombre">Nombre</Label>
              <Input
                id="cat-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="p. ej. Mixta"
                required
                minLength={3}
                maxLength={40}
                autoComplete="off"
                disabled={guardando}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor="cat-desc">Descripción corta</Label>
                <span className="text-[11px] tabular-nums text-muted">
                  {descripcion.length}/{DESC_MAX}
                </span>
              </div>
              <Input
                id="cat-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value.slice(0, DESC_MAX))}
                placeholder="p. ej. Abierta a parejas mixtas."
                maxLength={DESC_MAX}
                autoComplete="off"
                disabled={guardando}
                className="rounded-xl"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-accent">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormAbierto(false)}
                disabled={guardando}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} className="rounded-xl">
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal advertencia eliminar */}
      <Dialog open={porEliminar !== null} onOpenChange={(v) => !v && setPorEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"
            >
              <TriangleAlert className="h-6 w-6 text-accent" />
            </span>
            <DialogTitle className="pt-2">
              Eliminar <span className="text-accent">categoría</span>
            </DialogTitle>
            <DialogDescription>
              ¿Eliminar «{porEliminar?.nombre}»? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPorEliminar(null)}
              disabled={eliminando}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={eliminar}
              disabled={eliminando}
              className="rounded-xl"
            >
              <Trash2 aria-hidden="true" />
              {eliminando ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
