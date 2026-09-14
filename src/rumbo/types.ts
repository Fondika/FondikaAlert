/**
 * Los ocho estados de Rumbo. No se agregan estados nuevos sin documentarlos en
 * Brand_kit_Fondika/04-personaje/README.md (regla #8 de "Qué no hacer").
 */
export type RumboEstado =
  | "reposo"
  | "escuchando"
  | "pensando"
  | "cargando"
  | "exito"
  | "error"
  | "alerta"
  | "sin-conexion";

/**
 * Tono de superficie sobre el que se monta Rumbo. Determina automáticamente si se usa
 * la variante `color` (cuerpo naranja, sobre fondos claros) o `luminoso` (cuerpo blanco
 * con capas de degradado detrás, sobre fondos oscuros/saturados).
 *
 * Reduce el problema a los 18 tokens de la paleta (§02) — nada fuera de ahí.
 */
export type RumboSuperficie =
  | "naranja-900" | "naranja-700" | "naranja-500" | "naranja-300" | "naranja-100"
  | "turquesa-900" | "turquesa-700" | "turquesa-500" | "turquesa-300" | "turquesa-100"
  | "gris-900" | "gris-700" | "gris-500" | "gris-300" | "gris-100"
  | "rojo-900" | "rojo-700" | "rojo-100"
  | "blanco";

export type RumboVariante = "color" | "luminoso";

export interface RumboOptions {
  estado: RumboEstado;
  /** Superficie donde se monta. Por defecto "blanco" → variante `color`. */
  superficie?: RumboSuperficie;
  /** Tamaño en px del lienzo (120×120 nativo). Mínimo recomendado 28px (Vida deja de leerse debajo). */
  size?: number;
}
