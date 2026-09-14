import { R as RumboEstado } from './types-BYWgq4YE.js';

interface ConfirmarOptions {
    /** Estado de Rumbo. Obligatorio, igual que Alert/Toast: define la postura visual aunque no haya texto. */
    estado: RumboEstado;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Si es `true`, el botón de confirmar usa la variante destructiva (rojo). Por defecto `false`. */
    danger?: boolean;
    confirmarTexto?: string;
    cancelarTexto?: string;
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
    estado: RumboEstado;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Texto del único botón. Por defecto `"OK"`. */
    okTexto?: string;
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

export { type ConfirmarOptions, type ConfirmarResultado, type NotificarOptions, confirmar, notificar };
