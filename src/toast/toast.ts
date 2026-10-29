import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { fondoDeToken, esTonoOscuro, colorTextoSobre } from "../core/color";
import type { RumboSuperficie } from "../rumbo/types";
import type { RumboEstadoExtendido } from "../rumbo/estados";
import { baseDe, escenaDe, validarEstado } from "../rumbo/estados";
import { validarEntero, validarMs, validarPosicion } from "../core/validar";
import { seguirMirada } from "../rumbo/mirada";
import { pintarEscena } from "../escenas/pintar";

import type { Position } from "../core/layer";
import { nivelDeEstado } from "../alert/nivel";
import { iconoDeNivel } from "../alert/iconos";
import { sonarPara } from "../sonido/sonido";
import type { SonidoClave } from "../sonido/sonido";
import layerCss from "../core/layer.css";
import alertCss from "../alert/alert.css";
import rumboCss from "../rumbo/rumbo.css";
import toastCss from "./toast.css";

export interface ToastOptions {
  /** Estado de Rumbo. Obligatorio, igual que en Alert: define la postura visual aunque no haya texto. */
  estado: RumboEstadoExtendido;
  titulo?: string;
  texto?: string;
  /** Por defecto `true`: un toast sin Rumbo es sólo un aviso genérico, y aquí sí hay espacio y tiempo para animarlo. */
  personaje?: boolean;
  /**
   * Color de fondo del propio toast. En `saludo` y `onboarding` (siempre Rumbo luminoso) el valor por
   * defecto es `naranja-900`, no blanco + sombra. Por defecto es blanco con una sombra del color del nivel
   * (`info`/`exito`/`alerta`/`error`) en vez de un relleno plano — excepto en `sin-conexion`,
   * que conserva su fondo gris de siempre. Si se da un token explícito de tono oscuro/saturado
   * (900/700), el texto pasa a blanco y Rumbo cambia a su variante luminosa. Nunca tiñe nada
   * fuera del propio toast — a diferencia de la superficie donde se monta.
   *
   * Sólo se recomiendan los tonos 900/700 (sólidos/oscuros) de cada color — los tonos claros
   * (500/300/100) no dan suficiente contraste con el texto blanco. En los estados `reposo`,
   * `escuchando`, `pensando`, `cargando` y `exito`, evita `turquesa-900`/`turquesa-700`: Vida (y
   * en `escuchando`/`pensando`/`cargando` también sus acentos) son turquesa y se pierden contra
   * ese fondo.
   */
  background?: RumboSuperficie;
  /** Posición en la grilla 3×3 (ADR-003). Por defecto `top-end`. */
  posicion?: Position;
  /** ms antes de autocerrar. `0` deshabilita el autocierre — el usuario cierra a mano. Default 4000. */
  timer?: number;
  host?: HTMLElement;
  /**
   * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
   * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
   * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
   */
  sonido?: boolean | SonidoClave;
  /**
   * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
   * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
   */
  mirada?: boolean;
}

let maxVisibles = Infinity;
let visibles = 0;
const pendientes: Array<() => void> = [];

/**
 * Tope global de toasts a la vez (por defecto sin límite). Los que excedan el tope esperan en una cola y se
 * muestran, en orden, conforme se cierran los visibles; su `timer` empieza al mostrarse, no al pedirse.
 * `configurarToast({})` quita el tope. Ojo: un toast con `timer: 0` ocupa su lugar hasta que el usuario lo cierre.
 */
export function configurarToast(options: { maxVisibles?: number }): void {
  validarEntero(options?.maxVisibles, "configurarToast", "maxVisibles", 1);
  maxVisibles = options.maxVisibles ?? Infinity;
  liberar(); // si se subió el tope, los que esperaban entran ya
}

function liberar(): void {
  while (visibles < maxVisibles && pendientes.length) pendientes.shift()!();
}

