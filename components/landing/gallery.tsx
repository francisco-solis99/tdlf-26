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
            className="group relative flex h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.09] via-surface to-background shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-accent/30 lg:h-[420px]"
            aria-label="Toca la raqueta para ver la siguiente foto"
          >
            {/* contrast backdrop pattern */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,77,61,0.9) 1px, transparent 1.6px)",
                backgroundSize: "14px 14px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-line/60"
            />

            {/* racquet — upright like reference */}
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
              <div className="relative flex flex-col items-center drop-shadow-xl">
                {/* head — black frame fading to red at the bottom */}
                <div className="relative h-[210px] w-[150px] sm:h-[230px] sm:w-[164px]">
                  <svg
                    viewBox="0 0 150 210"
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="tdlf-frame"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#0d0d11" />
                        <stop offset="55%" stopColor="#131317" />
                        <stop offset="76%" stopColor="#7d0e0e" />
                        <stop offset="100%" stopColor="#c41616" />
                      </linearGradient>
                    </defs>
                    <ellipse
                      cx="75"
                      cy="96"
                      rx="64"
                      ry="84"
                      fill="none"
                      stroke="url(#tdlf-frame)"
                      strokeWidth="9"
                    />
                  </svg>
                  {/* outer rim highlight */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      background:
                        "linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.14) 50%, transparent 58%)",
                      borderRadius: "50% / 55%",
                    }}
                  />
                  {/* strings */}
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[26px] left-[16px] right-[16px] top-[16px] rounded-[50%/55%] opacity-[0.96]"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.92) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.92) 1px, transparent 1px)",
                      backgroundSize: "10.5px 10.5px",
                    }}
                  />
                  {/* Head H — pixel stepped like reference */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[46%] h-[42px] w-[44px] -translate-x-1/2 -translate-y-1/2 opacity-[0.92]"
                  >
                    <div className="absolute left-[6px] top-[4px] h-[34px] w-[3px] bg-black" />
                    <div className="absolute right-[6px] top-[4px] h-[34px] w-[3px] bg-black" />
                    <div className="absolute left-[6px] top-[18px] h-[3px] w-[32px] bg-black" />
                    <div className="absolute left-1/2 top-[18px] h-[3px] w-[10px] -translate-x-1/2 bg-black" />
                    {/* stepped corners */}
                    <div className="absolute left-[2px] top-[2px] h-[3px] w-[8px] bg-black" />
                    <div className="absolute right-[2px] top-[2px] h-[3px] w-[8px] bg-black" />
                    <div className="absolute left-[2px] bottom-[2px] h-[3px] w-[8px] bg-black" />
                    <div className="absolute right-[2px] bottom-[2px] h-[3px] w-[8px] bg-black" />
                  </div>
                  {/* frame text — side */}
                  <span className="pointer-events-none absolute bottom-[30%] right-[6px] rotate-90 text-[6.5px] font-black tracking-widest text-white/90">
                    HEAD
                  </span>
                </div>
                {/* throat — silver Y */}
                <div className="relative -mt-[2px] flex h-7 w-[42px] justify-center">
                  <div className="absolute left-[3px] top-0 h-7 w-[14px] origin-bottom -rotate-[13deg] rounded-sm bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-400 shadow-sm" />
                  <div className="absolute right-[3px] top-0 h-7 w-[14px] origin-bottom rotate-[13deg] rounded-sm bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-400 shadow-sm" />
                  <div className="absolute bottom-0 h-2 w-5 bg-zinc-900" />
                </div>
                {/* handle — plain black grip like reference */}
                <div className="relative h-[104px] w-[18px] overflow-hidden rounded-b-[9px] bg-zinc-900 shadow-inner">
                  {/* grip texture lines */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent 0 5px, rgba(255,255,255,0.06) 5px 6px)",
                    }}
                  />
                  {/* head logo on grip bottom */}
                  <div className="absolute bottom-[10px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border border-white/40" />
                </div>
                <div className="h-[5px] w-[20px] rounded-b-md bg-black/70" />
              </div>

              <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/90 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted shadow transition-opacity group-hover:bg-accent group-hover:text-white">
                toca para golpear →
              </span>
            </div>
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
