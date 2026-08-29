"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Sponsors() {
  const sponsors = site.sponsors;
  const containerRef = useRef<HTMLDivElement>(null);
  const [glitching, setGlitching] = useState(false);
  const [hasGlitched, setHasGlitched] = useState(false);

  useEffect(() => {
    if (hasGlitched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasGlitched) {
            setGlitching(true);
            setHasGlitched(true);
            setTimeout(() => setGlitching(false), 900);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.3 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [hasGlitched]);

  return (
    <Section
      id="patrocinadores"
      kicker="Gracias a ellos"
      title="Patrocinadores"
      intro="Agradecemos la confianza de quienes hacen posible este proyecto."
    >
      <Reveal>
        {sponsors.length === 0 ? (
          <div className="flex items-center justify-center border border-line bg-surface px-10 py-8 text-muted">
            La lista de patrocinadores 2026 se anunciará próximamente.
          </div>
        ) : (
          <div
            ref={containerRef}
            className="marquee overflow-hidden border border-line bg-surface"
          >
            <div className="marquee-track flex w-max items-center">
              {[0, 1].map((track) => (
                <div
                  key={track}
                  aria-hidden={track === 1}
                  className="flex items-center gap-6 px-3 py-4"
                >
                  {sponsors.map((sponsor) => (
                    <div
                      key={`${track}-${sponsor.name}`}
                      className="flex h-[88px] w-[168px] shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white p-3"
                    >
                      <Image
                        src={sponsor.image}
                        alt={sponsor.name}
                        width={144}
                        height={72}
                        className={
                          glitching
                            ? "halftone-sponsor h-full w-full object-contain"
                            : "h-full w-full object-contain transition-all duration-500"
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </Section>
  );
}
