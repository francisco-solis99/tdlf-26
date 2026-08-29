// Single source of truth for all landing copy.
// Values marked TODO(tbd) are pending official confirmation — do not
// hardcode them anywhere else; sections must render their fallback state.

export const site = {
  name: "Torneo de las Fresas",
  shortName: "TDLF",
  year: 2026,
  edition: "Cuarta edición",

  // Hero tagline (draft copy)
  tagline:
    "El dia que Irapuato se vuelve sede del frontenis de más alto nivel",

  date: {
    // America/Mexico_City observes UTC-6 year-round (no DST).
    iso: "2026-09-27T08:00:00-06:00",
    weekday: "Domingo",
    label: "27 de Septiembre",
    shortLabel: "27 · Sep · 2026",
    yearLabel: "2026",
  },

  venue: {
    name: "Deportiva Norte",
    city: "Irapuato, Gto.",
    mapsUrl:
      "https://www.google.com/maps/place/Unidad+Deportiva+Mario+Vazquez+Ra%C3%B1a/@20.6944313,-101.3764419,15z/data=!4m6!3m5!1s0x842c7f9746cdae27:0x6d070463c2cb0140!8m2!3d20.6944313!4d-101.3764419!16s%2Fg%2F119tgd4jz?entry=ttu&g_ep=EgoyMDI1MDMwMi4wIKXMDSoASAFQAw%3D%3D",
  },

  contact: {
    instagram: {
      url: "https://www.instagram.com/torneodelasfresas/",
      handle: "@torneodelasfresas",
    },
  },

  nav: [
    { label: "Info", href: "#info" },
    { label: "Reglas", href: "#reglas" },
    { label: "Premios", href: "#premios" },
    { label: "Agenda", href: "#agenda" },
    { label: "Merch", href: "#merch" },
    { label: "Patrocinadores", href: "#patrocinadores" },
  ],

  info: {
    intro:
      "Todo lo esencial antes de pisar la cancha. Los detalles operativos pueden moverse un poco conforme se acerque la fecha.",
    categories: [
      { id: "libre", name: "Libre", detail: "Categoría abierta" },
      { id: "masters", name: "Másters 50+", detail: "50 años o más" },
    ],
    registration: {
      priceLabel: null as string | null, // TODO(tbd): registration cost per pair/person
      note: "El costo de inscripción se confirmará próximamente.",
    },
    groups: [
      // Group counts are placeholders based on last edition — confirm before finalizing.
      {
        category: "Libre",
        pairs: 24,
        groups: 6,
        groupSize: 4,
      },
      {
        category: "Másters 50+",
        pairs: 12,
        groups: 4,
        groupSize: 3,
      },
    ],
    courts: {
      count: null as number | null, // TODO(tbd): courts available on event day
      ball: null as string | null, // TODO(tbd): official tournament ball brand/model
      ballNote:
        "Se pedirá a cada pareja llevar una pelota para el arranque del partido.",
    },
  },

  rules: {
    match: [
      "Los partidos se juegan a 10 puntos o 20 minutos.",
      "Al terminar el tiempo gana quien tenga ventaja en el marcador.",
      "Un punto define quién saca al inicio del partido.",
      "Si una pareja no se presenta en 5 minutos, pierde por default.",
      "La pareja ganadora funge como juez en el partido siguiente.",
    ],
    advancement: [
      "Fase de grupos seguida de eliminatoria directa (mata-mata).", // assumption: single elimination — confirm format details
      "Avanzan las dos primeras parejas de cada grupo a la siguiente ronda.", // assumption: top 2 per group — confirm
      "La clasificación se define por partidos ganados y, en empate, por puntos anotados.",
    ],
    tips: [
      "Uniforme: playera del mismo color o similar entre pareja.",
      "Lentes de protección recomendados (no obligatorios).",
      "Gorra y bloqueador: el sol de septiembre no perdona.",
      "Lleva toalla y mantente hidratado entre partidos.",
    ],
  },

  awards: [
    {
      category: "Libre",
      places: [
        { place: "1er lugar", prize: null }, // TODO(tbd): prize amounts
        { place: "2do lugar", prize: null },
        { place: "3er lugar", prize: null },
        { place: "4to lugar", prize: null },
      ],
    },
    {
      category: "Másters 50+",
      places: [
        { place: "1er lugar", prize: null },
        { place: "2do lugar", prize: null },
        { place: "3er lugar", prize: null },
      ],
    },
  ],

  agenda: {
    dateLabel: "Domingo 27 de Septiembre de 2026",
    items: [
      { time: null, title: "Recepción de parejas", desc: "Registro y bienvenida." }, // TODO(tbd): schedule times
      { time: null, title: "Inauguración", desc: "Ceremonia e indicaciones generales." },
      { time: null, title: "Fase de grupos", desc: "Arranca la etapa clasificatoria." },
      { time: null, title: "Fase eliminatoria", desc: "Octavos, cuartos y semifinales." },
      { time: null, title: "Gran final", desc: "La última bola del día." },
    ] as Array<{ time: string | null; title: string; desc: string }>,
  },

  merch: {
    catalogUrl: null as string | null, // TODO(tbd): full catalog link
    products: [
      {
        name: "Playera TDLF-26",
        blurb: "Diseño conmemorativo de la cuarta edición.", // TODO(tbd): product descriptions + images
        imageUrl: null as string | null,
      },
      {
        name: "Gorra TDLF-26",
        blurb: "Edición limitada del torneo.",
        imageUrl: null as string | null,
      },
    ],
  },

  sponsors: [] as Array<{ name: string; url?: string }>, // TODO(tbd): sponsor list — empty renders placeholder tiles

  gallery: {
    note: "Recuerdos de ediciones pasadas. Las fotos oficiales de 2026 llegarán después del torneo.", // photos TBD
    placeholderCount: 6,
  },
} as const;

export type Site = typeof site;
