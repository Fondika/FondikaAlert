import {
  getLayer
} from "./chunk-NTR55A6C.js";
import {
  layer_default
} from "./chunk-FU44WMPZ.js";
import {
  zIndex
} from "./chunk-IMEHW66V.js";
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

// src/mascota/mascota.css
var mascota_default = '.fdk-mascota {\n  display: flex;\n  align-items: flex-end;\n  gap: var(--fdk-sp-2);\n  font-family: var(--fdk-font);\n}\n\n/* Espejado cuando la mascota vive en el lado izquierdo: la burbuja se dibuja del otro lado */\n.fdk-layer--bottom-start .fdk-mascota,\n.fdk-layer--top-start .fdk-mascota,\n.fdk-layer--middle-start .fdk-mascota {\n  flex-direction: row-reverse;\n}\n\n.fdk-mascota__personaje {\n  flex: 0 0 auto;\n  width: 80px;\n  height: 80px;\n  cursor: pointer;\n  border: none;\n  background: transparent;\n  padding: 0;\n  filter: drop-shadow(0 6px 16px rgba(83, 86, 89, .22));\n}\n.fdk-mascota__personaje .fdk-rumbo { width: 100%; height: 100%; }\n/* Sin hover: es un personaje flotante, no un bot\xF3n de acci\xF3n \u2014 nada de fondo al pasar el mouse\n   (importante tambi\xE9n porque anula cualquier `button:hover` gen\xE9rico del proyecto anfitri\xF3n). */\n.fdk-mascota__personaje:hover { background: transparent; }\n.fdk-mascota__personaje:focus-visible { outline: none; filter: drop-shadow(0 0 0 3px rgba(0,146,166,.4)) drop-shadow(0 6px 16px rgba(83,86,89,.22)); }\n\n.fdk-mascota__burbuja {\n  position: relative;\n  background: var(--fdk-surface);\n  color: var(--fdk-ink);\n  border-radius: var(--fdk-radius-md);\n  box-shadow: 0 6px 16px rgba(83, 86, 89, .14), 0 2px 4px rgba(83, 86, 89, .06);\n  padding: var(--fdk-sp-3) var(--fdk-sp-4);\n  font-size: 14px;\n  line-height: 1.5;\n  max-width: 220px;\n  margin-bottom: var(--fdk-sp-2); /* alinea la burbuja con la cabeza de Rumbo, no con sus pies */\n}\n\n/*\n * Tri\xE1ngulo apuntando hacia Rumbo \u2014 de d\xF3nde "sale" el di\xE1logo. La mascota es una fila\n * (burbuja + personaje), as\xED que el tri\xE1ngulo apunta horizontalmente hacia el lado donde\n * est\xE1 el personaje, no hacia abajo. Por defecto (posiciones "end"): burbuja a la izquierda,\n * Rumbo a la derecha \u2192 el tri\xE1ngulo sale del borde derecho de la burbuja.\n *\n * Con un borde de `--fdk-sp-2` a los 4 lados sobre una caja 0\xD70, la mitad "visible" (el color\n * puesto en `border-left-color`) es un tri\xE1ngulo cuya base est\xE1 en el centro de esa caja y cuya\n * punta llega hasta el borde opuesto. Offset de `-1 * sp-2` deja la PUNTA justo en el borde de la\n * burbuja (nada sobresale, la base queda escondida por dentro). Con `-2 * sp-2` se corre toda la\n * caja un `sp-2` m\xE1s: la BASE queda a ras del borde de la burbuja y la punta sobresale `sp-2`\n * hacia afuera \u2014 as\xED se lee como una pieza que de verdad sale de la burbuja, no un borde pegado.\n *\n * `filter: drop-shadow` en vez de `box-shadow`: un tri\xE1ngulo hecho con el truco del borde no\n * tiene una caja rectangular que "shadowear" \u2014 box-shadow dibujar\xEDa un rect\xE1ngulo detr\xE1s del\n * tri\xE1ngulo. drop-shadow sigue la silueta real. Sin esto, un tri\xE1ngulo blanco sobre un fondo\n * de p\xE1gina tambi\xE9n blanco es literalmente invisible; con la sombra se lee como una pieza f\xEDsica\n * de la burbuja, igual que la burbuja misma.\n */\n.fdk-mascota__burbuja::after {\n  content: "";\n  position: absolute;\n  bottom: 22px;\n  width: 0;\n  height: 0;\n  border: var(--fdk-sp-2) solid transparent;\n  right: calc(var(--fdk-sp-2) * -2);\n  border-left-color: var(--fdk-surface);\n  filter: drop-shadow(2px 2px 2px rgba(83, 86, 89, .18));\n}\n\n/* Posiciones "start": Rumbo queda a la izquierda, la burbuja a la derecha \u2192 tri\xE1ngulo al rev\xE9s */\n.fdk-layer--bottom-start .fdk-mascota__burbuja::after,\n.fdk-layer--top-start .fdk-mascota__burbuja::after,\n.fdk-layer--middle-start .fdk-mascota__burbuja::after {\n  right: auto;\n  left: calc(var(--fdk-sp-2) * -2);\n  border-left-color: transparent;\n  border-right-color: var(--fdk-surface);\n  filter: drop-shadow(-2px 2px 2px rgba(83, 86, 89, .18));\n}\n\n@keyframes fdk-mascota-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: scale(1); } }\n@keyframes fdk-mascota-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(.85); } }\n.fdk-mascota.fdk-anim-in { animation: fdk-mascota-in var(--fdk-duration-base) var(--fdk-ease-out); }\n.fdk-mascota.fdk-anim-out { animation: fdk-mascota-out var(--fdk-duration-base) var(--fdk-ease-out) forwards; }\n\n@keyframes fdk-burbuja-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }\n.fdk-mascota__burbuja.fdk-anim-in { animation: fdk-burbuja-in var(--fdk-duration-base) var(--fdk-ease-out); }\n\n@media (prefers-reduced-motion: reduce) {\n  .fdk-mascota.fdk-anim-in, .fdk-mascota.fdk-anim-out, .fdk-mascota__burbuja.fdk-anim-in { animation: none; }\n}\n';

