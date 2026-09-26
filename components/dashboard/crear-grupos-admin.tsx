"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";

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
  createGroupsForCategory,
  resetCategoryGroups,
  type CreatedGroups,
} from "@/lib/actions/admin";
import { getDoublesWithPlayers } from "@/lib/actions/torneo";

export type CrearGruposCategory = {
  id: string;
  nombre: string;
};

type HeadOption = {
  id: string;
  nombre: string;
};

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

function parseCount(v: string): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 16 || (n & (n - 1)) !== 0) {
    return null;
  }
  return n;
}

export function CrearGruposAdmin({
  categories,
}: {
  categories: CrearGruposCategory[];
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [count, setCount] = useState("4");
  const [heads, setHeads] = useState<string[]>([]);
  const [opciones, setOpciones] = useState<HeadOption[]>([]);
  // True on mount when a category comes preselected (its fetch starts right away).
  const [cargandoParejas, setCargandoParejas] = useState(
    (categories[0]?.id ?? "") !== "",
  );
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [recargarParejas, setRecargarParejas] = useState(0);
  const [resetAbierto, setResetAbierto] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [reseteando, setReseteando] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resultado, setResultado] = useState<
    (CreatedGroups & { categoryNombre: string }) | null
  >(null);

  const n = parseCount(count);

  // Ungrouped doubles for the chosen category feed the head pickers.
  // (Resets live in the change handlers below, not here.)
  useEffect(() => {
    if (!categoryId) return;
    let vivo = true;
    getDoublesWithPlayers({ categoryId })
      .then((doubles) => {
        if (!vivo) return;
        setOpciones(
          doubles
            .filter((d) => d.group_id === null)
            .map((d) => ({
              id: d.id,
              nombre: `${d.player1.name} / ${d.player2.name}`,
            })),
        );
      })
      .catch(() => {
        if (vivo) setOpciones([]);
      })
      .finally(() => {
        if (vivo) setCargandoParejas(false);
      });
    return () => {
      vivo = false;
    };
  }, [categoryId, recargarParejas]);

  const categoriaNombre =
    categories.find((c) => c.id === categoryId)?.nombre ?? "";

  function setHead(i: number, value: string) {
    setHeads((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    setError(null);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Elige una categoría.");
      return;
    }
    if (n === null) {
      setError("El número de grupos debe ser potencia de 2 (1, 2, 4, 8, 16).");
      return;
    }
    const elegidos = heads.slice(0, n).filter((h) => h !== "");
    if (elegidos.length > 0 && elegidos.length !== n) {
      setError(
        `Si eliges cabezas, debes llenar los ${n} grupos — o ninguno.`,
      );
      return;
    }
    if (new Set(elegidos).size !== elegidos.length) {
      setError("Los cabezas de grupo deben ser parejas distintas.");
      return;
    }
    setCreando(true);
    setError(null);
    const result = await createGroupsForCategory({
      category_id: categoryId,
      group_count: n,
      group_heads: elegidos,
    });
    setCreando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHeads([]);
    setResultado({
      ...result.data,
      categoryNombre:
        categories.find((c) => c.id === categoryId)?.nombre ?? "",
    });
  }

  function abrirReset() {
    setConfirmText("");
    setError(null);
    setResetAbierto(true);
  }

  async function restablecer() {
    if (confirmText.trim() !== categoriaNombre || reseteando) return;
    setReseteando(true);
    const result = await resetCategoryGroups(categoryId);
    setReseteando(false);
    if (!result.ok) {
      setError(result.error);
      setResetAbierto(false);
      return;
    }
    setResetAbierto(false);
    setConfirmText("");
    setResultado(null);
    setHeads([]);
    setRecargarParejas((k) => k + 1);
    setResetMsg(
      `Se eliminaron ${result.data.groups} grupos y ${result.data.matches} partidos de «${categoriaNombre}». Las parejas quedaron sin grupo.`,
    );
  }

  return (
    <div>
      <Card className="mt-8 max-w-xl rounded-xl p-6">
        <form onSubmit={crear} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="cg-cat">Categoría</Label>
            <select
              id="cg-cat"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setHeads([]);
                setOpciones([]);
                setCargandoParejas(e.target.value !== "");
                setResetAbierto(false);
                setResetMsg(null);
                setError(null);
              }}
              required
              disabled={creando}
              className={SELECT_CLASS}
            >
              <option value="">Selecciona categoría…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cg-count">Número de grupos</Label>
            <Input
              id="cg-count"
              type="number"
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                setHeads([]);
                setResetMsg(null);
                setError(null);
              }}
              placeholder="4"
              required
              min={1}
              max={16}
              disabled={creando}
              className="rounded-xl"
            />
            <p className="text-xs leading-relaxed text-muted">
              Potencia de 2 (1, 2, 4, 8, 16) para que el cuadro final cierre
              sin descansos. Mínimo 2 parejas registradas por grupo. Solo se
              puede crear una vez por categoría.
            </p>
          </div>

          {n !== null && categoryId !== "" && (
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium">
                  Cabezas de grupo (opcional)
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {cargandoParejas
                    ? "Cargando parejas sin grupo…"
                    : opciones.length === 0
                      ? "No hay parejas sin grupo en esta categoría."
                      : `${opciones.length} parejas sin grupo. Llena los ${n} o ninguno.`}
                </p>
              </div>
              {Array.from({ length: n }, (_, i) => {
                const elegidosEnOtros = new Set(
                  heads.filter((_, j) => j !== i && j < n),
                );
                return (
                  <div key={i} className="grid gap-2">
                    <Label htmlFor={`cg-head-${i}`}>
                      Cabeza del grupo {i + 1}
                    </Label>
                    <select
                      id={`cg-head-${i}`}
                      value={heads[i] ?? ""}
                      onChange={(e) => setHead(i, e.target.value)}
                      disabled={creando || opciones.length === 0}
                      className={SELECT_CLASS}
                    >
                      <option value="">Sin cabeza (aleatorio)</option>
                      {opciones
                        .filter(
                          (o) => o.id === heads[i] || !elegidosEnOtros.has(o.id),
                        )
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          )}
          <div>
            <Button
              type="submit"
              size="lg"
              disabled={creando}
              className="rounded-xl"
            >
              <Shuffle aria-hidden="true" />
              {creando ? "Creando…" : "Crear grupos"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 max-w-xl rounded-xl border-accent/40 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
          Zona de peligro
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Elimina los grupos y sus partidos de la categoría elegida. Las
          parejas se conservan sin grupo; jugadores y categorías no se tocan.
          Esta acción no se puede deshacer.
        </p>
        {resetMsg && (
          <p role="status" className="mt-3 text-sm text-foreground">
            {resetMsg}
          </p>
        )}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={abrirReset}
            disabled={creando || reseteando || categoryId === ""}
            className="rounded-xl text-accent hover:text-accent"
          >
            Restablecer grupos…
          </Button>
        </div>
      </Card>

      <Dialog
        open={resetAbierto}
        onOpenChange={(v) => {
          if (!v) setResetAbierto(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Restablecer <span className="text-accent">grupos</span>
            </DialogTitle>
            <DialogDescription>
              Se eliminarán los grupos y sus partidos de «{categoriaNombre}».
              Las parejas quedarán sin grupo. Para confirmar, escribe el nombre
              de la categoría.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="cg-confirm">Nombre de la categoría</Label>
            <Input
              id="cg-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={categoriaNombre}
              autoComplete="off"
              disabled={reseteando}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetAbierto(false)}
              disabled={reseteando}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={restablecer}
              disabled={reseteando || confirmText.trim() !== categoriaNombre}
              className="rounded-xl"
            >
              {reseteando ? "Eliminando…" : "Eliminar grupos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {resultado && (
        <div className="mt-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
            Grupos creados · {resultado.categoryNombre}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultado.groups.map((g) => {
              const parejas = resultado.doubles.filter(
                (d) => d.group_id === g.id,
              );
              return (
                <Card key={g.id} className="rounded-xl p-5">
                  <p className="font-display text-xl uppercase tracking-wide">
                    {g.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
                    {parejas.length}{" "}
                    {parejas.length === 1 ? "pareja" : "parejas"}
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {parejas.map((d) => (
                      <li key={d.id} className="text-sm">
                        {d.player1.name} / {d.player2.name}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
