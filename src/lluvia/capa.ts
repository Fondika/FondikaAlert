import { zIndex } from "../core/zstack";
import type { EfectoLluvia } from "./tipos";

export interface Particula {
  el: HTMLElement;
  /** Ya arrancó su animación (terminó el retraso). */
  iniciada: boolean;
  /** Sigue en juego; al "pararla" se oculta y deja de contar. */
  activa: boolean;
  velocidad: number;
  tamano: number;
  duracionMs: number;
}

export interface Capa {
  el: HTMLElement;
  particulas: Particula[];
  /** Deshace lo que se le hizo al host (su `position`). */
  restaurar(): void;
}

/**
 * Arma la capa y TODAS las partículas, una sola vez: el motor las recicla, no crea más.
 * Cada partícula es un nodo (cae con `transform`) con su imagen adentro (gira o se balancea).
 */
export function crearCapa(host: HTMLElement, efecto: EfectoLluvia, cantidad: number, src: string): Capa {
  const el = document.createElement("div");
  const enPantalla = host === document.body;
  el.className = `fdk-lluvia ${enPantalla ? "fdk-lluvia--pantalla" : "fdk-lluvia--contenida"} ${efecto.clase}`;
  el.setAttribute("aria-hidden", "true"); // decorativa
  el.style.setProperty("--fdk-z", String(zIndex.lluvia));

  let restaurar = () => {};
  if (!enPantalla && getComputedStyle(host).position === "static") {
    const previa = host.style.position;
    host.style.position = "relative";
    restaurar = () => { host.style.position = previa; };
  }

  const particulas: Particula[] = Array.from({ length: cantidad }, () => {
    const p = document.createElement("div");
    p.className = "fdk-lluvia__p";
    const img = new Image();
    img.className = "fdk-lluvia__img";
    img.alt = "";
    img.draggable = false;
    img.src = src;
    p.appendChild(img);
    el.appendChild(p);
    return { el: p, iniciada: false, activa: true, velocidad: 0, tamano: 0, duracionMs: 0 };
  });

  host.appendChild(el);
  return { el, particulas, restaurar };
}

/** Los `@keyframes` de un efecto registrado desde fuera, una sola vez por efecto. */
export function inyectarCssEfecto(efecto: EfectoLluvia): void {
  if (!efecto.css || document.querySelector(`style[data-fdk-efecto="${CSS.escape(efecto.id)}"]`)) return;
  const style = document.createElement("style");
  style.setAttribute("data-fdk-efecto", efecto.id);
  style.textContent = efecto.css;
  document.head.appendChild(style);
}
