import Image from "next/image";
import { GravityPixels } from "@/components/gravity-pixels";
import { InstagramIcon } from "@/components/landing/header";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden border-t-2 border-accent"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <GravityPixels targetId="footer" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.webp"
              alt="Torneo de las Fresas"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <p className="font-display text-3xl uppercase leading-none">
              TDLF<span className="text-accent">·26</span>
            </p>
          </div>
          <p className="mt-3 text-sm text-muted">
            {site.date.weekday} {site.date.label} de {site.year} ·{" "}
            {site.venue.name}, {site.venue.city}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <a
            href={site.contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram del torneo"
            className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-accent hover:text-accent"
          >
            <InstagramIcon />
          </a>
          <span className="text-xs text-muted">{site.contact.instagram.handle}</span>
        </div>
      </div>
    </footer>
  );
}
