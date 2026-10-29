/**
 * Mirada: los ojos de Rumbo se desvían hacia el puntero, como en `04-personaje/assets/rumbo-en-movimiento.html`
 * ("Sigue el cursor"): como máximo 3.4 unidades del lienzo (120×120), con seguimiento suave, y nunca gira la cabeza.
 * Se apaga con `prefers-reduced-motion`. Opt-in: ningún componente lo hace sin `mirada: true`.
 *
 * Todos los seguidores comparten UN solo oyente de `pointermove` y UN solo bucle de animación, que se duerme cuando
 * los ojos ya llegaron a donde miran.
 */
const TOPE = 3.4; // unidades del viewBox
const SUAVIDAD = 0.14; // fracción del camino que recorre en cada cuadro
const DISTANCIA = 220; // px a partir de los cuales mira al máximo; más cerca, desvía menos
const REPOSO = 0.05;

interface Seguidor {
  raiz: Element;
  x: number;
  y: number;
  objX: number;
  objY: number;
}

const seguidores = new Set<Seguidor>();
let puntero: { x: number; y: number } | null = null;
let cuadro: number | null = null;

// Rumbo dibuja sus ojos en `.fdk-rumbo__ojos`; las escenas (SVG en línea, ver `rumboEscena(..., { mirada: true })`) en `[data-p^="ojos-"]`,
// que son 3 grupos (abiertos, arco, cerrados) y se mueven juntos, como en rumbo-en-movimiento.html.
const OJOS = '.fdk-rumbo__ojos, [data-p^="ojos-"]';
const ojosDe = (raiz: Element) => Array.from(raiz.querySelectorAll<SVGGElement>(OJOS));

function apuntar(s: Seguidor): void {
  const svg = s.raiz.querySelector('.fdk-rumbo, svg[data-fondika^="rumbo-"]');
  if (!puntero || !svg) {
    s.objX = s.objY = 0;
    return;
  }
  const r = svg.getBoundingClientRect();
  // Los ojos están hacia la derecha y algo por encima del centro: de ahí sale la mirada (mismo punto que la referencia).
  let fx = 0.72, fy = 0.56;
  if (!svg.classList.contains("fdk-rumbo")) {
    // una escena tiene otro viewBox (-24 -14 168 162): los ojos están en (83.5, 62) de su lienzo
    const vb = (svg as SVGSVGElement).viewBox.baseVal;
    fx = (83.5 - vb.x) / vb.width;
    fy = (62 - vb.y) / vb.height;
  }
  const dx = puntero.x - (r.left + r.width * fx);
  const dy = puntero.y - (r.top + r.height * fy);
  const d = Math.hypot(dx, dy) || 1;
  const f = Math.min(1, d / DISTANCIA);
  s.objX = (dx / d) * TOPE * f;
  s.objY = (dy / d) * TOPE * f;
}

/** Quita un seguidor y, si era el último, el oyente y el bucle. */
function soltar(s: Seguidor): void {
  if (!seguidores.delete(s)) return;
  ojosDe(s.raiz).forEach((g) => (g.style.transform = ""));
  if (seguidores.size === 0) {
    window.removeEventListener("pointermove", alMover);
    if (cuadro !== null) cancelAnimationFrame(cuadro);
    cuadro = null;
    puntero = null;
  }
}

function paso(): void {
  let activo = false;
  for (const s of seguidores) {
    // Si la app quitó el componente del DOM sin cerrarlo (cambio de ruta, innerHTML), nadie llamará a `detener`: se suelta aquí.
    if (s.raiz.isConnected === false) { soltar(s); continue; }
    apuntar(s);
    s.x += (s.objX - s.x) * SUAVIDAD;
    s.y += (s.objY - s.y) * SUAVIDAD;
    const t = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px)`;
    ojosDe(s.raiz).forEach((g) => (g.style.transform = t));
    if (Math.abs(s.objX - s.x) > REPOSO || Math.abs(s.objY - s.y) > REPOSO) activo = true;
  }
  cuadro = activo ? requestAnimationFrame(paso) : null;
}

function alMover(ev: PointerEvent): void {
  puntero = { x: ev.clientX, y: ev.clientY };
  if (cuadro === null) cuadro = requestAnimationFrame(paso);
}

/**
 * Hace que los ojos de los Rumbo que haya dentro de `raiz` sigan al puntero. Devuelve la función que lo detiene
 * (y devuelve los ojos a su sitio): llámala al cerrar el componente, o el seguidor se queda vivo.
 * No hace nada (y devuelve una función vacía) sin DOM o si el sistema pide movimiento reducido.
 */
export function seguirMirada(raiz: Element): () => void {
  if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};

  const s: Seguidor = { raiz, x: 0, y: 0, objX: 0, objY: 0 };
  if (seguidores.size === 0) window.addEventListener("pointermove", alMover, { passive: true });
  seguidores.add(s);

  return () => soltar(s);
}
