import {
  degradadoDeToken,
  esTonoOscuro
} from "./chunk-GQCXWWGT.js";
import {
  zIndex
} from "./chunk-IMEHW66V.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-H7UDFJLK.js";
import {
  iniciarCicloVoz,
  resolverVozRumbo
} from "./chunk-R75R3BM7.js";
import {
  rumboSvg
} from "./chunk-J7ITZR5C.js";

// src/core/overlay.ts
var posicionPrevia = /* @__PURE__ */ new WeakMap();
function montarOverlay(host, contenido) {
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
        if (prev !== void 0) {
          host.style.position = prev;
          posicionPrevia.delete(host);
        }
      }
    }
  };
}

// src/loader/loader.css
var loader_default = ".fdk-overlay {\n  position: absolute;\n  inset: 0;\n  z-index: var(--fdk-z, 9000);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: var(--fdk-sp-3);\n  background: rgb(255 255 255 / 85%);\n}\n.fdk-overlay--pantalla { position: fixed; }\n\n.fdk-overlay__media {\n  /*\n   * `display:flex` real, no `text-align:center`: Rumbo (el SVG) es `display:block`, y\n   * text-align s\xF3lo centra contenido inline \u2014 sobre un hijo de bloque no hace nada. Sin esto,\n   * si el texto de abajo es m\xE1s ancho, este div se estira a su ancho (los bloques ocupan el\n   * 100% disponible por defecto) y el SVG, pegado a la izquierda dentro de \xE9l, queda\n   * visualmente descentrado aunque el propio div s\xED est\xE9 centrado en el overlay.\n   */\n  display: flex;\n  justify-content: center;\n}\n\n.fdk-overlay__texto {\n  font-family: var(--fdk-font);\n  font-size: 14px;\n  color: var(--fdk-ink);\n  text-align: center;\n  max-width: 32ch;\n  margin: 0;\n}\n\n@keyframes fdk-overlay-in { from { opacity: 0; } to { opacity: 1; } }\n@keyframes fdk-overlay-out { from { opacity: 1; } to { opacity: 0; } }\n.fdk-overlay.fdk-anim-in { animation: fdk-overlay-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-overlay.fdk-anim-out { animation: fdk-overlay-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n\n/* Loader.button: Rumbo (cargando) inline, centrado dentro del bot\xF3n. */\n.fdk-loader-boton__rumbo {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  vertical-align: middle;\n}\n.fdk-loader-boton__rumbo .fdk-rumbo { width: 100%; height: 100%; }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-overlay.fdk-anim-in, .fdk-overlay.fdk-anim-out { animation: none; }\n}\n";

// src/loader/loader.ts
function construirContenido(options, size) {
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
  let detenerCiclo = () => {
  };
  if (esCiclico && sinTextoExplicito) {
    detenerCiclo = iniciarCicloVoz(estado, (texto) => p.textContent = texto);
  } else {
    const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
    if (texto === null) p.remove();
    else p.textContent = texto;
  }
  return { el, detenerCiclo };
}
function te\u00F1irOverlay(overlayEl, superficie) {
  const degradado = degradadoDeToken(superficie);
  if (!degradado) return;
  overlayEl.style.background = degradado;
  if (esTonoOscuro(superficie)) overlayEl.style.color = "#fff";
}
var refsPantalla = 0;
var overlayPantalla = null;
var detenerCicloPantalla = () => {
};
function loaderScreen(options = {}) {
  ensureStyles(loader_default + rumbo_default);
  refsPantalla++;
  if (!overlayPantalla) {
    const { el, detenerCiclo } = construirContenido(options, 96);
    overlayPantalla = montarOverlay(document.body, el);
    overlayPantalla.el.classList.add("fdk-anim-in");
    te\u00F1irOverlay(overlayPantalla.el, options.superficie);
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
    }
  };
}
var targets = /* @__PURE__ */ new WeakMap();
function loaderTarget(host, options = {}) {
  ensureStyles(loader_default + rumbo_default);
  let entrada = targets.get(host);
  if (!entrada) {
    const { el, detenerCiclo } = construirContenido(options, 44);
    const overlay = montarOverlay(host, el);
    overlay.el.classList.add("fdk-anim-in");
    te\u00F1irOverlay(overlay.el, options.superficie);
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
    }
  };
}

// src/loader/boton.ts
function loaderBoton(boton, options = {}) {
  ensureStyles(loader_default + rumbo_default);
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
    }
  };
}

export {
  loaderScreen,
  loaderTarget,
  loaderBoton
};
