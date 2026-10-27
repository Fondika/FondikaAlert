/**
 * Lluvia de personajes. Módulo independiente: no importa Alert, Toast, Modal ni nada de los demás
 * (`@fondika/alert/lluvia`). Reutiliza el registro de personajes (`personajes/`), que también
 * se exporta desde aquí.
 */
export { iniciarLluvia } from "./lluvia";
export { registrarEfecto, crearRegistroEfectos, registroEfectos } from "./efectos";
export type { RegistroEfectos } from "./efectos";
export { EFECTOS_BASE, caidaBase } from "./efectos-base";
export { registrarPersonaje, crearRegistro, registroGlobal } from "../personajes/registro";
export type { Personaje, RegistroPersonajes } from "../personajes/registro";
export type { ContextoParticula, EfectoLluvia, LluviaHandle, MotivoFin, OpcionesLluvia, ParametrosParticula } from "./tipos";
