import { b as RumboOptions, c as RumboSuperficie, d as RumboVariante } from './estados-8m_MyFGM.js';
export { B as BASE_DE_ESCENA, E as EscenaEstado, a as RumboEstado, R as RumboEstadoExtendido, e as baseDe, f as escenaDe } from './estados-8m_MyFGM.js';

/** Genera el SVG inline de Rumbo para un estado y una superficie dados. */
declare function rumboSvg(options: RumboOptions): string;

/**
 * Hace que los ojos de los Rumbo que haya dentro de `raiz` sigan al puntero. Devuelve la función que lo detiene
 * (y devuelve los ojos a su sitio): llámala al cerrar el componente, o el seguidor se queda vivo.
 * No hace nada (y devuelve una función vacía) sin DOM o si el sistema pide movimiento reducido.
 */
declare function seguirMirada(raiz: Element): () => void;

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
declare function resolveRumboVariante(superficie?: RumboSuperficie): RumboVariante;

export { RumboOptions, RumboSuperficie, RumboVariante, resolveRumboVariante, rumboSvg, seguirMirada };
