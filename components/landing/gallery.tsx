"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Gallery() {
  const photos = site.gallery.photos;
  const total = photos.length;
  const [index, setIndex] = useState(0);
  const [hitDir, setHitDir] = useState<1 | -1>(1);
  const [hitting, setHitting] = useState(false);
  const [swinging, setSwinging] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      setHitDir(dir);
      setHitting(true);
      setIndex((i) => (i + dir + total) % total);
      setTimeout(() => setHitting(false), 420);
    },
    [total],
  );

  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  const handleTap = () => {
    setSwinging(true);
    next();
    setTimeout(() => setSwinging(false), 380);
  };

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <Section
      id="galeria"
      kicker="Ediciones pasadas"
      title="Galería"
      intro={site.gallery.note}
    >
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:gap-6">
        {/* racquet — click/tap to cycle */}
        <div className="flex w-full flex-col items-center lg:w-[42%]">
          <button
            type="button"
            onClick={handleTap}
            className="group relative flex h-[380px] w-full items-center justify-center overflow-hidden rounded-xl border border-accent/25 bg-gradient-to-br from-[#3d0a06] via-[#200503] to-background shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-accent/40 sm:h-[400px] lg:h-[420px]"
            aria-label="Toca la raqueta para ver la siguiente foto"
          >
            {/* contrast backdrop pattern */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,120,100,0.9) 1px, transparent 1.6px)",
                backgroundSize: "14px 14px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-white/10"
            />

            {/* racquet — upright like reference, scaled to fit on mobile */}
            <div className="origin-center scale-[0.78] sm:scale-90 lg:scale-100">
            <div
              className="relative"
              style={{
                transform: swinging
                  ? "rotate(-14deg) translateX(6px) scale(1.02)"
                  : "rotate(0deg) translateX(0) scale(1)",
                transition: swinging
                  ? "transform 180ms cubic-bezier(0.34,1.56,0.64,1)"
                  : "transform 420ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              <div className="relative flex flex-col items-center text-[#f3ede1] drop-shadow-xl">
                {/* hand-drawn racquet — matches reference line-art */}
                <svg
                  viewBox="0 0 160 360"
                  className="h-[320px] w-auto sm:h-[340px]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <defs>
                    <clipPath id="tdlf-strings">
                      <ellipse cx="80" cy="108" rx="51" ry="82" />
                    </clipPath>
                  </defs>

                  {/* strings — dense hand-drawn crosshatch */}
                  <g
                    clipPath="url(#tdlf-strings)"
                    strokeWidth="1.3"
                    opacity="0.95"
                  >
                    {[
                      33, 39, 45, 51, 57, 62, 68, 74, 80, 86, 92, 98, 103,
                      109, 115, 121, 127,
                    ].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="22" x2={x - 3} y2="194" />
                    ))}
                    {[
                      30, 37, 44, 51, 58, 65, 72, 79, 86, 93, 100, 107, 114,
                      121, 128, 135, 142, 149, 156, 163, 170, 177, 184,
                    ].map((y) => (
                      <line key={`h-${y}`} x1="24" y1={y} x2="136" y2={y + 1.5} />
                    ))}
                  </g>

                  {/* head — inner hoop (thick, like reference) */}
                  <ellipse
                    cx="80"
                    cy="108"
                    rx="55"
                    ry="86"
                    strokeWidth="6"
                  />
                  {/* head — outer rim (thin double line) */}
                  <ellipse
                    cx="80"
                    cy="108"
                    rx="62"
                    ry="93"
                    strokeWidth="3"
                  />
                  {/* string-bed bottom curve */}
                  <path
                    d="M30 168 Q80 198 130 168"
                    strokeWidth="3.5"
                  />

                  {/* throat — outer frame continuing down */}
                  <path
                    d="M28 148 C38 178 62 210 70 252"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M132 148 C122 178 98 210 90 252"
                    strokeWidth="3.5"
                  />
                  {/* throat — inner double line */}
                  <path
                    d="M40 162 C50 186 64 212 72 246"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M120 162 C110 186 96 212 88 246"
                    strokeWidth="2.5"
                  />

                  {/* handle — shaft sides (double-stroke like sketch) */}
                  <path d="M70 250 L68 322" strokeWidth="3.5" />
                  <path d="M73.5 250 L71.5 320" strokeWidth="1.6" opacity="0.85" />
                  <path d="M90 250 L92 322" strokeWidth="3.5" />
                  <path d="M86.5 250 L88.5 320" strokeWidth="1.6" opacity="0.85" />
                  {/* handle top */}
                  <path d="M70 250 L90 250" strokeWidth="3" />

                  {/* grip tape — diagonal wraps */}
                  <g strokeWidth="2.6">
                    <path d="M69 262 L89 256" />
                    <path d="M69 272 L89 265" />
                    <path d="M68.5 282 L88.5 275" />
                    <path d="M68.5 292 L88.5 284" />
                    <path d="M68.5 302 L88.5 294" />
                    <path d="M68.5 311 L88.5 303" />
                    <path d="M68.5 320 L88.5 311" />
                  </g>

                  {/* butt cap — flared like reference */}
                  <path
                    d="M68 322 L63 340 Q80 348 97 340 L92 322"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M66 335 Q80 341 94 335"
                    strokeWidth="2.2"
                  />
                </svg>
              </div>

              </div>
            </div>

            <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-background/90 px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] text-foreground/90 shadow-lg transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              toca para golpear →
            </span>
          </button>

          {/* a11y controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
            >
              ‹
            </button>
            <span className="font-display text-sm tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-accent text-white transition-colors hover:bg-accent-strong"
            >
              ›
            </button>
          </div>
        </div>

        {/* card that racquet hits */}
        <div className="flex w-full flex-1 flex-col justify-center lg:w-[58%]">
          <Reveal>
            <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
              <div
                key={index}
                className={`relative aspect-[4/3] overflow-hidden bg-background ${
                  hitting
                    ? hitDir === 1
                      ? "animate-[hitInRight_420ms_cubic-bezier(0.22,1,0.36,1)]"
                      : "animate-[hitInLeft_420ms_cubic-bezier(0.22,1,0.36,1)]"
                    : ""
                }`}
              >
                <Image
                  src={photos[index]}
                  alt={`Foto ${index + 1} del Torneo de las Fresas`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                />
                <span className="pointer-events-none absolute bottom-3 right-4 rounded-sm bg-background/70 px-2 py-0.5 text-xs uppercase tracking-[0.18em] text-muted backdrop-blur-sm">
                  TDLF · {site.year}
                </span>
                {hitting && (
                  <span className="pointer-events-none absolute inset-0 bg-accent/10 animate-[flash_320ms_ease-out]" />
                )}
              </div>
            </div>
            <p className="mt-3 hidden text-center text-xs uppercase tracking-[0.18em] text-muted lg:block">
              {site.gallery.caption}
            </p>
          </Reveal>

          <div className="mt-4 hidden justify-center gap-2 lg:flex">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setHitDir(i > index ? 1 : -1);
                  setHitting(true);
                  setIndex(i);
                  setTimeout(() => setHitting(false), 420);
                }}
                aria-label={`Ir a foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-line hover:bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hitInRight {
          0% { transform: translateX(18%) scale(0.98); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes hitInLeft {
          0% { transform: translateX(-18%) scale(0.98); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes flash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </Section>
  );
}
