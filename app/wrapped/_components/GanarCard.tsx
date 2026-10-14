import type { GanarSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface GanarCardProps {
  slide: GanarSlide;
  color: string;
}

/** Comparación de dos parejas: más victorias no es más dominio. */
export function GanarCard({ slide, color }: GanarCardProps) {
  const pares = [slide.a, slide.b];
  const maxSinergia = Math.max(slide.a.sinergia, slide.b.sinergia);

  return (
    <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
      <Reveal>
        <ol className="grid gap-2 sm:grid-cols-2">
          {pares.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <p className="text-sm font-medium leading-snug">{p.pareja}</p>
              <p className="mt-2 font-display text-4xl tabular-nums">
                {p.pg}
                <span className="ml-1.5 text-xs font-sans font-medium uppercase tracking-[0.18em] text-muted">
                  ganados
                </span>
              </p>
              <p className="mt-1 text-sm tabular-nums" style={{ color }}>
                {p.sinergia}% sinergia
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-background"
                role="img"
                aria-label={`${p.pareja}: ${p.sinergia}% de sinergia`}
              >
                <div
                  className="wrapped-bar h-full rounded-full"
                  style={{
                    width: `${(p.sinergia / (maxSinergia || 1)) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">Comparación de parejas</caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Pareja
                </th>
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  PG
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  Sinergia
                </th>
              </tr>
            </thead>
            <tbody>
              {pares.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="py-1 pr-2">{p.pareja}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{p.pg}</td>
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
