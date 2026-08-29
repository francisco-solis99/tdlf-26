import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Info() {
  const { categories, registration, groups, courts } = site.info;

  return (
    <Section
      id="info"
      kicker="Antes de jugar"
      title="Lo que necesitas saber"
      intro={site.info.intro}
    >
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
        <Reveal className="bg-background p-6 sm:p-8">
          <CardTitle>Categorías</CardTitle>
          <ul className="mt-4 space-y-3">
            {categories.map((c) => (
              <li key={c.id} className="flex items-baseline gap-3">
                <span className="font-display text-2xl uppercase text-accent">
                  {c.name}
                </span>
                <span className="text-sm text-muted">{c.detail}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delayMs={60} className="bg-background p-6 sm:p-8">
          <CardTitle>Inscripción</CardTitle>
          <p className="font-display mt-4 text-4xl uppercase text-accent">
            {registration.priceLabel ?? "Por confirmar"}
          </p>
          <p className="mt-2 text-sm text-muted">{registration.note}</p>
        </Reveal>

        <Reveal delayMs={120} className="bg-background p-6 sm:p-8">
          <CardTitle>Grupos y parejas proyectadas</CardTitle>
          <ul className="mt-4 space-y-4">
            {groups.map((g) => (
              <li key={g.category}>
                <p className="font-semibold">{g.category}</p>
                <p className="text-sm text-muted">
                  {g.pairs} parejas · {g.groups} grupos de {g.groupSize}{" "}
                  (proyectado)
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delayMs={180} className="bg-background p-6 sm:p-8">
          <CardTitle>Canchas y pelota</CardTitle>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <span className="text-muted">Canchas: </span>
              {courts.count ?? "por confirmar"}
            </li>
            <li>
              <span className="text-muted">Pelota oficial: </span>
              {courts.ball ?? "por confirmar"}
            </li>
            <li className="text-muted">{courts.ballNote}</li>
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}

function CardTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
      {children}
    </h3>
  );
}
