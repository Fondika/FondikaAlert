import { R as RumboEstado, b as RumboSuperficie } from './types-BYWgq4YE.js';
import { P as Position } from './layer-CjjTmQWt.js';

interface ToastOptions {
    /** Estado de Rumbo. Obligatorio, igual que en Alert: define la postura visual aunque no haya texto. */
    estado: RumboEstado;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Por defecto `true`: un toast sin Rumbo es sólo un aviso genérico, y aquí sí hay espacio y tiempo para animarlo. */
    personaje?: boolean;
    /**
     * Color de fondo del propio toast (uno de los 18 tokens de la paleta). Por defecto usa el
     * tinte del nivel (`info`/`exito`/`alerta`/`error`/`neutro`), igual que Alert. Si el tono es
     * oscuro/saturado (900/700), el texto pasa a blanco y Rumbo cambia a su variante luminosa.
     * Nunca tiñe nada fuera del propio toast — a diferencia de la superficie donde se monta.
     */
    background?: RumboSuperficie;
    /** Posición en la grilla 3×3 (ADR-003). Por defecto `top-end`. */
    posicion?: Position;
    /** ms antes de autocerrar. `0` deshabilita el autocierre — el usuario cierra a mano. Default 4000. */
    timer?: number;
    host?: HTMLElement;
}
/**
 * Toast — efímero (ADR-006): `fire()` devuelve una `Promise<void>` que resuelve cuando el toast
 * termina de cerrarse, sea por timer, por click de cierre, o porque el usuario nunca más lo ve.
 * No hay `close()` externo: si necesitas cerrarlo desde código, usa `Alert`/`Loader` (persistentes).
 *
 * A diferencia de Alert, el Toast NUNCA lleva la barra izquierda de 4px (`fdk-alert--barra`):
 * esa marca es exclusiva de Alert.
 */
declare function fireToast(options: ToastOptions): Promise<void>;

export { type ToastOptions, fireToast };
