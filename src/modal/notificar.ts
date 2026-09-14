import { abrirModal } from "./modal";
import type { RumboEstado } from "../rumbo/types";

export interface NotificarOptions {
  /** Estado de Rumbo. Obligatorio, igual que Confirm/Alert/Toast: define la postura visual aunque no haya texto. */
  estado: RumboEstado;
  titulo?: string;
  texto?: string;
  vozId?: string;
  /** Texto del único botón. Por defecto `"OK"`. */
  okTexto?: string;
}

/**
 * Preset de Modal para avisar algo al usuario sin pedirle una decisión — un solo botón ("OK"
 * por defecto). A diferencia de `confirmar()`, no hay nada que confirmar o cancelar: la promesa
 * sólo resuelve cuando el usuario reconoce el aviso.
 *
 * Sin X de cierre, sin Esc, sin click en el backdrop (`cerrable: false`): la única salida es el
 * botón — regla del brief, para que "avisar" no se confunda con "ignorar".
 */
export async function notificar(options: NotificarOptions): Promise<void> {
  await abrirModal({
    estado: options.estado,
    titulo: options.titulo,
    texto: options.texto,
    vozId: options.vozId,
    acciones: [{ id: "ok", label: options.okTexto ?? "OK", variante: "primario" }],
    cerrable: false,
  });
}
