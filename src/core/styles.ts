// El loader de texto para `.css` se configura en tsup.config.ts (esbuild `loader: { ".css": "text" }`),
// así este import no depende de sintaxis específica de Vite (`?inline`).
import tokens from "./tokens.css";

/** Id corto de cada hoja ya vista: el atributo del <style> que la lleva (los tokens se llaman "tokens"). */
const ids = new Map<string, string>([[tokens, "tokens"]]);

/**
 * Inyección idempotente de CSS en runtime. Guardia de SSR (ADR-005, invariante 12).
 * Cada hoja se inyecta UNA vez, por separado: dos componentes que comparten `rumboCss` o `layerCss` no lo duplican
 * en el <head>. Se mira el DOM y no una bandera: si alguien borra el <style> (HMR, limpieza), vuelve a inyectarse.
 */
export function ensureStyles(...hojas: string[]): void {
  if (typeof document === "undefined") return;
  for (const css of [tokens, ...hojas]) {
    if (!css) continue;
    let id = ids.get(css);
    if (id === undefined) ids.set(css, (id = String(ids.size)));
    if (document.head.querySelector(`style[data-fondika-css="${id}"]`)) continue;
    const style = document.createElement("style");
    style.setAttribute("data-fondika-css", id);
    if (css === tokens) style.setAttribute("data-fondika", "tokens");
    style.textContent = css;
    document.head.appendChild(style);
  }
}
