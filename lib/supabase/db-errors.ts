// Framework-free mapping of Postgres/PostgREST failures to readable
// Spanish messages. Kept free of Next imports so it can be unit-tested
// in plain Node. Raw SQL text never reaches the UI.

export type DbErrorLike = {
  code?: string;
  message?: string;
};

export function toReadableError(
  operation: "player" | "double" | "match" | "groups" | "knockout",
  error: DbErrorLike,
): string {
  const message = error.message ?? "";
  const code = error.code ?? "";

  // Frontenis has no draws (set_match_winner trigger).
  if (message.includes("cannot end in a tie")) {
    return "Un partido no puede terminar en empate — revisa los marcadores.";
  }

  // One pair ever per player (trg_validate_player_single_double).
  if (message.includes("only be registered in one pair")) {
    return "Uno de los jugadores ya está registrado en otra pareja del torneo.";
  }

  // Group/category consistency (trg_validate_double_group_category).
  if (message.includes("must belong to the same category")) {
    return "El grupo no pertenece a la misma categoría de la pareja.";
  }

  // Match/group consistency (trg_validate_match_group).
  if (
    message.includes("must belong to the same group") ||
    message.includes("must match the doubles")
  ) {
    return "El partido solo puede enfrentar parejas del mismo grupo.";
  }

  // Canonical ordering slipped through (should be normalized client-side).
  if (message.includes("canonical_")) {
    return "El orden de los jugadores o parejas no es válido.";
  }

  // create_groups_for_category validations.
  if (message.includes("must be a power of 2")) {
    return "El número de grupos debe ser potencia de 2 (1, 2, 4, 8, 16…).";
  }
  // NB: the knockout "already exist" check must come before the groups
  // one below — "... matches already exist ..." contains its substring.
  if (message.includes("matches already exist for this category")) {
    return "Esa ronda ya fue creada para esta categoría.";
  }
  if (message.includes("already exist for this category")) {
    return "Esta categoría ya tiene grupos creados — la creación solo se ejecuta una vez.";
  }  if (message.includes("Not enough registered doubles")) {
    return "No hay suficientes parejas registradas (mínimo 2 por grupo).";
  }
  if (message.includes("one group head per group")) {
    return "Si eliges cabezas, debes llenar una por grupo — o ninguna.";
  }
  if (message.includes("must all be different doubles")) {
    return "Los cabezas de grupo deben ser parejas distintas.";
  }
  if (message.includes("not valid, ungrouped doubles")) {
    return "Un cabeza elegido ya no es una pareja válida sin grupo de esta categoría.";
  }

  // create_knockout_round validations.
  if (message.includes("only for knockout stages")) {
    return "La fase de grupos no se crea desde la eliminatoria.";
  }
  if (message.includes("No pairings provided")) {
    return "Arma al menos un cruce para crear la ronda.";
  }
  if (
    message.includes("must include both double1_id") ||
    message.includes("cannot be paired against itself") ||
    message.includes("only appear in one pairing")
  ) {
    return "Cada cruce necesita dos parejas distintas, cada una una sola vez.";
  }
  if (message.includes("Expected to create ")) {
    return "La ronda indicada no es la que sigue. Revisa la ronda esperada.";
  }
  if (message.includes("Group stage is not finished")) {
    return "Aún hay grupos sin terminar la fase de grupos.";
  }
  if (message.includes("No groups exist for this category")) {
    return "Esta categoría aún no tiene grupos.";
  }
  if (message.includes("has a result yet")) {
    return "Faltan resultados en la ronda anterior.";
  }
  if (message.includes("matches already exist for this category")) {
    return "Esa ronda ya fue creada para esta categoría.";
  }
  if (message.includes("must include every eligible double")) {
    return "Los cruces deben incluir a cada pareja elegible exactamente una vez.";
  }
  if (message.includes("final has already been created")) {
    return "La final ya fue creada; no queda nada por avanzar.";
  }
  if (message.includes("Unexpected qualifier count")) {
    return "Número inesperado de clasificados; se esperaban 2, 4, 8, 16 o 32.";
  }

  // RPC function missing (migration not applied).
  if (code === "PGRST202" || message.includes("Could not find the function")) {
    return "La creación de grupos no está disponible en la base de datos.";
  }

  // Unique violation — e.g. the same pair inserted twice.
  if (code === "23505") {
    return operation === "double"
      ? "Esa pareja ya está registrada."
      : "Ese registro ya existe.";
  }

  // Foreign key violation — e.g. unknown category/player/group id.
  if (code === "23503") {
    return operation === "double"
      ? "La categoría o uno de los jugadores no existe."
      : "El registro relacionado no existe.";
  }

  // Check violation — e.g. negative score, age out of range, same player twice.
  if (code === "23514") {
    return "Datos inválidos (edad fuera de rango, marcador negativo o mismo jugador dos veces).";
  }

  // PostgREST single-row miss — record doesn't exist (or was deleted).
  if (code === "PGRST116") {
    return "El registro no existe o ya fue eliminado.";
  }

  return "No se pudo guardar. Intenta de nuevo.";
}
