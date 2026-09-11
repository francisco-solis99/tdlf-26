import Image from "next/image";
import { GravityPixels } from "@/components/gravity-pixels";
import { InstagramIcon } from "@/components/landing/header";
import { site } from "@/config/site";

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
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
              src="/sponsors/logo.webp"
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
          <div className="flex items-center gap-3">
            <a
              href={site.contact.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp del torneo"
              className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-accent hover:text-accent"
            >
              <WhatsappIcon />
            </a>
            <a
              href={site.contact.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram del torneo"
              className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-accent hover:text-accent"
            >
              <InstagramIcon />
            </a>
          </div>
          <span className="text-xs text-muted">{site.contact.instagram.handle}</span>
        </div>
      </div>
    </footer>
  );
}
