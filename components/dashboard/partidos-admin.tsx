"use client";

import { useEffect, useState } from "react";
import { Pencil, Search, Trash2, TriangleAlert } from "lucide-react";

import { CategoriaBadge } from "@/components/dashboard/categoria-badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoria, listCategorias } from "@/config/categorias";
import {
  FASES,
  ganador,
  isJugado,
  listTodosPartidos,
  type Fase,
  type PartidoAdmin,
} from "@/config/partidos";

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent";

function nombrePareja(p: { jugador1: string; jugador2: string }) {
  return `${p.jugador1} / ${p.jugador2}`;
}

function parseScore(v: string): number | null | "invalido" {
  if (v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 30) return "invalido";
  return n;
}

export function PartidosAdmin() {
  // TODO(db): partidos llegan de Supabase; mutaciones = queries.
  const [partidos, setPartidos] = useState<PartidoAdmin[]>(() =>
    listTodosPartidos(),
  );
  const [filtro, setFiltro] = useState<string>("todas");
  const [editando, setEditando] = useState<PartidoAdmin | null>(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [fase, setFase] = useState<Fase>("Fase de grupos");
  const [error, setError] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<PartidoAdmin | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDeb, setBusquedaDeb] = useState("");

  // Debounce del buscador para no filtrar en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setBusquedaDeb(busqueda), 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  function normaliza(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function nombresPartido(p: PartidoAdmin) {
    return [
      p.parejaA.jugador1,
      p.parejaA.jugador2,
      p.parejaB.jugador1,
      p.parejaB.jugador2,
    ].join(" ");
  }

  const visibles = partidos.filter((p) => {
    if (filtro !== "todas" && p.categoriaSlug !== filtro) return false;
    const q = normaliza(busquedaDeb.trim());
    if (!q) return true;
    return normaliza(nombresPartido(p)).includes(q);
  });

  function abrirEditar(p: PartidoAdmin) {
    setEditando(p);
    setScoreA(p.scoreA === null ? "" : String(p.scoreA));
    setScoreB(p.scoreB === null ? "" : String(p.scoreB));
    setFase(p.fase);
    setError(null);
  }

  function guardar(e: React.FormEvent) {
    // Solo UI: sin DB todavía. Vaciar ambos = pendiente.
    e.preventDefault();
    if (!editando) return;
    const a = parseScore(scoreA);
    const b = parseScore(scoreB);
    if (a === "invalido" || b === "invalido") {
      setError("Marcadores enteros entre 0 y 30.");
      return;
    }
    if ((a === null) !== (b === null)) {
      setError("Llena ambos marcadores o vacía los dos (pendiente).");
      return;
    }
    if (a !== null && b !== null && a === b) {
      setError("Sin empates: un lado debe ganar.");
      return;
    }
    setPartidos((prev) =>
      prev.map((p) =>
        p.id === editando.id ? { ...p, scoreA: a, scoreB: b, fase } : p,
      ),
    );
    setEditando(null);
  }

  function eliminar() {
    if (!porEliminar) return;
    setPartidos((prev) => prev.filter((p) => p.id !== porEliminar.id));
    setPorEliminar(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {visibles.length} {visibles.length === 1 ? "partido" : "partidos"} ·
          Solo UI, sin base de datos.
        </p>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="grid gap-2">
            <Label htmlFor="part-buscar">Buscar por jugador</Label>
            <span className="relative block">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                id="part-buscar"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="p. ej. Mendoza"
                autoComplete="off"
                className="min-h-11 w-full rounded-xl border border-line bg-background py-2.5 pl-10 pr-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus-visible:border-accent [&::-webkit-search-cancel-button]:cursor-pointer"
              />
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="part-filtro">Categoría</Label>
            <select
              id="part-filtro"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className={`${SELECT_CLASS} sm:w-auto sm:min-w-44`}
            >
              <option value="todas">Todas las categorías</option>
              {listCategorias().map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="part-grupo">Grupo</Label>
            <select
              id="part-grupo"
              disabled
              value=""
              onChange={() => {}}
              title="Se activa cuando los partidos tengan grupo asignado"
              aria-describedby="part-grupo-ayuda"
              className={`${SELECT_CLASS} sm:w-auto sm:min-w-44`}
            >
              <option value="">Todos los grupos</option>
            </select>
            <span id="part-grupo-ayuda" className="sr-only">
              Filtro inactivo hasta que los partidos tengan grupo.
            </span>
          </div>
        </div>
      </div>

      {visibles.length === 0 ? (
        <Card className="mt-6 rounded-xl p-10 text-center">
          <p className="font-display text-xl uppercase tracking-wide">
            Sin partidos
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            No hay partidos para este filtro.
          </p>
        </Card>
      ) : (
        <div className="mt-6">
          <Table className="min-w-[880px]">
            <caption className="sr-only">Partidos del torneo</caption>
            <TableHeader>
              <tr>
                <TableHead>Pareja 1</TableHead>
                <TableHead className="text-center">Marc.</TableHead>
                <TableHead>Pareja 2</TableHead>
                <TableHead className="text-center">Marc.</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {visibles.map((p) => {
                const win = ganador(p);
                const jugado = isJugado(p);
                const cat = getCategoria(p.categoriaSlug);
                const color = cat?.color ?? "#ff4d3d";
                return (
                  <TableRow key={p.id}>
                    <TableCell
                      style={
                        win === "A"
                          ? { backgroundColor: cat?.colorSoft }
                          : undefined
                      }
                    >
                      <span
                        className="text-sm leading-snug"
                        style={win === "A" ? { color } : undefined}
                      >
                        {nombrePareja(p.parejaA)}
                      </span>
                    </TableCell>
                    <TableCell
                      className="countdown-num text-center font-display text-2xl tabular-nums"
                      style={
                        win === "A" ? { color } : { color: "var(--muted)" }
                      }
                    >
                      {jugado ? p.scoreA : "–"}
                    </TableCell>
                    <TableCell
                      style={
                        win === "B"
                          ? { backgroundColor: cat?.colorSoft }
                          : undefined
                      }
                    >
                      <span
                        className="text-sm leading-snug"
                        style={win === "B" ? { color } : undefined}
                      >
                        {nombrePareja(p.parejaB)}
                      </span>
                    </TableCell>
                    <TableCell
                      className="countdown-num text-center font-display text-2xl tabular-nums"
                      style={
                        win === "B" ? { color } : { color: "var(--muted)" }
                      }
                    >
                      {jugado ? p.scoreB : "–"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex whitespace-nowrap rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                        {p.fase}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">Sin asignar</span>
                    </TableCell>
                    <TableCell>
                      <CategoriaBadge slug={p.categoriaSlug} />
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => abrirEditar(p)}
                          aria-label={`Editar partido ${nombrePareja(p.parejaA)} contra ${nombrePareja(p.parejaB)}`}
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
                          aria-label={`Eliminar partido ${nombrePareja(p.parejaA)} contra ${nombrePareja(p.parejaB)}`}
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

      {/* Modal editar: solo marcador y fase */}
      <Dialog
        open={editando !== null}
        onOpenChange={(v) => !v && setEditando(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar <span className="text-accent">partido</span>
            </DialogTitle>
            <DialogDescription>
              {editando &&
                `${nombrePareja(editando.parejaA)} contra ${nombrePareja(editando.parejaB)}. Vacía ambos para dejarlo pendiente.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={guardar} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="part-score-a">Marcador 1</Label>
                <Input
                  id="part-score-a"
                  type="number"
                  value={scoreA}
                  onChange={(e) => {
                    setScoreA(e.target.value);
                    setError(null);
                  }}
                  placeholder="–"
                  min={0}
                  max={30}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="part-score-b">Marcador 2</Label>
                <Input
                  id="part-score-b"
                  type="number"
                  value={scoreB}
                  onChange={(e) => {
                    setScoreB(e.target.value);
                    setError(null);
                  }}
                  placeholder="–"
                  min={0}
                  max={30}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="part-fase">Fase</Label>
              <select
                id="part-fase"
                value={fase}
                onChange={(e) => setFase(e.target.value as Fase)}
                className={SELECT_CLASS}
              >
                {FASES.map((f) => (
                  <option key={f} value={f}>
                    {f}
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
                onClick={() => setEditando(null)}
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
              Eliminar <span className="text-accent">partido</span>
            </DialogTitle>
            <DialogDescription>
              {porEliminar &&
                `¿Eliminar «${nombrePareja(porEliminar.parejaA)} contra ${nombrePareja(porEliminar.parejaB)}»? Esta acción no se puede deshacer.`}
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
