import { ESCENAS } from "./datos";
import type { EscenaEstado } from "../rumbo/estados";

/** Las 20 escenas animadas de Rumbo (brandkit 04-personaje/assets/escenas). */
export type EscenaNombre = EscenaEstado;

/**
 * `<img>` con la escena animada. Va como imagen y no como SVG en línea a propósito: cada escena
 * trae su propio `<style>` global (`[data-p]…`) y dos escenas en la misma página se pisarían.
 * Úsala donde cabe HTML: `attachTo(host, { contenido: rumboEscena("deposito"), html: true })`.
 */
export function rumboEscena(nombre: EscenaNombre, size = 168): string {
  const e = ESCENAS[nombre];
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(e.svg);
  return `<img src="${src}" width="${size}" height="${Math.round((size * 162) / 168)}" alt="Rumbo · ${e.nombre}">`;
}

/** Nombre y descripción de cada escena, por si quieres armar un selector. */
export const escenasInfo = Object.fromEntries(
  Object.entries(ESCENAS).map(([k, v]) => [k, { nombre: v.nombre, linea: v.linea }])
) as Record<EscenaNombre, { nombre: string; linea: string }>;
