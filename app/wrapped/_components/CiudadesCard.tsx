import { readFile } from "node:fs/promises";
import path from "node:path";
import { geoMercator, geoPath } from "d3-geo";

import type { CiudadAgregada, SlideBase } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface CiudadesCardProps {
  slide: SlideBase & { ciudades: CiudadAgregada[] };
  color: string;
}

const ANCHO = 400;
const ALTO = 300;

interface Punto {
  x: number;
  y: number;
  ciudad: CiudadAgregada;
}

/**
 * Mapa agregado: la proyección se ajusta a la caja de las ciudades (con
 * margen para que los valores atípicos como CDMX y Xalapa sigan visibles) y
 * los trazados SVG se calculan en el servidor. El geojson nunca llega al
 * navegador. Solo conteos agregados, nada por persona.
 */
async function calculaMapa(ciudades: CiudadAgregada[]): Promise<{
  estados: string[];
  puntos: Punto[];
}> {
  const puntosFC = {
    type: "FeatureCollection",
    features: ciudades.map((c) => ({
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [c.lon, c.lat] },
    })),
  } as const;

  const proyeccion = geoMercator().fitExtent(
    [
      [24, 16],
      [ANCHO - 24, ALTO - 16],
    ],
    // fitExtent acepta cualquier objeto geográfico; los puntos definen la caja.
    puntosFC as unknown as Parameters<typeof proyeccion.fitExtent>[1],
  );

  const crudo = await readFile(
    path.join(process.cwd(), "data/analysis/mx_estados.geojson"),
    "utf-8",
  );
  const estados = JSON.parse(crudo) as {
    features: Array<{
      geometry: unknown;
      properties?: Record<string, unknown>;
    }>;
  };
  const traza = geoPath(proyeccion);
  const lineas: string[] = [];
  for (const f of estados.features) {
    const d = traza(
      f as unknown as Parameters<typeof traza>[0],
    );
    if (d) lineas.push(d);
  }

  const puntos: Punto[] = [];
  for (const c of ciudades) {
    const p = proyeccion([c.lon, c.lat]);
    if (!p) continue;
    puntos.push({
      x: Math.round(p[0] * 10) / 10,
      y: Math.round(p[1] * 10) / 10,
      ciudad: c,
    });
  }
  return { estados: lineas, puntos };
}

export async function CiudadesCard({ slide, color }: CiudadesCardProps) {
  const { estados, puntos } = await calculaMapa(slide.ciudades);
  const maximo = Math.max(...slide.ciudades.map((c) => c.jugadores));
  const ordenadas = [...slide.ciudades].sort(
    (a, b) => b.jugadores - a.jugadores,
  );

  return (
    <CardFrame
      numero={String(slide.ciudades.length)}
      etiqueta="ciudades"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          role="img"
          aria-label={`Mapa con ${slide.ciudades.length} ciudades de origen`}
          className="w-full rounded-xl border border-line bg-surface"
        >
          {/* <desc> en vez de <title>: React 19 trata <title> como metadato
              hoistable al hidratar y rompería la hidratación dentro del SVG. */}
          <desc>
            {ordenadas
              .map((c) => `${c.ciudad}: ${c.jugadores}`)
              .join(", ")}
          </desc>
          {estados.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.6}
              opacity={0.35}
            />
          ))}
          {puntos.map((p) => (
            <g key={`${p.ciudad.ciudad}-${p.ciudad.estado}`}>
              <desc>
                {p.ciudad.ciudad} ({p.ciudad.estado}): {p.ciudad.jugadores}{" "}
                jugadores
              </desc>
              <circle
                cx={p.x}
                cy={p.y}
                r={3 + (p.ciudad.jugadores / maximo) * 9}
                fill={color}
                opacity={0.85}
              />
            </g>
          ))}
        </svg>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Jugadores por ciudad de origen
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Ciudad
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  Estado
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  Jugadores
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((c) => (
                <tr
                  key={`${c.ciudad}-${c.estado}`}
                  className="border-t border-line"
                >
                  <td className="py-1 pr-2">{c.ciudad}</td>
                  <td className="py-1 pr-2 text-muted">{c.estado}</td>
                  <td className="py-1 text-right tabular-nums">
                    {c.jugadores}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
