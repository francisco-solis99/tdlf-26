"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGroupsForCategory,
  type CreatedGroups,
} from "@/lib/actions/admin";

export type CrearGruposCategory = {
  id: string;
  nombre: string;
};

const SELECT_CLASS =
  "min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function CrearGruposAdmin({
  categories,
}: {
  categories: CrearGruposCategory[];
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [count, setCount] = useState("4");
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [resultado, setResultado] = useState<
    (CreatedGroups & { categoryNombre: string }) | null
  >(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Elige una categoría.");
      return;
    }
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 16 || (n & (n - 1)) !== 0) {
      setError("El número de grupos debe ser potencia de 2 (1, 2, 4, 8, 16).");
      return;
    }
    setCreando(true);
    setError(null);
    const result = await createGroupsForCategory({
      category_id: categoryId,
      group_count: n,
    });
    setCreando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResultado({
      ...result.data,
      categoryNombre:
        categories.find((c) => c.id === categoryId)?.nombre ?? "",
    });
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
