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

  cierreInscripcion: "25 de Septiembre",

  contact: {
    instagram: {
      url: "https://www.instagram.com/torneodelasfresas/",
      handle: "@torneodelasfresas",
    },
    whatsapp: {
      url: "https://wa.me/524622883931?text=Hola%2C%20quisiera%20inscribirme%20al%20Torneo%20de%20las%20Fresas%202026",
      number: "4622883931",
      display: "462 288 3931",
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
      { id: "femenil", name: "Femenil", detail: "Categoría femenil" },
      { id: "masters", name: "Masters +50", detail: "50 años o más" },
    ],
    registration: {
      priceLabel: "$800 por pareja",
      note: "Su inscripción incluye:",
      includes: [
        "Zona de hidratación",
        "Comida para los jugadores",
        "Pelotas del torneo",
        "Refrigerios",
      ] as const,
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
        category: "Femenil",
        pairs: 12,
        groups: 4,
        groupSize: 3,
      },
      {
        category: "Masters +50",
        pairs: 12,
        groups: 4,
        groupSize: 3,
      },
    ],
    courts: {
      count: null as number | null, // TODO(tbd): courts available on event day
      ball: "Head Pre-Olimpica", // TODO(tbd): official tournament ball brand/model
      ballNote:
        "Se pedirá a cada pareja llevar una pelota por si acaso hay alguna circustancia.",
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
      "Fase de grupos seguida de eliminatoria directa.", // assumption: single elimination — confirm format details
      "La clasificación se define por partidos ganados y, en empate, por puntos anotados.",
      "Avanzan las dos primeras parejas de cada grupo a la siguiente ronda.", // assumption: top 2 per group — confirm
    ],
    tips: [
      "Uniforme: playera del mismo color o similar entre pareja.",
      "Lentes de protección recomendados (no obligatorios).",
      "Gorra y bloqueador: el sol de septiembre no perdona.",
      "Lleva toalla y mantente hidratado entre partidos.",
    ],
  },

  awards: {
    total: "$30,000",
    categories: [
      {
        category: "Libre",
        bolsa: "$20,000",
        places: [
          { place: "1er lugar", prize: "$10,000" },
          { place: "2do lugar", prize: "$5,000" },
          { place: "3er lugar", prize: "$3,000" },
          { place: "4to lugar", prize: "$2,000" },
        ],
      },
      {
        category: "Femenil",
        bolsa: "$7,500",
        places: [
          { place: "1er lugar", prize: "$4,000" },
          { place: "2do lugar", prize: "$2,000" },
          { place: "3er lugar", prize: "$1,000" },
          { place: "4to lugar", prize: "$500" },
        ],
      },
      {
        category: "Masters +50",
        bolsa: "$7,500",
        places: [
          { place: "1er lugar", prize: "$4,000" },
          { place: "2do lugar", prize: "$2,000" },
          { place: "3er lugar", prize: "$1,000" },
          { place: "4to lugar", prize: "$500" },
        ],
      },
    ],
  },

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
        blurb: "Diseño conmemorativo de la cuarta edición.",
        imageUrl: "/merch-shirt.webp",
      },
      {
        name: "Gorra TDLF-26",
        blurb: "Edición limitada del torneo.",
        imageUrl: "/merch-cap.webp",
      },
    ],
  },

  sponsors: [
    { name: "Auto Clutch", image: "/auto-clutch.webp" },
    { name: "BBS", image: "/bbs.webp" },
    { name: "Comudaj", image: "/comudaj.webp" },
    { name: "Crys Pura Ice", image: "/cryspuraice.webp" },
    { name: "Deep", image: "/deep.webp" },
    { name: "Duo", image: "/duo.webp" },
    { name: "Fenix", image: "/fenix.webp" },
    { name: "Frutero", image: "/frutero.webp" },
    { name: "Lavander", image: "/lavander.webp" },
    { name: "Servicom", image: "/servicom.webp" },
    { name: "Showtime", image: "/showtime.webp" },
  ] as Array<{ name: string; image: string; url?: string }>,

  gallery: {
    note: "Recuerdos de ediciones pasadas. Las fotos oficiales de 2026 llegarán después del torneo.", // photos TBD
    placeholderCount: 6,
  },
} as const;

export type Site = typeof site;
