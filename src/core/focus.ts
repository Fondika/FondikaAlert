const SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap de un contenedor: Tab/Shift+Tab ciclan dentro, y al destruirse el foco vuelve a
 * quien lo tenía antes de abrir (invariante #17: todo Popup restaura el foco al cerrar).
 */
export function atraparFoco(contenedor: HTMLElement): () => void {
  const previo = document.activeElement as HTMLElement | null;

  const focoInicial =
    contenedor.querySelector<HTMLElement>("[autofocus]") ||
    contenedor.querySelectorAll<HTMLElement>(SELECTOR)[0];
  focoInicial?.focus();

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focables = Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
    if (focables.length === 0) return;
    const primero = focables[0];
    const ultimo = focables[focables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  contenedor.addEventListener("keydown", onKeydown);

  return () => {
    contenedor.removeEventListener("keydown", onKeydown);
    previo?.focus();
  };
}
