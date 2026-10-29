// src/rumbo/mirada.ts
var TOPE = 3.4;
var SUAVIDAD = 0.14;
var DISTANCIA = 220;
var REPOSO = 0.05;
var seguidores = /* @__PURE__ */ new Set();
var puntero = null;
var cuadro = null;
var OJOS = '.fdk-rumbo__ojos, [data-p^="ojos-"]';
var ojosDe = (raiz) => Array.from(raiz.querySelectorAll(OJOS));
function apuntar(s) {
  const svg = s.raiz.querySelector('.fdk-rumbo, svg[data-fondika^="rumbo-"]');
  if (!puntero || !svg) {
    s.objX = s.objY = 0;
    return;
  }
  const r = svg.getBoundingClientRect();
  let fx = 0.72, fy = 0.56;
  if (!svg.classList.contains("fdk-rumbo")) {
    const vb = svg.viewBox.baseVal;
    fx = (83.5 - vb.x) / vb.width;
    fy = (62 - vb.y) / vb.height;
  }
  const dx = puntero.x - (r.left + r.width * fx);
  const dy = puntero.y - (r.top + r.height * fy);
  const d = Math.hypot(dx, dy) || 1;
  const f = Math.min(1, d / DISTANCIA);
  s.objX = dx / d * TOPE * f;
  s.objY = dy / d * TOPE * f;
}
function soltar(s) {
  if (!seguidores.delete(s)) return;
  ojosDe(s.raiz).forEach((g) => g.style.transform = "");
  if (seguidores.size === 0) {
    window.removeEventListener("pointermove", alMover);
    if (cuadro !== null) cancelAnimationFrame(cuadro);
    cuadro = null;
    puntero = null;
  }
}
function paso() {
  let activo = false;
  for (const s of seguidores) {
    if (s.raiz.isConnected === false) {
      soltar(s);
      continue;
    }
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
  return () => soltar(s);
}

export {
  seguirMirada
};
