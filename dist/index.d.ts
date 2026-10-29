export { AlertHandle, AlertOptions, crearAlert } from './alert.js';
import { R as RumboEstadoExtendido } from './estados-8m_MyFGM.js';
export { B as BASE_DE_ESCENA, E as EscenaEstado, a as RumboEstado, b as RumboOptions, c as RumboSuperficie, d as RumboVariante, e as baseDe, f as escenaDe } from './estados-8m_MyFGM.js';
export { ToastOptions, configurarToast, fireToast } from './toast.js';
export { P as Position } from './layer-CjjTmQWt.js';
export { ConfirmarOptions, ConfirmarResultado, NotificarOptions, cerrarModal, configurarModal, confirmar, notificar } from './modal.js';
export { LoaderBotonHandle, LoaderBotonOptions, LoaderHandle, LoaderOptions, loaderBoton, loaderScreen, loaderTarget } from './loader.js';
export { AttachHandle, AttachOptions, attachTo } from './attach.js';
export { MascotaHandle, MascotaOptions, mostrarMascota } from './mascota.js';
export { resolveRumboVariante, rumboSvg, seguirMirada } from './rumbo.js';
export { EscenaNombre, escenasInfo, rumboEscena } from './escenas.js';
export { ContextoParticula, EFECTOS_BASE, EfectoLluvia, LluviaHandle, MotivoFin, OpcionesLluvia, ParametrosParticula, Personaje, RegistroEfectos, RegistroPersonajes, caidaBase, crearRegistro, crearRegistroEfectos, iniciarLluvia, registrarEfecto, registrarPersonaje, registroEfectos, registroGlobal } from './lluvia.js';
export { SonidoClave, configurarSonido, sonar } from './sonido.js';

/** Los 4 niveles visuales definidos en Brand_kit_Fondika/03-design-system/assets/componentes.html. */
type AlertNivel = "info" | "exito" | "alerta" | "error" | "neutro";
declare function nivelDeEstado(estado: RumboEstadoExtendido): AlertNivel;

export { type AlertNivel, RumboEstadoExtendido, nivelDeEstado };
