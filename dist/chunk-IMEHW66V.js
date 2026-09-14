// src/core/zstack.ts
var BASE = 9e3;
var zIndex = {
  overlayScoped: BASE + 0,
  // Loader.target — cubre sólo su host, no debe tapar toasts/modales
  floating: BASE + 100,
  // toast
  mascot: BASE + 150,
  popup: BASE + 200,
  // modal, alert, confirm
  overlayPantalla: BASE + 300
  // Loader.screen — por encima de TODO, incluido un modal abierto
};

export {
  zIndex
};
