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
function degradadoDeToken(token) {
  const fondo = fondoDeToken(token);
  if (!fondo) return void 0;
  return `radial-gradient(ellipse 68% 40% at 50% 38%, color-mix(in srgb, ${fondo} 80%, white) 0%, color-mix(in srgb, ${fondo} 40%, transparent) 55%, transparent 100%), ${fondo}`;
}

export {
  fondoDeToken,
  esTonoOscuro,
  colorTextoSobre,
  degradadoDeToken
};
