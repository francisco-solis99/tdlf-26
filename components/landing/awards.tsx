import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Awards() {
  return (
    <Section
      id="premios"
      kicker="La recompensa"
      title="Premios"
      intro={`Bolsa en premios a repartir de ${site.awards.total} — reconocimiento a quienes dejen todo en la cancha.`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {site.awards.categories.map((award, i) => (
          <Reveal
            key={award.category}
            delayMs={i * 80}
            className="border border-line bg-surface p-6 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl uppercase">
                {award.category}
              </h3>
              <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-accent" />
            </div>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">
              Bolsa {award.bolsa}
            </p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {award.places.map((p) => (
                <li
                  key={p.place}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm uppercase tracking-widest text-muted">
                    {p.place}
                  </span>
                  <span className="font-display text-xl uppercase">
                    {p.prize ?? "Por anunciar"}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
