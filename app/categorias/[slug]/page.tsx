import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/landing/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategoria, listCategorias } from "@/config/categorias";
import { listGrupos } from "@/config/grupos";

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
  const grupos = listGrupos(slug);

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

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/categorias"
            className="inline-flex items-center gap-1.5 text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Todas las categorías
          </Link>
        </div>

        <Card className="mx-auto mt-8 w-full max-w-3xl overflow-hidden rounded-xl">
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

        <section id="grupos" aria-label={`Grupos de ${cat.nombre}`} className="mt-12 scroll-mt-20">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.25em]"
            style={{ color: cat.color }}
          >
            Fase de grupos
          </p>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl">
            Grupos de {cat.nombre}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Toca un grupo para ver sus parejas. Puedes tener varios abiertos a
            la vez.
          </p>

          <Accordion
            type="multiple"
            className="mt-6 grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {grupos.map((grupo) => (
              <AccordionItem key={grupo.id} value={grupo.id}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rotate-45"
                      style={{ backgroundColor: cat.color }}
                    />
                    {grupo.nombre}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                    {grupo.parejas.length} parejas
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="max-h-80 pr-3">
                    <ul className="flex flex-col gap-2 pb-6">
                      {grupo.parejas.map((pareja) => (
                        <li
                          key={`${pareja.jugador1}-${pareja.jugador2}`}
                          className="flex items-center gap-3 rounded-xl border border-line bg-background px-3 py-2.5"
                        >
                          <span className="flex shrink-0" aria-hidden="true">
                            <Avatar
                              nombre={pareja.jugador1}
                              color={cat.color}
                              colorSoft={cat.colorSoft}
                            />
                            <Avatar
                              nombre={pareja.jugador2}
                              color={cat.color}
                              colorSoft={cat.colorSoft}
                              overlap
                            />
                          </span>
                          <span className="min-w-0 text-sm leading-snug">
                            {pareja.jugador1}{" "}
                            <span className="text-muted">/</span>{" "}
                            {pareja.jugador2}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
      </main>
    </>
  );
}

function iniciales(nombre: string) {
  const partes = nombre.split(" ").filter(Boolean);
  const primera = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return `${primera}${ultima}`.toUpperCase();
}

function Avatar({
  nombre,
  color,
  colorSoft,
  overlap = false,
}: {
  nombre: string;
  color: string;
  colorSoft: string;
  overlap?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      title={nombre}
      style={{ backgroundColor: colorSoft, color }}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-line ${overlap ? "-ml-3" : ""}`}
    >
      {iniciales(nombre)}
    </span>
  );
}
