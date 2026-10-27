import { ensureStyles } from "../core/styles";
import { bloquearScroll, desbloquearScroll } from "../core/scroll";
import { atraparFoco } from "../core/focus";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import type { RumboEstadoExtendido } from "../rumbo/estados";
import { escenaDe, validarEstado } from "../rumbo/estados";
import { pintarEscena } from "../escenas/pintar";
import { validarEntero } from "../core/validar";
import { seguirMirada } from "../rumbo/mirada";
import { sonarPara } from "../sonido/sonido";
import type { SonidoClave } from "../sonido/sonido";
import layerCss from "../core/layer.css"; // sin uso directo de layer.ts, pero comparte tokens de capa
import modalCss from "./modal.css";
import rumboCss from "../rumbo/rumbo.css";

export type ModalVariante = "primario" | "secundario" | "destructivo";

export interface ModalAccion {
  id: string;
  label: string;
  variante?: ModalVariante;
}

export interface ModalOptions {
  titulo?: string;
  texto?: string;
  /** Estado de Rumbo. Opcional en Modal (a diferencia de Alert/Toast): un modal puede ser contenido libre sin personaje. */
  estado?: RumboEstadoExtendido;
  vozId?: string;
  acciones?: ModalAccion[];
  /** `wide` = 640px. Por defecto 420px. */
  ancho?: "default" | "wide";
  /** Si es `false`, ni Esc ni click en el backdrop cierran el modal — sólo una acción explícita. Por defecto `true`. */
  cerrable?: boolean;
  /**
   * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
   * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
   * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
   */
  sonido?: boolean | SonidoClave;
  /**
   * Tema del modal: `"auto"` (por defecto) sigue el del sistema (`prefers-color-scheme`) y lo actualiza si cambia
   * mientras está abierto; `"claro"` u `"oscuro"` lo fijan a mano. Sólo aplica a los modales.
   */
  tema?: "auto" | "claro" | "oscuro";
  /**
   * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
   * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
   */
  mirada?: boolean;
}

export interface ModalResultado {
  /** Id de la acción presionada, o `null` si se cerró con Esc/backdrop/botón de cierre. */
  accionId: string | null;
}

interface Pendiente {
  options: ModalOptions;
  resolve: (r: ModalResultado) => void;
}

const cola: Pendiente[] = [];
let mostrando = false;
let maxCola = Infinity;

/**
 * Tope de modales EN ESPERA (sin contar el visible; por defecto sin límite). Con la cola llena, un modal nuevo no se
 * encola ni se muestra: su promesa resuelve ya con `{ accionId: null }` (como si se hubiera descartado), así que
 * `confirmar()` da `isConfirmed: false` — el resultado seguro. `configurarModal({})` quita el tope.
 */
export function configurarModal(options: { maxCola?: number }): void {
  validarEntero(options?.maxCola, "configurarModal", "maxCola", 0);
  maxCola = options.maxCola ?? Infinity;
}
/** Modal visible: permite cerrarlo por código y detectar que alguien le quitó el DOM desde fuera. */
let actual: { backdrop: HTMLElement; cerrar: (accionId: string | null) => void } | null = null;

/**
 * Cierra el modal visible por código (p. ej. al cambiar de ruta) como si se hubiera cerrado con Esc: resuelve su
 * promesa con `{ accionId: null }` y deja pasar al siguiente de la cola. No hace nada si no hay ninguno.
 */
export function cerrarModal(): void {
  actual?.cerrar(null);
}

/**
 * Motor interno del presentador Popup (ADR-002/§4.3): centrado, backdrop, focus trap y bloqueo
 * de scroll. Efímero (ADR-006): devuelve `Promise<ModalResultado>`.
 *
 * NO es parte de la API pública — `src/modal/index.ts` sólo exporta `confirmar()` y
 * `notificar()`. Los dos son los únicos tipos de Modal que existen (regla del brief): no se
 * expone `abrirModal` suelto para que nadie arme un tercer tipo con acciones arbitrarias.
 *
 * Los popups se ENCOLAN: máximo uno visible a la vez (invariante #7) — si ya hay uno abierto,
 * este se muestra en cuanto el anterior se cierra.
 */
export function abrirModal(options: ModalOptions): Promise<ModalResultado> {
  validarEstado(options.estado, "Modal", true);
  if (options.tema !== undefined && !["auto", "claro", "oscuro"].includes(options.tema)) {
    throw new RangeError(`Modal: \`tema\` "${options.tema}" no es válido. Usa "auto", "claro" u "oscuro".`);
  }
  return new Promise((resolve) => {
    // Si la app quitó el modal del DOM por su cuenta (cambio de ruta, innerHTML del body), nadie puede pulsar sus
    // botones y la cola quedaría bloqueada para siempre: se cierra el huérfano antes de encolar.
    if (mostrando && actual && !actual.backdrop.isConnected) actual.cerrar(null);
    if (mostrando && cola.length >= maxCola) return resolve({ accionId: null });
    cola.push({ options, resolve });
    procesarCola();
  });
}

