import { zIndex } from "./zstack";

export interface OverlayHandle {
  el: HTMLElement;
  close(): void;
}

const posicionPrevia = new WeakMap<HTMLElement, string>();

/**
 * Presentador Overlay: cubre por completo un host (pantalla o elemento), invariante #18
 * (`aria-busy` + `inert` en el host) e invariante #4 (restaura lo que mutó al cerrar).
 */
export function montarOverlay(host: HTMLElement, contenido: HTMLElement): OverlayHandle {
  const esPantalla = host === document.body;

  const overlay = document.createElement("div");
  overlay.className = `fdk-overlay ${esPantalla ? "fdk-overlay--pantalla" : "fdk-overlay--target"}`;
  overlay.style.setProperty("--fdk-z", String(esPantalla ? zIndex.overlayPantalla : zIndex.overlayScoped));
  overlay.setAttribute("aria-busy", "true");
  overlay.appendChild(contenido);

  if (!esPantalla) {
    if (getComputedStyle(host).position === "static") {
      posicionPrevia.set(host, host.style.position);
      host.style.position = "relative";
    }
    host.setAttribute("aria-busy", "true");
    host.setAttribute("inert", "");
  }

  host.appendChild(overlay);

  return {
    el: overlay,
    close() {
      overlay.remove();
      if (!esPantalla) {
        host.removeAttribute("aria-busy");
        host.removeAttribute("inert");
        const prev = posicionPrevia.get(host);
        if (prev !== undefined) {
          host.style.position = prev;
          posicionPrevia.delete(host);
        }
      }
    },
  };
}