/**
 * Toast — efímero (ADR-006): `fire()` devuelve una `Promise<void>` que resuelve cuando el toast
 * termina de cerrarse, sea por timer, por click de cierre, o porque el usuario nunca más lo ve.
 * No hay `close()` externo: si necesitas cerrarlo desde código, usa `Alert`/`Loader` (persistentes).
 *
 * A diferencia de Alert, el Toast NUNCA lleva la barra izquierda de 4px (`fdk-alert--barra`):
 * esa marca es exclusiva de Alert.
 */
export function fireToast(options: ToastOptions): Promise<void> {
  validarEstado(options?.estado, "fireToast");
  validarPosicion(options.posicion, "fireToast");
  validarMs(options.timer, "fireToast", "timer");
  if (visibles >= maxVisibles) return new Promise((resolve) => pendientes.push(() => mostrarToast(options).then(resolve)));
  return mostrarToast(options);
}

function mostrarToast(options: ToastOptions): Promise<void> {
  const cerrado = pintarToast(options);
  visibles++;
  return cerrado.finally(() => {
    visibles--;
    liberar();
  });
}

function pintarToast(options: ToastOptions): Promise<void> {
  ensureStyles(layerCss, alertCss, rumboCss, toastCss);

  const personaje = options.personaje ?? true;
  const timerMs = options.timer ?? 4000;
  const nivel = nivelDeEstado(options.estado);
  const layer = getLayer(options.posicion ?? "top-end", options.host);

  const el = document.createElement("div");
  el.className = `fdk-alert fdk-toast fdk-alert--${nivel} fdk-alert--flotante fdk-anim-in`;
  el.setAttribute("role", nivel === "error" ? "alert" : "status");
  el.setAttribute("aria-live", nivel === "error" ? "assertive" : "polite");

  const background = options.background;
  const fondo = fondoDeToken(background);
  if (fondo) {
    el.style.background = fondo;
    if (esTonoOscuro(background)) el.style.color = colorTextoSobre(background);
  } else if (baseDe(options.estado) !== "sin-conexion") {
    // Sin `background` explícito, el toast es blanco + sombra de color del nivel — no el
    // relleno plano. `sin-conexion` es la única excepción: conserva su fondo gris por defecto.
    el.classList.add("fdk-alert--sombra");
  }

  const media = document.createElement("div");
  const escena = escenaDe(options.estado);
  if (personaje) {
    media.className = "fdk-alert__rumbo";
    if (escena) {
      media.classList.add("fdk-alert__rumbo--escena");
      pintarEscena(media, escena, 64.7, { luminoso: esTonoOscuro(background), mirada: options.mirada }); // 46.2 × 168/120: el cuerpo mide lo mismo que el de los demás estados
    } else media.innerHTML = rumboSvg({ estado: options.estado, superficie: background, size: 46.2 }); // 44px + 5%
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
  cerrarBtn.textContent = "×";
  el.appendChild(cerrarBtn);

  if (options.texto) p.textContent = options.texto;
  else p.remove();

  layer.appendChild(el);
  sonarPara(options.sonido, options.estado);
  const detenerMirada = options.mirada ? seguirMirada(el) : () => {};

  return new Promise<void>((resolve) => {
    let cerrado = false;
    let restante = timerMs;
    let inicioEspera = Date.now();
    let handle: ReturnType<typeof setTimeout> | null = null;

    const armar = () => {
      if (handle || restante <= 0) return;
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
      detenerMirada();
      if (handle) clearTimeout(handle);
      await animar(el, "fdk-anim-out", 250);
      el.remove();
      resolve();
    }

    cerrarBtn.addEventListener("click", cerrar);
    // Pausa con el puntero O con el foco dentro (WCAG 2.2.1): el auto-cierre sólo corre si no hay ninguno.
    let sobre = false;
    let foco = false;
    const sincronizar = () => (sobre || foco ? pausar() : armar());
    el.addEventListener("mouseenter", () => { sobre = true; sincronizar(); });
    el.addEventListener("mouseleave", () => { sobre = false; sincronizar(); });
    el.addEventListener("focusin", () => { foco = true; sincronizar(); });
    el.addEventListener("focusout", (e) => { foco = el.contains(e.relatedTarget as Node | null); sincronizar(); });

    if (timerMs > 0) armar();
  });
}
