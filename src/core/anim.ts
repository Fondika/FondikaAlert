/**
 * Promesa sobre `animationend`, con timeout de respaldo (ADR de invariantes, #3).
 * `animationend` no dispara si el elemento está oculto, si hay `prefers-reduced-motion`,
 * o si la pestaña está en segundo plano — sin el respaldo, el elemento nunca se limpia.
 */
export function animar(el: HTMLElement, clase: string, ms = 400): Promise<void> {
  return new Promise((resolve) => {
    const listo = () => {
      clearTimeout(timer);
      el.removeEventListener("animationend", listo);
      resolve();
    };
    const timer = setTimeout(listo, ms + 50);
    el.addEventListener("animationend", listo, { once: true });
    el.classList.add(clase);
  });
}
