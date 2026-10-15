import type {
  ParejaFicha,
  ParejaSlidePayload,
} from "@/lib/wrapped-data";

import { CardFrame } from "./CardFrame";
import { Reveal } from "./Reveal";

interface ParejaSlideCardProps {
  slide: ParejaSlidePayload;
  ficha: ParejaFicha;
  color: string;
}

function textoDe(datos: Record<string, unknown>, clave: string): string {
  const v = datos[clave];
  if (typeof v !== "string") {
    throw new Error(`[wrapped] slide sin datos.${clave} de texto`);
  }
  return v;
}

function numeroDe(datos: Record<string, unknown>, clave: string): number {
  const v = datos[clave];
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`[wrapped] slide sin datos.${clave} numérico`);
  }
  return v;
}

/** Portada: el nombre de la pareja como título al inicio de su historia. */
export function ParejaPortadaCard({
  ficha,
  color,
}: {
  ficha: ParejaFicha;
  color: string;
}) {
  return (
    <div className="flex min-h-[50dvh] flex-col justify-center gap-4">
      <p
        className="text-[11px] font-medium uppercase tracking-[0.25em]"
        style={{ color }}
      >
        {ficha.nombreCategoria} · {ficha.grupo}
      </p>
      <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
        {ficha.pareja}
      </h1>
      <p className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span
          className="rounded-full px-2 py-px font-semibold tabular-nums"
          style={{
            backgroundColor: `${color}1f`,
            color,
          }}
        >
          {ficha.resumen.sinergia}% sinergia
        </span>
        <span className="rounded-full border border-line px-2 py-px text-muted">
          {ficha.nivel.nombre}
        </span>
      </p>
      <p className="max-w-prose text-base leading-relaxed text-muted">
        Esta es su historia en la fase de grupos.
      </p>
    </div>
  );
}

