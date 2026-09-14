import { P as Position } from './layer-CjjTmQWt.js';
import { R as RumboEstado, b as RumboSuperficie } from './types-BYWgq4YE.js';

interface MascotaOptions {
    /** Estado de Rumbo. Por defecto `"reposo"` — la mascota no está atada a ningún aviso en curso. */
    estado?: RumboEstado;
    /** Texto de la burbuja. Tiene prioridad sobre `vozId`. Si no hay ninguno, no hay burbuja. */
    texto?: string;
    /** Id de una línea de la biblioteca de voz de Rumbo para el estado usado. */
    vozId?: string;
    /** Posición en la grilla 3×3 (ADR-003). Por defecto `bottom-end`. */
    posicion?: Position;
    superficie?: RumboSuperficie;
    /** Tamaño de Rumbo en px. Por defecto 80. */
    size?: number;
    /** Handler de click sobre el propio personaje (ej. abrir un chat). Opcional. */
    onClick?: () => void;
    host?: HTMLElement;
}
interface MascotaHandle {
    el: HTMLElement;
    /** Cambia estado/texto/superficie sin recrear ni re-animar la entrada — es la misma mascota, actualizada. */
    actualizar(opts: Partial<MascotaOptions>): void;
    /** La esconde (fade out) sin destruirla — `mostrar()` la vuelve a traer donde estaba. */
    ocultar(): Promise<void>;
    mostrar(): void;
    /** La destruye. A diferencia de `ocultar()`, después de esto ya no existe. */
    cerrar(): Promise<void>;
}
/**
 * Mascota — presentador Floating persistente (ADR-002/§4.3): Rumbo suelto en la pantalla, fuera
 * de cualquier Alert/Toast/Modal, típicamente un widget de ayuda fijo en una esquina.
 *
 * A diferencia de Attach (que fija a Rumbo DENTRO de un elemento existente del consumidor), la
 * Mascota trae su propia capa flotante — comparte el sistema de posiciones de Toast pero un
 * z-index propio (`zstack.ts`), así nunca compite por apilamiento con un toast en la misma esquina.
 *
 * Sólo una mascota por posición (host + posición): llamar de nuevo actualiza la existente en vez
 * de apilar una segunda. Persistente (ADR-006): devuelve un `Handle`, nunca se cierra sola.
 */
declare function mostrarMascota(options?: MascotaOptions): MascotaHandle;

export { type MascotaHandle, type MascotaOptions, mostrarMascota };
