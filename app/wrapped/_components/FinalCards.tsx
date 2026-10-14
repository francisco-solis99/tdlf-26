import type {
  DistanciaSlide,
  ExtremosSlide,
  ParejaExtremosSlide,
} from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

/** El marcador menos parejo del torneo. */
export function ExtremosCard({
  slide,
  color,
}: {
  slide: ExtremosSlide;
  color: string;
}) {
  return (
    <CardFrame
      numero={slide.marcador}
      etiqueta="marcador"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <p className="sr-only">Marcador: {slide.marcador}</p>
      </Reveal>
    </CardFrame>
  );
}

/** La pareja de los extremos (solo libre). El texto cuenta la historia. */
export function ParejaExtremosCard({
  slide,
  color,
}: {
  slide: ParejaExtremosSlide;
  color: string;
}) {
  return (
    <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
      <Reveal>
        <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium">
          {slide.pareja}
        </p>
      </Reveal>
    </CardFrame>
  );
}

/** Distancia entre ciudades de origen (formas distintas por categoría). */
export function DistanciaCard({
  slide,
  color,
}: {
  slide: DistanciaSlide;
  color: string;
}) {
  const km = slide.km ?? slide.kmMax ?? 0;
  return (
    <CardFrame
      numero={String(km)}
      etiqueta="km"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <dl className="grid grid-cols-1 gap-2">
          <div className="rounded-xl border border-line bg-surface px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              Partidos locales
            </dt>
            <dd className="font-display text-2xl tabular-nums">
              {slide.locales}
            </dd>
          </div>
        </dl>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">Datos de distancia</caption>
            <tbody>
              {slide.km !== null && (
                <tr className="border-t border-line">
                  <th scope="row" className="py-1 pr-2 font-normal text-muted">
                    Distancia promedio
                  </th>
                  <td className="py-1 text-right tabular-nums">
                    {slide.km} km
                  </td>
                </tr>
              )}
              {slide.kmMax !== null && (
                <tr className="border-t border-line">
                  <th scope="row" className="py-1 pr-2 font-normal text-muted">
                    Distancia máxima
                  </th>
                  <td className="py-1 text-right tabular-nums">
                    {slide.kmMax} km
                  </td>
                </tr>
              )}
              <tr className="border-t border-line">
                <th scope="row" className="py-1 pr-2 font-normal text-muted">
                  Partidos locales
                </th>
                <td className="py-1 text-right tabular-nums">
                  {slide.locales}
                </td>
              </tr>
            </tbody>
          </table>
        </details>
      </Reveal>
    </CardFrame>
  );
}
