"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, TriangleAlert, Trophy } from "lucide-react";

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
import { listCategorias, type Categoria } from "@/config/categorias";

// TODO(db): todo este estado en memoria se reemplaza por Supabase.
// Solo importan slug, nombre y descripción; el resto es presentacional.
type AdminCategoria = Pick<
  Categoria,
  "slug" | "nombre" | "tagline" | "color" | "colorSoft" | "icono"
>;

// Paleta rotativa para categorías nuevas (el form solo pide 2 campos).
const PALETA = [
  { color: "#ff4d3d", colorSoft: "rgba(255, 77, 61, 0.12)" },
  { color: "#8b7cf6", colorSoft: "rgba(139, 124, 246, 0.12)" },
  { color: "#d9a62e", colorSoft: "rgba(217, 166, 46, 0.12)" },
  { color: "#34d399", colorSoft: "rgba(52, 211, 153, 0.12)" },
  { color: "#38bdf8", colorSoft: "rgba(56, 189, 248, 0.12)" },
];

function slugify(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

const DESC_MAX = 120;

export function CategoriasAdmin() {
  // TODO(db): initial → fetch; mutaciones → queries.
  const [cats, setCats] = useState<AdminCategoria[]>(() =>
    listCategorias().map((c) => ({
      slug: c.slug,
      nombre: c.nombre,
      tagline: c.tagline,
      color: c.color,
      colorSoft: c.colorSoft,
      icono: c.icono,
    })),
  );
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<AdminCategoria | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [porEliminar, setPorEliminar] = useState<AdminCategoria | null>(null);

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setDescripcion("");
    setFormAbierto(true);
  }

  function abrirEditar(cat: AdminCategoria) {
    setEditando(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.tagline);
    setFormAbierto(true);
  }

  function guardar(e: React.FormEvent) {
    // Solo UI: sin DB todavía.
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 3) return;
    if (editando) {
      setCats((prev) =>
        prev.map((c) =>
          c.slug === editando.slug
            ? { ...c, nombre: limpio, tagline: descripcion.trim() }
            : c,
        ),
      );
    } else {
      const base = slugify(limpio) || `categoria-${cats.length + 1}`;
      let unico = base;
      let n = 2;
      while (cats.some((c) => c.slug === unico)) unico = `${base}-${n++}`;
      const paleta = PALETA[cats.length % PALETA.length];
      setCats((prev) => [
        ...prev,
        {
          slug: unico,
          nombre: limpio,
          tagline: descripcion.trim(),
          color: paleta.color,
          colorSoft: paleta.colorSoft,
          icono: Trophy,
        },
      ]);
    }
    setFormAbierto(false);
  }

  function eliminar() {
    if (!porEliminar) return;
    setCats((prev) => prev.filter((c) => c.slug !== porEliminar.slug));
    setPorEliminar(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {cats.length} {cats.length === 1 ? "categoría" : "categorías"} · Solo
          UI, sin base de datos.
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
              <Card key={cat.slug} className="overflow-hidden rounded-xl">
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
                      onClick={() => setPorEliminar(cat)}
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
                : "Se guardará solo en pantalla hasta conectar la base de datos."}
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
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormAbierto(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl">
                Guardar
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPorEliminar(null)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={eliminar}
              className="rounded-xl"
            >
              <Trash2 aria-hidden="true" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
