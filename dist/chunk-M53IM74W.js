import {
  pintarEscena
} from "./chunk-YVERCKO4.js";
import {
  sonarPara
} from "./chunk-WIHJ4O4Y.js";
import {
  esTonoOscuro
} from "./chunk-5ZI5VQVH.js";
import {
  exigirElemento
} from "./chunk-TWOV343Q.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-6JBUCDJC.js";
import {
  seguirMirada
} from "./chunk-J7SY2XIS.js";
import {
  rumboSvg
} from "./chunk-BMHUI4L2.js";
import {
  escenaDe,
  validarEstado
} from "./chunk-LOWXO64Y.js";

// src/attach/attach.css
var attach_default = ".fdk-attach { display: inline-block; --fdk-attach-tam: var(--fdk-attach-size, 24px); width: var(--fdk-attach-tam); height: var(--fdk-attach-tam); }\n/* El SVG llena el contenedor. El lienzo de una escena es m\xE1s ancho (168 frente a 120): la caja crece \xD71.4 para que su cuerpo mida lo mismo. */\n.fdk-attach[data-escena] { width: calc(var(--fdk-attach-tam) * 1.4); height: calc(var(--fdk-attach-tam) * 1.4); }\n.fdk-attach > svg { width: 100%; height: 100%; }\n\n@keyframes fdk-attach-fade-in { from { opacity: 0; } to { opacity: 1; } }\n@keyframes fdk-attach-fade-out { from { opacity: 1; } to { opacity: 0; } }\n@keyframes fdk-attach-slide-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }\n@keyframes fdk-attach-slide-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(6px); } }\n\n.fdk-attach--fade.fdk-anim-in { animation: fdk-attach-fade-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-attach--fade.fdk-anim-out { animation: fdk-attach-fade-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n.fdk-attach--slide.fdk-anim-in { animation: fdk-attach-slide-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-attach--slide.fdk-anim-out { animation: fdk-attach-slide-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-attach.fdk-anim-in, .fdk-attach.fdk-anim-out { animation: none; }\n}\n";

// src/attach/attach.ts
function attachTo(host, options = {}) {
  exigirElemento(host, "attachTo");
  validarEstado(options.estado, "attachTo", true);
  ensureStyles(attach_default, rumbo_default);
  const anim = options.anim ?? "fade";
  const wrap = document.createElement("span");
  wrap.className = `fdk-attach fdk-attach--${anim} fdk-anim-in`;
  if (options.size !== void 0) wrap.style.setProperty("--fdk-attach-tam", `${options.size}px`);
  if (typeof options.contenido === "string") {
    if (options.html) wrap.innerHTML = options.contenido;
    else wrap.textContent = options.contenido;
  } else if (options.contenido) {
    wrap.appendChild(options.contenido);
  } else if (options.estado) {
    const escena = escenaDe(options.estado);
    if (escena) pintarEscena(
      wrap,
      escena,
      0,
      // el tamaño lo da el CSS del contenedor
      { luminoso: esTonoOscuro(options.superficie), mirada: options.mirada }
    );
    else
      wrap.innerHTML = rumboSvg({ estado: options.estado, superficie: options.superficie, size: 24 });
  }
  host.appendChild(wrap);
  sonarPara(options.sonido, options.estado);
  const detenerMirada = options.mirada ? seguirMirada(wrap) : () => {
  };
  return {
    el: wrap,
    async close() {
      detenerMirada();
      await animar(wrap, "fdk-anim-out", 250);
      wrap.remove();
    }
  };
}

export {
  attachTo
};
