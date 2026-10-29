import { R as RumboEstadoExtendido, c as RumboSuperficie } from './estados-8m_MyFGM.js';

interface LoaderOptions {
    /** Estado de Rumbo. Por defecto `"cargando"` — el uso más común, pero no el único (ej. dejar un `error` fijo cubriendo la pantalla). */
    estado?: RumboEstadoExtendido;
    /** Texto bajo Rumbo. Opcional: sin él no hay copy (en `pensando`/`cargando`, el de espera). Sobre un fondo luminoso es blanco. */
    texto?: string;
    /**
     * Superficie donde se monta el loader, para resolver la variante de Rumbo (color/luminoso).
     * Cuando el tono es oscuro/saturado (900/700), Rumbo pasa a blanco y el propio overlay se pinta con ese color,
     * plano (sin degradado ni halo detrás de Rumbo).
     */
    superficie?: RumboSuperficie;
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
interface LoaderHandle {
    el: HTMLElement;
    close(): Promise<void>;
}
/** Loader de pantalla completa. Persistente (ADR-006): devuelve un `Handle`, no se cierra solo. */
declare function loaderScreen(options?: LoaderOptions): LoaderHandle;
/** Loader que cubre sólo `host` (una tabla, una card…), no toda la pantalla. */
declare function loaderTarget(host: HTMLElement, options?: LoaderOptions): LoaderHandle;

interface LoaderBotonOptions {
    /** Evita que el botón se encoja al sustituir el texto por Rumbo. Por defecto `true`. */
    keepWidth?: boolean;
    /**
     * Superficie donde se monta el botón, para resolver la variante de Rumbo (color/luminoso).
     * Muy relevante aquí: un botón primario ya es fondo `naranja-900` — pásalo para que Rumbo se
     * vea en blanco (luminoso) en vez de desaparecer sobre su propio color. Por defecto `blanco`.
     */
    superficie?: RumboSuperficie;
    /**
     * Texto junto a Rumbo mientras el botón carga (p. ej. «Guardando…»). Opcional: sin él, sólo Rumbo. Sobre una
     * `superficie` luminosa (900/700) es blanco. Con texto, `keepWidth` fija el ancho MÍNIMO del botón, no el exacto.
     */
    texto?: string;
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
interface LoaderBotonHandle {
    close(): void;
}
/**
 * Loader inline dentro de un `<button>` (presentador Inline: inyecta DENTRO del elemento, sin
 * cubrirlo). Persistente: el botón queda `disabled` y con `aria-busy` hasta que se llame a `close()` en todos
 * los handles que se pidieron (varias llamadas sobre el mismo botón cuentan referencias).
 *
 * Usa a Rumbo (estado `cargando`) como indicador, no un spinner genérico — es el mismo personaje
 * en todos los loaders de la librería. 28px es el mínimo de marca para que Vida siga siendo
 * legible (Brand_kit_Fondika/04-personaje/README.md §6): cualquier botón con ese alto o más
 * (el mínimo táctil ya es 44px) lo acomoda sin problema.
 */
declare function loaderBoton(boton: HTMLButtonElement, options?: LoaderBotonOptions): LoaderBotonHandle;

export { type LoaderBotonHandle, type LoaderBotonOptions, type LoaderHandle, type LoaderOptions, loaderBoton, loaderScreen, loaderTarget };
