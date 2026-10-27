import { SonidoClave } from './sonido.js';
import { R as RumboEstadoExtendido } from './estados-Disuf6Zh.js';

/**
 * Tope de modales EN ESPERA (sin contar el visible; por defecto sin límite). Con la cola llena, un modal nuevo no se
 * encola ni se muestra: su promesa resuelve ya con `{ accionId: null }` (como si se hubiera descartado), así que
 * `confirmar()` da `isConfirmed: false` — el resultado seguro. `configurarModal({})` quita el tope.
 */
declare function configurarModal(options: {
    maxCola?: number;
}): void;
/**
 * Cierra el modal visible por código (p. ej. al cambiar de ruta) como si se hubiera cerrado con Esc: resuelve su
 * promesa con `{ accionId: null }` y deja pasar al siguiente de la cola. No hace nada si no hay ninguno.
 */
declare function cerrarModal(): void;

interface ConfirmarOptions {
    /** Estado de Rumbo. Obligatorio, igual que Alert/Toast: define la postura visual aunque no haya texto. */
    estado: RumboEstadoExtendido;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Si es `true`, el botón de confirmar usa la variante destructiva (rojo). Por defecto `false`. */
    danger?: boolean;
    confirmarTexto?: string;
    cancelarTexto?: string;
    /** Sonido + háptica: `true` = el del `estado`, o una clave (`"deposito"`…). Ver `ModalOptions.sonido`. */
    sonido?: boolean | SonidoClave;
    /**
     * Tema del modal: `"auto"` (por defecto) sigue el del sistema (`prefers-color-scheme`) y lo actualiza si cambia
     * mientras está abierto; `"claro"` u `"oscuro"` lo fijan a mano. Sólo aplica a los modales.
     */
    tema?: "auto" | "claro" | "oscuro";
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
interface ConfirmarResultado {
    isConfirmed: boolean;
}
/**
 * Preset de Modal para confirmaciones sí/no con Rumbo (catálogo Confirm del UI-Kit). Devuelve
 * `Promise<{ isConfirmed }>`.
 *
 * Sin X de cierre, sin Esc, sin click en el backdrop (`cerrable: false`): la decisión sólo se
 * toma presionando uno de los dos botones — regla del brief, para que un cierre accidental no
 * se confunda con "cancelar".
 */
declare function confirmar(options: ConfirmarOptions): Promise<ConfirmarResultado>;

interface NotificarOptions {
    /** Estado de Rumbo. Obligatorio, igual que Confirm/Alert/Toast: define la postura visual aunque no haya texto. */
    estado: RumboEstadoExtendido;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Texto del único botón. Por defecto `"OK"`. */
    okTexto?: string;
    /** Sonido + háptica: `true` = el del `estado`, o una clave (`"deposito"`…). Ver `ModalOptions.sonido`. */
    sonido?: boolean | SonidoClave;
    /**
     * Tema del modal: `"auto"` (por defecto) sigue el del sistema (`prefers-color-scheme`) y lo actualiza si cambia
     * mientras está abierto; `"claro"` u `"oscuro"` lo fijan a mano. Sólo aplica a los modales.
     */
    tema?: "auto" | "claro" | "oscuro";
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
/**
 * Preset de Modal para avisar algo al usuario sin pedirle una decisión — un solo botón ("OK"
 * por defecto). A diferencia de `confirmar()`, no hay nada que confirmar o cancelar: la promesa
 * sólo resuelve cuando el usuario reconoce el aviso.
 *
 * Sin X de cierre, sin Esc, sin click en el backdrop (`cerrable: false`): la única salida es el
 * botón — regla del brief, para que "avisar" no se confunda con "ignorar".
 */
declare function notificar(options: NotificarOptions): Promise<void>;

export { type ConfirmarOptions, type ConfirmarResultado, type NotificarOptions, cerrarModal, configurarModal, confirmar, notificar };
