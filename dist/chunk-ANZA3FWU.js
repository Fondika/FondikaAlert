import {
  alert_default,
  iconoDeNivel,
  nivelDeEstado
} from "./chunk-HJ4EWXOW.js";
import {
  esTonoOscuro,
  fondoDeToken
} from "./chunk-GQCXWWGT.js";
import {
  getLayer
} from "./chunk-NTR55A6C.js";
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

// src/toast/toast.css
var toast_default = "/**\n * Toast reutiliza `.fdk-alert` + `.fdk-alert--flotante` (ancho y sombra, ver alert.css) pero\n * NUNCA agrega `.fdk-alert--barra`: la l\xEDnea izquierda de 4px es una marca exclusiva de Alert.\n */\n.fdk-toast {\n  position: relative;\n  /* SIN overflow:hidden a prop\xF3sito: recortaba las animaciones de Rumbo (salta, flota, sube)\n     cada vez que se mov\xEDan fuera de su propia caja \u2014 se ve\xEDa cortado por arriba. */\n}\n\n.fdk-toast__cerrar {\n  /* margin-left:auto lo empuja al extremo derecho; el resto queda centrado por .fdk-alert */\n  margin: 0 var(--fdk-sp-2) 0 auto;\n  background: transparent;\n  border: none;\n  font-size: 16px;\n  line-height: 1;\n  cursor: pointer;\n  color: inherit;\n  opacity: .6;\n  padding: 2px;\n  flex: 0 0 auto;\n}\n.fdk-toast__cerrar:hover { opacity: 1; }\n\n@keyframes fdk-toast-in { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }\n@keyframes fdk-toast-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-8px) scale(.98); } }\n.fdk-toast.fdk-anim-in { animation: fdk-toast-in var(--fdk-duration-base, 250ms) var(--fdk-ease-out, ease); }\n.fdk-toast.fdk-anim-out { animation: fdk-toast-out var(--fdk-duration-base, 250ms) var(--fdk-ease-out, ease) forwards; }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-toast.fdk-anim-in, .fdk-toast.fdk-anim-out { animation: none; }\n}\n";

// src/toast/toast.ts
function fireToast(options) {
  ensureStyles(layer_default + alert_default + rumbo_default + toast_default);
  const personaje = options.personaje ?? true;
  const timerMs = options.timer ?? 4e3;
  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer(options.posicion ?? "top-end", options.host);
  const el = document.createElement("div");
  el.className = `fdk-alert fdk-toast fdk-alert--${nivel} fdk-alert--flotante fdk-anim-in`;
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");
  const fondo = fondoDeToken(options.background);
  if (fondo) {
    el.style.background = fondo;
    if (esTonoOscuro(options.background)) el.style.color = "#fff";
  } else if (options.estado !== "sin-conexion") {
    el.classList.add("fdk-alert--sombra");
  }
  const media = document.createElement("div");
  if (personaje) {
    media.className = "fdk-alert__rumbo";
    media.innerHTML = rumboSvg({ estado: options.estado, superficie: options.background, size: 46.2 });
  } else {
    media.className = "fdk-alert__icono";
    media.innerHTML = iconoDeNivel(nivel);
  }
  el.appendChild(media);
  const body = document.createElement("div");
  body.className = "fdk-alert__cuerpo";
  if (options.titulo) {
    const b = document.createElement("b");
    b.className = "fdk-alert__titulo";
    b.textContent = options.titulo;
    body.appendChild(b);
  }
  const p = document.createElement("span");
  body.appendChild(p);
  el.appendChild(body);
  const cerrarBtn = document.createElement("button");
  cerrarBtn.className = "fdk-toast__cerrar";
  cerrarBtn.setAttribute("aria-label", "Cerrar");
  cerrarBtn.textContent = "\xD7";
  el.appendChild(cerrarBtn);
  const estado = options.estado;
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  let detenerCiclo = () => {
  };
  if (esCiclico && sinTextoExplicito) {
    detenerCiclo = iniciarCicloVoz(estado, (texto) => p.textContent = texto);
  } else {
    const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
    if (texto === null) p.remove();
    else p.textContent = texto;
  }
  layer.appendChild(el);
  return new Promise((resolve) => {
    let cerrado = false;
    let restante = timerMs;
    let inicioEspera = Date.now();
    let handle = null;
    const armar = () => {
      if (restante <= 0) return;
      inicioEspera = Date.now();
      handle = setTimeout(cerrar, restante);
    };
    const pausar = () => {
      if (handle) {
        clearTimeout(handle);
        handle = null;
        restante -= Date.now() - inicioEspera;
      }
    };
    async function cerrar() {
      if (cerrado) return;
      cerrado = true;
      detenerCiclo();
      if (handle) clearTimeout(handle);
      await animar(el, "fdk-anim-out", 250);
      el.remove();
      resolve();
    }
    cerrarBtn.addEventListener("click", cerrar);
    el.addEventListener("mouseenter", pausar);
    el.addEventListener("mouseleave", armar);
    if (timerMs > 0) armar();
  });
}

export {
  fireToast
};
