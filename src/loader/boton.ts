import { ensureStyles } from "../core/styles";
import { exigirElemento } from "../core/validar";
import { esTonoOscuro } from "../core/color";
import { seguirMirada } from "../rumbo/mirada";
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

export interface LoaderBotonHandle {
  close(): void;
}

/** Botones con un loader en curso: varias llamadas sobre el mismo botón comparten un solo spinner. */
const activos = new WeakMap<HTMLButtonElement, { refs: number; restaurar: () => void }>();

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
export function loaderBoton(boton: HTMLButtonElement, options: LoaderBotonOptions = {}): LoaderBotonHandle {
  exigirElemento(boton, "loaderBoton", "boton");
  ensureStyles(loaderCss, rumboCss);

  // Llamarlo dos veces sobre el mismo botón (un submit por Enter repetido) cuenta referencias, como los
  // demás loaders: si no, la 2ª llamada guardaría el spinner como "contenido original" y el botón
  // quedaría deshabilitado con el spinner para siempre.
  let entrada = activos.get(boton);
  if (!entrada) {
    const keepWidth = options.keepWidth ?? true;
    const hijos = Array.from(boton.childNodes); // los MISMOS nodos: un framework puede tener referencias a ellos
    const disabledPrevio = boton.disabled;
    const anchoPrevio = boton.style.width;
    const minAnchoPrevio = boton.style.minWidth;

    if (keepWidth) boton.style[options.texto ? "minWidth" : "width"] = `${boton.getBoundingClientRect().width}px`;
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
    const rumbo = document.createElement("span");
    rumbo.className = "fdk-loader-boton__rumbo";
    rumbo.setAttribute("aria-hidden", "true");
    rumbo.innerHTML = rumboSvg({ estado: "cargando", superficie: options.superficie, size: 28 });
    if (options.texto) {
      const texto = document.createElement("span");
      texto.className = "fdk-loader-boton__texto";
      texto.textContent = options.texto;
      if (esTonoOscuro(options.superficie)) texto.style.color = "#fff";
      boton.replaceChildren(rumbo, texto);
    } else boton.replaceChildren(rumbo);
    const detenerMirada = options.mirada ? seguirMirada(rumbo) : () => {};

    entrada = {
      refs: 0,
      restaurar() {
        detenerMirada();
        boton.replaceChildren(...hijos);
        boton.disabled = disabledPrevio;
        boton.removeAttribute("aria-busy");
        if (keepWidth) {
          boton.style.width = anchoPrevio;
          boton.style.minWidth = minAnchoPrevio;
        }
      },
    };
    activos.set(boton, entrada);
  }
  entrada.refs++;
  const actual = entrada;
  let cerrado = false;

  return {
    close() {
      if (cerrado) return;
      cerrado = true;
      if (--actual.refs > 0) return;
      actual.restaurar();
      activos.delete(boton);
    },
  };
}
