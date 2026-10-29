import {
  alert_default,
  iconoDeNivel,
  nivelDeEstado
} from "./chunk-7GHW5GJX.js";
import {
  getLayer
} from "./chunk-WZA7ARBF.js";
import {
  layer_default
} from "./chunk-FU44WMPZ.js";
import {
  pintarEscena
} from "./chunk-YVERCKO4.js";
import {
  sonarPara
} from "./chunk-WIHJ4O4Y.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-6JBUCDJC.js";
import {
  rumboSvg
} from "./chunk-BMHUI4L2.js";
import {
  escenaDe,
  validarEstado
} from "./chunk-LOWXO64Y.js";

// src/alert/alert.ts
function crearAlert(options) {
  validarEstado(options?.estado, "crearAlert");
  ensureStyles(layer_default, alert_default, rumbo_default);
  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer("top-end", options.host);
  const el = document.createElement("div");
  el.className = `fdk-alert fdk-alert--${nivel} fdk-alert--barra fdk-alert--flotante`;
  const escena = escenaDe(options.estado);
  const conPersonaje = options.personaje || !!escena;
  if (conPersonaje) el.classList.add("fdk-alert--sombra");
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");
  const media = document.createElement("div");
  if (conPersonaje) {
    media.className = "fdk-alert__rumbo";
    if (escena) {
      media.classList.add("fdk-alert__rumbo--escena");
      pintarEscena(media, escena, 64.7);
    } else media.innerHTML = rumboSvg({ estado: options.estado, size: 46.2 });
  } else {
    media.className = "fdk-alert__icono";
    media.innerHTML = iconoDeNivel(nivel);
    if (options.titulo) media.style.alignSelf = "flex-start";
  }
  el.appendChild(media);
  const body = document.createElement("div");
  body.className = "fdk-alert__cuerpo";
  if (options.titulo) {
    const b = document.createElement("b");
    b.className = "fdk-alert__titulo";
    b.textContent = options.titulo;
    body.appendChild(b);
  }
  const p = document.createElement("span");
  body.appendChild(p);
  el.appendChild(body);
  if (options.texto) p.textContent = options.texto;
  else p.remove();
  layer.appendChild(el);
  sonarPara(options.sonido, options.estado);
  return {
    el,
    cerrar() {
      el.remove();
    }
  };
}

export {
  crearAlert
};
