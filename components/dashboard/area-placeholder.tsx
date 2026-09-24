import { Card } from "@/components/ui/card";

export function AreaPlaceholder({
  kicker,
  titulo,
  descripcion,
  icono,
}: {
  kicker: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
        {kicker}
      </p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-wide sm:text-5xl">
        {titulo}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        {descripcion}
      </p>

      <Card className="mt-8 flex flex-col items-center gap-3 rounded-xl p-10 text-center sm:p-14">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10"
        >
          {icono}
        </span>
        <p className="font-display text-xl uppercase tracking-wide">
          Área en construcción
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Esta sección se trabajará por áreas. Por ahora no hay contenido que
          mostrar.
        </p>
      </Card>
    </div>
  );
}
