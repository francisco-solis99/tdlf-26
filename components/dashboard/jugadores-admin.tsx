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
import { createPlayer, deletePlayer, updatePlayer } from "@/lib/actions/admin";
import type { PlayerRow } from "@/lib/torneo-view";

export type JugadorPairRef = {
  player1_id: string;
  player2_id: string;
};

export function JugadoresAdmin({
  initialPlayers,
  doubles,
}: {
  initialPlayers: PlayerRow[];
  doubles: JugadorPairRef[];
}) {
  const [jugadores, setJugadores] = useState<PlayerRow[]>(initialPlayers);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<PlayerRow | null>(null);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState<PlayerRow | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Parejas conocidas (live) para bloquear borrados.
  function parejaDe(id: string): string | null {
    const p = doubles.find(
      (x) => x.player1_id === id || x.player2_id === id,
    );
    if (!p) return null;
    const a = jugadores.find((j) => j.id === p.player1_id)?.nombre ?? "?";
    const b = jugadores.find((j) => j.id === p.player2_id)?.nombre ?? "?";
    return `${a} / ${b}`;
  }

  function abrirCrear() {
    setEditando(null);
    setNombre("");
    setEdad("");
    setCiudad("");
    setError(null);
    setFormAbierto(true);
  }

  function abrirEditar(j: PlayerRow) {
    setEditando(j);
    setNombre(j.nombre);
    setEdad(j.edad === null ? "" : String(j.edad));
    setCiudad(j.ciudad ?? "");
    setError(null);
    setFormAbierto(true);
  }

  function parseEdad(v: string): number | null | "invalido" {
    if (v.trim() === "") return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0 || n >= 120) return "invalido";
    return n;
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 3) {
      setError("El nombre debe tener al menos 3 letras.");
      return;
    }
    const numEdad = parseEdad(edad);
    if (numEdad === "invalido") {
      setError("La edad debe ser un número entero entre 1 y 119.");
      return;
    }
    setGuardando(true);
    const ciudadLimpia = ciudad.trim() === "" ? null : ciudad.trim();
    const result = editando
      ? await updatePlayer(editando.id, {
          nombre: limpio,
          edad: numEdad,
          ciudad: ciudadLimpia,
        })
      : await createPlayer({ nombre: limpio, edad: numEdad, ciudad: ciudadLimpia });
    setGuardando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const row: PlayerRow = {
      id: result.data.id,
      nombre: result.data.name,
      edad: result.data.age,
      ciudad: result.data.city,
      categoriaSlug: editando?.categoriaSlug ?? "",
    };
    if (editando) {
      setJugadores((prev) => prev.map((j) => (j.id === row.id ? row : j)));
    } else {
      setJugadores((prev) => [...prev, row]);
    }
    setFormAbierto(false);
  }

  async function eliminar() {
    if (!porEliminar || parejaDe(porEliminar.id) || eliminando) return;
    setEliminando(true);
    const result = await deletePlayer(porEliminar.id);
    setEliminando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setJugadores((prev) => prev.filter((j) => j.id !== porEliminar.id));
    setPorEliminar(null);
  }

  const bloqueado = porEliminar ? parejaDe(porEliminar.id) : null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {jugadores.length} {jugadores.length === 1 ? "jugador" : "jugadores"}
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
                    {j.edad ?? "–"}
                  </TableCell>
                  <TableCell className="text-muted">
                    {j.ciudad ?? "–"}
                  </TableCell>
                  <TableCell>
                    {j.categoriaSlug ? (
                      <CategoriaBadge slug={j.categoriaSlug} />
                    ) : (
                      <span className="text-sm text-muted">Sin asignar</span>
                    )}
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
                        onClick={() => {
                          setError(null);
                          setPorEliminar(j);
                        }}
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
              La categoría se define al armar su pareja.
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
                disabled={guardando}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="jug-edad">Edad (opcional)</Label>
                <Input
                  id="jug-edad"
                  type="number"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  placeholder="28"
                  min={1}
                  max={119}
                  disabled={guardando}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jug-ciudad">Ciudad (opcional)</Label>
                <Input
                  id="jug-ciudad"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="p. ej. Irapuato"
                  maxLength={40}
                  autoComplete="off"
                  disabled={guardando}
                  className="rounded-xl"
                />
              </div>
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
          {!bloqueado && error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
