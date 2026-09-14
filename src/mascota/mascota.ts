import { ensureStyles } from "../core/styles";
import { getLayer } from "../core/layer";
import type { Position } from "../core/layer";
import { zIndex } from "../core/zstack";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import type { RumboEstado, RumboSuperficie } from "../rumbo/types";
import mascotaCss from "./mascota.css";
import rumboCss from "../rumbo/rumbo.css";
import layerCss from "../core/layer.css";

export interface MascotaOptions {
  /** Estado de Rumbo. Por defecto `"reposo"` — la mascota no está atada a ningún aviso en curso. */
  estado?: RumboEstado;
  /** Texto de la burbuja. Tiene prioridad sobre `vozId`. Si no hay ninguno, no hay burbuja. */
  texto?: string;
  /** Id de una línea de la biblioteca de voz de Rumbo para el estado usado. */
  vozId?: string;
  /** Posición en la grilla 3×3 (ADR-003). Por defecto `bottom-end`. */
  posicion?: Position;
  superficie?: RumboSuperficie;
  /** Tamaño de Rumbo en px. Por defecto 80. */
  size?: number;
  /** Handler de click sobre el propio personaje (ej. abrir un chat). Opcional. */
  onClick?: () => void;
  host?: HTMLElement;
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

function resolverTexto(
  estado: RumboEstado,
  options: Pick<MascotaOptions, "texto" | "vozId">,
  onTextoCiclo: (t: string) => void
): () => void {
  const esCiclico = estado === "pensando" || estado === "cargando";
  const sinTextoExplicito = !options.texto && !options.vozId;
  if (esCiclico && sinTextoExplicito) {
    return iniciarCicloVoz(estado, onTextoCiclo);
  }
  const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
  onTextoCiclo(texto ?? "__ninguno__");
  return () => {};
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
  ensureStyles(layerCss + mascotaCss + rumboCss);

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
    instancia = { el, personaje, burbuja: null, detenerCiclo: () => {}, opciones: {} };
    porHost.set(posicion, instancia);
  }

  aplicar(instancia, options);
  return construirHandle(instancia, posicion, porHost);
}

function aplicar(instancia: Instancia, options: MascotaOptions): void {
  instancia.detenerCiclo();
  instancia.opciones = { ...instancia.opciones, ...options };
  const { estado = "reposo", superficie, size = 80, onClick } = instancia.opciones;

  instancia.personaje.innerHTML = rumboSvg({ estado, superficie, size });
  instancia.personaje.onclick = onClick ?? null;

  instancia.detenerCiclo = resolverTexto(estado, instancia.opciones, (texto) => {
    instancia.burbuja = construirBurbuja(instancia.el, texto === "__ninguno__" ? null : texto);
  });
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
      await animar(instancia.el, "fdk-anim-out", 250);
      instancia.el.remove();
      porHost.delete(posicion);
    },
  };
}
