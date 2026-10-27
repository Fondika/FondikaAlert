import {
  alert_default,
  iconoDeNivel,
  nivelDeEstado
} from "./chunk-22HQHEYW.js";
import {
  getLayer
} from "./chunk-WZA7ARBF.js";
import {
  layer_default
} from "./chunk-FU44WMPZ.js";
import {
  pintarEscena
} from "./chunk-4SL5GHEC.js";
import {
  sonarPara
} from "./chunk-3RP4GPS2.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-ABG2US5U.js";
import {
  iniciarCicloVoz,
  resolverVozRumbo
} from "./chunk-HRROGUWK.js";
import {
  rumboSvg
} from "./chunk-A6EV2SXJ.js";
import {
  escenaDe,
  validarEstado
} from "./chunk-DNUNKU7K.js";

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
      pintarEscena(media, escena, 80);
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
  const estado = options.estado;
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  let detenerCiclo = () => {
  };
  if (esCiclico && sinTextoExplicito) {
    p.style.display = "";
    detenerCiclo = iniciarCicloVoz(estado, (texto) => {
      p.textContent = texto;
    });
  } else {
    const texto = resolverVozRumbo({
      estado: options.estado,
      texto: options.texto,
      vozId: options.vozId
    });
    if (texto === null) {
      p.remove();
    } else {
      p.textContent = texto;
    }
  }
  layer.appendChild(el);
  sonarPara(options.sonido, options.estado);
  return {
    el,
    cerrar() {
      detenerCiclo();
      el.remove();
    }
  };
}

export {
  crearAlert
};
