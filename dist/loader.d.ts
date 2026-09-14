import { R as RumboEstado, b as RumboSuperficie } from './types-BYWgq4YE.js';

interface LoaderOptions {
    /** Estado de Rumbo. Por defecto `"cargando"` — el uso más común, pero no el único (ej. dejar un `error` fijo cubriendo la pantalla). */
    estado?: RumboEstado;
    /** Texto libre. Tiene prioridad sobre `vozId`. */
    texto?: string;
    /** Id de una línea de la biblioteca de voz de Rumbo para el estado usado (voz-rumbo.json). */
    vozId?: string;
    /**
     * Superficie donde se monta el loader, para resolver la variante de Rumbo (color/luminoso).
     * Cuando el tono es oscuro/saturado (900/700), Rumbo pasa a blanco con su glow detrás y,
     * además, el propio overlay se pinta con un degradado radial de ese color (más claro donde
     * está Rumbo, más profundo hacia los bordes) — el glow no se lee sobre el overlay translúcido
     * casi blanco por defecto ni sobre un relleno plano; necesita ese filtro de luz detrás.
     */
    superficie?: RumboSuperficie;
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
}
interface LoaderBotonHandle {
    close(): void;
}
/**
 * Loader inline dentro de un `<button>` (presentador Inline: inyecta DENTRO del elemento, sin
 * cubrirlo). Persistente: el botón queda `disabled` y con `aria-busy` hasta llamar a `close()`.
 *
 * Usa a Rumbo (estado `cargando`) como indicador, no un spinner genérico — es el mismo personaje
 * en todos los loaders de la librería. 28px es el mínimo de marca para que Vida siga siendo
 * legible (Brand_kit_Fondika/04-personaje/README.md §6): cualquier botón con ese alto o más
 * (el mínimo táctil ya es 44px) lo acomoda sin problema.
 */
declare function loaderBoton(boton: HTMLButtonElement, options?: LoaderBotonOptions): LoaderBotonHandle;

export { type LoaderBotonHandle, type LoaderBotonOptions, type LoaderHandle, type LoaderOptions, loaderBoton, loaderScreen, loaderTarget };
