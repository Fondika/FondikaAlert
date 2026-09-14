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
var modal_default = ".fdk-backdrop {\n  position: fixed;\n  inset: 0;\n  background: var(--fdk-backdrop);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: var(--fdk-sp-4);\n}\n\n/*\n * El objetivo de la iteraci\xF3n anterior (`min-height` = `width`, forma cuadrada) era reducir el\n * espacio en blanco \u2014 pero forzar un piso de alto en contenido corto termina haciendo lo\n * contrario: agranda la tarjeta artificialmente. Se quita: el alto ahora es s\xF3lo el que pide el\n * contenido real, y el padding se reduce para que ese espacio en blanco baje directamente en\n * vez de disimularse detr\xE1s de una forma cuadrada.\n */\n.fdk-modal {\n  background: var(--fdk-surface);\n  color: var(--fdk-ink);\n  font-family: var(--fdk-font);\n  border-radius: var(--fdk-radius-lg);\n  box-shadow: var(--fdk-shadow-4);\n  width: 370px;\n  max-width: 100%;\n  max-height: calc(100vh - 2 * var(--fdk-sp-4));\n  overflow-y: auto;\n  padding: var(--fdk-sp-5) var(--fdk-sp-4) var(--fdk-sp-4);\n  position: relative;\n  display: flex;\n  flex-direction: column;\n}\n.fdk-modal--wide { width: 640px; }\n\n.fdk-modal__cerrar {\n  position: absolute;\n  top: var(--fdk-sp-3);\n  right: var(--fdk-sp-3);\n  background: transparent;\n  border: none;\n  font-size: 20px;\n  line-height: 1;\n  cursor: pointer;\n  color: var(--fdk-gris-700);\n  padding: var(--fdk-sp-2);\n}\n.fdk-modal__cerrar:hover { color: var(--fdk-ink); }\n.fdk-modal__cerrar:focus-visible { outline: none; box-shadow: var(--fdk-foco); border-radius: var(--fdk-radius-sm); }\n\n.fdk-modal__media { display: flex; justify-content: center; margin-bottom: var(--fdk-sp-4); }\n.fdk-modal__media .fdk-rumbo { width: 110px; height: 110px; } /* 96px + 15% */\n\n.fdk-modal__titulo {\n  font-family: var(--fdk-font-display);\n  font-size: 22px;\n  font-weight: 700;\n  margin: 0 0 var(--fdk-sp-2);\n  text-align: center;\n}\n.fdk-modal__texto {\n  font-size: 15px;\n  line-height: 1.55;\n  color: var(--fdk-ink);\n  margin: 0;\n  text-align: center;\n}\n\n.fdk-modal__acciones {\n  display: flex;\n  justify-content: center;\n  gap: 18%;\n  margin-top: var(--fdk-sp-5);\n  flex-wrap: wrap;\n}\n\n.fdk-modal__btn {\n  font: inherit;\n  font-weight: 700;\n  font-size: 15px;\n  height: 44px;\n  padding: 0 var(--fdk-sp-5);\n  border-radius: var(--fdk-radius-md);\n  border: 1.5px solid transparent;\n  cursor: pointer;\n  transition: background-color var(--fdk-duration-base) var(--fdk-ease-out);\n}\n.fdk-modal__btn:focus-visible { outline: none; box-shadow: var(--fdk-foco); }\n\n.fdk-modal__btn--primario { background: var(--fdk-btn-primario-bg); color: #000; }\n.fdk-modal__btn--primario:hover { background: var(--fdk-btn-primario-hover); }\n.fdk-modal__btn--primario:active { background: var(--fdk-btn-primario-activo); }\n\n.fdk-modal__btn--secundario { background: var(--fdk-surface); color: var(--fdk-ink); border-color: var(--fdk-ink); }\n.fdk-modal__btn--secundario:hover { background: var(--fdk-btn-secundario-hover); }\n.fdk-modal__btn--secundario:active { background: var(--fdk-btn-secundario-activo); }\n\n.fdk-modal__btn--destructivo { background: var(--fdk-btn-destructivo-bg); color: #fff; }\n.fdk-modal__btn--destructivo:hover { background: var(--fdk-btn-destructivo-hover); }\n.fdk-modal__btn--destructivo:active { background: var(--fdk-btn-destructivo-activo); }\n\n@keyframes fdk-backdrop-in { from { opacity: 0; } to { opacity: 1; } }\n@keyframes fdk-backdrop-out { from { opacity: 1; } to { opacity: 0; } }\n@keyframes fdk-modal-in { from { opacity: 0; transform: scale(.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }\n@keyframes fdk-modal-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(.96) translateY(8px); } }\n\n.fdk-backdrop.fdk-anim-in { animation: fdk-backdrop-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-backdrop.fdk-anim-out { animation: fdk-backdrop-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n.fdk-modal.fdk-anim-in { animation: fdk-modal-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-modal.fdk-anim-out { animation: fdk-modal-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-backdrop.fdk-anim-in, .fdk-backdrop.fdk-anim-out,\n  .fdk-modal.fdk-anim-in, .fdk-modal.fdk-anim-out { animation: none; }\n}\n";

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
