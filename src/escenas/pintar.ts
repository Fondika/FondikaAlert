import type { EscenaEstado as EscenaNombre } from "../rumbo/estados";
import type { OpcionesEscena } from "./escenas";

/**
 * Pinta una escena en `el` cargando el módulo de escenas (~90 KB de SVG) sólo cuando se pide:
 * así Modal, Mascota y Attach no engordan para quien nunca usa `escena`. El `dataset` evita que
 * una carga tardía pise un cambio posterior (ej. `actualizar()` a otra escena o a un estado).
 */
export function pintarEscena(el: HTMLElement, nombre: EscenaNombre, size: number, opciones: OpcionesEscena = {}): void {
  el.dataset.escena = nombre;
  import("./escenas").then((m) => {
    if (el.dataset.escena === nombre) el.innerHTML = m.rumboEscena(nombre, size, opciones);
  });
}
