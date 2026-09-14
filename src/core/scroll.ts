/**
 * Bloqueo de scroll del body con compensación de ancho de scrollbar (invariante #4: todo
 * presentador que muta el DOM ajeno guarda el valor previo y lo restaura al cerrar).
 * Con refcount: varios popups pueden pedirlo a la vez sin desbloquear de más.
 */
let refs = 0;
let overflowPrevio = "";
let paddingPrevio = "";

export function bloquearScroll(): void {
  if (refs++ > 0) return;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  overflowPrevio = document.body.style.overflow;
  paddingPrevio = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const actual = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${actual + scrollbarWidth}px`;
  }
}

export function desbloquearScroll(): void {
  if (--refs > 0) return;
  refs = 0;
  document.body.style.overflow = overflowPrevio;
  document.body.style.paddingRight = paddingPrevio;
}
