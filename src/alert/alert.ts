import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import type { RumboEstado } from "../rumbo/types";
import { nivelDeEstado } from "./nivel";
import { iconoDeNivel } from "./iconos";
import alertCss from "./alert.css";
import rumboCss from "../rumbo/rumbo.css";
import layerCss from "../core/layer.css";

export interface AlertOptions {
  /** Estado de Rumbo. Obligatorio: define la postura visual aunque no haya texto (regla del brief). */
  estado: RumboEstado;
  /** Título en bold. Opcional. */
  titulo?: string;
  /** Texto libre. Tiene prioridad sobre `vozId`. */
  texto?: string;
  /** Id de una línea de la biblioteca de voz de Rumbo (voz-rumbo.json). */
  vozId?: string;
  /**
   * Si es `true`, Rumbo sustituye al icono outline (nunca coexisten, ver crítica de diseño).
   * Por defecto `false`: se usa el icono outline del nivel, más liviano para una alerta.
   */
  personaje?: boolean;
  host?: HTMLElement;
}

export interface AlertHandle {
  el: HTMLElement;
  /** Detiene el ciclo de voz (pensando/cargando) si estaba activo y quita el elemento. */
  cerrar(): void;
}

/**
 * Alerta — misma estructura y MISMOS COLORES que Brand_kit_Fondika/03-design-system
 * componentes.html (§ALERTAS): barra de 4px, fondo tintado, icono o Rumbo, título + cuerpo.
 *
 * A diferencia de Toast, Alert no tiene parámetro de color: el color lo decide únicamente el
 * `estado` de Rumbo, vía la clasificación fija de `nivel.ts` (Información / Listo / Alerta /
 * Error / neutro) — no es personalizable por quien la llama.
 *
 * Siempre flota fija en la esquina superior derecha (capa `top-end`, la misma grilla que Toast) —
 * nunca se inserta inline en el flujo de la página.
 *
 * Prioridad de texto: `texto` > `vozId` > ninguno (sólo se ve el tipo de alerta, sin copy).
 * En `pensando` y `cargando`, si no se da `texto` ni `vozId`, el copy avanza solo con el tiempo
 * de espera (ver rumbo/voz-rumbo.json) — es la única razón por la que esta función devuelve un
 * `AlertHandle` con `cerrar()` en vez de ser un fire-and-forget.
 */
export function crearAlert(options: AlertOptions): AlertHandle {
  ensureStyles(layerCss + alertCss + rumboCss);

  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer("top-end", options.host);

  const el = document.createElement("div");
  el.className = `fdk-alert fdk-alert--${nivel} fdk-alert--barra fdk-alert--flotante`;
  if (options.personaje) el.classList.add("fdk-alert--sombra");
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");

  const media = document.createElement("div");
  if (options.personaje) {
    media.className = "fdk-alert__rumbo";
    media.innerHTML = rumboSvg({ estado: options.estado, size: 46.2 }); // 44px + 5%
  } else {
    media.className = "fdk-alert__icono";
    media.innerHTML = iconoDeNivel(nivel);
    // Con título el bloque de texto crece a dos líneas; centrar el icono contra todo el bloque
    // lo descuelga del título. Sin Rumbo (icono normal), se alinea la CAJA del icono arriba —
    // el icono queda centrado dentro de esa caja, a la altura del título, no del bloque entero.
    if (options.titulo) media.style.alignSelf = "flex-start";
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

  const estado = options.estado;
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;

  let detenerCiclo: () => void = () => {};

  if (esCiclico && sinTextoExplicito) {
    p.style.display = ""; // hay copy: lo pone el ciclo
    detenerCiclo = iniciarCicloVoz(estado, (texto) => {
      p.textContent = texto;
    });
  } else {
    const texto = resolverVozRumbo({
      estado: options.estado,
      texto: options.texto,
      vozId: options.vozId,
    });
    if (texto === null) {
      p.remove(); // regla: sin texto ni vozId, no se muestra copy — sólo el tipo de alerta
    } else {
      p.textContent = texto;
    }
  }

  layer.appendChild(el);

  return {
    el,
    cerrar() {
      detenerCiclo();
      el.remove();
    },
  };
}
