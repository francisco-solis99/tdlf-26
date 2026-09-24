"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";

import { CategoriaBadge } from "@/components/dashboard/categoria-badge";
import { Avatar } from "@/components/pareja-avatars";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoria } from "@/config/categorias";
import {
  JUGADORES_SEED,
  PAREJAS_SEED,
  type Jugador,
} from "@/config/jugadores";

function slugify(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);
}

export function JugadoresAdmin() {
  // TODO(db): jugadores llegan de Supabase; mutaciones = queries.
  // Sin categoría al crear: se define al armar la pareja.
  const [jugadores, setJugadores] = useState<Jugador[]>(JUGADORES_SEED);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Jugador | null>(null);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [porEliminar, setPorEliminar] = useState<Jugador | null>(null);

  // Parejas conocidas (seed) para bloquear borrados. Con DB será query.
  function parejaDe(id: string): string | null {
    const p = PAREJAS_SEED.find(
      (x) => x.jugador1Id === id || x.jugador2Id === id,
    );
    if (!p) return null;
    const a = jugadores.find((j) => j.id === p.jugador1Id)?.nombre ?? "?";
    const b = jugadores.find((j) => j.id === p.jugador2Id)?.nombre ?? "?";
    return `${a} / ${b}`;
  }

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setEdad("");
    setCiudad("");
    setFormAbierto(true);
  }

  function abrirEditar(j: Jugador) {
    setEditando(j);
    setNombre(j.nombre);
    setEdad(String(j.edad));
    setCiudad(j.ciudad);
    setFormAbierto(true);
  }

  function guardar(e: React.FormEvent) {
    // Solo UI: sin DB todavía.
    e.preventDefault();
    const limpio = nombre.trim();
    const numEdad = Number(edad);
    if (limpio.length < 3 || !ciudad.trim()) return;
    if (!Number.isInteger(numEdad) || numEdad < 5 || numEdad > 100) return;
    if (editando) {
      setJugadores((prev) =>
        prev.map((j) =>
          j.id === editando.id
            ? { ...j, nombre: limpio, edad: numEdad, ciudad: ciudad.trim() }
            : j,
        ),
      );
    } else {
      const base = slugify(limpio) || `jugador-${jugadores.length + 1}`;
      let id = `j-${base}`;
      let n = 2;
      while (jugadores.some((j) => j.id === id)) id = `j-${base}-${n++}`;
      setJugadores((prev) => [
        ...prev,
        {
          id,
          nombre: limpio,
          edad: numEdad,
          ciudad: ciudad.trim(),
          categoriaSlug: "",
        },
      ]);
    }
    setFormAbierto(false);
  }

  function eliminar() {
    if (!porEliminar || parejaDe(porEliminar.id)) return;
    setJugadores((prev) => prev.filter((j) => j.id !== porEliminar.id));
    setPorEliminar(null);
  }

  const bloqueado = porEliminar ? parejaDe(porEliminar.id) : null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {jugadores.length} {jugadores.length === 1 ? "jugador" : "jugadores"}{" "}
          · Solo UI, sin base de datos.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={abrirCrear}
          className="w-full rounded-xl sm:w-auto"
        >
          <Plus aria-hidden="true" />
          Nuevo jugador
        </Button>
      </div>

      <div className="mt-6">
        <Table className="min-w-[620px]">
          <caption className="sr-only">Jugadores registrados</caption>
          <TableHeader>
            <tr>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-center">Edad</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {jugadores.map((j) => {
              const cat = getCategoria(j.categoriaSlug);
              return (
                <TableRow key={j.id}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <Avatar
                        nombre={j.nombre}
                        color={cat?.color ?? "#9b9b96"}
                        colorSoft={cat?.colorSoft ?? "rgba(155,155,150,0.15)"}
                      />
                      <span className="text-sm font-medium">{j.nombre}</span>
                    </span>
                  </TableCell>
                  <TableCell className="countdown-num text-center tabular-nums">
                    {j.edad}
                  </TableCell>
                  <TableCell className="text-muted">{j.ciudad}</TableCell>
                  <TableCell>
                    <CategoriaBadge slug={j.categoriaSlug} />
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => abrirEditar(j)}
                        aria-label={`Editar ${j.nombre}`}
                        className="rounded-xl"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        onClick={() => setPorEliminar(j)}
                        aria-label={`Eliminar ${j.nombre}`}
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

      {/* Modal crear / editar (sin categoría: se define en la pareja) */}
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
              {editando ? "Editar" : "Nuevo"}{" "}
              <span className="text-accent">jugador</span>
            </DialogTitle>
            <DialogDescription>
              Se guarda solo en pantalla hasta conectar la base de datos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="jug-nombre">Nombre</Label>
              <Input
                id="jug-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="p. ej. Memo Ochoa"
                required
                minLength={3}
                maxLength={60}
                autoComplete="off"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jug-edad">Edad</Label>
                <Input
                  id="jug-edad"
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="28"
                  required
                  min={5}
                  max={100}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jug-ciudad">Ciudad</Label>
                <Input
                  id="jug-ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="p. ej. Irapuato"
                  required
                  maxLength={40}
                  autoComplete="off"
                  className="rounded-xl"
                />
              </div>
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

      {/* Modal eliminar (o bloqueo si está emparejado) */}
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
              Eliminar <span className="text-accent">jugador</span>
            </DialogTitle>
            <DialogDescription>
              {bloqueado
                ? `«${porEliminar?.nombre}» está en la pareja «${bloqueado}». Elimina la pareja primero.`
                : `¿Eliminar a «${porEliminar?.nombre}»? Esta acción no se puede deshacer.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {bloqueado ? (
              <Button
                type="button"
                onClick={() => setPorEliminar(null)}
                className="rounded-xl"
              >
                Entendido
              </Button>
            ) : (
              <>
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