/** Una tarjeta por slide de la ficha, en el orden del archivo. */
export function ParejaSlideCard({ slide, ficha, color }: ParejaSlideCardProps) {
  switch (slide.id) {
    case "su_torneo": {
      const r = ficha.resumen;
      const cifras: Array<[string, number]> = [
        ["partidos", r.partidos],
        ["puntos a favor", r.puntosFavor],
        ["puntos en contra", r.puntosContra],
        ["diferencia", r.diferencia],
      ];
      return (
        <CardFrame
          numero={String(r.victorias)}
          etiqueta="victorias"
          titulo={slide.titulo}
          texto={slide.texto}
          color={color}
        >
          <Reveal>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {cifras.map(([etiqueta, valor]) => (
                <div
                  key={etiqueta}
                  className="rounded-xl border border-line bg-surface px-3 py-2"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                    {etiqueta}
                  </dt>
                  <dd className="font-display text-2xl tabular-nums">
                    {valor}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </CardFrame>
      );
    }
    case "su_nivel": {
      const sinergia = numeroDe(slide.datos, "sinergia");
      return (
        <CardFrame
          numero={`${sinergia}%`}
          etiqueta="sinergia"
          titulo={slide.titulo}
          texto={slide.texto}
          color={color}
        >
          <Reveal>
            <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-relaxed">
              <span className="font-medium">{ficha.nivel.nombre}:</span>{" "}
              <span className="text-muted">{ficha.nivel.descripcion}</span>
            </p>
          </Reveal>
        </CardFrame>
      );
    }
    case "frente_al_resto": {
      const ataque = numeroDe(slide.datos, "ataque");
      const defensa = numeroDe(slide.datos, "defensa");
      const barras: Array<[string, number]> = [
        ["ataque", ataque],
        ["defensa", defensa],
      ];
      return (
        <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
          <Reveal>
            <ol className="flex flex-col gap-2">
              {barras.map(([etiqueta, valor]) => (
                <li key={etiqueta}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium capitalize">{etiqueta}</span>
                    <span className="tabular-nums text-muted">
                      {Math.round(valor * 100)}%
                    </span>
                  </div>
                  <div
                    className="mt-1 h-2 overflow-hidden rounded-full bg-surface"
                    role="img"
                    aria-label={`${etiqueta}: percentil ${valor}`}
                  >
                    <div
                      className="wrapped-bar h-full rounded-full"
                      style={{
                        width: `${valor * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </CardFrame>
      );
    }
    case "sus_insignias": {
      return (
        <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
          <Reveal>
            <ul className="flex flex-col gap-2">
              {ficha.insignias.map((ins) => (
                <li
                  key={ins.nombre}
                  className="rounded-xl border border-line bg-surface px-3 py-2"
                >
                  <p className="text-sm font-medium" style={{ color }}>
                    {ins.nombre}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {ins.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </CardFrame>
      );
    }
    case "mejor_victoria":
    case "mas_puntos":
    case "casi": {
      const marcador = textoDe(slide.datos, "marcador");
      const rival = textoDe(slide.datos, "rival");
      const margen =
        slide.id === "casi" &&
        typeof slide.datos["margen"] === "number"
          ? (slide.datos["margen"] as number)
          : null;
      return (
        <CardFrame
          numero={marcador}
          etiqueta="marcador"
          titulo={slide.titulo}
          texto={slide.texto}
          color={color}
        >
          <Reveal>
            <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
              Contra <span className="font-medium">{rival}</span>
              {margen !== null && (
                <span className="ml-2 text-muted">
                  (a {margen} puntos)
                </span>
              )}
            </p>
          </Reveal>
        </CardFrame>
      );
    }
    case "rival_lejano": {
      const km = numeroDe(slide.datos, "km");
      const rival = textoDe(slide.datos, "rival");
      return (
        <CardFrame
          numero={String(km)}
          etiqueta="km"
          titulo={slide.titulo}
          texto={slide.texto}
          color={color}
        >
          <Reveal>
            <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm">
              Rival: <span className="font-medium">{rival}</span>
            </p>
          </Reveal>
        </CardFrame>
      );
    }
    case "cierre": {
      return (
        <CardFrame titulo={slide.titulo} texto={slide.texto} color={color}>
          <Reveal>
            <svg
              viewBox="0 0 200 120"
              role="img"
              aria-label="Celebración"
              className="mx-auto w-full max-w-xs"
            >
              <desc>Festejo con trofeo y confeti</desc>
              {[
                [20, 18], [45, 8], [70, 20], [95, 6], [120, 18], [145, 8],
                [170, 22], [32, 40], [58, 34], [108, 36], [134, 30], [160, 42],
                [184, 36],
              ].map(([x, y], i) => (
                <g key={i} aria-hidden="true">
                  <rect
                    x={x}
                    y={y}
                    width={i % 3 === 0 ? 7 : 5}
                    height={i % 2 === 0 ? 5 : 8}
                    rx={1.5}
                    fill={color}
                    opacity={i % 4 === 0 ? 0.45 : 0.9}
                    transform={`rotate(${(i * 47) % 90} ${x} ${y})`}
                  />
                </g>
              ))}
              <g
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                <path d="M78 62 h44 v10 c0 16 -10 26 -22 26 c-12 0 -22 -10 -22 -26 z" />
                <path d="M78 66 H60 c0 14 8 22 20 24" />
                <path d="M122 66 h18 c0 14 -8 22 -20 24" />
                <path d="M92 98 v8 h16 v-8" />
                <path d="M84 112 h32" />
              </g>
              <circle cx={100} cy={76} r={4} fill={color} opacity={0.9} />
            </svg>
          </Reveal>
        </CardFrame>
      );
    }
    default: {
      // Slide desconocido: se muestra el texto antes que fallar el build.
      return (
        <CardFrame titulo={slide.titulo} texto={slide.texto} color={color} />
      );
    }
  }
}

/** Tabla de partidos de la pareja, como tarjeta final fuera de los slides. */
export function ParejaPartidosCard({
  ficha,
  color,
}: {
  ficha: ParejaFicha;
  color: string;
}) {
  return (
    <CardFrame
      numero={String(ficha.partidos.length)}
      etiqueta="partidos"
      titulo="Sus partidos"
      texto={`Así le fue a ${ficha.pareja} en la fase de grupos.`}
      color={color}
    >
      <Reveal>
        <ol className="flex flex-col gap-2">
          {ficha.partidos.map((p, i) => (
            <li
              key={`${p.rival}-${p.marcador ?? "default"}-${i}`}
              className="rounded-xl border border-line bg-surface px-3 py-2"
            >
              <p className="text-sm font-medium leading-snug">
                <span
                  className="mr-1.5 inline-block w-4 font-display"
                  style={{ color }}
                >
                  {p.resultado}
                </span>
                {p.marcador ?? "Default"}
                <span className="ml-1.5 text-muted">vs {p.rival}</span>
              </p>
              {(p.porTiempo || p.esDefault) && (
                <p className="mt-0.5 flex flex-wrap gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {p.porTiempo && <span>Por tiempo</span>}
                  {p.esDefault && <span>Default</span>}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Reveal>
    </CardFrame>
  );
}
