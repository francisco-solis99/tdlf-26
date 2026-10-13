# Contrato de datos: estadísticas del torneo

Todo es JSON estático (UTF-8). No hay API: los archivos se generan desde el notebook de análisis.

## Archivos
| Archivo | Contenido |
|---|---|
| `meta.json` | Categorías, niveles, insignias, definiciones de métricas, mensajes y notas |
| `indice.json` | Todas las parejas inscritas, para buscar. `jugo: false` indica que no disputó partidos |
| `libre.json`, `masters.json` | Historia de la categoría (`slides`), `ranking` y datos del `mapa` |
| `parejas/<id>.json` | Wrapped de cada pareja que jugó |
| `mx_estados.geojson` | Límites de los estados de México (Natural Earth, dominio público) para la capa del mapa |

## Flujo
1. El usuario busca su pareja en `indice.json` (el campo `busqueda` va en minúsculas y sin acentos).
2. Si `jugo` es `true`, se abre `parejas/<id>.json`. Si es `false`, se muestra `meta.mensajes.no_jugo`.

## Slides
Cada slide tiene `id`, `tipo`, `categoria`, `titulo`, `texto` y `datos`. El `texto` ya viene redactado y
listo para mostrar. `datos` trae las cifras para dibujar la gráfica; el notebook tiene una gráfica de
referencia para cada slide.
Tipos: `stat`, `chart`, `scatter`, `ranking`, `map`, `comparacion`, `badges`.
Algunos slides son opcionales y solo aparecen si hay caso: `jerarquia`, `ganar_no_es_dominar`,
`pareja_extremos` y, en cada pareja, `frente_al_resto`, `sus_insignias`, `mejor_victoria`, `mas_puntos`,
`casi` y `rival_lejano`.

## Conceptos
- **Sinergia**: ((Ph - Pr + PJ) / (11 * PJ)) * 100. 100% es ganar todos los partidos 10-0. Promedio del
  torneo: 9.1%.
- **Default**: partido ganado porque la pareja rival no se presentó. Cuenta como victoria oficial, pero no
  entra en las métricas de puntos. En `partidos` aparece con `default: true` y sin marcador.
- **Percentil**: fracción de las otras parejas de la categoría a las que supera (0 a 1).
- **muestra_pequena**: la pareja jugó un solo partido real. Sus números son orientativos y conviene
  decirlo en pantalla ("basado en 1 partido").
- **por_tiempo**: el partido terminó antes de que alguien llegara a 10.

## Sugerencias de diseño
- Mostrar siempre el % de sinergia junto al nivel: los cortes de nivel son una convención y las parejas
  vecinas a un corte son casi iguales.
- No resaltar visualmente valores negativos de sinergia en la ficha de cada pareja.
- Los datos incluyen nombres y ciudades de los jugadores: conviene tratar los enlaces con cuidado.
