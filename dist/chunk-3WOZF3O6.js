import {
  pintarEscena
} from "./chunk-4SL5GHEC.js";
import {
  sonarPara
} from "./chunk-3RP4GPS2.js";
import {
  exigirElemento
} from "./chunk-TWOV343Q.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-ABG2US5U.js";
import {
  seguirMirada
} from "./chunk-B3635KHF.js";
import {
  rumboSvg
} from "./chunk-A6EV2SXJ.js";
import {
  escenaDe,
  validarEstado
} from "./chunk-DNUNKU7K.js";

// src/attach/attach.css
var attach_default = ".fdk-attach { display: inline-block; }\n\n@keyframes fdk-attach-fade-in { from { opacity: 0; } to { opacity: 1; } }\n@keyframes fdk-attach-fade-out { from { opacity: 1; } to { opacity: 0; } }\n@keyframes fdk-attach-slide-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }\n@keyframes fdk-attach-slide-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(6px); } }\n\n.fdk-attach--fade.fdk-anim-in { animation: fdk-attach-fade-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-attach--fade.fdk-anim-out { animation: fdk-attach-fade-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n.fdk-attach--slide.fdk-anim-in { animation: fdk-attach-slide-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-attach--slide.fdk-anim-out { animation: fdk-attach-slide-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-attach.fdk-anim-in, .fdk-attach.fdk-anim-out { animation: none; }\n}\n";

// src/attach/attach.ts
function attachTo(host, options = {}) {
  exigirElemento(host, "attachTo");
  validarEstado(options.estado, "attachTo", true);
  ensureStyles(attach_default, rumbo_default);
  const anim = options.anim ?? "fade";
  const wrap = document.createElement("span");
  wrap.className = `fdk-attach fdk-attach--${anim} fdk-anim-in`;
  if (typeof options.contenido === "string") {
    if (options.html) wrap.innerHTML = options.contenido;
    else wrap.textContent = options.contenido;
  } else if (options.contenido) {
    wrap.appendChild(options.contenido);
  } else if (options.estado) {
    const escena = escenaDe(options.estado);
    if (escena) pintarEscena(wrap, escena, options.size ?? 120);
    else
      wrap.innerHTML = rumboSvg({ estado: options.estado, superficie: options.superficie, size: options.size ?? 24 });
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
