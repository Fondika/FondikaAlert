import { abrirModal } from "./modal";
import type { RumboEstado } from "../rumbo/types";

export interface ConfirmarOptions {
  /** Estado de Rumbo. Obligatorio, igual que Alert/Toast: define la postura visual aunque no haya texto. */
  estado: RumboEstado;
  titulo?: string;
  texto?: string;
  vozId?: string;
  /** Si es `true`, el botón de confirmar usa la variante destructiva (rojo). Por defecto `false`. */
  danger?: boolean;
  confirmarTexto?: string;
  cancelarTexto?: string;
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
