import { Section } from "@/components/landing/section";
import { Reveal } from "@/components/reveal";
import { site } from "@/config/site";

export function Merch() {
  return (
    <Section
      id="merch"
      kicker="Luce los colores"
      title="Merch oficial"
      intro="Playeras y gorras diseñadas para la cuarta edición. El catálogo completo estará disponible próximamente."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {site.merch.products.map((product, i) => (
          <Reveal
            key={product.name}
            delayMs={i * 80}
            className="group border border-line bg-surface"
          >
            <div className="grain relative flex h-[420px] items-center justify-center overflow-hidden border-b border-line bg-background p-4 sm:h-[520px]">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-6xl uppercase text-line transition-colors group-hover:text-accent/30">
                  TDLF·26
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-display text-xl uppercase">{product.name}</h3>
              <p className="mt-1 text-sm text-muted">{product.blurb}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
