import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

const PLACEHOLDERS = ["Tu marca aquí", "Tu logo", "Tu empresa"];

export function Sponsors() {
  const sponsors = site.sponsors;

  return (
    <Section
      id="patrocinadores"
      kicker="Gracias a ellos"
      title="Patrocinadores"
      intro={
        sponsors.length === 0
          ? "Agradecemos a las marcas que hacen posible el torneo. La lista de patrocinadores 2026 se anunciará próximamente."
          : "Agradecemos la confianza de quienes hacen posible este proyecto."
      }
    >
      <Reveal>
        {sponsors.length === 0 ? (
          <div className="marquee overflow-hidden border border-line bg-surface">
            <div className="marquee-track flex w-max items-center">
              {[0, 1].map((track) => (
                <div
                  key={track}
                  aria-hidden={track === 1}
                  className="flex items-center"
                >
                  {PLACEHOLDERS.map((name) => (
                    <span
                      key={`${track}-${name}`}
                      className="font-display whitespace-nowrap px-10 py-8 text-2xl uppercase text-line sm:px-14"
                    >
                      {name} <span className="text-accent/40">·</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor) => (
              <li
                key={sponsor.name}
                className="flex h-24 items-center justify-center border border-line bg-surface font-display uppercase tracking-wide text-muted"
              >
                {sponsor.url ? (
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    {sponsor.name}
                  </a>
                ) : (
                  sponsor.name
                )}
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </Section>
  );
}