function procesarCola(): void {
  if (mostrando || cola.length === 0) return;
  mostrando = true;
  const { options, resolve } = cola.shift()!;
  actual = montar(options, (r) => {
    mostrando = false;
    actual = null;
    resolve(r);
    procesarCola();
  });
}

function montar(options: ModalOptions, onCerrado: (r: ModalResultado) => void): { backdrop: HTMLElement; cerrar: (accionId: string | null) => void } {
  ensureStyles(layerCss, modalCss, rumboCss);
  bloquearScroll();

  const cerrable = options.cerrable ?? true;

  const backdrop = document.createElement("div");
  backdrop.className = "fdk-backdrop fdk-anim-in";

  const modal = document.createElement("div");
  modal.className = `fdk-modal fdk-anim-in${options.ancho === "wide" ? " fdk-modal--wide" : ""}`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  // Un diálogo sin nombre accesible se anuncia como "diálogo" a secas: sin título, el texto (o un genérico) lo nombra.
  if (options.titulo) modal.setAttribute("aria-labelledby", "fdk-modal-titulo");
  else modal.setAttribute("aria-label", options.texto || "Aviso");

  // Tema: fijo si el llamador lo pidió; si no, el del sistema, siguiéndolo mientras el modal esté abierto.
  const tema = options.tema ?? "auto";
  const sistema = tema === "auto" && typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
  const aplicarTema = () => modal.classList.toggle("fdk-modal--oscuro", tema === "oscuro" || (sistema?.matches ?? false));
  aplicarTema();
  sistema?.addEventListener?.("change", aplicarTema);
  const detenerMirada = options.mirada ? seguirMirada(modal) : () => {};

  let detenerCiclo: () => void = () => {};
  let cerrado = false;

  async function cerrar(accionId: string | null) {
    if (cerrado) return;
    cerrado = true;
    detenerCiclo();
    soltarFoco();
    detenerMirada();
    sistema?.removeEventListener?.("change", aplicarTema);
    document.removeEventListener("keydown", onKeydown);
    await Promise.all([animar(backdrop, "fdk-anim-out", 250), animar(modal, "fdk-anim-out", 250)]);
    backdrop.remove();
    desbloquearScroll();
    onCerrado({ accionId });
  }

  if (cerrable) {
    const cerrarBtn = document.createElement("button");
    cerrarBtn.className = "fdk-modal__cerrar";
    cerrarBtn.setAttribute("aria-label", "Cerrar");
    cerrarBtn.textContent = "×";
    cerrarBtn.addEventListener("click", () => cerrar(null));
    modal.appendChild(cerrarBtn);
  }

  if (options.estado) {
    const media = document.createElement("div");
    media.className = "fdk-modal__media";
    const escena = escenaDe(options.estado);
    if (escena) pintarEscena(media, escena, 106); // 150 × (78/110): misma reducción que Rumbo
    else media.innerHTML = rumboSvg({ estado: options.estado, size: 78 }); // proporción de la referencia: el cuerpo ocupa ~17% del ancho del modal
    modal.appendChild(media);
  }

  if (options.titulo) {
    const h = document.createElement("h2");
    h.id = "fdk-modal-titulo";
    h.className = "fdk-modal__titulo";
    h.textContent = options.titulo;
    modal.appendChild(h);
  }

  const p = document.createElement("p");
  p.className = "fdk-modal__texto";
  modal.appendChild(p);

  if (options.estado) {
    const estado = options.estado;
    const esCiclico = estado === "pensando" || estado === "cargando";
    const sinTextoExplicito = !options.texto && !options.vozId;
    if (esCiclico && sinTextoExplicito) {
      detenerCiclo = iniciarCicloVoz(estado, (texto) => (p.textContent = texto));
    } else {
      const texto = resolverVozRumbo({ estado, texto: options.texto, vozId: options.vozId });
      if (texto === null) p.remove();
      else p.textContent = texto;
    }
  } else if (options.texto) {
    p.textContent = options.texto;
  } else {
    p.remove();
  }

  if (options.acciones?.length) {
    const row = document.createElement("div");
    row.className = "fdk-modal__acciones";
    for (const accion of options.acciones) {
      const btn = document.createElement("button");
      btn.className = `fdk-modal__btn fdk-modal__btn--${accion.variante ?? "secundario"}`;
      btn.textContent = accion.label;
      btn.addEventListener("click", () => cerrar(accion.id));
      row.appendChild(btn);
    }
    modal.appendChild(row);
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && cerrable) cerrar(null);
  }
  document.addEventListener("keydown", onKeydown);

  if (cerrable) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) cerrar(null);
    });
  }

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  const soltarFoco = atraparFoco(modal);
  sonarPara(options.sonido, options.estado);
  return { backdrop, cerrar };
}
