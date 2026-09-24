import Image from "next/image";
import { site } from "@/config/site";

export function Header({
  logoHref = "#top",
  navBasePath = "",
  showNav = true,
}: {
  logoHref?: string;
  navBasePath?: string;
  showNav?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href={logoHref} className="flex items-center gap-2.5">
          <Image
            src="/sponsors/logo.webp"
            alt="Torneo de las Fresas"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line"
            priority
          />
          <span className="font-display text-xl uppercase tracking-wide">
            TDLF<span className="text-accent">·26</span>
          </span>
        </a>

        {showNav && (
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-6 md:flex"
          >
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={`${navBasePath}${item.href}`}
                className="text-sm uppercase tracking-widest text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <a
          href={site.contact.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram del torneo"
          className="text-muted transition-colors hover:text-accent"
        >
          <InstagramIcon />
        </a>
      </div>
    </header>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
