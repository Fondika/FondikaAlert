import { R as RumboEstadoExtendido, c as RumboSuperficie } from './estados-Disuf6Zh.js';
import { P as Position } from './layer-CjjTmQWt.js';
import { SonidoClave } from './sonido.js';

interface ToastOptions {
    /** Estado de Rumbo. Obligatorio, igual que en Alert: define la postura visual aunque no haya texto. */
    estado: RumboEstadoExtendido;
    titulo?: string;
    texto?: string;
    vozId?: string;
    /** Por defecto `true`: un toast sin Rumbo es sólo un aviso genérico, y aquí sí hay espacio y tiempo para animarlo. */
    personaje?: boolean;
    /**
     * Color de fondo del propio toast. En `saludo` y `onboarding` (siempre Rumbo luminoso) el valor por
     * defecto es `naranja-900`, no blanco + sombra. Por defecto es blanco con una sombra del color del nivel
     * (`info`/`exito`/`alerta`/`error`) en vez de un relleno plano — excepto en `sin-conexion`,
     * que conserva su fondo gris de siempre. Si se da un token explícito de tono oscuro/saturado
     * (900/700), el texto pasa a blanco y Rumbo cambia a su variante luminosa. Nunca tiñe nada
     * fuera del propio toast — a diferencia de la superficie donde se monta.
     *
     * Sólo se recomiendan los tonos 900/700 (sólidos/oscuros) de cada color — los tonos claros
     * (500/300/100) no dan suficiente contraste con el texto blanco. En los estados `reposo`,
     * `escuchando`, `pensando`, `cargando` y `exito`, evita `turquesa-900`/`turquesa-700`: Vida (y
     * en `escuchando`/`pensando`/`cargando` también sus acentos) son turquesa y se pierden contra
     * ese fondo.
     */
    background?: RumboSuperficie;
    /** Posición en la grilla 3×3 (ADR-003). Por defecto `top-end`. */
    posicion?: Position;
    /** ms antes de autocerrar. `0` deshabilita el autocierre — el usuario cierra a mano. Default 4000. */
    timer?: number;
    host?: HTMLElement;
    /**
     * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
     * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
     * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
     */
    sonido?: boolean | SonidoClave;
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
/**
 * Tope global de toasts a la vez (por defecto sin límite). Los que excedan el tope esperan en una cola y se
 * muestran, en orden, conforme se cierran los visibles; su `timer` empieza al mostrarse, no al pedirse.
 * `configurarToast({})` quita el tope. Ojo: un toast con `timer: 0` ocupa su lugar hasta que el usuario lo cierre.
 */
declare function configurarToast(options: {
    maxVisibles?: number;
}): void;
/**
 * Toast — efímero (ADR-006): `fire()` devuelve una `Promise<void>` que resuelve cuando el toast
 * termina de cerrarse, sea por timer, por click de cierre, o porque el usuario nunca más lo ve.
 * No hay `close()` externo: si necesitas cerrarlo desde código, usa `Alert`/`Loader` (persistentes).
 *
 * A diferencia de Alert, el Toast NUNCA lleva la barra izquierda de 4px (`fdk-alert--barra`):
 * esa marca es exclusiva de Alert.
 */
declare function fireToast(options: ToastOptions): Promise<void>;

export { type ToastOptions, configurarToast, fireToast };
