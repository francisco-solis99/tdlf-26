import type { CardiacosSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface CardiacosCardProps {
  slide: CardiacosSlide;
  porTiempoDefinicion: string;
  color: string;
}

/**
 * Marcador de los 5 partidos más apretados. Sin histograma: top[] solo trae
 * los 5 más cercanos, así que graficar márgenes sería engañoso.
 */
export function CardiacosCard({
  slide,
  porTiempoDefinicion,
  color,
}: CardiacosCardProps) {
  return (
    <CardFrame
      numero={String(slide.partidos)}
      etiqueta="partidos"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <h3 className="font-display text-xl uppercase tracking-tight">
          Los 5 más apretados
        </h3>
        <ol className="mt-2 flex flex-col gap-2">
          {slide.top.map((p, i) => (
            <li
              key={`${p.gano}-${p.marcador}-${i}`}
              className="rounded-xl border border-line bg-surface px-3 py-2"
            >
              <p className="text-sm font-medium leading-snug">
                {p.gano}{" "}
                <span
                  className="font-display tabular-nums"
                  style={{ color }}
                >
                  {p.marcador}
                </span>{" "}
                {p.perdio}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <span>{p.grupo}</span>
                {p.por_tiempo && (
                  <span
                    title={porTiempoDefinicion}
                    className="cursor-help rounded-full border border-line px-2 py-px text-[11px] uppercase tracking-[0.14em]"
                  >
                    Por tiempo
                  </span>
                )}
              </p>
            </li>
          ))}
        </ol>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Los 5 partidos más apretados
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Ganó
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  Marcador
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  Perdió
                </th>
                <th scope="col" className="py-1 font-medium">
                  Grupo
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.top.map((p, i) => (
                <tr
                  key={`${p.gano}-${p.marcador}-${i}`}
                  className="border-t border-line"
                >
                  <td className="py-1 pr-2">{p.gano}</td>
                  <td className="py-1 pr-2 tabular-nums">{p.marcador}</td>
                  <td className="py-1 pr-2">{p.perdio}</td>
                  <td className="py-1 text-muted">{p.grupo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
