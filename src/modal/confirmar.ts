import { abrirModal } from "./modal";
import type { SonidoClave } from "../sonido/sonido";
import type { RumboEstadoExtendido } from "../rumbo/estados";

export interface ConfirmarOptions {
  /** Estado de Rumbo. Obligatorio, igual que Alert/Toast: define la postura visual aunque no haya texto. */
  estado: RumboEstadoExtendido;
  titulo?: string;
  texto?: string;
  vozId?: string;
  /** Si es `true`, el botón de confirmar usa la variante destructiva (rojo). Por defecto `false`. */
  danger?: boolean;
  confirmarTexto?: string;
  cancelarTexto?: string;
  /** Sonido + háptica: `true` = el del `estado`, o una clave (`"deposito"`…). Ver `ModalOptions.sonido`. */
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

export interface ConfirmarResultado {
  isConfirmed: boolean;
}

/**
 * Preset de Modal para confirmaciones sí/no con Rumbo (catálogo Confirm del UI-Kit). Devuelve
 * `Promise<{ isConfirmed }>`.
 *
 * Sin X de cierre, sin Esc, sin click en el backdrop (`cerrable: false`): la decisión sólo se
 * toma presionando uno de los dos botones — regla del brief, para que un cierre accidental no
 * se confunda con "cancelar".
 */
export async function confirmar(options: ConfirmarOptions): Promise<ConfirmarResultado> {
  const r = await abrirModal({
    estado: options.estado,
    titulo: options.titulo,
    texto: options.texto,
    vozId: options.vozId,
    sonido: options.sonido,
    tema: options.tema,
    mirada: options.mirada,
    acciones: [
      { id: "cancelar", label: options.cancelarTexto ?? "Cancelar", variante: "secundario" },
      {
        id: "confirmar",
        label: options.confirmarTexto ?? "Aceptar",
        variante: options.danger ? "destructivo" : "primario",
      },
    ],
    cerrable: false,
  });
  return { isConfirmed: r.accionId === "confirmar" };
}
