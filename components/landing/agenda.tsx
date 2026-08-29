import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Agenda() {
  return (
    <Section
      id="agenda"
      kicker="El día del torneo"
      title="Agenda"
      intro={site.agenda.dateLabel}
    >
      <ol className="relative ml-2 space-y-0 border-l border-line">
        {site.agenda.items.map((item, i) => (
          <Reveal key={item.title} delayMs={i * 60}>
            <li className="relative py-6 pl-8">
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-9 h-2 w-2 rotate-45 bg-accent"
              />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="countdown-num font-display w-24 shrink-0 text-lg uppercase text-accent">
                  {item.time ?? "--:--"}
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">
        Horarios por confirmar · Hora de Irapuato (CDMX)
      </p>
    </Section>
  );
}
