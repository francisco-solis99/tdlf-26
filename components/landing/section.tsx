import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";

type SectionProps = {
  id?: string;
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  id,
  kicker,
  title,
  intro,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-16 border-t border-line py-16 sm:py-24 ${className ?? ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rotate-45 bg-accent" />
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted">
              {kicker}
            </p>
          </div>
          <h2 className="mt-3 font-display text-4xl uppercase leading-none sm:text-6xl">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-2xl text-muted">{intro}</p>
          ) : null}
        </Reveal>
        <div className="mt-10 sm:mt-14">{children}</div>
      </div>
    </section>
  );
}
