import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import type { Position } from "../core/layer";
import { zIndex } from "../core/zstack";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import type { RumboSuperficie } from "../rumbo/types";
import type { RumboEstadoExtendido } from "../rumbo/estados";

import { escenaDe, validarEstado } from "../rumbo/estados";
import { validarPosicion } from "../core/validar";
import { seguirMirada } from "../rumbo/mirada";
import { pintarEscena } from "../escenas/pintar";
import { esTonoOscuro } from "../core/color";
import { sonarPara } from "../sonido/sonido";
import type { SonidoClave } from "../sonido/sonido";
import mascotaCss from "./mascota.css";
import rumboCss from "../rumbo/rumbo.css";
import layerCss from "../core/layer.css";

export interface MascotaOptions {
  /** Estado de Rumbo. Por defecto `"reposo"` — la mascota no está atada a ningún aviso en curso. */
  estado?: RumboEstadoExtendido;
  /** Texto de la burbuja. Si no hay, no hay burbuja (salvo el copy de espera de `pensando`/`cargando`). */
  texto?: string;
  /** Posición en la grilla 3×3 (ADR-003). Por defecto `bottom-end`. */
  posicion?: Position;
  superficie?: RumboSuperficie;
  /** Tamaño de Rumbo en px. Por defecto 80. Las escenas se escalan (×168/120) para que su cuerpo mida lo mismo. */
  size?: number;
  /** Handler de click sobre el propio personaje (ej. abrir un chat). Opcional. */
  onClick?: () => void;
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

export interface MascotaHandle {
  el: HTMLElement;
  /** Cambia estado/texto/superficie sin recrear ni re-animar la entrada — es la misma mascota, actualizada. */
  actualizar(opts: Partial<MascotaOptions>): void;
  /** La esconde (fade out) sin destruirla — `mostrar()` la vuelve a traer donde estaba. */
  ocultar(): Promise<void>;
  mostrar(): void;
  /** La destruye. A diferencia de `ocultar()`, después de esto ya no existe. */
  cerrar(): Promise<void>;
}

interface Instancia {
  el: HTMLElement;
  personaje: HTMLElement;
  burbuja: HTMLElement | null;
  detenerCiclo: () => void;
  /** Seguidor de la mirada, mientras `mirada` esté activa. */
  detenerMirada: (() => void) | null;
  opciones: MascotaOptions;
}

const instancias = new WeakMap<HTMLElement, Map<Position, Instancia>>();

function construirBurbuja(el: HTMLElement, texto: string | null): HTMLElement | null {
  const previa = el.querySelector<HTMLElement>(".fdk-mascota__burbuja");
  previa?.remove();
  if (texto === null) return null;
  const burbuja = document.createElement("div");
  burbuja.className = "fdk-mascota__burbuja fdk-anim-in";
  burbuja.textContent = texto;
  el.insertBefore(burbuja, el.firstChild);
  return burbuja;
}

/**
 * Mascota — presentador Floating persistente (ADR-002/§4.3): Rumbo suelto en la pantalla, fuera
 * de cualquier Alert/Toast/Modal, típicamente un widget de ayuda fijo en una esquina.
 *
 * A diferencia de Attach (que fija a Rumbo DENTRO de un elemento existente del consumidor), la
 * Mascota trae su propia capa flotante — comparte el sistema de posiciones de Toast pero un
 * z-index propio (`zstack.ts`), así nunca compite por apilamiento con un toast en la misma esquina.
 *
 * Sólo una mascota por posición (host + posición): llamar de nuevo actualiza la existente en vez
 * de apilar una segunda. Persistente (ADR-006): devuelve un `Handle`, nunca se cierra sola.
 */
export function mostrarMascota(options: MascotaOptions = {}): MascotaHandle {
  validarEstado(options.estado, "mostrarMascota", true);
  validarPosicion(options.posicion, "mostrarMascota");
  ensureStyles(layerCss, mascotaCss, rumboCss);

  const host = options.host ?? document.body;
  const posicion = options.posicion ?? "bottom-end";
  const layer = getLayer(posicion, host, zIndex.mascot);

  let porHost = instancias.get(host);
  if (!porHost) instancias.set(host, (porHost = new Map()));

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
    instancia = { el, personaje, burbuja: null, detenerCiclo: () => {}, detenerMirada: null, opciones: {} };
    porHost.set(posicion, instancia);
  }

  aplicar(instancia, options);
  return construirHandle(instancia, posicion, porHost);
}

function aplicar(instancia: Instancia, options: MascotaOptions): void {
  instancia.detenerCiclo();
  instancia.opciones = { ...instancia.opciones, ...options };
  const { estado = "reposo", superficie, onClick } = instancia.opciones;
  const escena = escenaDe(estado);
  const rumbo = instancia.opciones.size ?? 80;
  const size = escena ? (rumbo * 168) / 120 : rumbo; // el lienzo de una escena es más ancho: así su cuerpo mide lo mismo que el de Rumbo

  const caja = instancia.personaje;
  caja.style.width = caja.style.height = escena ? `${size}px` : "";
  if (escena) pintarEscena(caja, escena, size, { luminoso: esTonoOscuro(superficie), mirada: instancia.opciones.mirada });
  else {
    delete caja.dataset.escena;
    caja.innerHTML = rumboSvg({ estado, superficie, size });
  }
  sonarPara(options.sonido, estado);
  instancia.personaje.onclick = onClick ?? null;
  // un solo seguidor por mascota: busca los ojos cada cuadro, así que sobrevive a que `actualizar` cambie el SVG
  if (instancia.opciones.mirada && !instancia.detenerMirada) instancia.detenerMirada = seguirMirada(instancia.personaje);
  else if (!instancia.opciones.mirada && instancia.detenerMirada) { instancia.detenerMirada(); instancia.detenerMirada = null; }

  instancia.burbuja = construirBurbuja(instancia.el, instancia.opciones.texto || null);
}

function construirHandle(
  instancia: Instancia,
  posicion: Position,
  porHost: Map<Position, Instancia>
): MascotaHandle {
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
      instancia.detenerMirada?.();
      await animar(instancia.el, "fdk-anim-out", 250);
      instancia.el.remove();
      porHost.delete(posicion);
    },
  };
}
