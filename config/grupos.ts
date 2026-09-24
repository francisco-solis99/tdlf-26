// Grupos por categoría — datos falsos para la UI.
// TODO(db): reemplazar listGrupos por query a Supabase.
// La forma (slug → grupos → parejas → 2 jugadores) ya es la que usará la DB.

export type Pareja = {
  jugador1: string;
  jugador2: string;
};

export type Grupo = {
  id: string;
  letra: string;
  nombre: string;
  parejas: Pareja[];
};

const LETRAS = "ABCDEFGH".split("");

const LIBRE_JUGADORES = [
  "Carlos Mendoza", "Luis Torres", "Jorge Ramírez", "Miguel Soto",
  "Andrés Vega", "Pablo Núñez", "Diego Fuentes", "Raúl Cordero",
  "Emilio Salas", "Fernando Ríos", "Gabriel Mora", "Hugo Tapia",
  "Iván Cabrera", "Jesús Luna", "Kevin Rosas", "Óscar Padilla",
  "Mario Aguirre", "Emilio Herrera", "Omar Campos", "Rafa Duarte",
  "Sergio Méndez", "Tomás Gil", "Uriel Soto", "Víctor Lara",
  "Adrián Paz", "Bruno Salgado", "César Ibarra", "Daniel Vera",
  "Erik Montes", "Fabián Cruz", "Gael Ortiz", "Héctor Peña",
  "Israel Vidal", "Joel Marín", "Alan Brito", "Marco Ruiz",
  "Poncho León", "Chava Domínguez", "Beto Quesada", "Lalo Fierro",
  "Nando Solís", "Paco Beltrán", "Tavo Miranda", "Yair Cortés",
  "Zaid Amaral", "Alex Treviño", "Iván Peralta", "Memo Ochoa",
];

const FEMENIL_JUGADORAS = [
  "Ana Pau Ríos", "Vale Montes", "Fer Camacho", "Sofi Becerra",
  "Dani Trejo", "Pau Ledesma", "Xime Navarro", "Renata Falcón",
  "Majo Uribe", "Caro Iñiguez", "Lucía Partida", "Marisol Dueñas",
  "Elena Bravo", "Gaby Zamora", "Itzel Mercado", "Jimena Orozco",
  "Karla Ulloa", "Lizbeth Vega", "Mariana Solano", "Nadia Prieto",
  "Paula Vicencio", "Regina Galván", "Samadhi Cruz", "Tania Esparza",
];

const MASTERS_JUGADORES = [
  "Beto Ayala", "Chuy Rentería", "Lupe Bañuelos", "Nico Zepeda",
  "Toño Lugo", "Pepe Garduño", "Chon Araiza", "Lencho Perales",
  "Cuco Villalobos", "Tino Rea", "Goyo Salazar", "Milo Cárdenas",
  "Santos Macías", "Polo Ibáñez", "Nayo Jasso", "Quico Montelongo",
  "Chema Vallarta", "Fello Oñate", "Augusto Quirino", "Ramiro Sada",
  "Efraín Muñiz", "Gilberto Jara", "Honorio Lerma", "Eleuterio Casas",
];

// Grupos y parejas por categoría, según config actual:
// Libre 6 grupos × 4 parejas · Femenil y Masters 4 grupos × 3 parejas.
const GRUPOS_POR_CATEGORIA: Record<string, string[]> = {
  libre: LIBRE_JUGADORES,
  femenil: FEMENIL_JUGADORAS,
  masters: MASTERS_JUGADORES,
};

const PAREJAS_POR_GRUPO: Record<string, number> = {
  libre: 4,
  femenil: 3,
  masters: 3,
};

function buildGrupos(slug: string): Grupo[] {
  const nombres = GRUPOS_POR_CATEGORIA[slug] ?? [];
  const porGrupo = PAREJAS_POR_GRUPO[slug] ?? 3;
  const parejas: Pareja[] = [];
  for (let i = 0; i + 1 < nombres.length; i += 2) {
    parejas.push({ jugador1: nombres[i], jugador2: nombres[i + 1] });
  }
  const grupos: Grupo[] = [];
  for (let g = 0; g * porGrupo < parejas.length; g++) {
    const letra = LETRAS[g] ?? String(g + 1);
    grupos.push({
      id: `${slug}-grupo-${letra.toLowerCase()}`,
      letra,
      nombre: `Grupo ${letra}`,
      parejas: parejas.slice(g * porGrupo, g * porGrupo + porGrupo),
    });
  }
  return grupos;
}

const CACHE = new Map<string, Grupo[]>();

export function listGrupos(slug: string): Grupo[] {
  const cached = CACHE.get(slug);
  if (cached) return cached;
  const grupos = buildGrupos(slug);
  CACHE.set(slug, grupos);
  return grupos;
}
