/**
 * Validación en el borde público: una entrada inválida falla AL INSTANTE y dice qué se esperaba y qué llegó
 * (como `lluvia/opciones.ts`), en vez de pintar un componente roto (`fdk-alert--undefined`) o reventar adentro con
 * "Cannot read properties of null". Lanza de forma síncrona, antes de tocar el DOM o los contadores de referencias.
 */

function describir(valor: unknown): string {
  if (valor === null) return "null";
  if (typeof valor === "string") return `"${valor}"`;
  if (typeof valor === "object") return Object.prototype.toString.call(valor);
  return String(valor);
}

/**
 * `host`/`boton` deben ser un elemento del DOM (p. ej. `querySelector` que no encontró nada devuelve `null`).
 * Se mira `nodeType` y no `instanceof HTMLElement`: un elemento de otro iframe no es instancia de esta ventana.
 */
export function exigirElemento(valor: unknown, quien: string, parametro = "host"): asserts valor is HTMLElement {
  if ((valor as Node | null)?.nodeType !== 1) {
    throw new TypeError(`${quien}: \`${parametro}\` debe ser un elemento del DOM y llegó ${describir(valor)}.`);
  }
}

const POSICIONES = [
  "top-start", "top-center", "top-end",
  "middle-start", "middle-center", "middle-end",
  "bottom-start", "bottom-center", "bottom-end",
] as const;

export function validarPosicion(posicion: unknown, quien: string): void {
  if (posicion !== undefined && !POSICIONES.includes(posicion as (typeof POSICIONES)[number])) {
    throw new RangeError(`${quien}: \`posicion\` ${describir(posicion)} no es válida. Usa una de: ${POSICIONES.join(", ")}.`);
  }
}

/** Milisegundos: número finito y >= 0 (`0` = sin autocierre). */
export function validarMs(valor: unknown, quien: string, parametro: string): void {
  if (valor !== undefined && (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0)) {
    throw new RangeError(`${quien}: \`${parametro}\` debe ser un número de ms finito y >= 0 (0 = sin autocierre) y llegó ${describir(valor)}.`);
  }
}

/** Entero >= `min`. `undefined` pasa (= "sin límite" / valor por defecto). */
export function validarEntero(valor: unknown, quien: string, parametro: string, min: number): void {
  if (valor !== undefined && (typeof valor !== "number" || !Number.isInteger(valor) || valor < min)) {
    throw new RangeError(`${quien}: \`${parametro}\` debe ser un entero >= ${min} (o no darlo, para sin límite) y llegó ${describir(valor)}.`);
  }
}
