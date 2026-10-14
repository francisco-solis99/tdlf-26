import type { AtaqueDefensaSlide } from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface AtaqueDefensaCardProps {
  slide: AtaqueDefensaSlide;
  color: string;
}

const ANCHO = 400;
const ALTO = 300;
const MARGEN = 36;

/** Scatter ataque (x) vs defensa (y) con promedios por partido del ranking. */
export function AtaqueDefensaCard({ slide, color }: AtaqueDefensaCardProps) {
  const xs = slide.puntos.map((p) => p.aFavor);
  const ys = slide.puntos.map((p) => p.enContra);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const escalaX = (v: number) =>
    MARGEN +
    ((v - minX) / (maxX - minX || 1)) * (ANCHO - MARGEN * 2);
  // Eje Y invertido: arriba = menos puntos recibidos (mejor defensa).
  const escalaY = (v: number) =>
    MARGEN + ((v - minY) / (maxY - minY || 1)) * (ALTO - MARGEN * 2);

  // Línea de tendencia por mínimos cuadrados sobre los puntos mostrados:
  // dibuja la correlación (sube a la derecha = mejor ataque y defensa).
  const n = slide.puntos.length;
  const mediaX = xs.reduce((a, b) => a + b, 0) / (n || 1);
  const mediaY = ys.reduce((a, b) => a + b, 0) / (n || 1);
  const cov = slide.puntos.reduce(
    (a, p) => a + (p.aFavor - mediaX) * (p.enContra - mediaY),
    0,
  );
  const varianza = xs.reduce((a, x) => a + (x - mediaX) ** 2, 0);
  const pendiente = varianza === 0 ? 0 : cov / varianza;
  const interseccion = mediaY - pendiente * mediaX;
  const redondea = (v: number) => Math.round(v * 10) / 10;
  const x1 = escalaX(minX);
  const y1 = escalaY(interseccion + pendiente * minX);
  const x2 = escalaX(maxX);
  const y2 = escalaY(interseccion + pendiente * maxX);

  return (
    <CardFrame
      numero={String(slide.r)}
      etiqueta="correlación"
      titulo={slide.titulo}
      texto={slide.texto}
      color={color}
    >
      <Reveal>
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          role="img"
          aria-label="Dispersión de ataque contra defensa por pareja"
          className="w-full rounded-xl border border-line bg-surface"
        >
          <desc>
            {slide.puntos
              .map((p) => `${p.pareja}: ${p.aFavor} a favor, ${p.enContra} en contra por partido`)
              .join("; ")}
          </desc>
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={MARGEN}
              x2={ANCHO - MARGEN}
              y1={MARGEN + t * (ALTO - MARGEN * 2)}
              y2={MARGEN + t * (ALTO - MARGEN * 2)}
              stroke="currentColor"
              strokeWidth={0.5}
              opacity={0.2}
            />
          ))}
          <line
            x1={redondea(x1)}
            x2={redondea(x2)}
            y1={redondea(y1)}
            y2={redondea(y2)}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="7 5"
            opacity={0.9}
          >
            <desc>Línea de tendencia: a más puntos a favor, menos en contra</desc>
          </line>
          {slide.puntos.map((p) => (
            <g key={p.pareja}>
              <desc>
                {p.pareja}: {p.aFavor} a favor, {p.enContra} en contra por
                partido
              </desc>
              <circle
                cx={Math.round(escalaX(p.aFavor) * 10) / 10}
                cy={Math.round(escalaY(p.enContra) * 10) / 10}
                r={5}
                fill={color}
                opacity={0.8}
              />
            </g>
          ))}
          <text
            x={ANCHO / 2}
            y={ALTO - 8}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            opacity={0.6}
          >
            Puntos a favor por partido →
          </text>
          <text
            x={MARGEN}
            y={ALTO - 22}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {minX}
          </text>
          <text
            x={ANCHO - MARGEN}
            y={ALTO - 22}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {maxX}
          </text>
          <text
            x={10}
            y={ALTO / 2}
            textAnchor="middle"
            fontSize={11}
            fill="currentColor"
            opacity={0.6}
            transform={`rotate(-90 10 ${ALTO / 2})`}
          >
            ← Menos recibidos arriba
          </text>
          <text
            x={MARGEN - 4}
            y={MARGEN + 22}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {minY}
          </text>
          <text
            x={MARGEN - 4}
            y={ALTO - MARGEN + 4}
            textAnchor="end"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            {maxY}
          </text>
        </svg>
        <p className="mt-2 flex items-center gap-2 text-xs text-muted">
          <svg width="28" height="6" aria-hidden="true">
            <line
              x1="0"
              x2="28"
              y1="3"
              y2="3"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="7 5"
            />
          </svg>
          Línea de tendencia
        </p>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted underline-offset-4 hover:text-foreground hover:underline">
            Ver datos
          </summary>
          <table className="mt-2 w-full border-collapse text-left">
            <caption className="sr-only">
              Promedios por partido de cada pareja
            </caption>
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.18em] text-muted">
                <th scope="col" className="py-1 pr-2 font-medium">
                  Pareja
                </th>
                <th scope="col" className="py-1 pr-2 text-right font-medium">
                  A favor/p
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  En contra/p
                </th>
              </tr>
            </thead>
            <tbody>
              {slide.puntos.map((p) => (
                <tr key={p.pareja} className="border-t border-line">
                  <td className="py-1 pr-2">{p.pareja}</td>
                  <td className="py-1 pr-2 text-right tabular-nums">
                    {p.aFavor}
                  </td>
                  <td className="py-1 text-right tabular-nums">
                    {p.enContra}
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
