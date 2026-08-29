import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Gallery() {
  return (
    <Section
      id="galeria"
      kicker="Ediciones pasadas"
      title="Galería"
      intro={site.gallery.note}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {Array.from({ length: site.gallery.placeholderCount }, (_, i) => (
          <Reveal key={i} delayMs={(i % 3) * 60}>
            <div
              className="grain relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-line bg-surface"
              role="img"
              aria-label={`Foto pendiente de la edición ${i + 1}`}
            >
              <span className="font-display text-3xl uppercase text-line sm:text-4xl">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
