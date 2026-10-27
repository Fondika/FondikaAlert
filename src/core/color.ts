import type { RumboSuperficie } from "../rumbo/types";

/**
 * Convierte un token de la paleta de 18 colores en el `var(--fdk-...)` correspondiente,
 * para usarlo como `background` real de un componente (no de la capa que lo contiene).
 * `undefined`/`"blanco"` significa "sin overrride": el componente usa su fondo por nivel.
 */
export function fondoDeToken(token?: RumboSuperficie): string | undefined {
  if (!token || token === "blanco") return undefined;
  return `var(--fdk-${token})`;
}

/** Mismo criterio que rumbo/variante.ts: tonos 900/700 son oscuros/alto contraste. */
export function esTonoOscuro(token?: RumboSuperficie): boolean {
  if (!token || token === "blanco") return false;
  const tono = token.split("-")[1];
  return tono === "900" || tono === "700";
}

/** Tonos 900/700 donde el blanco NO llega a 4.5:1 (WCAG AA): naranja 2.05/1.82, turquesa-700 2.82, gris-700 2.38. */
const TONOS_CLAROS_PARA_TEXTO = ["naranja-900", "naranja-700", "turquesa-700", "gris-700"];

/**
 * Color de texto sobre un fondo 900/700: blanco, salvo en los tonos de arriba, que llevan tinta casi negra (>= 5.8:1).
 * Turquesa-900 se queda en blanco (3.71:1: cumple sólo para texto grande); gris-900 y rojo, con 6.4–7.4:1 y 4.7–6.4:1, también.
 * El cuerpo de Rumbo luminoso sigue siendo blanco: esto sólo cambia el texto.
 */
export function colorTextoSobre(token?: RumboSuperficie): string {
  return token && TONOS_CLAROS_PARA_TEXTO.includes(token) ? "#1f2123" : "#ffffff";
}

/**
 * Fondo con un halo de luz localizado alrededor de Rumbo: dos capas, no una.
 *
 * La capa de encima es una ELIPSE horizontal (más ancha que alta, como una luz real, no un
 * círculo de UI) que va del color resaltado en el centro a TRANSPARENTE hacia afuera — se pierde
 * en la capa de abajo en vez de terminar en un borde duro. La capa de abajo es el color plano
 * del token, así que donde el degradado ya es transparente, lo que se ve es el fondo, sin
 * costura visible.
 *
 * Sólo tiene sentido con `esTonoOscuro(token)` — en tonos claros no se usa.
 */
export function degradadoDeToken(token?: RumboSuperficie): string | undefined {
  const fondo = fondoDeToken(token);
  if (!fondo) return undefined;
  return (
    `radial-gradient(ellipse 68% 40% at 50% 38%, ` +
    `color-mix(in srgb, ${fondo} 80%, white) 0%, ` +
    `color-mix(in srgb, ${fondo} 40%, transparent) 55%, ` +
    `transparent 100%), ${fondo}`
  );
}
