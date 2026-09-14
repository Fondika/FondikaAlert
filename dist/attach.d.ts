import { R as RumboEstado, b as RumboSuperficie } from './types-BYWgq4YE.js';

interface AttachOptions {
    /** Contenido libre a inyectar. Si se omite y se da `estado`, se usa Rumbo como contenido. */
    contenido?: HTMLElement | string;
    /** Atajo: monta a Rumbo directamente (icono de estado dentro de un botón, badge, etc.). */
    estado?: RumboEstado;
    superficie?: RumboSuperficie;
    /** Tamaño de Rumbo en px cuando se usa el atajo `estado`. Por defecto 24 (tamaño de icono). */
    size?: number;
    anim?: "fade" | "slide";
}
interface AttachHandle {
    el: HTMLElement;
    close(): Promise<void>;
}
/**
 * Attach — presentador Inline (ADR-002/§4.3): inyecta contenido DENTRO de un elemento existente,
 * sin cubrirlo (a diferencia de Overlay). Caso genérico de "monta esto en este div", y el atajo
 * más común: fijar a Rumbo como icono dentro de un botón, un badge o cualquier contenedor.
 *
 * Persistente (ADR-006): devuelve un `Handle`, el llamador decide cuándo `close()`.
 */
declare function attachTo(host: HTMLElement, options?: AttachOptions): AttachHandle;

export { type AttachHandle, type AttachOptions, attachTo };
