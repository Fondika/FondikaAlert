import {
  alert_default,
  iconoDeNivel,
  nivelDeEstado
} from "./chunk-HJ4EWXOW.js";
import {
  getLayer
} from "./chunk-NTR55A6C.js";
import {
  layer_default
} from "./chunk-FU44WMPZ.js";
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

// src/alert/alert.ts
function crearAlert(options) {
  ensureStyles(layer_default + alert_default + rumbo_default);
  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer("top-end", options.host);
  const el = document.createElement("div");
  el.className = `fdk-alert fdk-alert--${nivel} fdk-alert--barra fdk-alert--flotante`;
  if (options.personaje) el.classList.add("fdk-alert--sombra");
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");
  const media = document.createElement("div");
  if (options.personaje) {
    media.className = "fdk-alert__rumbo";
    media.innerHTML = rumboSvg({ estado: options.estado, size: 46.2 });
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
