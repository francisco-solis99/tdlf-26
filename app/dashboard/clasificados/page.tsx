import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/actions/auth";
import { getCategories, getGroups } from "@/lib/actions/torneo";
import { categorySlug } from "@/lib/torneo-view";

export const metadata: Metadata = {
  title: "Clasificados — Panel TDLF 2026",
  description: "Parejas clasificadas por categoría.",
};

export default async function DashboardClasificadosPage() {
  await requireAdmin();
  const categories = await getCategories();
  const counts = await Promise.all(
    categories.map(async (c) => ({
      id: c.id,
      nombre: c.name,
      descripcion: c.description ?? "",
      slug: categorySlug(c.name),
      grupos: (await getGroups(c.id)).length,
    })),
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        Fase final
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        Clasificados
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Las dos primeras parejas de cada grupo avanzan. Elige una categoría
        para ver quiénes pasan.
      </p>

      {counts.length === 0 ? (
        <Card className="mt-8 rounded-xl p-10 text-center">
          <p className="mx-auto max-w-sm text-sm text-muted">
            Aún no hay categorías registradas.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {counts.map((c) => (
            <Card key={c.id} className="rounded-xl p-5">
              <p className="font-display text-xl uppercase tracking-wide">
                {c.nombre}
              </p>
              <p className="mt-1 text-sm text-muted">
                {c.descripcion || "Sin descripción."}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">
                {c.grupos} {c.grupos === 1 ? "grupo" : "grupos"}
              </p>
              <Button asChild className="mt-4 w-full rounded-xl">
                <Link href={`/dashboard/clasificados/${c.slug}`}>
                  Ver clasificados
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
