import { ensureStyles } from "../core/styles";
import { bloquearScroll, desbloquearScroll } from "../core/scroll";
import { atraparFoco } from "../core/focus";
import { animar } from "../core/anim";
import { rumboSvg } from "../rumbo/rumbo";
import { resolverVozRumbo, iniciarCicloVoz } from "../rumbo/voz";
import type { RumboEstado } from "../rumbo/types";
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
  estado?: RumboEstado;
  vozId?: string;
  acciones?: ModalAccion[];
  /** `wide` = 640px. Por defecto 420px. */
  ancho?: "default" | "wide";
  /** Si es `false`, ni Esc ni click en el backdrop cierran el modal — sólo una acción explícita. Por defecto `true`. */
  cerrable?: boolean;
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
  return new Promise((resolve) => {
    cola.push({ options, resolve });
    procesarCola();
  });
}

function procesarCola(): void {
  if (mostrando || cola.length === 0) return;
  mostrando = true;
  const { options, resolve } = cola.shift()!;
  montar(options, (r) => {
    mostrando = false;
    resolve(r);
    procesarCola();
  });
}

function montar(options: ModalOptions, onCerrado: (r: ModalResultado) => void): void {
  ensureStyles(layerCss + modalCss + rumboCss);
  bloquearScroll();

  const cerrable = options.cerrable ?? true;

  const backdrop = document.createElement("div");
  backdrop.className = "fdk-backdrop fdk-anim-in";

  const modal = document.createElement("div");
  modal.className = `fdk-modal fdk-anim-in${options.ancho === "wide" ? " fdk-modal--wide" : ""}`;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  if (options.titulo) modal.setAttribute("aria-labelledby", "fdk-modal-titulo");

  let detenerCiclo: () => void = () => {};
  let cerrado = false;

  async function cerrar(accionId: string | null) {
    if (cerrado) return;
    cerrado = true;
    detenerCiclo();
    soltarFoco();
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
    media.innerHTML = rumboSvg({ estado: options.estado, size: 96 });
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
}
