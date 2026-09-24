"use client";

import { useRef, useState } from "react";
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
import { listCategorias, getCategoria } from "@/config/categorias";
import {
  JUGADORES_SEED,
  PAREJAS_SEED,
  getJugador,
  type ParejaAdmin,
} from "@/config/jugadores";

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function ParejasAdmin() {
  // TODO(db): jugadores y parejas llegan de Supabase; mutaciones = queries.
  const [jugadores] = useState(JUGADORES_SEED);
  const [parejas, setParejas] = useState<ParejaAdmin[]>(PAREJAS_SEED);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<ParejaAdmin | null>(null);
  const [j1, setJ1] = useState("");
  const [j2, setJ2] = useState("");
  const [categoria, setCategoria] = useState(listCategorias()[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<ParejaAdmin | null>(null);
  const seq = useRef(PAREJAS_SEED.length + 1);

  function abrirCrear() {
    setEditando(null);
    setJ1("");
    setJ2("");
    setCategoria(listCategorias()[0]?.slug ?? "");
    setError(null);
    setFormAbierto(true);
  }

  function abrirEditar(p: ParejaAdmin) {
    setEditando(p);
    setJ1(p.jugador1Id);
    setJ2(p.jugador2Id);
    setCategoria(p.categoriaSlug);
    setError(null);
    setFormAbierto(true);
  }

  function guardar(e: React.FormEvent) {
    // Solo UI: sin DB todavía.
    e.preventDefault();
    if (!j1 || !j2) {
      setError("Elige a los dos jugadores.");
      return;
    }
    if (j1 === j2) {
      setError("Son dos jugadores distintos por pareja.");
      return;
    }
    if (!categoria) {
      setError("Elige una categoría.");
      return;
    }
    if (editando) {
      setParejas((prev) =>
        prev.map((p) =>
          p.id === editando.id
            ? { ...p, jugador1Id: j1, jugador2Id: j2, categoriaSlug: categoria }
            : p,
        ),
      );
    } else {
      setParejas((prev) => [
        ...prev,
        {
          id: `p-nueva-${seq.current++}`,
          jugador1Id: j1,
          jugador2Id: j2,
          categoriaSlug: categoria,
          grupo: null,
        },
      ]);
    }
    setFormAbierto(false);
  }

  function eliminar() {
    if (!porEliminar) return;
    setParejas((prev) => prev.filter((p) => p.id !== porEliminar.id));
    setPorEliminar(null);
  }

  function nombrePareja(p: ParejaAdmin) {
    const a = getJugador(jugadores, p.jugador1Id);
    const b = getJugador(jugadores, p.jugador2Id);
    return `${a?.nombre ?? "?"} / ${b?.nombre ?? "?"}`;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {parejas.length} {parejas.length === 1 ? "pareja" : "parejas"} · Solo
          UI, sin base de datos.
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
                const a = getJugador(jugadores, p.jugador1Id);
                const b = getJugador(jugadores, p.jugador2Id);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <JugadorCelda
                        nombre={a?.nombre ?? "?"}
                        detalle={
                          a ? `${a.edad} años · ${a.ciudad}` : undefined
                        }
                        colorSlug={p.categoriaSlug}
                      />
                    </TableCell>
                    <TableCell>
                      <JugadorCelda
                        nombre={b?.nombre ?? "?"}
                        detalle={
                          b ? `${b.edad} años · ${b.ciudad}` : undefined
                        }
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
                          onClick={() => setPorEliminar(p)}
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
              Elige dos jugadores existentes y su categoría. Se guarda solo en
              pantalla hasta conectar la base de datos.
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
                options={jugadores.map((j) => ({
                  value: j.id,
                  label: j.nombre,
                  hint: `${j.edad} años · ${j.ciudad}`,
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
                options={jugadores.map((j) => ({
                  value: j.id,
                  label: j.nombre,
                  hint: `${j.edad} años · ${j.ciudad}`,
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
                className={SELECT_CLASS}
              >
                <option value="">Selecciona categoría…</option>
                {listCategorias().map((c) => (
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPorEliminar(null)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="button" onClick={eliminar} className="rounded-xl">
              <Trash2 aria-hidden="true" />
              Eliminar
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
