import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import { rumboSvg } from "../rumbo/rumbo";
import type { RumboEstadoExtendido } from "../rumbo/estados";
import { escenaDe, validarEstado } from "../rumbo/estados";
import { pintarEscena } from "../escenas/pintar";
import { nivelDeEstado } from "./nivel";
import { iconoDeNivel } from "./iconos";
import { sonarPara } from "../sonido/sonido";
import type { SonidoClave } from "../sonido/sonido";
import alertCss from "./alert.css";
import rumboCss from "../rumbo/rumbo.css";
import layerCss from "../core/layer.css";

export interface AlertOptions {
  /** Estado de Rumbo. Obligatorio: define la postura visual aunque no haya texto (regla del brief).
   * Sin `saludo` ni `onboarding`: son siempre Rumbo luminoso y necesitan un fondo de color, y Alert no tiene `background` configurable. */
  estado: RumboEstadoExtendido;
  /** Título en bold. Opcional. */
  titulo?: string;
  /** El texto. Si falta, sólo se ve el tipo de alerta (en `pensando`/`cargando`, el copy de espera). */
  texto?: string;
  /**
   * Si es `true`, Rumbo sustituye al icono outline (nunca coexisten, ver crítica de diseño).
   * Por defecto `false`: se usa el icono outline del nivel, más liviano para una alerta.
   */
  personaje?: boolean;
  host?: HTMLElement;
  /**
   * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
   * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
   * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
   */
  sonido?: boolean | SonidoClave;
}

export interface AlertHandle {
  el: HTMLElement;
  /** Quita el elemento. */
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
 * El copy sale sólo de `texto`; sin él, sólo se ve el tipo de alerta.
 *
 * Devuelve un `AlertHandle` con `cerrar()`: el llamador decide cuándo cerrarla.
 */
export function crearAlert(options: AlertOptions): AlertHandle {
  validarEstado(options?.estado, "crearAlert");
  ensureStyles(layerCss, alertCss, rumboCss);

  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer("top-end", options.host);

  const el = document.createElement("div");
  el.className = `fdk-alert fdk-alert--${nivel} fdk-alert--barra fdk-alert--flotante`;
  const escena = escenaDe(options.estado);
  const conPersonaje = options.personaje || !!escena; // un estado-escena siempre es Rumbo, nunca el icono
  if (conPersonaje) el.classList.add("fdk-alert--sombra");
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");

  const media = document.createElement("div");
  if (conPersonaje) {
    media.className = "fdk-alert__rumbo";
    if (escena) {
      media.classList.add("fdk-alert__rumbo--escena");
      pintarEscena(media, escena, 64.7); // 46.2 × 168/120: el cuerpo mide lo mismo que el de los demás estados
    } else media.innerHTML = rumboSvg({ estado: options.estado, size: 46.2 }); // 44px + 5%
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

  if (options.texto) p.textContent = options.texto;
  else p.remove(); // sin texto no se muestra copy — sólo el tipo de alerta

  layer.appendChild(el);
  sonarPara(options.sonido, options.estado);

  return {
    el,
    cerrar() {
      el.remove();
    },
  };
}
