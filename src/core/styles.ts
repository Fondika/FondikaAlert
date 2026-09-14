// El loader de texto para `.css` se configura en tsup.config.ts (esbuild `loader: { ".css": "text" }`),
// así este import no depende de sintaxis específica de Vite (`?inline`).
import tokens from "./tokens.css";

let injected = false;

/** Inyección idempotente de CSS en runtime. Guardia de SSR (ADR-005, invariante 12). */
export function ensureStyles(extraCss = ""): void {
  if (typeof document === "undefined") return;
  if (!injected) {
    const style = document.createElement("style");
    style.setAttribute("data-fondika", "tokens");
    style.textContent = tokens;
    document.head.appendChild(style);
    injected = true;
  }
  if (extraCss && !document.querySelector(`style[data-fondika-css="${extraCss.length}"]`)) {
    const style = document.createElement("style");
    style.setAttribute("data-fondika-css", String(extraCss.length));
    style.textContent = extraCss;
    document.head.appendChild(style);
  }
}
