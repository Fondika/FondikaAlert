import {
  layer_default
} from "./chunk-FU44WMPZ.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-H7UDFJLK.js";
import {
  iniciarCicloVoz,
  resolverVozRumbo
} from "./chunk-R75R3BM7.js";
import {
  rumboSvg
} from "./chunk-J7ITZR5C.js";

// src/core/scroll.ts
var refs = 0;
var overflowPrevio = "";
var paddingPrevio = "";
function bloquearScroll() {
  if (refs++ > 0) return;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  overflowPrevio = document.body.style.overflow;
  paddingPrevio = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    const actual = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${actual + scrollbarWidth}px`;
  }
}
function desbloquearScroll() {
  if (--refs > 0) return;
  refs = 0;
  document.body.style.overflow = overflowPrevio;
  document.body.style.paddingRight = paddingPrevio;
}

// src/core/focus.ts
var SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
function atraparFoco(contenedor) {
  const previo = document.activeElement;
  const focoInicial = contenedor.querySelector("[autofocus]") || contenedor.querySelectorAll(SELECTOR)[0];
  focoInicial?.focus();
  function onKeydown(e) {
    if (e.key !== "Tab") return;
    const focables = Array.from(contenedor.querySelectorAll(SELECTOR)).filter(
      (el) => el.offsetParent !== null
    );
    if (focables.length === 0) return;
    const primero = focables[0];
    const ultimo = focables[focables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
  contenedor.addEventListener("keydown", onKeydown);
  return () => {
    contenedor.removeEventListener("keydown", onKeydown);
    previo?.focus();
  };
}

// src/modal/modal.css
var modal_default = ".fdk-backdrop {\r\n  position: fixed;\r\n  inset: 0;\r\n  background: var(--fdk-backdrop);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: var(--fdk-sp-4);\r\n}\r\n\r\n/*\r\n * El objetivo de la iteraci\xF3n anterior (`min-height` = `width`, forma cuadrada) era reducir el\r\n * espacio en blanco \u2014 pero forzar un piso de alto en contenido corto termina haciendo lo\r\n * contrario: agranda la tarjeta artificialmente. Se quita: el alto ahora es s\xF3lo el que pide el\r\n * contenido real, y el padding se reduce para que ese espacio en blanco baje directamente en\r\n * vez de disimularse detr\xE1s de una forma cuadrada.\r\n */\r\n.fdk-modal {\r\n  background: var(--fdk-surface);\r\n  color: var(--fdk-ink);\r\n  font-family: var(--fdk-font);\r\n  border-radius: var(--fdk-radius-lg);\r\n  box-shadow: var(--fdk-shadow-4);\r\n  width: 370px;\r\n  max-width: 100%;\r\n  max-height: calc(100vh - 2 * var(--fdk-sp-4));\r\n  overflow-y: auto;\r\n  padding: var(--fdk-sp-5) var(--fdk-sp-4) var(--fdk-sp-4);\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n.fdk-modal--wide { width: 640px; }\r\n\r\n.fdk-modal__cerrar {\r\n  position: absolute;\r\n  top: var(--fdk-sp-3);\r\n  right: var(--fdk-sp-3);\r\n  background: transparent;\r\n  border: none;\r\n  font-size: 20px;\r\n  line-height: 1;\r\n  cursor: pointer;\r\n  color: var(--fdk-gris-700);\r\n  padding: var(--fdk-sp-2);\r\n}\r\n.fdk-modal__cerrar:hover { color: var(--fdk-ink); }\r\n.fdk-modal__cerrar:focus-visible { outline: none; box-shadow: var(--fdk-foco); border-radius: var(--fdk-radius-sm); }\r\n\r\n.fdk-modal__media { display: flex; justify-content: center; margin-bottom: var(--fdk-sp-4); }\r\n.fdk-modal__media .fdk-rumbo { width: 110px; height: 110px; } /* 96px + 15% */\r\n\r\n.fdk-modal__titulo {\r\n  font-family: var(--fdk-font-display);\r\n  font-size: 22px;\r\n  font-weight: 700;\r\n  margin: 0 0 var(--fdk-sp-2);\r\n  text-align: center;\r\n}\r\n.fdk-modal__texto {\r\n  font-size: 15px;\r\n  line-height: 1.55;\r\n  color: var(--fdk-ink);\r\n  margin: 0;\r\n  text-align: center;\r\n}\r\n\r\n.fdk-modal__acciones {\r\n  display: flex;\r\n  justify-content: center;\r\n  gap: 5%;\r\n  margin-top: var(--fdk-sp-5);\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.fdk-modal__btn {\r\n  font: inherit;\r\n  font-weight: 700;\r\n  font-size: 15px;\r\n  height: 44px;\r\n  padding: 0 var(--fdk-sp-5);\r\n  border-radius: var(--fdk-radius-md);\r\n  border: 1.5px solid transparent;\r\n  cursor: pointer;\r\n  transition: background-color var(--fdk-duration-base) var(--fdk-ease-out);\r\n}\r\n.fdk-modal__btn:focus-visible { outline: none; box-shadow: var(--fdk-foco); }\r\n\r\n.fdk-modal__btn--primario { background: var(--fdk-btn-primario-bg); color: #000; }\r\n.fdk-modal__btn--primario:hover { background: var(--fdk-btn-primario-hover); }\r\n.fdk-modal__btn--primario:active { background: var(--fdk-btn-primario-activo); }\r\n\r\n.fdk-modal__btn--secundario { background: var(--fdk-surface); color: var(--fdk-ink); border-color: var(--fdk-ink); }\r\n.fdk-modal__btn--secundario:hover { background: var(--fdk-btn-secundario-hover); }\r\n.fdk-modal__btn--secundario:active { background: var(--fdk-btn-secundario-activo); }\r\n\r\n.fdk-modal__btn--destructivo { background: var(--fdk-btn-destructivo-bg); color: #fff; }\r\n.fdk-modal__btn--destructivo:hover { background: var(--fdk-btn-destructivo-hover); }\r\n.fdk-modal__btn--destructivo:active { background: var(--fdk-btn-destructivo-activo); }\r\n\r\n@keyframes fdk-backdrop-in { from { opacity: 0; } to { opacity: 1; } }\r\n@keyframes fdk-backdrop-out { from { opacity: 1; } to { opacity: 0; } }\r\n@keyframes fdk-modal-in { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }\r\n@keyframes fdk-modal-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(.96) translateY(8px); } }\r\n\r\n.fdk-backdrop.fdk-anim-in { animation: fdk-backdrop-in var(--fdk-duration-base) var(--fdk-ease-out); }\r\n.fdk-backdrop.fdk-anim-out { animation: fdk-backdrop-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\r\n.fdk-modal.fdk-anim-in { animation: fdk-modal-in var(--fdk-duration-base) var(--fdk-ease-out); }\r\n.fdk-modal.fdk-anim-out { animation: fdk-modal-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\r\n\r\n@media (prefers-reduced-motion: reduce) {\r\n  .fdk-backdrop.fdk-anim-in, .fdk-backdrop.fdk-anim-out,\r\n  .fdk-modal.fdk-anim-in, .fdk-modal.fdk-anim-out { animation: none; }\r\n}\r\n";

// src/modal/modal.ts
var cola = [];
var mostrando = false;
function abrirModal(options) {
  return new Promise((resolve) => {
    cola.push({ options, resolve });
    procesarCola();
  });
}
function procesarCola() {
  if (mostrando || cola.length === 0) return;
  mostrando = true;
  const { options, resolve } = cola.shift();
  montar(options, (r) => {
    mostrando = false;
    resolve(r);
    procesarCola();
  });
}
function montar(options, onCerrado) {
  ensureStyles(layer_default + modal_default + rumbo_default);
  bloquearScroll();
  const cerrable = options.cerrable ?? true;
  const backdrop = document.createElement("div");
  backdrop.className = "fdk-backdrop fdk-anim-in";
  const modal = document.createElement("div");
  modal.className = `fdk-modal fdk-anim-in${options.ancho === "wide" ? " fdk-modal--wide" : ""}`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  if (options.titulo) modal.setAttribute("aria-labelledby", "fdk-modal-titulo");
  let detenerCiclo = () => {
  };
  let cerrado = false;
  async function cerrar(accionId) {
    if (cerrado) return;
    cerrado = true;
    detenerCiclo();
    soltarFoco();
    document.removeEventListener("keydown", onKeydown);
    await Promise.all([animar(backdrop, "fdk-anim-out", 250), animar(modal, "fdk-anim-out", 250)]);
    backdrop.remove();
    desbloquearScroll();
    onCerrado({ accionId });
  }
  if (cerrable) {
    const cerrarBtn = document.createElement("button");
    cerrarBtn.className = "fdk-modal__cerrar";
    cerrarBtn.setAttribute("aria-label", "Cerrar");
    cerrarBtn.textContent = "\xD7";
    cerrarBtn.addEventListener("click", () => cerrar(null));
    modal.appendChild(cerrarBtn);
  }
  if (options.estado) {
    const media = document.createElement("div");
    media.className = "fdk-modal__media";
    media.innerHTML = rumboSvg({ estado: options.estado, size: 110 });
    modal.appendChild(media);
  }
  if (options.titulo) {
    const h = document.createElement("h2");
    h.id = "fdk-modal-titulo";
    h.className = "fdk-modal__titulo";
    h.textContent = options.titulo;
    modal.appendChild(h);
  }
  const p = document.createElement("p");
  p.className = "fdk-modal__texto";
  modal.appendChild(p);
  if (options.estado) {
    const estado = options.estado;
    const esCiclico = estado === "pensando" || estado === "cargando";
    const sinTextoExplicito = !options.texto && !options.vozId;
    if (esCiclico && sinTextoExplicito) {
      detenerCiclo = iniciarCicloVoz(estado, (texto) => p.textContent = texto);
    } else {
      const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
      if (texto === null) p.remove();
      else p.textContent = texto;
    }
  } else if (options.texto) {
    p.textContent = options.texto;
  } else {
    p.remove();
  }
  if (options.acciones?.length) {
    const row = document.createElement("div");
    row.className = "fdk-modal__acciones";
    for (const accion of options.acciones) {
      const btn = document.createElement("button");
      btn.className = `fdk-modal__btn fdk-modal__btn--${accion.variante ?? "secundario"}`;
      btn.textContent = accion.label;
      btn.addEventListener("click", () => cerrar(accion.id));
      row.appendChild(btn);
    }
    modal.appendChild(row);
  }
  function onKeydown(e) {
    if (e.key === "Escape" && cerrable) cerrar(null);
  }
  document.addEventListener("keydown", onKeydown);
  if (cerrable) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) cerrar(null);
    });
  }
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  const soltarFoco = atraparFoco(modal);
}

// src/modal/confirmar.ts
async function confirmar(options) {
  const r = await abrirModal({
    estado: options.estado,
    titulo: options.titulo,
    texto: options.texto,
    vozId: options.vozId,
    acciones: [
      { id: "cancelar", label: options.cancelarTexto ?? "Cancelar", variante: "secundario" },
      {
        id: "confirmar",
        label: options.confirmarTexto ?? "Aceptar",
        variante: options.danger ? "destructivo" : "primario"
      }
    ],
    cerrable: false
  });
  return { isConfirmed: r.accionId === "confirmar" };
}

// src/modal/notificar.ts
async function notificar(options) {
  await abrirModal({
    estado: options.estado,
    titulo: options.titulo,
    texto: options.texto,
    vozId: options.vozId,
    acciones: [{ id: "ok", label: options.okTexto ?? "OK", variante: "primario" }],
    cerrable: false
  });
}

export {
  confirmar,
  notificar
};
