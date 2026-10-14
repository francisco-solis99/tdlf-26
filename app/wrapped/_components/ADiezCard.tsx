import type { ADiezSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface ADiezCardProps {
  slide: ADiezSlide;
  color: string;
}

/** Parejas que ganaron todo llegando siempre a 10. */
export function ADiezCard({ slide, color }: ADiezCardProps) {
  return (
    <CardFrame
      numero={String(slide.parejas.length)}
      etiqueta="parejas"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <ul className="flex flex-wrap gap-2">
          {slide.parejas.map((p) => (
            <li
              key={p}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium"
            >
              {p}
            </li>
          ))}
        </ul>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Parejas que siempre llegaron a 10
            </caption>
            <tbody>
              {slide.parejas.map((p) => (
                <tr key={p} className="border-t border-line">
                  <td className="py-1">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
