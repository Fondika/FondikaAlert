import { R as RumboEstadoExtendido, c as RumboSuperficie } from './estados-8m_MyFGM.js';
import { SonidoClave } from './sonido.js';

interface AttachOptions {
    /**
     * Contenido libre a inyectar. Un string se inserta como TEXTO (seguro con datos de usuario); para markup
     * pasa un `HTMLElement` o activa `html`. Si se omite y se da `estado`, se usa Rumbo como contenido.
     */
    contenido?: HTMLElement | string;
    /** Atajo: monta a Rumbo directamente (icono de estado dentro de un botón, badge, etc.). */
    estado?: RumboEstadoExtendido;
    superficie?: RumboSuperficie;
    /** Tamaño de Rumbo en px cuando se usa el atajo `estado`. Si falta, Rumbo llena el contenedor de Attach, de 24px por defecto (o lo que fije `--fdk-attach-size` en CSS); las escenas se escalan ×168/120 para que su cuerpo mida lo mismo. */
    size?: number;
    anim?: "fade" | "slide";
    /**
     * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
     * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
     * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
     */
    sonido?: boolean | SonidoClave;
    /**
     * Interpreta `contenido` (string) como HTML. Úsalo sólo con markup propio o de confianza, p. ej. `rumboEscena(...)`:
     * nunca con texto de usuario (XSS). Por defecto `false`.
     */
    html?: boolean;
    /**
     * Los ojos de Rumbo siguen al puntero (como en `rumbo-en-movimiento.html`: hasta 3.4 unidades, suave, sin girar la
     * cabeza). Apagado por defecto; se desactiva solo con `prefers-reduced-motion`. No aplica a las escenas.
     */
    mirada?: boolean;
}
interface AttachHandle {
    el: HTMLElement;
    close(): Promise<void>;
}
/**
 * Attach — presentador Inline (ADR-002/§4.3): inyecta contenido DENTRO de un elemento existente,
 * sin cubrirlo (a diferencia de Overlay). Caso genérico de "monta esto en este div", y el atajo
 * más común: fijar a Rumbo como icono dentro de un botón, un badge o cualquier contenedor.
 *
 * Persistente (ADR-006): devuelve un `Handle`, el llamador decide cuándo `close()`.
 */
declare function attachTo(host: HTMLElement, options?: AttachOptions): AttachHandle;

export { type AttachHandle, type AttachOptions, attachTo };
