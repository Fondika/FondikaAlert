import { E as EscenaEstado } from './estados-8m_MyFGM.js';

/** Las escenas animadas de Rumbo (brandkit 04-personaje/assets/escenas). */
type EscenaNombre = EscenaEstado;
interface OpcionesEscena {
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
/**
 * La escena animada. Por defecto va como `<img>`, a propósito: así su `<style>` global no choca con el de otra escena.
 * Con `mirada: true` va como SVG en línea (con su CSS acotado) para que `seguirMirada` pueda mover sus ojos.
 * Úsala donde cabe HTML: `attachTo(host, { contenido: rumboEscena("deposito"), html: true })`.
 */
declare function rumboEscena(nombre: EscenaNombre, size?: number, opciones?: OpcionesEscena): string;
/** Nombre y descripción de cada escena, por si quieres armar un selector. */
declare const escenasInfo: Record<EscenaNombre, {
    nombre: string;
    linea: string;
}>;

export { type EscenaNombre, type OpcionesEscena, escenasInfo, rumboEscena };
