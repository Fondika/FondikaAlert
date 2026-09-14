import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import { fondoDeToken, esTonoOscuro } from "../core/color";
import type { RumboEstado, RumboSuperficie } from "../rumbo/types";
import type { Position } from "../core/layer";
import { nivelDeEstado } from "../alert/nivel";
import { iconoDeNivel } from "../alert/iconos";
import layerCss from "../core/layer.css";
import alertCss from "../alert/alert.css";
import rumboCss from "../rumbo/rumbo.css";
import toastCss from "./toast.css";

export interface ToastOptions {
  /** Estado de Rumbo. Obligatorio, igual que en Alert: define la postura visual aunque no haya texto. */
  estado: RumboEstado;
  titulo?: string;
  texto?: string;
  vozId?: string;
  /** Por defecto `true`: un toast sin Rumbo es sólo un aviso genérico, y aquí sí hay espacio y tiempo para animarlo. */
  personaje?: boolean;
  /**
   * Color de fondo del propio toast. Por defecto es blanco con una sombra del color del nivel
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
  ensureStyles(layerCss + alertCss + rumboCss + toastCss);

  const personaje = options.personaje ?? true;
  const timerMs = options.timer ?? 4000;
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
    // Sin `background` explícito, el toast es blanco + sombra de color del nivel — no el
    // relleno plano. `sin-conexion` es la única excepción: conserva su fondo gris por defecto.
    el.classList.add("fdk-alert--sombra");
  }

  const media = document.createElement("div");
  if (personaje) {
    media.className = "fdk-alert__rumbo";
    media.innerHTML = rumboSvg({ estado: options.estado, superficie: options.background, size: 46.2 }); // 44px + 5%
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

  const estado = options.estado;
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  let detenerCiclo: () => void = () => {};

  if (esCiclico && sinTextoExplicito) {
    detenerCiclo = iniciarCicloVoz(estado, (texto) => (p.textContent = texto));
  } else {
    const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
    if (texto === null) p.remove();
    else p.textContent = texto;
  }

  layer.appendChild(el);

  return new Promise<void>((resolve) => {
    let cerrado = false;
    let restante = timerMs;
    let inicioEspera = Date.now();
    let handle: ReturnType<typeof setTimeout> | null = null;

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
