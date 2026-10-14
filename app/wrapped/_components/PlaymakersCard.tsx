import type { PlaymakersSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface PlaymakersCardProps {
  slide: PlaymakersSlide;
  color: string;
}

/** Top de sinergia con la marca del promedio. */
export function PlaymakersCard({ slide, color }: PlaymakersCardProps) {
  const cima = slide.ranking[0];
  const maximo = Math.max(...slide.ranking.map((r) => r.sinergia));
  const minimo = Math.min(0, ...slide.ranking.map((r) => r.sinergia));

  return (
    <CardFrame
      numero={cima ? `${cima.sinergia}%` : "—"}
      etiqueta="sinergia máxima"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <ol className="flex flex-col gap-2">
          {slide.ranking.map((r, i) => (
            <li key={`${r.pareja}-${i}`}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 truncate font-medium">
                  <span className="mr-1.5 tabular-nums text-muted">{i + 1}</span>
                  {r.pareja}
                </span>
                <span className="shrink-0 tabular-nums" style={{ color }}>
                  {r.sinergia}%
                </span>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-surface"
                role="img"
                aria-label={`${r.pareja}: ${r.sinergia}% de sinergia`}
              >
                <div
                  className="wrapped-bar h-full rounded-full"
                  style={{
                    width: `${((r.sinergia - minimo) / (maximo - minimo || 1)) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">
          Promedio del torneo: {slide.promedio}%
        </p>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver todas ({slide.todas.length} parejas)
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Sinergia de todas las parejas
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  #
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  Pareja
                </th>
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  PJ
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  Sinergia
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.todas.map((r, i) => (
                <tr key={`${r.pareja}-${i}`} className="border-t border-line">
                  <td className="py-1 pr-2 tabular-nums text-muted">{i + 1}</td>
                  <td className="py-1 pr-2">{r.pareja}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{r.pj}</td>
                  <td className="py-1 text-right tabular-nums">
                    {r.sinergia}%
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
