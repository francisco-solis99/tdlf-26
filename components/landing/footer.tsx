import { InstagramIcon } from "@/components/landing/header";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t-2 border-accent">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-3xl uppercase leading-none">
            TDLF<span className="text-accent">·26</span>
          </p>
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
