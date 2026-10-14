import "server-only";

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import libreRaw from "@/data/analysis/libre.json";
import mastersRaw from "@/data/analysis/masters.json";
import metaRaw from "@/data/analysis/meta.json";
import indiceRaw from "@/data/analysis/indice.json";

export const CATEGORIAS_VALIDAS = ["libre", "masters"] as const;
export type CategoriaId = (typeof CATEGORIAS_VALIDAS)[number];

export function esCategoriaValida(value: string): value is CategoriaId {
  return (CATEGORIAS_VALIDAS as readonly string[]).includes(value);
}

/* Tipos mínimos: solo los campos que las tarjetas muestran. */

export interface AperturaDatos {
  parejas: number;
  partidos: number;
  puntos: number;
  ciudades: number;
}

export interface CiudadAgregada {
  ciudad: string;
  estado: string;
  lat: number;
  lon: number;
  jugadores: number;
}

export interface SlideBase {
  id: string;
  titulo: string;
  texto: string;
}

export interface MapaSlide extends SlideBase {
  ciudades: CiudadAgregada[];
}

export interface JerarquiaGrupo {
  grupo: string;
  victorias: number[];
}

export interface JerarquiaSlide extends SlideBase {
  grupos: JerarquiaGrupo[];
}

export interface CardiacoPartido {
  gano: string;
  marcador: string;
  perdio: string;
  grupo: string;
  margen: number;
  total: number;
  por_tiempo: boolean;
}

export interface CardiacosSlide extends SlideBase {
  umbral: number;
  partidos: number;
  top: CardiacoPartido[];
}

export interface RankingFila {
  id: string;
  pareja: string;
  grupo: string;
  pj: number;
  pg: number;
  pf: number;
  pc: number;
  dif: number;
  sinergia: number;
  muestraPequena: boolean;
}

export interface PuntosSlide extends SlideBase {
  filas: Array<{ pareja: string; pf: number; pc: number }>;
}

export interface AtaqueDefensaSlide extends SlideBase {
  r: number;
  puntos: Array<{ pareja: string; aFavor: number; enContra: number }>;
}

export interface PlaymakersSlide extends SlideBase {
  promedio: number;
  ranking: Array<{ pareja: string; pj: number; sinergia: number }>;
  /** Todas las parejas de la categoría, para la tabla completa. */
  todas: Array<{ pareja: string; pj: number; sinergia: number }>;
}

export interface ADiezSlide extends SlideBase {
  parejas: string[];
}

export interface GanarSlide extends SlideBase {
  a: RankingFila;
  b: RankingFila;
}

export interface ArquetipoPar {
  pareja: string;
  arquetipo: string;
  sinergia: number;
  pj: number;
  muestraPequena: boolean;
  insignias: string[];
}

export interface ArquetiposSlide extends SlideBase {
  conteo: Record<string, number>;
  descripciones: Record<string, string>;
  pares: ArquetipoPar[];
}

export interface ExtremosSlide extends SlideBase {
  marcador: string;
}

export interface ParejaExtremosSlide extends SlideBase {
  pareja: string;
}

export interface DistanciaSlide extends SlideBase {
  km: number | null;
  kmMax: number | null;
  locales: number;
}

export interface WrappedCategoria {
  categoria: CategoriaId;
  nombre: string;
  apertura: SlideBase & { datos: AperturaDatos };
  mapa: MapaSlide;
  jerarquia: JerarquiaSlide;
  cardiacos: CardiacosSlide;
  porTiempoDefinicion: string;
  puntos: PuntosSlide;
  ataqueDefensa: AtaqueDefensaSlide;
  playmakers: PlaymakersSlide;
  aDiez: ADiezSlide;
  /** Solo existe en libre. */
  ganar: GanarSlide | null;
  arquetipos: ArquetiposSlide;
  extremos: ExtremosSlide;
  /** Solo existe en libre. */
  parejaExtremos: ParejaExtremosSlide | null;
  distancia: DistanciaSlide;
}

