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
                src="/sponsors/logo.webp"
                alt=""
                fill
                className="object-contain opacity-[0.12] mix-blend-screen translate-x-[2px] hue-rotate-[-18deg] blur-[0.8px]"
                priority
                aria-hidden
              />
              <Image
                src="/sponsors/logo.webp"
                alt=""
                fill
                className="object-contain opacity-[0.12] mix-blend-screen -translate-x-[2px] hue-rotate-[18deg] blur-[0.8px]"
                priority
                aria-hidden
              />
              {/* main halftone logo */}
              <Image
                src="/sponsors/logo.webp"
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

        <div className="relative z-10 flex flex-col items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            Cierre de inscripción:{" "}
            <span className="font-semibold text-foreground">
              {site.cierreInscripcion}
            </span>
          </p>
          <a
            href={site.contact.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent-strong"
          >
            <WhatsappIcon className="h-[18px] w-[18px]" />
            Contactar para inscribirse
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-[18px] w-[18px]"}
      aria-hidden="true"
    >
      <path d="M12.5 2.5a9.2 9.2 0 0 0-8 13.7L3 21l5-1.3A9.2 9.2 0 1 0 12.5 2.5Z" />
      <path
        d="M9.2 10.4c.25-.6.8-1.5 1.15-1.5.15 0 .28.05.44.3l.62.88c.08.14.08.29 0 .44l-.4.5c-.08.1-.07.22.02.37.18.33.62.86 1.15 1.28.47.37 1.05.7 1.42.82.16.05.28.02.36-.07l.5-.5c.09-.09.2-.12.33-.06l.88.42c.22.1.33.22.33.44 0 .33-1 1.3-1.52 1.4-.4.07-.86 0-1.86-.6-1.05-.64-1.88-1.46-2.56-2.4-.6-.84-.96-1.66-.96-2.3 0-.46.86-1.55 1.22-1.71.12-.05.23-.04.34.07l.44.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
