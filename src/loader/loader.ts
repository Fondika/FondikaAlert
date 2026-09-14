import { ensureStyles } from "../core/styles";
import { montarOverlay } from "../core/overlay";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import { degradadoDeToken, esTonoOscuro } from "../core/color";
import type { RumboEstado, RumboSuperficie } from "../rumbo/types";
import loaderCss from "./loader.css";
import rumboCss from "../rumbo/rumbo.css";

export interface LoaderOptions {
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

export interface LoaderHandle {
  el: HTMLElement;
  close(): Promise<void>;
}

function construirContenido(options: LoaderOptions, size: number) {
  const estado = options.estado ?? "cargando";
  const el = document.createElement("div");
  const media = document.createElement("div");
  media.className = "fdk-overlay__media";
  media.innerHTML = rumboSvg({ estado, superficie: options.superficie, size });
  el.appendChild(media);

  const p = document.createElement("p");
  p.className = "fdk-overlay__texto";
  el.appendChild(p);

  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  let detenerCiclo: () => void = () => {};
  if (esCiclico && sinTextoExplicito) {
    detenerCiclo = iniciarCicloVoz(estado, (texto) => (p.textContent = texto));
  } else {
    const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
    if (texto === null) p.remove();
    else p.textContent = texto;
  }

  return { el, detenerCiclo };
}

/** Aplica el color de `superficie` al propio overlay (nunca queda implícito en el CSS base). */
function teñirOverlay(overlayEl: HTMLElement, superficie: RumboSuperficie | undefined) {
  const degradado = degradadoDeToken(superficie);
  if (!degradado) return;
  overlayEl.style.background = degradado;
  if (esTonoOscuro(superficie)) overlayEl.style.color = "#fff";
}

// ---- Loader.screen — refcount global: 3 llamadas paralelas, 1 sola pantalla, cierra hasta la 3ª close() ----
let refsPantalla = 0;
let overlayPantalla: ReturnType<typeof montarOverlay> | null = null;
let detenerCicloPantalla: () => void = () => {};

/** Loader de pantalla completa. Persistente (ADR-006): devuelve un `Handle`, no se cierra solo. */
export function loaderScreen(options: LoaderOptions = {}): LoaderHandle {
  ensureStyles(loaderCss + rumboCss);
  refsPantalla++;
  if (!overlayPantalla) {
    const { el, detenerCiclo } = construirContenido(options, 96);
    overlayPantalla = montarOverlay(document.body, el);
    overlayPantalla.el.classList.add("fdk-anim-in");
    teñirOverlay(overlayPantalla.el, options.superficie);
    detenerCicloPantalla = detenerCiclo;
  }
  const overlay = overlayPantalla;
  return {
    el: overlay.el,
    async close() {
      if (--refsPantalla > 0) return;
      refsPantalla = 0;
      detenerCicloPantalla();
      await animar(overlay.el, "fdk-anim-out", 250);
      overlay.close();
      overlayPantalla = null;
    },
  };
}

// ---- Loader.target — mismo refcount, pero uno por host (WeakMap: se libera solo si el host se desmonta) ----
interface EntradaTarget {
  refs: number;
  overlay: ReturnType<typeof montarOverlay>;
  detenerCiclo: () => void;
}
const targets = new WeakMap<HTMLElement, EntradaTarget>();

/** Loader que cubre sólo `host` (una tabla, una card…), no toda la pantalla. */
export function loaderTarget(host: HTMLElement, options: LoaderOptions = {}): LoaderHandle {
  ensureStyles(loaderCss + rumboCss);
  let entrada = targets.get(host);
  if (!entrada) {
    const { el, detenerCiclo } = construirContenido(options, 44);
    const overlay = montarOverlay(host, el);
    overlay.el.classList.add("fdk-anim-in");
    teñirOverlay(overlay.el, options.superficie);
    entrada = { refs: 0, overlay, detenerCiclo };
    targets.set(host, entrada);
  }
  entrada.refs++;
  const actual = entrada;
  return {
    el: actual.overlay.el,
    async close() {
      if (--actual.refs > 0) return;
      actual.detenerCiclo();
      await animar(actual.overlay.el, "fdk-anim-out", 250);
      actual.overlay.close();
      targets.delete(host);
    },
  };
}
