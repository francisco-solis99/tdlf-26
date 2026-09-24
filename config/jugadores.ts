// Jugadores y parejas del panel — datos falsos para la UI.
// TODO(db): reemplazar por queries a Supabase.
// Las parejas referencian jugadores existentes (no se crean inline).

export type Jugador = {
  id: string;
  nombre: string;
  edad: number;
  ciudad: string;
  categoriaSlug: string;
};

export type ParejaAdmin = {
  id: string;
  jugador1Id: string;
  jugador2Id: string;
  categoriaSlug: string;
  grupo: string | null; // vacío por ahora; se asignará después
};

export const JUGADORES_SEED: Jugador[] = [
  // Libre
  { id: "j-carlos-mendoza", nombre: "Carlos Mendoza", edad: 28, ciudad: "Irapuato", categoriaSlug: "libre" },
  { id: "j-luis-torres", nombre: "Luis Torres", edad: 31, ciudad: "Irapuato", categoriaSlug: "libre" },
  { id: "j-jorge-ramirez", nombre: "Jorge Ramírez", edad: 26, ciudad: "Silao", categoriaSlug: "libre" },
  { id: "j-miguel-soto", nombre: "Miguel Soto", edad: 34, ciudad: "Guanajuato", categoriaSlug: "libre" },
  // Femenil
  { id: "j-ana-pau-rios", nombre: "Ana Pau Ríos", edad: 24, ciudad: "Irapuato", categoriaSlug: "femenil" },
  { id: "j-vale-montes", nombre: "Vale Montes", edad: 27, ciudad: "León", categoriaSlug: "femenil" },
  { id: "j-fer-camacho", nombre: "Fer Camacho", edad: 22, ciudad: "Irapuato", categoriaSlug: "femenil" },
  { id: "j-sofi-becerra", nombre: "Sofi Becerra", edad: 29, ciudad: "Silao", categoriaSlug: "femenil" },
  // Masters
  { id: "j-beto-ayala", nombre: "Beto Ayala", edad: 56, ciudad: "Irapuato", categoriaSlug: "masters" },
  { id: "j-chuy-renteria", nombre: "Chuy Rentería", edad: 61, ciudad: "Pénjamo", categoriaSlug: "masters" },
  { id: "j-lupe-banuelos", nombre: "Lupe Bañuelos", edad: 54, ciudad: "Irapuato", categoriaSlug: "masters" },
  { id: "j-nico-zepeda", nombre: "Nico Zepeda", edad: 58, ciudad: "Abasolo", categoriaSlug: "masters" },
];

export const PAREJAS_SEED: ParejaAdmin[] = [
  { id: "p1", jugador1Id: "j-carlos-mendoza", jugador2Id: "j-luis-torres", categoriaSlug: "libre", grupo: null },
  { id: "p2", jugador1Id: "j-jorge-ramirez", jugador2Id: "j-miguel-soto", categoriaSlug: "libre", grupo: null },
  { id: "p3", jugador1Id: "j-ana-pau-rios", jugador2Id: "j-vale-montes", categoriaSlug: "femenil", grupo: null },
  { id: "p4", jugador1Id: "j-fer-camacho", jugador2Id: "j-sofi-becerra", categoriaSlug: "femenil", grupo: null },
  { id: "p5", jugador1Id: "j-beto-ayala", jugador2Id: "j-chuy-renteria", categoriaSlug: "masters", grupo: null },
  { id: "p6", jugador1Id: "j-lupe-banuelos", jugador2Id: "j-nico-zepeda", categoriaSlug: "masters", grupo: null },
];

export function getJugador(jugadores: Jugador[], id: string): Jugador | undefined {
  return jugadores.find((j) => j.id === id);
}
