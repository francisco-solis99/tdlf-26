import type { ArquetiposSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface ArquetiposCardProps {
  slide: ArquetiposSlide;
  color: string;
}

/** Tres niveles con conteo, descripciones y lista completa de pares. */
export function ArquetiposCard({ slide, color }: ArquetiposCardProps) {
  const nombres = Object.keys(slide.conteo);
  const total = Object.values(slide.conteo).reduce((a, b) => a + b, 0);

  return (
    <CardFrame
      numero={String(nombres.length)}
      etiqueta="niveles"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <div
          className="flex h-4 overflow-hidden rounded-full bg-surface"
          role="img"
          aria-label={nombres
            .map((n) => `${n}: ${slide.conteo[n]}`)
            .join(", ")}
        >
          {nombres.map((n, i) => (
            <div
              key={n}
              className="wrapped-bar h-full"
              style={{
                width: `${((slide.conteo[n] ?? 0) / (total || 1)) * 100}%`,
                backgroundColor: color,
                opacity: 0.45 + (0.55 * (nombres.length - i)) / nombres.length,
              }}
            />
          ))}
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {nombres.map((n) => (
            <li
              key={n}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <p className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{n}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {slide.conteo[n]} parejas
                </span>
              </p>
              {slide.descripciones[n] && (
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {slide.descripciones[n]}
                </p>
              )}
            </li>
          ))}
        </ol>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Nivel y sinergia de cada pareja
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Pareja
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  Nivel
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  Sinergia
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.pares.map((p) => (
                <tr key={p.pareja} className="border-t border-line">
                  <td className="py-1 pr-2">
                    {p.pareja}
                    {p.muestraPequena && (
                      <span className="ml-1.5 text-[11px] text-muted">
                        (1 partido)
                      </span>
                    )}
                    {p.insignias.length > 0 && (
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {p.insignias.join(" · ")}
                      </span>
                    )}
                  </td>
                  <td className="py-1 pr-2 text-muted">{p.arquetipo}</td>
                  <td className="py-1 text-right tabular-nums">
                    {p.sinergia}%
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