/* Guardas en tiempo de ejecución: un desajuste debe fallar el build (throw),
   nunca convertirse en un 404 silencioso. */

function esNumero(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function exige(condicion: boolean, mensaje: string): void {
  if (!condicion) throw new Error(`[wrapped] ${mensaje}`);
}

function extraeSlide(
  slides: unknown,
  id: string,
  categoria: string,
): Record<string, unknown> {
  exige(Array.isArray(slides), `slides no es un arreglo en ${categoria}`);
  const slide = (slides as unknown[]).find(
    (s): s is Record<string, unknown> =>
      typeof s === "object" &&
      s !== null &&
      (s as Record<string, unknown>)["id"] === id,
  );
  exige(slide !== undefined, `falta el slide "${id}" en ${categoria}`);
  const s = slide as Record<string, unknown>;
  exige(typeof s["titulo"] === "string", `slide "${id}" sin titulo`);
  exige(typeof s["texto"] === "string", `slide "${id}" sin texto`);
  exige(
    typeof s["datos"] === "object" && s["datos"] !== null,
    `slide "${id}" sin datos`,
  );
  return s;
}

function extraeApertura(
  slides: unknown,
  categoria: string,
): SlideBase & { datos: AperturaDatos } {
  const s = extraeSlide(slides, "apertura", categoria);
  const d = s["datos"] as Record<string, unknown>;
  for (const k of ["parejas", "partidos", "puntos", "ciudades"] as const) {
    exige(esNumero(d[k]), `apertura.${k} no es número en ${categoria}`);
  }
  return {
    id: "apertura",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    datos: {
      parejas: d["parejas"] as number,
      partidos: d["partidos"] as number,
      puntos: d["puntos"] as number,
      ciudades: d["ciudades"] as number,
    },
  };
}

function extraeMapa(slides: unknown, categoria: string): MapaSlide {
  const s = extraeSlide(slides, "mapa", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(Array.isArray(d["ciudades"]), `mapa.ciudades no es arreglo`);
  const ciudades = (d["ciudades"] as unknown[]).map((c, i) => {
    const r = c as Record<string, unknown>;
    exige(typeof r["ciudad"] === "string", `mapa.ciudades[${i}] sin ciudad`);
    exige(typeof r["estado"] === "string", `mapa.ciudades[${i}] sin estado`);
    exige(esNumero(r["lat"]), `mapa.ciudades[${i}] sin lat`);
    exige(esNumero(r["lon"]), `mapa.ciudades[${i}] sin lon`);
    exige(
      esNumero(r["jugadores"]),
      `mapa.ciudades[${i}] sin jugadores`,
    );
    return {
      ciudad: r["ciudad"] as string,
      estado: r["estado"] as string,
      lat: r["lat"] as number,
      lon: r["lon"] as number,
      jugadores: r["jugadores"] as number,
    };
  });
  // Solo agregados; nunca se exponen edades, fotos ni ciudades por persona.
  return {
    id: "mapa",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    ciudades,
  };
}

/**
 * Escaleras derivadas del ranking publicado (pg tal cual, solo se agrupa y
 * ordena para mostrar). No se reexporta nada: los vectores por grupo salen
 * de los datos que ya trae el archivo.
 */
function derivaJerarquia(
  ranking: unknown,
  slide: Record<string, unknown>,
  categoria: string,
): JerarquiaSlide {
  exige(Array.isArray(ranking), `ranking no es arreglo en ${categoria}`);
  const porGrupo = new Map<string, number[]>();
  for (const fila of ranking as unknown[]) {
    const r = fila as Record<string, unknown>;
    exige(typeof r["grupo"] === "string", `ranking sin grupo`);
    exige(esNumero(r["pg"]), `ranking sin pg`);
    const lista = porGrupo.get(r["grupo"] as string) ?? [];
    lista.push(r["pg"] as number);
    porGrupo.set(r["grupo"] as string, lista);
  }
  exige(porGrupo.size > 0, `ranking vacío en ${categoria}`);
  const grupos: JerarquiaGrupo[] = [...porGrupo.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([grupo, victorias]) => ({
      grupo,
      victorias: [...victorias].sort((a, b) => b - a),
    }));
  return {
    id: "jerarquia",
    titulo: slide["titulo"] as string,
    texto: slide["texto"] as string,
    grupos,
  };
}

function extraeCardiacos(
  slides: unknown,
  categoria: string,
): CardiacosSlide {
  const s = extraeSlide(slides, "cardiacos", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(esNumero(d["umbral"]), `cardiacos.umbral no es número`);
  exige(esNumero(d["partidos"]), `cardiacos.partidos no es número`);
  exige(Array.isArray(d["top"]), `cardiacos.top no es arreglo`);
  const top = (d["top"] as unknown[]).map((p, i) => {
    const r = p as Record<string, unknown>;
    for (const k of ["gano", "marcador", "perdio", "grupo"] as const) {
      exige(typeof r[k] === "string", `cardiacos.top[${i}] sin ${k}`);
    }
    exige(esNumero(r["margen"]), `cardiacos.top[${i}] sin margen`);
    exige(esNumero(r["total"]), `cardiacos.top[${i}] sin total`);
    exige(
      typeof r["por_tiempo"] === "boolean",
      `cardiacos.top[${i}] sin por_tiempo`,
    );
    return {
      gano: r["gano"] as string,
      marcador: r["marcador"] as string,
      perdio: r["perdio"] as string,
      grupo: r["grupo"] as string,
      margen: r["margen"] as number,
      total: r["total"] as number,
      por_tiempo: r["por_tiempo"] as boolean,
    };
  });
  return {
    id: "cardiacos",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    umbral: d["umbral"] as number,
    partidos: d["partidos"] as number,
    top,
  };
}

function extraeRanking(fuente: unknown, categoria: string): RankingFila[] {
  const ranking = (fuente as Record<string, unknown>)["ranking"];
  exige(Array.isArray(ranking), `ranking no es arreglo en ${categoria}`);
  return (ranking as unknown[]).map((f, i) => {
    const r = f as Record<string, unknown>;
    exige(typeof r["id"] === "string", `ranking[${i}] sin id`);
    exige(typeof r["pareja"] === "string", `ranking[${i}] sin pareja`);
    exige(typeof r["grupo"] === "string", `ranking[${i}] sin grupo`);
    for (const k of ["pj", "pg", "pf", "pc", "dif", "sinergia"] as const) {
      exige(esNumero(r[k]), `ranking[${i}] sin ${k}`);
    }
    return {
      id: r["id"] as string,
      pareja: r["pareja"] as string,
      grupo: r["grupo"] as string,
      pj: r["pj"] as number,
      pg: r["pg"] as number,
      pf: r["pf"] as number,
      pc: r["pc"] as number,
      dif: r["dif"] as number,
      sinergia: r["sinergia"] as number,
      muestraPequena: r["muestra_pequena"] === true,
    };
  });
}

function buscaEnRanking(
  ranking: RankingFila[],
  id: string,
  contexto: string,
): RankingFila {
  const fila = ranking.find((r) => r.id === id);
  exige(fila !== undefined, `${contexto}: id ${id} no está en el ranking`);
  return fila as RankingFila;
}

function slideOpcional(
  slides: unknown,
  id: string,
): Record<string, unknown> | null {
  if (!Array.isArray(slides)) return null;
  const s = (slides as unknown[]).find(
    (x): x is Record<string, unknown> =>
      typeof x === "object" &&
      x !== null &&
      (x as Record<string, unknown>)["id"] === id,
  );
  return s ?? null;
}

function baseOpcional(
  s: Record<string, unknown>,
): SlideBase {
  exige(typeof s["titulo"] === "string", "slide opcional sin titulo");
  exige(typeof s["texto"] === "string", "slide opcional sin texto");
  return {
    id: s["id"] as string,
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
  };
}

/** Puntos: barras divergentes desde el ranking (pf/pc tal cual). */
function extraePuntos(
  slides: unknown,
  ranking: RankingFila[],
  categoria: string,
): PuntosSlide {
  const s = extraeSlide(slides, "puntos", categoria);
  return {
    id: "puntos",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    filas: ranking.map((r) => ({ pareja: r.pareja, pf: r.pf, pc: r.pc })),
  };
}

/** Ataque/defensa: promedios por partido para el scatter (solo display). */
function extraeAtaqueDefensa(
  slides: unknown,
  ranking: RankingFila[],
  categoria: string,
): AtaqueDefensaSlide {
  const s = extraeSlide(slides, "ataque_defensa", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(esNumero(d["r"]), "ataque_defensa.r no es número");
  return {
    id: "ataque_defensa",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    r: d["r"] as number,
    puntos: ranking.map((r) => ({
      pareja: r.pareja,
      aFavor: Math.round((r.pf / r.pj) * 10) / 10,
      enContra: Math.round((r.pc / r.pj) * 10) / 10,
    })),
  };
}

function extraePlaymakers(
  slides: unknown,
  filas: RankingFila[],
  categoria: string,
): PlaymakersSlide {
  const s = extraeSlide(slides, "playmakers", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(esNumero(d["promedio"]), "playmakers.promedio no es número");
  exige(Array.isArray(d["ranking"]), "playmakers.ranking no es arreglo");
  const ranking = (d["ranking"] as unknown[]).map((f, i) => {
    const r = f as Record<string, unknown>;
    exige(typeof r["pareja"] === "string", `playmakers[${i}] sin pareja`);
    exige(esNumero(r["pj"]), `playmakers[${i}] sin pj`);
    exige(esNumero(r["sinergia"]), `playmakers[${i}] sin sinergia`);
    return {
      pareja: r["pareja"] as string,
      pj: r["pj"] as number,
      sinergia: r["sinergia"] as number,
    };
  });
  return {
    id: "playmakers",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    promedio: d["promedio"] as number,
    ranking,
    todas: [...filas]
      .sort((a, b) => b.sinergia - a.sinergia)
      .map((r) => ({ pareja: r.pareja, pj: r.pj, sinergia: r.sinergia })),
  };
}

function extraeADiez(slides: unknown, categoria: string): ADiezSlide {
  const s = extraeSlide(slides, "a_diez", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(Array.isArray(d["parejas"]), "a_diez.parejas no es arreglo");
  for (const p of d["parejas"] as unknown[]) {
    exige(typeof p === "string", "a_diez.parejas con valor no texto");
  }
  return {
    id: "a_diez",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    parejas: d["parejas"] as string[],
  };
}

function extraeGanar(
  slides: unknown,
  ranking: RankingFila[],
): GanarSlide | null {
  const raw = slideOpcional(slides, "ganar_no_es_dominar");
  if (!raw) return null;
  const base = baseOpcional(raw);
  const d = raw["datos"] as Record<string, unknown>;
  exige(typeof d["a"] === "string", "ganar_no_es_dominar.a sin id");
  exige(typeof d["b"] === "string", "ganar_no_es_dominar.b sin id");
  return {
    ...base,
    a: buscaEnRanking(ranking, d["a"] as string, "ganar_no_es_dominar.a"),
    b: buscaEnRanking(ranking, d["b"] as string, "ganar_no_es_dominar.b"),
  };
}

function extraeArquetipos(
  slides: unknown,
  categoria: string,
): ArquetiposSlide {
  const s = extraeSlide(slides, "arquetipos", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(
    typeof d["conteo"] === "object" && d["conteo"] !== null,
    "arquetipos.conteo ausente",
  );
  exige(
    typeof d["descripciones"] === "object" && d["descripciones"] !== null,
    "arquetipos.descripciones ausente",
  );
  exige(Array.isArray(d["pares"]), "arquetipos.pares no es arreglo");
  const conteo: Record<string, number> = {};
  for (const [k, v] of Object.entries(
    d["conteo"] as Record<string, unknown>,
  )) {
    exige(esNumero(v), `arquetipos.conteo.${k} no es número`);
    conteo[k] = v as number;
  }
  const descripciones: Record<string, string> = {};
  for (const [k, v] of Object.entries(
    d["descripciones"] as Record<string, unknown>,
  )) {
    exige(typeof v === "string", `arquetipos.descripciones.${k} no es texto`);
    descripciones[k] = v as string;
  }
  const pares = (d["pares"] as unknown[]).map((f, i) => {
    const r = f as Record<string, unknown>;
    exige(typeof r["pareja"] === "string", `arquetipos.pares[${i}] sin pareja`);
    exige(
      typeof r["arquetipo"] === "string",
      `arquetipos.pares[${i}] sin arquetipo`,
    );
    exige(esNumero(r["sinergia"]), `arquetipos.pares[${i}] sin sinergia`);
    exige(esNumero(r["pj"]), `arquetipos.pares[${i}] sin pj`);
    const insignias = Array.isArray(r["insignias"]) ? r["insignias"] : [];
    for (const ins of insignias as unknown[]) {
      exige(typeof ins === "string", "insignia no es texto");
    }
    return {
      pareja: r["pareja"] as string,
      arquetipo: r["arquetipo"] as string,
      sinergia: r["sinergia"] as number,
      pj: r["pj"] as number,
      muestraPequena: r["muestra_pequena"] === true,
      insignias: insignias as string[],
    };
  });
  return {
    id: "arquetipos",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    conteo,
    descripciones,
    pares,
  };
}

function extraeExtremos(
  slides: unknown,
  categoria: string,
): ExtremosSlide {
  const s = extraeSlide(slides, "extremos", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(typeof d["marcador"] === "string", "extremos.marcador no es texto");
  return {
    id: "extremos",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    marcador: d["marcador"] as string,
  };
}

function extraeParejaExtremos(
  slides: unknown,
  ranking: RankingFila[],
): ParejaExtremosSlide | null {
  const raw = slideOpcional(slides, "pareja_extremos");
  if (!raw) return null;
  const base = baseOpcional(raw);
  const d = raw["datos"] as Record<string, unknown>;
  exige(typeof d["double_id"] === "string", "pareja_extremos sin double_id");
  const fila = buscaEnRanking(
    ranking,
    d["double_id"] as string,
    "pareja_extremos",
  );
  return { ...base, pareja: fila.pareja };
}

function extraeDistancia(
  slides: unknown,
  categoria: string,
): DistanciaSlide {
  const s = extraeSlide(slides, "distancia", categoria);
  const d = s["datos"] as Record<string, unknown>;
  exige(esNumero(d["locales"]), "distancia.locales no es número");
  const km = esNumero(d["km"]) ? (d["km"] as number) : null;
  const kmMax = esNumero(d["km_max"]) ? (d["km_max"] as number) : null;
  exige(
    km !== null || kmMax !== null,
    `distancia sin km ni km_max en ${categoria}`,
  );
  return {
    id: "distancia",
    titulo: s["titulo"] as string,
    texto: s["texto"] as string,
    km,
    kmMax,
    locales: d["locales"] as number,
  };
}

const FUENTES: Record<CategoriaId, unknown> = {
  libre: libreRaw,
  masters: mastersRaw,
};

export function getWrappedCategoria(categoria: CategoriaId): WrappedCategoria {
  const fuente = FUENTES[categoria] as Record<string, unknown>;
  exige(
    fuente["categoria"] === categoria,
    `el archivo no corresponde a ${categoria}`,
  );
  const nombre =
    categoria === "libre" ? "Libre" : "Masters";
  const meta = metaRaw as Record<string, unknown>;
  const metricas = meta["metricas"] as Record<string, unknown>;
  exige(
    typeof metricas["por_tiempo"] === "string",
    "meta.metricas.por_tiempo ausente",
  );
  const jerarquiaSlide = extraeSlide(fuente["slides"], "jerarquia", categoria);
  const ranking = extraeRanking(fuente, categoria);
  return {
    categoria,
    nombre,
    apertura: extraeApertura(fuente["slides"], categoria),
    mapa: extraeMapa(fuente["slides"], categoria),
    jerarquia: derivaJerarquia(fuente["ranking"], jerarquiaSlide, categoria),
    cardiacos: extraeCardiacos(fuente["slides"], categoria),
    porTiempoDefinicion: metricas["por_tiempo"] as string,
    puntos: extraePuntos(fuente["slides"], ranking, categoria),
    ataqueDefensa: extraeAtaqueDefensa(fuente["slides"], ranking, categoria),
    playmakers: extraePlaymakers(fuente["slides"], ranking, categoria),
    aDiez: extraeADiez(fuente["slides"], categoria),
    ganar: extraeGanar(fuente["slides"], ranking),
    arquetipos: extraeArquetipos(fuente["slides"], categoria),
    extremos: extraeExtremos(fuente["slides"], categoria),
    parejaExtremos: extraeParejaExtremos(fuente["slides"], ranking),
    distancia: extraeDistancia(fuente["slides"], categoria),
  };
}

/* ------------------------------------------------------------------ */
/* Directorio y fichas por pareja                                       */
/* ------------------------------------------------------------------ */

export interface ParejaIndice {
  id: string;
  pareja: string;
  categoria: CategoriaId;
  grupo: string;
  jugo: boolean;
}

export interface ParejaGrupo {
  grupo: string;
  parejas: ParejaIndice[];
}

export interface ParejaCategoria {
  categoria: CategoriaId;
  nombre: string;
  grupos: ParejaGrupo[];
}

export interface ParejaResumen {
  partidos: number;
  victorias: number;
  puntosFavor: number;
  puntosContra: number;
  diferencia: number;
  sinergia: number;
  muestraPequena: boolean;
}

export interface ParejaNivel {
  nombre: string;
  descripcion: string;
}

export interface ParejaPartido {
  rival: string;
  rivalId: string;
  /** Nulo en partidos por default (no se jugó). */
  marcador: string | null;
  resultado: string;
  porTiempo: boolean;
  esDefault: boolean;
}

export interface ParejaInsignia {
  nombre: string;
  descripcion: string;
}

export interface ParejaSlidePayload {
  id: string;
  titulo: string;
  texto: string;
  datos: Record<string, unknown>;
}

export interface ParejaFicha {
  id: string;
  categoria: CategoriaId;
  nombreCategoria: string;
  grupo: string;
  pareja: string;
  resumen: ParejaResumen;
  nivel: ParejaNivel;
  percentiles: { sinergia: number; ataque: number; defensa: number };
  insignias: ParejaInsignia[];
  partidos: ParejaPartido[];
  slides: ParejaSlidePayload[];
}

const NOMBRE_CATEGORIA: Record<CategoriaId, string> = {
  libre: "Libre",
  masters: "Masters",
};

function esUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

/** Valida el formato del id de pareja para las rutas dinámicas. */
export function esUuidPareja(value: string): boolean {
  return esUuid(value);
}

function idsDeParejasConArchivo(): Set<string> {
  const dir = path.join(process.cwd(), "data/analysis/parejas");
  const archivos = readdirSync(dir).filter((f) => f.endsWith(".json"));
  return new Set(archivos.map((f) => f.replace(/\.json$/, "")));
}

/** Directorio completo agrupado por categoría y grupo. */
export function getParejasDirectorio(): {
  categorias: ParejaCategoria[];
  mensajeNoJugo: string;
} {
  exige(Array.isArray(indiceRaw), "indice.json no es un arreglo");
  const conArchivo = idsDeParejasConArchivo();
  const meta = metaRaw as Record<string, unknown>;
  const mensajes = meta["mensajes"] as Record<string, unknown>;
  exige(
    typeof mensajes["no_jugo"] === "string",
    "meta.mensajes.no_jugo ausente",
  );

  const entradas: ParejaIndice[] = (indiceRaw as unknown[]).map((f, i) => {
    const r = f as Record<string, unknown>;
    exige(esUuid(r["id"]), `indice[${i}] sin id válido`);
    exige(typeof r["pareja"] === "string", `indice[${i}] sin pareja`);
    exige(
      typeof r["categoria"] === "string" &&
        esCategoriaValida(r["categoria"] as string),
      `indice[${i}] con categoria inválida`,
    );
    exige(typeof r["grupo"] === "string", `indice[${i}] sin grupo`);
    exige(typeof r["jugo"] === "boolean", `indice[${i}] sin jugo`);
    const id = r["id"] as string;
    if (r["jugo"] === true) {
      exige(conArchivo.has(id), `indice[${i}] jugó pero no tiene archivo`);
    } else {
      exige(
        !conArchivo.has(id),
        `indice[${i}] no jugó pero tiene archivo`,
      );
    }
    return {
      id,
      pareja: r["pareja"] as string,
      categoria: r["categoria"] as CategoriaId,
      grupo: r["grupo"] as string,
      jugo: r["jugo"] as boolean,
    };
  });

  const categorias: ParejaCategoria[] = CATEGORIAS_VALIDAS.map((cat) => {
    const porGrupo = new Map<string, ParejaIndice[]>();
    for (const e of entradas) {
      if (e.categoria !== cat) continue;
      const lista = porGrupo.get(e.grupo) ?? [];
      lista.push(e);
      porGrupo.set(e.grupo, lista);
    }
    const grupos: ParejaGrupo[] = [...porGrupo.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "es"))
      .map(([grupo, parejas]) => ({
        grupo,
        parejas: [...parejas].sort((a, b) =>
          a.pareja.localeCompare(b.pareja, "es"),
        ),
      }));
    return { categoria: cat, nombre: NOMBRE_CATEGORIA[cat], grupos };
  });

  return {
    categorias,
    mensajeNoJugo: mensajes["no_jugo"] as string,
  };
}

/** Ficha de una pareja: valida el archivo y devuelve solo lo mostrable
    (nombres de pareja y agregados; nunca ciudades por persona). */
export function getPareja(id: string): ParejaFicha {
  exige(esUuid(id), `id de pareja inválido: ${id}`);
  const ruta = path.join(process.cwd(), "data/analysis/parejas", `${id}.json`);
  let crudo: string;
  try {
    crudo = readFileSync(ruta, "utf-8");
  } catch {
    throw new Error(`[wrapped] no existe la ficha ${id}`);
  }
  const f = JSON.parse(crudo) as Record<string, unknown>;
  exige(f["id"] === id, `la ficha ${id} no corresponde`);
  exige(
    typeof f["categoria"] === "string" &&
      esCategoriaValida(f["categoria"] as string),
    `ficha ${id} con categoria inválida`,
  );
  exige(typeof f["grupo"] === "string", `ficha ${id} sin grupo`);
  exige(typeof f["pareja"] === "string", `ficha ${id} sin pareja`);

  const r = f["resumen"] as Record<string, unknown>;
  for (const k of [
    "partidos",
    "victorias",
    "puntos_favor",
    "puntos_contra",
    "diferencia",
    "sinergia",
  ] as const) {
    exige(esNumero(r[k]), `ficha ${id}: resumen.${k} no es número`);
  }
  const nivel = f["nivel"] as Record<string, unknown>;
  exige(typeof nivel["nombre"] === "string", `ficha ${id} sin nivel`);
  exige(
    typeof nivel["descripcion"] === "string",
    `ficha ${id} sin descripción de nivel`,
  );
  const perc = f["percentiles"] as Record<string, unknown>;
  for (const k of ["sinergia", "ataque", "defensa"] as const) {
    exige(esNumero(perc[k]), `ficha ${id}: percentiles.${k} no es número`);
  }

  exige(Array.isArray(f["insignias"]), `ficha ${id} sin insignias`);
  const insignias = (f["insignias"] as unknown[]).map((x, i) => {
    const ins = x as Record<string, unknown>;
    exige(typeof ins["nombre"] === "string", `insignia[${i}] sin nombre`);
    exige(
      typeof ins["descripcion"] === "string",
      `insignia[${i}] sin descripción`,
    );
    return {
      nombre: ins["nombre"] as string,
      descripcion: ins["descripcion"] as string,
    };
  });

  exige(Array.isArray(f["partidos"]), `ficha ${id} sin partidos`);
  const partidos = (f["partidos"] as unknown[]).map((x, i) => {
    const p = x as Record<string, unknown>;
    for (const k of ["rival", "rival_id", "resultado"] as const) {
      exige(typeof p[k] === "string", `partido[${i}] sin ${k}`);
    }
    const esDefault = p["default"] === true;
    exige(
      typeof p["marcador"] === "string" || (esDefault && p["marcador"] === null),
      `partido[${i}] sin marcador`,
    );
    return {
      rival: p["rival"] as string,
      rivalId: p["rival_id"] as string,
      marcador: p["marcador"] as string | null,
      resultado: p["resultado"] as string,
      porTiempo: p["por_tiempo"] === true,
      esDefault,
    };
  });

  exige(Array.isArray(f["slides"]), `ficha ${id} sin slides`);
  const slides = (f["slides"] as unknown[]).map((x, i) => {
    const s = x as Record<string, unknown>;
    exige(typeof s["id"] === "string", `slide[${i}] sin id`);
    exige(typeof s["titulo"] === "string", `slide[${i}] sin titulo`);
    exige(typeof s["texto"] === "string", `slide[${i}] sin texto`);
    exige(
      typeof s["datos"] === "object" && s["datos"] !== null,
      `slide[${i}] sin datos`,
    );
    return {
      id: s["id"] as string,
      titulo: s["titulo"] as string,
      texto: s["texto"] as string,
      datos: s["datos"] as Record<string, unknown>,
    };
  });

  const categoria = f["categoria"] as CategoriaId;
  return {
    id,
    categoria,
    nombreCategoria: NOMBRE_CATEGORIA[categoria],
    grupo: f["grupo"] as string,
    pareja: f["pareja"] as string,
    resumen: {
      partidos: r["partidos"] as number,
      victorias: r["victorias"] as number,
      puntosFavor: r["puntos_favor"] as number,
      puntosContra: r["puntos_contra"] as number,
      diferencia: r["diferencia"] as number,
      sinergia: r["sinergia"] as number,
      muestraPequena: r["muestra_pequena"] === true,
    },
    nivel: {
      nombre: nivel["nombre"] as string,
      descripcion: nivel["descripcion"] as string,
    },
    percentiles: {
      sinergia: perc["sinergia"] as number,
      ataque: perc["ataque"] as number,
      defensa: perc["defensa"] as number,
    },
    insignias,
    partidos,
    slides,
  };
}

/** Todos los ids con ficha, para generateStaticParams. */
export function getParejaIds(): string[] {
  return [...idsDeParejasConArchivo()].sort();
}
