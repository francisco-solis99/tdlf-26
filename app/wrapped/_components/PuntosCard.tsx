import type { PuntosSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface PuntosCardProps {
  slide: PuntosSlide;
  color: string;
}

/**
 * Barras divergentes: a la derecha lo anotado (pf), a la izquierda lo
 * recibido (pc). Datos del ranking tal cual, en su orden.
 */
export function PuntosCard({ slide, color }: PuntosCardProps) {
  const maximo = Math.max(...slide.filas.flatMap((f) => [f.pf, f.pc]));

  return (
    <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
      <Reveal>
        <ol className="flex flex-col gap-1.5">
          {slide.filas.map((f) => (
            <li
              key={f.pareja}
              className="grid grid-cols-[2rem_1fr_auto_1fr_2rem] items-center gap-1"
            >
              <span
                className="text-left text-[11px] tabular-nums text-muted"
                aria-hidden="true"
              >
                {f.pc}
              </span>
              <div
                className="flex h-4 justify-end overflow-hidden rounded-l-full bg-surface"
                aria-hidden="true"
              >
                <div
                  className="wrapped-bar h-full rounded-l-full bg-muted"
                  style={{ width: `${(f.pc / maximo) * 100}%` }}
                />
              </div>
              <span className="sr-only">
                {f.pareja}: anotó {f.pf}, recibió {f.pc}
              </span>
              <span
                className="max-w-[7rem] truncate text-center text-[11px] leading-tight text-muted sm:max-w-[12rem] sm:text-xs"
                aria-hidden="true"
              >
                {f.pareja}
              </span>
              <div
                className="flex h-4 overflow-hidden rounded-r-full bg-surface"
                aria-hidden="true"
              >
                <div
                  className="wrapped-bar h-full rounded-r-full"
                  style={{
                    width: `${(f.pf / maximo) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span
                className="text-right text-[11px] tabular-nums"
                style={{ color }}
                aria-hidden="true"
              >
                {f.pf}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>← Recibidos</span>
          <span>Anotados →</span>
        </p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Puntos a favor y en contra por pareja
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Pareja
                </th>
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  A favor
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  En contra
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.filas.map((f) => (
                <tr key={f.pareja} className="border-t border-line">
                  <td className="py-1 pr-2">{f.pareja}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">{f.pf}</td>
                  <td className="py-1 text-right tabular-nums">{f.pc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
