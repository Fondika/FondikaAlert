import { zIndex } from "./zstack";

/**
 * Posiciones como grilla 3×3 (ADR-003 del UI-Kit). Nomenclatura lógica, no física:
 * soporta RTL sin código adicional porque usa `inset-inline-start/end`.
 */
export type Block = "top" | "middle" | "bottom";
export type Inline = "start" | "center" | "end";
export type Position = `${Block}-${Inline}`;

const hosts = new WeakMap<HTMLElement, Map<string, HTMLElement>>();

/**
 * Caché de contenedores flotantes por host + posición + capa de z-index. La capa es parte de la
 * clave: Toast (`zIndex.floating`) y Mascota (`zIndex.mascot`) pueden compartir la misma posición
 * (ej. `bottom-end`) sin compartir el mismo contenedor — si lo hicieran, su orden de apilado
 * dependería del orden del DOM en vez del z-index que cada uno tiene reservado en `zstack.ts`.
 */
export function getLayer(
  position: Position,
  host: HTMLElement = document.body,
  z: number = zIndex.floating
): HTMLElement {
  let byKey = hosts.get(host);
  if (!byKey) hosts.set(host, (byKey = new Map()));

  const key = `${position}:${z}`;
  const cached = byKey.get(key);
  if (cached?.isConnected) return cached;

  const el = document.createElement("div");
  el.className = `fdk-layer fdk-layer--${position}`;
  el.style.setProperty("--fdk-z", String(z));

  if (host !== document.body) {
    el.classList.add("fdk-layer--scoped");
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
  }

  host.appendChild(el);
  byKey.set(key, el);
  return el;
}
