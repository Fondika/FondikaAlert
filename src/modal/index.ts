/**
 * Superficie pública de Modal: `cerrarModal()` cierra por código el visible, y sólo existen dos tipos (regla del brief) — `confirmar()` (dos
 * botones, sí/no) y `notificar()` (un solo botón, avisar). `abrirModal()` es el motor Popup
 * interno (centrado, backdrop, focus trap, cola) que ambos reutilizan; no se expone suelto para
 * evitar un tercer tipo de modal con acciones arbitrarias.
 */
export { cerrarModal, configurarModal } from "./modal";
export { confirmar } from "./confirmar";
export type { ConfirmarOptions, ConfirmarResultado } from "./confirmar";
export { notificar } from "./notificar";
export type { NotificarOptions } from "./notificar";
