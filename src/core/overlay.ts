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

  // Pantalla completa: el overlay no puede ser hijo de un `inert`, así que se inerta el resto del <body> (menos
  // lo que es de la librería: toasts, modales, otro loader) para que Tab/Enter no lleguen a la página bloqueada.
  const inertados: Element[] = [];
  if (esPantalla) {
    for (const hijo of Array.from(document.body.children)) {
      if (/(^|\s)fdk-/.test(hijo.className) || hijo.hasAttribute("inert")) continue;
      hijo.setAttribute("inert", "");
      inertados.push(hijo);
    }
    const activo = document.activeElement;
    if (activo && inertados.some((n) => n.contains(activo))) (activo as HTMLElement).blur();
  }

  host.appendChild(overlay);

  return {
    el: overlay,
    close() {
      overlay.remove();
      inertados.forEach((n) => n.removeAttribute("inert"));
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
