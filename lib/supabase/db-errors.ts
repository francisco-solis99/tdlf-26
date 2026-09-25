// Framework-free mapping of Postgres/PostgREST failures to readable
// Spanish messages. Kept free of Next imports so it can be unit-tested
// in plain Node. Raw SQL text never reaches the UI.

export type DbErrorLike = {
  code?: string;
  message?: string;
};

export function toReadableError(
  operation: "player" | "double" | "match",
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