// src/mascota/mascota.ts
var instancias = /* @__PURE__ */ new WeakMap();
function construirBurbuja(el, texto) {
  const previa = el.querySelector(".fdk-mascota__burbuja");
  previa?.remove();
  if (texto === null) return null;
  const burbuja = document.createElement("div");
  burbuja.className = "fdk-mascota__burbuja fdk-anim-in";
  burbuja.textContent = texto;
  el.insertBefore(burbuja, el.firstChild);
  return burbuja;
}
function resolverTexto(estado, options, onTextoCiclo) {
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  if (esCiclico && sinTextoExplicito) {
    return iniciarCicloVoz(estado, onTextoCiclo);
  }
  const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
  onTextoCiclo(texto ?? "__ninguno__");
  return () => {
  };
}
function mostrarMascota(options = {}) {
  ensureStyles(layer_default + mascota_default + rumbo_default);
  const host = options.host ?? document.body;
  const posicion = options.posicion ?? "bottom-end";
  const layer = getLayer(posicion, host, zIndex.mascot);
  let porHost = instancias.get(host);
  if (!porHost) instancias.set(host, porHost = /* @__PURE__ */ new Map());
  let instancia = porHost.get(posicion);
  if (!instancia) {
    const el = document.createElement("div");
    el.className = "fdk-mascota fdk-anim-in";
    el.setAttribute("role", "complementary");
    const personaje = document.createElement("button");
    personaje.type = "button";
    personaje.className = "fdk-mascota__personaje";
    personaje.setAttribute("aria-label", "Rumbo");
    el.appendChild(personaje);
    layer.appendChild(el);
    instancia = { el, personaje, burbuja: null, detenerCiclo: () => {
    }, opciones: {} };
    porHost.set(posicion, instancia);
  }
  aplicar(instancia, options);
  return construirHandle(instancia, posicion, porHost);
}
function aplicar(instancia, options) {
  instancia.detenerCiclo();
  instancia.opciones = { ...instancia.opciones, ...options };
  const { estado = "reposo", superficie, size = 80, onClick } = instancia.opciones;
  instancia.personaje.innerHTML = rumboSvg({ estado, superficie, size });
  instancia.personaje.onclick = onClick ?? null;
  instancia.detenerCiclo = resolverTexto(estado, instancia.opciones, (texto) => {
    instancia.burbuja = construirBurbuja(instancia.el, texto === "__ninguno__" ? null : texto);
  });
}
function construirHandle(instancia, posicion, porHost) {
  return {
    el: instancia.el,
    actualizar(opts) {
      aplicar(instancia, opts);
    },
    async ocultar() {
      await animar(instancia.el, "fdk-anim-out", 250);
      instancia.el.style.display = "none";
    },
    mostrar() {
      instancia.el.style.display = "";
      instancia.el.classList.remove("fdk-anim-out");
      instancia.el.classList.add("fdk-anim-in");
    },
    async cerrar() {
      instancia.detenerCiclo();
      await animar(instancia.el, "fdk-anim-out", 250);
      instancia.el.remove();
      porHost.delete(posicion);
    }
  };
}

export {
  mostrarMascota
};
