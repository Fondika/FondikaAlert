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
function degradadoDeToken(token) {
  const fondo = fondoDeToken(token);
  if (!fondo) return void 0;
  return `radial-gradient(ellipse 68% 40% at 50% 38%, color-mix(in srgb, ${fondo} 80%, white) 0%, color-mix(in srgb, ${fondo} 40%, transparent) 55%, transparent 100%), ${fondo}`;
}

export {
  fondoDeToken,
  esTonoOscuro,
  degradadoDeToken
};
