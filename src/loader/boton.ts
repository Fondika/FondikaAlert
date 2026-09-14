import { ensureStyles } from "../core/styles";
import { rumboSvg } from "../rumbo/rumbo";
import type { RumboSuperficie } from "../rumbo/types";
import loaderCss from "./loader.css";
import rumboCss from "../rumbo/rumbo.css";

export interface LoaderBotonOptions {
  /** Evita que el botón se encoja al sustituir el texto por Rumbo. Por defecto `true`. */
  keepWidth?: boolean;
  /**
   * Superficie donde se monta el botón, para resolver la variante de Rumbo (color/luminoso).
   * Muy relevante aquí: un botón primario ya es fondo `naranja-900` — pásalo para que Rumbo se
   * vea en blanco (luminoso) en vez de desaparecer sobre su propio color. Por defecto `blanco`.
   */
  superficie?: RumboSuperficie;
}

export interface LoaderBotonHandle {
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
export function loaderBoton(boton: HTMLButtonElement, options: LoaderBotonOptions = {}): LoaderBotonHandle {
  ensureStyles(loaderCss + rumboCss);

  const keepWidth = options.keepWidth ?? true;
  const contenidoPrevio = boton.innerHTML;
  const disabledPrevio = boton.disabled;

  if (keepWidth) boton.style.width = `${boton.getBoundingClientRect().width}px`;
  boton.disabled = true;
  boton.setAttribute("aria-busy", "true");
  boton.innerHTML = `<span class="fdk-loader-boton__rumbo" aria-hidden="true">${rumboSvg({ estado: "cargando", superficie: options.superficie, size: 28 })}</span>`;

  return {
    close() {
      boton.innerHTML = contenidoPrevio;
      boton.disabled = disabledPrevio;
      boton.removeAttribute("aria-busy");
      if (keepWidth) boton.style.width = "";
    },
  };
}
