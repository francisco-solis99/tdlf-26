import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Rules() {
  const { match, advancement, tips } = site.rules;

  return (
    <Section
      id="reglas"
      kicker="Así se jugará"
      title="Reglas claras, competencia intensa"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal className="border border-line bg-surface p-6 sm:p-8">
          <BentoTitle index="01" title="El partido" />
          <ul className="mt-5 space-y-3">
            {match.map((rule) => (
              <li key={rule} className="flex gap-3 text-sm leading-relaxed">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
                {rule}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="grid gap-4">
          <Reveal
            delayMs={80}
            className="border border-accent/40 bg-accent/10 p-6 sm:p-8"
          >
            <BentoTitle index="02" title="Cómo se avanza" />
            <ul className="mt-5 space-y-3">
              {advancement.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm leading-relaxed">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
                  {rule}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={160} className="border border-line bg-surface p-6 sm:p-8">
            <BentoTitle index="03" title="Prepárate" />
            <ul className="mt-5 space-y-3">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm leading-relaxed">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-muted" />
                  {tip}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function BentoTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-display text-sm text-accent">{index}</span>
      <h3 className="font-display text-xl uppercase tracking-wide sm:text-2xl">
        {title}
      </h3>
    </div>
  );
}
