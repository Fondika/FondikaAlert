import { ensureStyles } from "../core/styles";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import type { RumboEstado, RumboSuperficie } from "../rumbo/types";
import attachCss from "./attach.css";
import rumboCss from "../rumbo/rumbo.css";

export interface AttachOptions {
  /** Contenido libre a inyectar. Si se omite y se da `estado`, se usa Rumbo como contenido. */
  contenido?: HTMLElement | string;
  /** Atajo: monta a Rumbo directamente (icono de estado dentro de un botón, badge, etc.). */
  estado?: RumboEstado;
  superficie?: RumboSuperficie;
  /** Tamaño de Rumbo en px cuando se usa el atajo `estado`. Por defecto 24 (tamaño de icono). */
  size?: number;
  anim?: "fade" | "slide";
}

export interface AttachHandle {
  el: HTMLElement;
  close(): Promise<void>;
}

/**
 * Attach — presentador Inline (ADR-002/§4.3): inyecta contenido DENTRO de un elemento existente,
 * sin cubrirlo (a diferencia de Overlay). Caso genérico de "monta esto en este div", y el atajo
 * más común: fijar a Rumbo como icono dentro de un botón, un badge o cualquier contenedor.
 *
 * Persistente (ADR-006): devuelve un `Handle`, el llamador decide cuándo `close()`.
 */
export function attachTo(host: HTMLElement, options: AttachOptions = {}): AttachHandle {
  ensureStyles(attachCss + rumboCss);

  const anim = options.anim ?? "fade";
  const wrap = document.createElement("span");
  wrap.className = `fdk-attach fdk-attach--${anim} fdk-anim-in`;

  if (options.contenido instanceof HTMLElement) {
    wrap.appendChild(options.contenido);
  } else if (typeof options.contenido === "string") {
    wrap.innerHTML = options.contenido;
  } else if (options.estado) {
    wrap.innerHTML = rumboSvg({ estado: options.estado, superficie: options.superficie, size: options.size ?? 24 });
  }

  host.appendChild(wrap);

  return {
    el: wrap,
    async close() {
      await animar(wrap, "fdk-anim-out", 250);
      wrap.remove();
    },
  };
}
