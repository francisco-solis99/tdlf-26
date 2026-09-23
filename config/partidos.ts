// Partidos por grupo — datos falsos para la UI.
// TODO(db): reemplazar listPartidos por query a Supabase.
// Round-robin simple: cada pareja enfrenta una vez a cada rival
// (4 parejas → 6 partidos, 3 parejas → 3 partidos).
import { listGrupos, type Pareja } from "@/config/grupos";

export type Partido = {
  id: string;
  parejaA: Pareja;
  parejaB: Pareja;
  scoreA: number | null;
  scoreB: number | null;
};

export function isJugado(p: Partido): boolean {
  return p.scoreA !== null && p.scoreB !== null;
}

export function ganador(p: Partido): "A" | "B" | null {
  if (!isJugado(p)) return null;
  if ((p.scoreA as number) === (p.scoreB as number)) return null;
  return (p.scoreA as number) > (p.scoreB as number) ? "A" : "B";
}

// Cruces round-robin (método círculo) sobre los índices de parejas.
function cruces(n: number): Array<[number, number]> {
  const ids = Array.from({ length: n }, (_, i) => i);
  const impar = n % 2 === 1;
  const lista = impar ? [...ids, -1] : [...ids];
  const rondas = lista.length - 1;
  const out: Array<[number, number]> = [];
  const arr = [...lista];
  for (let r = 0; r < rondas; r++) {
    for (let i = 0; i < arr.length / 2; i++) {
      const a = arr[i];
      const b = arr[arr.length - 1 - i];
      if (a !== -1 && b !== -1) out.push([a, b]);
    }
    // rota todos menos el primero
    arr.splice(1, 0, arr.pop() as number);
  }
  return out;
}

// Scores falsos deterministas (sin random: la página es estática).
// Ganador a 10, perdedor 4–8; los últimos 2 cruces quedan pendientes.
function scoreFalso(i: number, total: number): [number, number] | [null, null] {
  if (i >= total - 2) return [null, null];
  const ganaA = (i * 7 + 3) % 2 === 0;
  const perdedor = 4 + ((i * 5 + 1) % 5); // 4..8
  return ganaA ? [10, perdedor] : [perdedor, 10];
}

export type Posicion = {
  pareja: Pareja;
  pj: number;
  pg: number;
  pp: number;
  pf: number;
  pc: number;
  dif: number;
  pos: number;
};

const CACHE = new Map<string, Partido[]>();

// Tabla de posiciones: orden por ganados, desempate por puntos a favor.
// Solo cuentan partidos jugados. Posiciones secuenciales (1..N).
export function computeStandings(slug: string, letra: string): Posicion[] {
  const grupo = listGrupos(slug).find(
    (g) => g.letra.toUpperCase() === letra.toUpperCase(),
  );
  if (!grupo) return [];

  const key = (p: Pareja) => `${p.jugador1} / ${p.jugador2}`;
  const tabla = new Map<string, Posicion>();
  for (const pareja of grupo.parejas) {
    tabla.set(key(pareja), {
      pareja,
      pj: 0,
      pg: 0,
      pp: 0,
      pf: 0,
      pc: 0,
      dif: 0,
      pos: 0,
    });
  }
  for (const partido of listPartidos(slug, letra)) {
    if (!isJugado(partido)) continue;
    const a = tabla.get(key(partido.parejaA));
    const b = tabla.get(key(partido.parejaB));
    if (!a || !b) continue;
    const sA = partido.scoreA as number;
    const sB = partido.scoreB as number;
    a.pj += 1;
    b.pj += 1;
    a.pf += sA;
    a.pc += sB;
    b.pf += sB;
    b.pc += sA;
    if (sA > sB) {
      a.pg += 1;
      b.pp += 1;
    } else {
      b.pg += 1;
      a.pp += 1;
    }
  }
  const filas = [...tabla.values()];
  for (const f of filas) f.dif = f.pf - f.pc;
  filas.sort(
    (x, y) =>
      y.pg - x.pg ||
      y.pf - x.pf ||
      key(x.pareja).localeCompare(key(y.pareja)),
  );
  filas.forEach((f, i) => {
    f.pos = i + 1;
  });
  return filas;
}

export function listPartidos(slug: string, letra: string): Partido[] {
  const key = `${slug}/${letra.toUpperCase()}`;
  const cached = CACHE.get(key);
  if (cached) return cached;

  const grupo = listGrupos(slug).find(
    (g) => g.letra.toUpperCase() === letra.toUpperCase(),
  );
  const partidos: Partido[] = (grupo ? cruces(grupo.parejas.length) : []).map(
    ([a, b], i, arr) => {
      const [scoreA, scoreB] = scoreFalso(i, arr.length);
      return {
        id: `${slug}-grupo-${grupo?.letra.toLowerCase()}-p${i + 1}`,
        parejaA: (grupo as NonNullable<typeof grupo>).parejas[a],
        parejaB: (grupo as NonNullable<typeof grupo>).parejas[b],
        scoreA,
        scoreB,
      };
    },
  );
  CACHE.set(key, partidos);
  return partidos;
}
