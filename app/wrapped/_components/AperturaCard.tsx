import type { AperturaDatos, SlideBase } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";

interface AperturaCardProps {
  slide: SlideBase & { datos: AperturaDatos };
  color: string;
}

/** Apertura: conteo animado de parejas + fila de cifras + tabla. */
export function AperturaCard({ slide, color }: AperturaCardProps) {
  const { datos } = slide;
  const cifras: Array<[string, number]> = [
    ["partidos", datos.partidos],
    ["puntos", datos.puntos],
    ["ciudades", datos.ciudades],
  ];
  return (
    <CardFrame
      numero={<CountUp valor={datos.parejas} />}
      etiqueta="parejas"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <dl className="mt-4 grid grid-cols-3 gap-2">
          {cifras.map(([etiqueta, valor]) => (
            <div
              key={etiqueta}
              className="rounded-xl border border-line bg-surface px-3 py-2"
            >
              <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                {etiqueta}
              </dt>
              <dd className="font-display text-2xl tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">Cifras del torneo</caption>
            <tbody>
              {(
                [
                  ["Parejas", datos.parejas],
                  ["Partidos", datos.partidos],
                  ["Puntos", datos.puntos],
                  ["Ciudades", datos.ciudades],
                ] as Array<[string, number]>
              ).map(([k, v]) => (
                <tr key={k} className="border-t border-line">
                  <th scope="row" className="py-1 pr-2 font-normal text-muted">
                    {k}
                  </th>
                  <td className="py-1 text-right tabular-nums">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
