import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Sponsors() {
  const sponsors = site.sponsors;

  return (
    <section
      id="patrocinadores"
      className="border-t border-line py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-20 xl:gap-24">
          {/* left — sticky title + subtitle */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 bg-accent"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Gracias a ellos
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rotate-45 bg-accent"
                />
                <h2 className="font-display text-4xl uppercase leading-none tracking-tight sm:text-5xl">
                  Patrocinadores
                </h2>
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rotate-45 bg-accent"
                />
              </div>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
                Gracias a nuestros{" "}
                <span className="font-semibold text-foreground">sponsors</span>{" "}
                que hacen posible{" "}
                <span className="font-semibold text-foreground">
                  este evento
                </span>
              </p>
            </Reveal>
          </div>

          {/* right — sponsors list (page scroll is here) */}
          <div>
            {sponsors.length === 0 ? (
              <Reveal>
                <div className="flex items-center justify-center border border-line bg-surface px-10 py-12 text-muted">
                  La lista de patrocinadores 2026 se anunciará próximamente.
                </div>
              </Reveal>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sponsors.map((sponsor, i) => (
                  <Reveal key={sponsor.name} delayMs={(i % 2) * 80}>
                    <div className="group flex h-32 items-center justify-center rounded-md border border-line bg-surface p-6 transition-colors hover:border-accent/30 sm:h-36 lg:h-40 lg:p-8">
                      <Image
                        src={sponsor.image}
                        alt={sponsor.name}
                        width={240}
                        height={120}
                        className="sponsor-logo h-full w-full object-contain opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:contrast-100"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
