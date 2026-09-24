import { getCategoria } from "@/config/categorias";

export function CategoriaBadge({ slug }: { slug: string }) {
  const cat = getCategoria(slug);
  if (!cat) return <span className="text-sm text-muted">—</span>;
  return (
    <span
      className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
      style={{ backgroundColor: cat.colorSoft, color: cat.color }}
    >
      {cat.nombre}
    </span>
  );
}
