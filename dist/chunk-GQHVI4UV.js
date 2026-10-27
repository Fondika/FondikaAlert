import {
  colorTextoSobre,
  degradadoDeToken,
  esTonoOscuro
} from "./chunk-BQ5PS2RS.js";
import {
  zIndex
} from "./chunk-WBGATSQU.js";
import {
  exigirElemento
} from "./chunk-TWOV343Q.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-ABG2US5U.js";
import {
  iniciarCicloVoz,
  resolverVozRumbo
} from "./chunk-HRROGUWK.js";
import {
  seguirMirada
} from "./chunk-B3635KHF.js";
import {
  rumboSvg
} from "./chunk-A6EV2SXJ.js";
import {
  superficiePorDefecto,
  validarEstado
} from "./chunk-DNUNKU7K.js";

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
  const inertados = [];
  if (esPantalla) {
    for (const hijo of Array.from(document.body.children)) {
      if (/(^|\s)fdk-/.test(hijo.className) || hijo.hasAttribute("inert")) continue;
      hijo.setAttribute("inert", "");
      inertados.push(hijo);
    }
    const activo = document.activeElement;
    if (activo && inertados.some((n) => n.contains(activo))) activo.blur();
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
  const detenerMirada = options.mirada ? seguirMirada(el) : () => {
  };
  return { el, detenerCiclo: () => {
    detenerCiclo();
    detenerMirada();
  } };
}
function te\u00F1irOverlay(overlayEl, superficie) {
  const degradado = degradadoDeToken(superficie);
  if (!degradado) return;
  overlayEl.style.background = degradado;
  if (esTonoOscuro(superficie)) overlayEl.style.color = colorTextoSobre(superficie);
}
var refsPantalla = 0;
var overlayPantalla = null;
var detenerCicloPantalla = () => {
};
var cierrePantalla = 0;
function loaderScreen(options = {}) {
  validarEstado(options.estado, "loaderScreen", true);
  ensureStyles(loader_default, rumbo_default);
  options = { ...options, superficie: options.superficie ?? superficiePorDefecto(options.estado) };
  refsPantalla++;
  if (!overlayPantalla) {
    const { el, detenerCiclo } = construirContenido(options, 96);
    overlayPantalla = montarOverlay(document.body, el);
    overlayPantalla.el.classList.add("fdk-anim-in");
    te\u00F1irOverlay(overlayPantalla.el, options.superficie);
    detenerCicloPantalla = detenerCiclo;
  } else if (refsPantalla === 1) {
    overlayPantalla.el.classList.remove("fdk-anim-out");
    cierrePantalla++;
  }
  const overlay = overlayPantalla;
  let cerrado = false;
  return {
    el: overlay.el,
    async close() {
      if (cerrado) return;
      cerrado = true;
      if (--refsPantalla > 0) return;
      const marca = ++cierrePantalla;
      await animar(overlay.el, "fdk-anim-out", 250);
      if (marca !== cierrePantalla) return;
      detenerCicloPantalla();
      overlay.close();
      overlayPantalla = null;
    }
  };
}
var targets = /* @__PURE__ */ new WeakMap();
function loaderTarget(host, options = {}) {
  exigirElemento(host, "loaderTarget");
  validarEstado(options.estado, "loaderTarget", true);
  ensureStyles(loader_default, rumbo_default);
  options = { ...options, superficie: options.superficie ?? superficiePorDefecto(options.estado) };
  let entrada = targets.get(host);
  if (!entrada) {
    const { el, detenerCiclo } = construirContenido(options, 44);
    const overlay = montarOverlay(host, el);
    overlay.el.classList.add("fdk-anim-in");
    te\u00F1irOverlay(overlay.el, options.superficie);
    entrada = { refs: 0, cierre: 0, overlay, detenerCiclo };
    targets.set(host, entrada);
  } else if (entrada.refs === 0) {
    entrada.overlay.el.classList.remove("fdk-anim-out");
    entrada.cierre++;
  }
  entrada.refs++;
  const actual = entrada;
  let cerrado = false;
  return {
    el: actual.overlay.el,
    async close() {
      if (cerrado) return;
      cerrado = true;
      if (--actual.refs > 0) return;
      const marca = ++actual.cierre;
      await animar(actual.overlay.el, "fdk-anim-out", 250);
      if (marca !== actual.cierre) return;
      actual.detenerCiclo();
      actual.overlay.close();
      targets.delete(host);
    }
  };
}

// src/loader/boton.ts
var activos = /* @__PURE__ */ new WeakMap();
function loaderBoton(boton, options = {}) {
  exigirElemento(boton, "loaderBoton", "boton");
  ensureStyles(loader_default, rumbo_default);
  let entrada = activos.get(boton);
  if (!entrada) {
    const keepWidth = options.keepWidth ?? true;
    const hijos = Array.from(boton.childNodes);
    const disabledPrevio = boton.disabled;
    const anchoPrevio = boton.style.width;
    if (keepWidth) boton.style.width = `${boton.getBoundingClientRect().width}px`;
    boton.disabled = true;
    boton.setAttribute("aria-busy", "true");
    const rumbo = document.createElement("span");
    rumbo.className = "fdk-loader-boton__rumbo";
    rumbo.setAttribute("aria-hidden", "true");
    rumbo.innerHTML = rumboSvg({ estado: "cargando", superficie: options.superficie, size: 28 });
    boton.replaceChildren(rumbo);
    const detenerMirada = options.mirada ? seguirMirada(rumbo) : () => {
    };
    entrada = {
      refs: 0,
      restaurar() {
        detenerMirada();
        boton.replaceChildren(...hijos);
        boton.disabled = disabledPrevio;
        boton.removeAttribute("aria-busy");
        if (keepWidth) boton.style.width = anchoPrevio;
      }
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
    }
  };
}

export {
  loaderScreen,
  loaderTarget,
  loaderBoton
};
