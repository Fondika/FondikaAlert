import { E as EscenaEstado } from './estados-Disuf6Zh.js';

/** Las 20 escenas animadas de Rumbo (brandkit 04-personaje/assets/escenas). */
type EscenaNombre = EscenaEstado;
/**
 * `<img>` con la escena animada. Va como imagen y no como SVG en línea a propósito: cada escena
 * trae su propio `<style>` global (`[data-p]…`) y dos escenas en la misma página se pisarían.
 * Úsala donde cabe HTML: `attachTo(host, { contenido: rumboEscena("deposito"), html: true })`.
 */
declare function rumboEscena(nombre: EscenaNombre, size?: number): string;
/** Nombre y descripción de cada escena, por si quieres armar un selector. */
declare const escenasInfo: Record<EscenaNombre, {
    nombre: string;
    linea: string;
}>;

export { type EscenaNombre, escenasInfo, rumboEscena };
