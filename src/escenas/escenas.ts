import { ESCENAS, ESCENAS_LUMINOSAS } from "./datos";
import type { EscenaEstado } from "../rumbo/estados";

/** Las escenas animadas de Rumbo (brandkit 04-personaje/assets/escenas). */
export type EscenaNombre = EscenaEstado;

export interface OpcionesEscena {
  /**
   * Cuerpo blanco (la versión luminosa), para un fondo 900/700. Sólo existe en `saludo` y `onboarding`; en las demás
   * escenas se ignora. Por defecto `false`: Rumbo normal.
   */
  luminoso?: boolean;
  /**
   * Dibuja la escena como SVG en línea (en vez de `<img>`) para que sus ojos puedan seguir al puntero
   * (`seguirMirada`). Cuesta un poco más: ver `enLinea`.
   */
  mirada?: boolean;
}

let contador = 0;

/**
 * La escena como SVG en línea. Cada escena trae su propio `<style>` con selectores globales (`[data-p]…`), y dos
 * escenas en la misma página se pisarían: aquí cada selector se prefija con una clase única del propio SVG. Los
 * `@keyframes` ya llevan el nombre de su escena, así que no chocan.
 */
function enLinea(svg: string, size: number): string {
  const clase = `fdk-escena-${++contador}`;
  return svg
    .replace("<svg ", `<svg class="${clase}" `)
    .replace(/width="336" height="324"/, `width="${size}" height="${Math.round((size * 162) / 168)}"`)
    .replace(/<style>[\s\S]*?<\/style>/, (css) => css.replace(/\[data-p/g, `.${clase} [data-p`));
}

/**
 * La escena animada. Por defecto va como `<img>`, a propósito: así su `<style>` global no choca con el de otra escena.
 * Con `mirada: true` va como SVG en línea (con su CSS acotado) para que `seguirMirada` pueda mover sus ojos.
 * Úsala donde cabe HTML: `attachTo(host, { contenido: rumboEscena("deposito"), html: true })`.
 */
export function rumboEscena(nombre: EscenaNombre, size = 168, opciones: OpcionesEscena = {}): string {
  const e = ESCENAS[nombre];
  const svg = opciones.luminoso && nombre in ESCENAS_LUMINOSAS ? ESCENAS_LUMINOSAS[nombre as "saludo" | "onboarding"] : e.svg;
  if (opciones.mirada) return enLinea(svg, size);
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  return `<img src="${src}" width="${size}" height="${Math.round((size * 162) / 168)}" alt="Rumbo · ${e.nombre}">`;
}

/** Nombre y descripción de cada escena, por si quieres armar un selector. */
export const escenasInfo = Object.fromEntries(
  Object.entries(ESCENAS).map(([k, v]) => [k, { nombre: v.nombre, linea: v.linea }])
) as Record<EscenaNombre, { nombre: string; linea: string }>;
