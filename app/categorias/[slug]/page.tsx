import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/landing/header";
import { getCategoria, listCategorias } from "@/config/categorias";

export function generateStaticParams() {
  return listCategorias().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoria(slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: `${cat.nombre} — Torneo de las Fresas 2026`,
    description: cat.descripcion,
  };
}

export default async function CategoriaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategoria(slug);
  if (!cat) notFound();

  const Icon = cat.icono;

  return (
    <>
      <Header logoHref="/" navBasePath="/" showNav={false} />
      <main className="grain relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
          style={{ backgroundColor: cat.colorSoft }}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Todas las categorías
          </Link>
        </div>

        <Card className="mt-8 overflow-hidden rounded-xl">
          <div aria-hidden="true" className="h-1.5 w-full" style={{ backgroundColor: cat.color }} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: cat.colorSoft }}
              >
                <Icon
                  className="h-8 w-8"
                  style={{ color: cat.color }}
                  strokeWidth={1.5}
                />
              </span>
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.25em]"
                  style={{ color: cat.color }}
                >
                  Categoría
                </p>
                <h1 className="font-display text-3xl uppercase tracking-wide sm:text-5xl">
                  {cat.nombre}
                </h1>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
              {cat.descripcion}
            </p>

            <dl className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Grupos", value: cat.grupos },
                { label: "Parejas", value: cat.parejas },
                { label: "Jugadores", value: cat.jugadores },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-line bg-background px-3 py-4 text-center"
                >
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted">
                    {stat.label}
                  </dt>
                  <dd className="countdown-num mt-1 font-display text-3xl tabular-nums sm:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full rounded-xl sm:w-auto" disabled>
                Ver grupos
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-xl sm:w-auto"
              >
                <Link href="/categorias">Cambiar de categoría</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Datos de ejemplo — grupos y partidos se leerán de la base de
              datos.
            </p>
          </div>
        </Card>
      </div>
      </main>
    </>
  );
}
