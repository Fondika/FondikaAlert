// src/core/color.ts
function fondoDeToken(token) {
  if (!token || token === "blanco") return void 0;
  return `var(--fdk-${token})`;
}
function esTonoOscuro(token) {
  if (!token || token === "blanco") return false;
  const tono = token.split("-")[1];
  return tono === "900" || tono === "700";
}
var TONOS_CLAROS_PARA_TEXTO = ["naranja-900", "naranja-700", "turquesa-700", "gris-700"];
function colorTextoSobre(token) {
  return token && TONOS_CLAROS_PARA_TEXTO.includes(token) ? "#1f2123" : "#ffffff";
}

export {
  fondoDeToken,
  esTonoOscuro,
  colorTextoSobre
};
