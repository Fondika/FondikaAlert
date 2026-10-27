// src/rumbo/mirada.ts
var TOPE = 3.4;
var SUAVIDAD = 0.14;
var DISTANCIA = 220;
var REPOSO = 0.05;
var seguidores = /* @__PURE__ */ new Set();
var puntero = null;
var cuadro = null;
var ojosDe = (raiz) => Array.from(raiz.querySelectorAll(".fdk-rumbo__ojos"));
function apuntar(s) {
  const svg = s.raiz.querySelector(".fdk-rumbo");
  if (!puntero || !svg) {
    s.objX = s.objY = 0;
    return;
  }
  const r = svg.getBoundingClientRect();
  const dx = puntero.x - (r.left + r.width * 0.72);
  const dy = puntero.y - (r.top + r.height * 0.56);
  const d = Math.hypot(dx, dy) || 1;
  const f = Math.min(1, d / DISTANCIA);
  s.objX = dx / d * TOPE * f;
  s.objY = dy / d * TOPE * f;
}
function paso() {
  let activo = false;
  for (const s of seguidores) {
    apuntar(s);
    s.x += (s.objX - s.x) * SUAVIDAD;
    s.y += (s.objY - s.y) * SUAVIDAD;
    const t = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
    ojosDe(s.raiz).forEach((g) => g.style.transform = t);
    if (Math.abs(s.objX - s.x) > REPOSO || Math.abs(s.objY - s.y) > REPOSO) activo = true;
  }
  cuadro = activo ? requestAnimationFrame(paso) : null;
}
function alMover(ev) {
  puntero = { x: ev.clientX, y: ev.clientY };
  if (cuadro === null) cuadro = requestAnimationFrame(paso);
}
function seguirMirada(raiz) {
  if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") return () => {
  };
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {
  };
  const s = { raiz, x: 0, y: 0, objX: 0, objY: 0 };
  if (seguidores.size === 0) window.addEventListener("pointermove", alMover, { passive: true });
  seguidores.add(s);
  return () => {
    if (!seguidores.delete(s)) return;
    ojosDe(raiz).forEach((g) => g.style.transform = "");
    if (seguidores.size === 0) {
      window.removeEventListener("pointermove", alMover);
      if (cuadro !== null) cancelAnimationFrame(cuadro);
      cuadro = null;
      puntero = null;
    }
  };
}

export {
  seguirMirada
};
