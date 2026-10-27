// src/rumbo/estados.ts
var BASE_DE_ESCENA = {
  saludo: "reposo",
  vacia: "reposo",
  adios: "reposo",
  rendimiento: "reposo",
  asesor: "reposo",
  biometria: "escuchando",
  buscando: "pensando",
  "espera-larga": "cargando",
  "orden-manana": "cargando",
  deposito: "exito",
  retiro: "exito",
  domiciliacion: "exito",
  onboarding: "exito",
  mantenimiento: "sin-conexion",
  dormida: "sin-conexion"
};
function superficiePorDefecto(estado) {
  return estado === "saludo" || estado === "onboarding" ? "naranja-900" : void 0;
}
var propio = (obj, clave) => Object.prototype.hasOwnProperty.call(obj, clave);
function escenaDe(estado) {
  return estado !== void 0 && propio(BASE_DE_ESCENA, estado) ? estado : void 0;
}
var ESTADOS_BASE = {
  reposo: true,
  escuchando: true,
  pensando: true,
  cargando: true,
  exito: true,
  error: true,
  alerta: true,
  "sin-conexion": true
};
function validarEstado(estado, quien, opcional = false) {
  if (estado === void 0 && opcional) return;
  if (typeof estado === "string" && (propio(ESTADOS_BASE, estado) || propio(BASE_DE_ESCENA, estado))) return;
  const validos = [...Object.keys(ESTADOS_BASE), ...Object.keys(BASE_DE_ESCENA)].join(", ");
  throw new RangeError(`${quien}: \`estado\` ${typeof estado === "string" ? `"${estado}"` : String(estado)} no es v\xE1lido. Usa uno de: ${validos}.`);
}
function baseDe(estado) {
  const e = escenaDe(estado);
  return e ? BASE_DE_ESCENA[e] : estado;
}

export {
  BASE_DE_ESCENA,
  superficiePorDefecto,
  escenaDe,
  validarEstado,
  baseDe
};
