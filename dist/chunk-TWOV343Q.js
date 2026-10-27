// src/core/validar.ts
function describir(valor) {
  if (valor === null) return "null";
  if (typeof valor === "string") return `"${valor}"`;
  if (typeof valor === "object") return Object.prototype.toString.call(valor);
  return String(valor);
}
function exigirElemento(valor, quien, parametro = "host") {
  if (valor?.nodeType !== 1) {
    throw new TypeError(`${quien}: \`${parametro}\` debe ser un elemento del DOM y lleg\xF3 ${describir(valor)}.`);
  }
}
var POSICIONES = [
  "top-start",
  "top-center",
  "top-end",
  "middle-start",
  "middle-center",
  "middle-end",
  "bottom-start",
  "bottom-center",
  "bottom-end"
];
function validarPosicion(posicion, quien) {
  if (posicion !== void 0 && !POSICIONES.includes(posicion)) {
    throw new RangeError(`${quien}: \`posicion\` ${describir(posicion)} no es v\xE1lida. Usa una de: ${POSICIONES.join(", ")}.`);
  }
}
function validarMs(valor, quien, parametro) {
  if (valor !== void 0 && (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0)) {
    throw new RangeError(`${quien}: \`${parametro}\` debe ser un n\xFAmero de ms finito y >= 0 (0 = sin autocierre) y lleg\xF3 ${describir(valor)}.`);
  }
}
function validarEntero(valor, quien, parametro, min) {
  if (valor !== void 0 && (typeof valor !== "number" || !Number.isInteger(valor) || valor < min)) {
    throw new RangeError(`${quien}: \`${parametro}\` debe ser un entero >= ${min} (o no darlo, para sin l\xEDmite) y lleg\xF3 ${describir(valor)}.`);
  }
}

export {
  exigirElemento,
  validarPosicion,
  validarMs,
  validarEntero
};
