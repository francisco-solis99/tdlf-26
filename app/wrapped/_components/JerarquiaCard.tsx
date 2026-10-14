import type { JerarquiaSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface JerarquiaCardProps {
  slide: JerarquiaSlide;
  color: string;
}

/**
 * Escaleras por grupo derivadas del ranking publicado (pg tal cual, solo se
 * agrupa y ordena para mostrar). Sin histograma: top[] solo trae los 5
 * partidos más apretados.
 */
export function JerarquiaCard({ slide, color }: JerarquiaCardProps) {
  const maximo = Math.max(
    ...slide.grupos.flatMap((g) => g.victorias),
  );

  return (
    <CardFrame
      numero={String(slide.grupos.length)}
      etiqueta="grupos"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <ol className="flex flex-col gap-3">
          {slide.grupos.map((g) => (
            <li
              key={g.grupo}
              className="rounded-xl border border-line bg-surface p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {g.grupo}
              </p>
              <ol className="mt-2 flex items-end gap-1.5" aria-hidden="true">
                {g.victorias.map((v, i) => (
                  <li
                    key={i}
                    className="wrapped-bar flex-1 rounded-sm"
                    style={{
                      height: `${12 + (v / maximo) * 44}px`,
                      backgroundColor: color,
                      opacity: 0.45 + (0.55 * (i + 1)) / g.victorias.length,
                    }}
                  />
                ))}
              </ol>
              <p className="sr-only">
                {g.grupo}: {g.victorias.join(", ")} victorias
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
              Victorias por lugar en cada grupo
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Grupo
                </th>
                <th scope="col" className="py-1 font-medium">
                  Victorias
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.grupos.map((g) => (
                <tr key={g.grupo} className="border-t border-line">
                  <th scope="row" className="py-1 pr-2 font-normal">
                    {g.grupo}
                  </th>
                  <td className="py-1 tabular-nums">
                    {g.victorias.join(" · ")}
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
