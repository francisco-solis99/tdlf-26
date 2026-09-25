"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";

import { CategoriaBadge } from "@/components/dashboard/categoria-badge";
import { JugadorCombobox } from "@/components/dashboard/jugador-combobox";
import { Avatar } from "@/components/pareja-avatars";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoria } from "@/config/categorias";
import {
  createDouble,
  deleteDouble,
  updateDouble,
} from "@/lib/actions/admin";
import type { DoubleRow } from "@/lib/torneo-view";

export type ParejaPlayerOption = {
  id: string;
  nombre: string;
  edad: number | null;
  ciudad: string | null;
};

export type ParejaCategoryOption = {
  id: string;
  nombre: string;
  slug: string;
};

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function ParejasAdmin({
  initialParejas,
  players,
  categories,
}: {
  initialParejas: DoubleRow[];
  players: ParejaPlayerOption[];
  categories: ParejaCategoryOption[];
}) {
  const [parejas, setParejas] = useState<DoubleRow[]>(initialParejas);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<DoubleRow | null>(null);
  const [j1, setJ1] = useState("");
  const [j2, setJ2] = useState("");
  const [categoria, setCategoria] = useState(categories[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState<DoubleRow | null>(null);
  const [eliminando, setEliminando] = useState(false);

  function getJugador(id: string): ParejaPlayerOption | undefined {
    return players.find((j) => j.id === id);
  }

  function categoryId(slug: string): string | undefined {
    return categories.find((c) => c.slug === slug)?.id;
  }

  function abrirCrear() {
    setEditando(null);
    setJ1("");
    setJ2("");
    setCategoria(categories[0]?.slug ?? "");
    setError(null);
    setFormAbierto(true);
  }

  function abrirEditar(p: DoubleRow) {
    setEditando(p);
    setJ1(p.jugador1Id);
    setJ2(p.jugador2Id);
    setCategoria(p.categoriaSlug);
    setError(null);
    setFormAbierto(true);
  }

  function toRow(
    d: { id: string; player1_id: string; player2_id: string; category_id: string },
    slug: string,
    grupo: string | null,
  ): DoubleRow {
    return {
      id: d.id,
      jugador1Id: d.player1_id,
      jugador2Id: d.player2_id,
      categoriaSlug: slug,
      grupo,
    };
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!j1 || !j2) {
      setError("Elige a los dos jugadores.");
      return;
    }
    if (j1 === j2) {
      setError("Son dos jugadores distintos por pareja.");
      return;
    }
    const category_id = categoryId(categoria);
    if (!category_id) {
      setError("Elige una categoría.");
      return;
    }
    setGuardando(true);
    const result = editando
      ? await updateDouble(editando.id, {
          category_id,
          player1_id: j1,
          player2_id: j2,
        })
      : await createDouble({ category_id, player1_id: j1, player2_id: j2 });
    setGuardando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const row = toRow(
      result.data,
      categoria,
      editando?.grupo ?? null,
    );
    if (editando) {
      setParejas((prev) => prev.map((p) => (p.id === row.id ? row : p)));
    } else {
      setParejas((prev) => [...prev, row]);
    }
    setFormAbierto(false);
  }

  async function eliminar() {
    if (!porEliminar || eliminando) return;
    setEliminando(true);
    const result = await deleteDouble(porEliminar.id);
    setEliminando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setParejas((prev) => prev.filter((p) => p.id !== porEliminar.id));
    setPorEliminar(null);
  }

  function nombrePareja(p: DoubleRow) {
    const a = getJugador(p.jugador1Id);
    const b = getJugador(p.jugador2Id);
    return `${a?.nombre ?? "?"} / ${b?.nombre ?? "?"}`;
  }

  function hint(j: ParejaPlayerOption): string {
    const edad = j.edad === null ? "–" : `${j.edad} años`;
    const ciudad = j.ciudad ?? "–";
    return `${edad} · ${ciudad}`;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {parejas.length} {parejas.length === 1 ? "pareja" : "parejas"}
        </p>
        <Button
          type="button"
          size="lg"
          onClick={abrirCrear}
          className="w-full rounded-xl sm:w-auto"
        >
          <Plus aria-hidden="true" />
          Nueva pareja
        </Button>
      </div>

      {parejas.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Sin parejas
          </p>
          <p className="max-w-sm text-sm text-muted">
            Crea la primera eligiendo dos jugadores existentes.
          </p>
          <Button type="button" onClick={abrirCrear} className="mt-2 rounded-xl">
            <Plus aria-hidden="true" />
            Nueva pareja
          </Button>
        </Card>
      ) : (
        <div className="mt-6">
          <Table className="min-w-[720px]">
            <caption className="sr-only">Parejas registradas</caption>
            <TableHeader>
              <tr>
                <TableHead>Pareja 1</TableHead>
                <TableHead>Pareja 2</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {parejas.map((p) => {
                const a = getJugador(p.jugador1Id);
                const b = getJugador(p.jugador2Id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <JugadorCelda
                        nombre={a?.nombre ?? "?"}
                        detalle={a ? hint(a) : undefined}
                        colorSlug={p.categoriaSlug}
                      />
                    </TableCell>
                    <TableCell>
                      <JugadorCelda
                        nombre={b?.nombre ?? "?"}
                        detalle={b ? hint(b) : undefined}
                        colorSlug={p.categoriaSlug}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">
                        {p.grupo ?? "Sin asignar"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CategoriaBadge slug={p.categoriaSlug} />
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center justify-end gap-1">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          title="Ver grupo (público)"
                          className="rounded-xl"
                        >
                          <Link
                            href={`/categorias/${p.categoriaSlug}`}
                            aria-label={`Ver grupo de ${nombrePareja(p)}`}
                          >
                            <Eye aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => abrirEditar(p)}
                          aria-label={`Editar ${nombrePareja(p)}`}
                          className="rounded-xl"
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => {
                            setError(null);
                            setPorEliminar(p);
                          }}
                          aria-label={`Eliminar ${nombrePareja(p)}`}
                          className="rounded-xl text-muted hover:text-accent"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
              {editando ? "Editar" : "Nueva"}{" "}
              <span className="text-accent">pareja</span>
            </DialogTitle>
            <DialogDescription>
              Elige dos jugadores existentes y su categoría. Sin grupo: se
              asigna al armar los grupos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="par-j1">Jugador 1</Label>
              <JugadorCombobox
                id="par-j1"
                value={j1}
                placeholder="Escribe para buscar…"
                onChange={(v) => {
                  setJ1(v);
                  setError(null);
                }}
                options={players.map((j) => ({
                  value: j.id,
                  label: j.nombre,
                  hint: hint(j),
                  disabled: j.id === j2,
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="par-j2">Jugador 2</Label>
              <JugadorCombobox
                id="par-j2"
                value={j2}
                placeholder="Escribe para buscar…"
                onChange={(v) => {
                  setJ2(v);
                  setError(null);
                }}
                options={players.map((j) => ({
                  value: j.id,
                  label: j.nombre,
                  hint: hint(j),
                  disabled: j.id === j1,
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="par-cat">Categoría</Label>
              <select
                id="par-cat"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
                disabled={guardando}
                className={SELECT_CLASS}
              >
                <option value="">Selecciona categoría…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
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
      <Dialog
        open={porEliminar !== null}
        onOpenChange={(v) => !v && setPorEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10"
            >
              <TriangleAlert className="h-6 w-6 text-accent" />
            </span>
            <DialogTitle className="pt-2">
              Eliminar <span className="text-accent">pareja</span>
            </DialogTitle>
            <DialogDescription>
              {porEliminar &&
                `¿Eliminar «${nombrePareja(porEliminar)}»? Esta acción no se puede deshacer.`}
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

function JugadorCelda({
  nombre,
  detalle,
  colorSlug,
}: {
  nombre: string;
  detalle?: string;
  colorSlug: string;
}) {
  const cat = getCategoria(colorSlug);
  return (
    <span className="flex items-center gap-3">
      <Avatar
        nombre={nombre}
        color={cat?.color ?? "#ff4d3d"}
        colorSoft={cat?.colorSoft ?? "rgba(255,77,61,0.12)"}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{nombre}</span>
        {detalle && (
          <span className="block truncate text-xs text-muted">{detalle}</span>
        )}
      </span>
    </span>
  );
}
