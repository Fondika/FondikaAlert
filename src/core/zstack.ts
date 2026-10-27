/**
 * Única fuente de z-index. Ningún literal numérico fuera de este archivo (ADR-004).
 * Offsets fijos por capa (ver ARQUITECTURA-UI-KIT.md §4.1).
 */
const BASE = 9000;

export const zIndex = {
  overlayScoped: BASE + 0, // Loader.target — cubre sólo su host, no debe tapar toasts/modales
  floating: BASE + 100, // toast
  mascot: BASE + 150,
  popup: BASE + 200, // modal, alert, confirm
  lluvia: BASE + 250, // lluvia de personajes — decorativa: sobre el contenido y los popups, bajo el loader de pantalla
  overlayPantalla: BASE + 300, // Loader.screen — por encima de TODO, incluido un modal abierto
} as const;
