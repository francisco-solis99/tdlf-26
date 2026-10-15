import type { ReactNode } from "react";

interface CardFrameProps {
  numero?: ReactNode;
  etiqueta?: string;
  titulo: string;
  texto: string;
  color: string;
  /** Insignia decorativa opcional sobre el número o el titular. */
  icono?: ReactNode;
  children?: ReactNode;
}

/**
 * Marco genérico de tarjeta: número grande como ancla visual, titular y el
 * texto ya visible (es la historia). El contenido propio va en children.
 */
export function CardFrame({
  numero,
  etiqueta,
  titulo,
  texto,
  color,
  icono,
  children,
}: CardFrameProps) {
  return (
    <div className="flex flex-col gap-4">
      {icono !== undefined && (
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {icono}
        </span>
      )}
      {numero !== undefined && (
        <p
          className="font-display text-7xl leading-none tracking-tight tabular-nums sm:text-8xl"
          style={{ color }}
        >
          {numero}
          {etiqueta !== undefined && (
            <span className="ml-2 align-middle text-sm font-sans font-medium uppercase tracking-[0.2em] text-muted">
              {etiqueta}
            </span>
          )}
        </p>
      )}
      <h2 className="font-display text-3xl uppercase leading-[1.02] tracking-tight sm:text-4xl">
        {titulo}
      </h2>
      <p className="max-w-prose text-base leading-relaxed text-muted">
        {texto}
      </p>
      {children}
    </div>
  );
}
