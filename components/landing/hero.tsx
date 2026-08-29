import Image from "next/image";
import { Countdown } from "@/components/countdown";
import { site } from "@/config/site";

export function Hero() {
  return (
    <section
      id="top"
      className="grain relative overflow-hidden border-b-2 border-accent bg-background"
    >
      {/* --- pixel / halftone decoration — reference: miduconf blob --- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* large organic halftone blob behind the title */}
        <div className="absolute left-1/2 top-[46%] h-[860px] w-[980px] max-w-[160vw] -translate-x-1/2 -translate-y-1/2">
          <div
            className="halftone-blob absolute inset-0 opacity-[0.32]"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
              maskImage:
                "radial-gradient(ellipse 68% 62% at 50% 50%, black 58%, transparent 78%)",
            }}
          />
          {/* pixel / glitch logo — absolute behind H1 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[520px] w-[520px] sm:h-[640px] sm:w-[640px]">
              {/* glitch layers — chromatic offset */}
              <Image
                src="/logo.jpg"
                alt=""
                fill
                className="object-contain opacity-[0.14] mix-blend-screen translate-x-[3px] hue-rotate-[-18deg] blur-[0.4px]"
                priority
                aria-hidden
              />
              <Image
                src="/logo.jpg"
                alt=""
                fill
                className="object-contain opacity-[0.14] mix-blend-screen -translate-x-[3px] hue-rotate-[18deg] blur-[0.4px]"
                priority
                aria-hidden
              />
              {/* main halftone logo */}
              <Image
                src="/logo.jpg"
                alt=""
                fill
                className="halftone-logo object-contain opacity-80"
                priority
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* scattered pixel dust — left / right, faded as in reference */}
        <div
          className="pixel-dust absolute -left-24 top-[4%] hidden h-[520px] w-[520px] opacity-[0.14] sm:block"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 72%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 72%)",
          }}
        />
        <div
          className="pixel-dust absolute -right-20 bottom-[6%] hidden h-[440px] w-[560px] opacity-[0.11] sm:block"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 58% at 50% 50%, black 30%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse 65% 58% at 50% 50%, black 30%, transparent 70%)",
          }}
        />
        {/* small accent pixel cluster — top edge like reference dots */}
        <div className="absolute left-[18%] top-[7%] hidden h-20 w-40 opacity-20 sm:block">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1.5px)",
              backgroundSize: "10px 10px",
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2.5 w-2.5 rotate-45 bg-accent" />
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted">
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
