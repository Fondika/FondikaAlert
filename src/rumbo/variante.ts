import type { RumboSuperficie, RumboVariante } from "./types";

/**
 * "Rumbo luminoso": sobre los dos primeros tonos (900/700 — los más oscuros y de mayor
 * contraste) de naranja, turquesa o gris, el cuerpo naranja de Rumbo se lee mal o desaparece
 * (documentado en Brand_kit_Fondika/04-personaje/README.md, §4 y §8.2). En esos fondos se usa
 * la variante `luminoso`: cuerpo blanco brillante + capas de degradado detrás para separarlo
 * del fondo. En los tonos claros (500/300/100) y en blanco se usa la variante `color` normal.
 *
 * El parámetro de color de cualquier componente que monte a Rumbo (Alert, Toast, Modal) sólo
 * conmuta entre estas dos: blanco (luminoso) y naranja (color). Nunca un tercer color de cuerpo.
 */
export function resolveRumboVariante(superficie: RumboSuperficie = "blanco"): RumboVariante {
  if (superficie === "blanco") return "color";
  const tono = superficie.split("-")[1];
  const esOscuro = tono === "900" || tono === "700";
  return esOscuro ? "luminoso" : "color";
}
