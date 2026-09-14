import { a as RumboOptions, b as RumboSuperficie, c as RumboVariante, R as RumboEstado } from './types-BYWgq4YE.js';

/** Genera el SVG inline de Rumbo para un estado y una superficie dados. */
declare function rumboSvg(options: RumboOptions): string;

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

interface RumboVozOptions {
    estado: RumboEstado;
    /** Texto libre. Si se define, siempre gana sobre `vozId` (regla de prioridad). */
    texto?: string;
    /** Id de una línea de la biblioteca (ver voz-rumbo.json). Ignorado si `texto` está definido. */
    vozId?: string;
}
/**
 * Resuelve qué texto mostrar bajo las tres reglas del brief:
 * 1. `texto` tiene prioridad si está definido.
 * 2. Si no, se usa `vozId` (o la primera línea del estado si no se especifica ninguna).
 * 3. Si no hay ni `texto` ni `vozId`, no se muestra texto — sólo el tipo de alerta según el estado.
 * El estado (`estado`) es obligatorio siempre: define la postura visual de Rumbo aunque no haya texto.
 */
declare function resolverVozRumbo(opts: RumboVozOptions & {
    mostrarPorDefecto?: boolean;
}): string | null;
/**
 * Sólo para `pensando` y `cargando`: arranca un ciclo que avanza a la siguiente línea de voz
 * a medida que pasa el tiempo de espera (cada estado define su propio `esperaMs`). Llama a
 * `onCambio` con el texto correspondiente cada vez que se cruza un umbral.
 *
 * Devuelve una función para detener el ciclo — quien la use debe llamarla al cerrar el
 * loader/alerta (ADR-006: los persistentes se cierran explícitamente, nunca solos).
 */
declare function iniciarCicloVoz(estado: "pensando" | "cargando", onCambio: (texto: string) => void): () => void;

export { RumboEstado, RumboOptions, RumboSuperficie, RumboVariante, type RumboVozOptions, iniciarCicloVoz, resolveRumboVariante, resolverVozRumbo, rumboSvg };
