// Avatares overlap de una pareja (iniciales con el color de la categoría).
export function iniciales(nombre: string) {
  const partes = nombre.split(" ").filter(Boolean);
  const primera = partes[0]?.[0] ?? "";
  const ultima =
    partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return `${primera}${ultima}`.toUpperCase();
}

export function Avatar({
  nombre,
  color,
  colorSoft,
  overlap = false,
}: {
  nombre: string;
  color: string;
  colorSoft: string;
  overlap?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      title={nombre}
      style={{ backgroundColor: colorSoft, color }}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-line ${overlap ? "-ml-3" : ""}`}
    >
      {iniciales(nombre)}
    </span>
  );
}

export function ParejaAvatars({
  jugador1,
  jugador2,
  color,
  colorSoft,
}: {
  jugador1: string;
  jugador2: string;
  color: string;
  colorSoft: string;
}) {
  return (
    <span className="flex shrink-0" aria-hidden="true">
      <Avatar nombre={jugador1} color={color} colorSoft={colorSoft} />
      <Avatar
        nombre={jugador2}
        color={color}
        colorSoft={colorSoft}
        overlap
      />
    </span>
  );
}
