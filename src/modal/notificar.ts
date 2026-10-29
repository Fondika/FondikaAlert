import { abrirModal } from "./modal";
import type { SonidoClave } from "../sonido/sonido";
import type { RumboEstadoExtendido } from "../rumbo/estados";

export interface NotificarOptions {
  /** Estado de Rumbo. Obligatorio, igual que Confirm/Alert/Toast: define la postura visual aunque no haya texto. */
  estado: RumboEstadoExtendido;
  titulo?: string;
  texto?: string;
  /** Texto del único botón. Por defecto `"OK"`. */
  okTexto?: string;
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
    sonido: options.sonido,
    tema: options.tema,
    mirada: options.mirada,
    acciones: [{ id: "ok", label: options.okTexto ?? "OK", variante: "primario" }],
    cerrable: false,
  });
}
