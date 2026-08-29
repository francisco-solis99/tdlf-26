import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { GravityPixels } from "@/components/gravity-pixels";
import { site } from "@/config/site";

export function Hero() {
  return (
    <section
      id="top"
      className="grain relative overflow-hidden border-b-2 border-accent bg-background"
    >
      {/* --- background decoration --- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* restored floating red bubble */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

        {/* interactive red pixels — gravity/rotate on cursor move */}
        <GravityPixels targetId="top" />

        {/* large organic halftone blob behind the title — keeps pink shape */}
        <div className="absolute left-1/2 top-[46%] h-[760px] w-[860px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2">
          <div
            className="halftone-blob absolute inset-0 opacity-[0.26]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
            }}
          />
          {/* pixel / glitch logo — smaller + subtle blur behind H1 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[360px] w-[360px] sm:h-[440px] sm:w-[440px] blur-[0.6px]">
              {/* glitch layers — chromatic offset */}
              <Image
                src="/logo.webp"
                alt=""
                fill
                className="object-contain opacity-[0.12] mix-blend-screen translate-x-[2px] hue-rotate-[-18deg] blur-[0.8px]"
                priority
                aria-hidden
              />
              <Image
                src="/logo.webp"
                alt=""
                fill
                className="object-contain opacity-[0.12] mix-blend-screen -translate-x-[2px] hue-rotate-[18deg] blur-[0.8px]"
                priority
                aria-hidden
              />
              {/* main halftone logo */}
              <Image
                src="/logo.webp"
                alt=""
                fill
                className="halftone-logo object-contain opacity-[0.78] blur-[0.7px]"
                priority
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.07] px-4 py-1.5 backdrop-blur-sm">
          <span className="inline-block h-2 w-2 rotate-45 bg-accent" />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/85">
            {site.edition} · {site.year}
          </p>
        </div>

        <h1 className="relative z-10 font-display uppercase leading-[0.9] tracking-tight text-6xl sm:text-8xl lg:text-[9rem]">
          Torneo de
          <br />
          las <span className="text-accent">Fresas</span>
        </h1>

        <p className="relative z-10 max-w-xl text-lg text-muted">
          {site.tagline}
        </p>

        <div className="relative z-10">
          <Countdown />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              ¿Cuándo?
            </p>
            <p className="mt-1 text-xl font-semibold">
              {site.date.label}{" "}
              <span className="font-normal text-muted">
                · {site.date.weekday}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              ¿Dónde?
            </p>
            <a
              href={site.venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-1 inline-flex items-center gap-2 text-xl font-semibold transition-colors hover:text-accent"
            >
              {site.venue.name}, {site.venue.city}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
            <p className="text-sm text-muted">Mostrar en el mapa</p>
          </div>
        </div>
      </div>
    </section>
  );
}
