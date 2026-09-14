export { AlertHandle, AlertOptions, crearAlert } from './alert.js';
import { R as RumboEstado } from './types-BYWgq4YE.js';
export { a as RumboOptions, b as RumboSuperficie, c as RumboVariante } from './types-BYWgq4YE.js';
export { ToastOptions, fireToast } from './toast.js';
export { P as Position } from './layer-CjjTmQWt.js';
export { ConfirmarOptions, ConfirmarResultado, NotificarOptions, confirmar, notificar } from './modal.js';
export { LoaderBotonHandle, LoaderBotonOptions, LoaderHandle, LoaderOptions, loaderBoton, loaderScreen, loaderTarget } from './loader.js';
export { AttachHandle, AttachOptions, attachTo } from './attach.js';
export { MascotaHandle, MascotaOptions, mostrarMascota } from './mascota.js';
export { RumboVozOptions, iniciarCicloVoz, resolveRumboVariante, resolverVozRumbo, rumboSvg } from './rumbo.js';

/** Los 4 niveles visuales definidos en Brand_kit_Fondika/03-design-system/assets/componentes.html. */
type AlertNivel = "info" | "exito" | "alerta" | "error" | "neutro";
declare function nivelDeEstado(estado: RumboEstado): AlertNivel;

export { type AlertNivel, RumboEstado, nivelDeEstado };
