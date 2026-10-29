import {
  baseDe
} from "./chunk-LOWXO64Y.js";

// src/sonido/sonido.ts
var HAPTICA = {
  exito: [12, 60, 24],
  deposito: [10, 40, 20],
  retiro: [10, 40, 20],
  alerta: [24, 70, 12],
  error: [26, 50, 26],
  toque: [10]
};
var POR_ESTADO = {
  exito: "exito",
  error: "error",
  alerta: "alerta",
  reposo: "aviso",
  escuchando: "aviso"
};
var baseUrl = "/sonidos/";
function configurarSonido(options) {
  baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : options.baseUrl + "/";
}
function sonar(clave) {
  if (typeof Audio === "undefined") return;
  new Audio(`${baseUrl}fdk-${clave}.wav`).play().catch(() => {
  });
  const h = HAPTICA[clave];
  if (h) navigator.vibrate?.(h);
}
function sonarPara(sonido, estado) {
  if (estado === "rendimiento") return;
  const clave = typeof sonido === "string" ? sonido : sonido && estado ? POR_ESTADO[baseDe(estado)] : void 0;
  if (clave) sonar(clave);
}

export {
  configurarSonido,
  sonar,
  sonarPara
};
