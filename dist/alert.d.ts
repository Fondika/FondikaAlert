import { R as RumboEstadoExtendido, g as EstadoSiempreLuminoso } from './estados-Disuf6Zh.js';
import { SonidoClave } from './sonido.js';

interface AlertOptions {
    /** Estado de Rumbo. Obligatorio: define la postura visual aunque no haya texto (regla del brief).
     * Sin `saludo` ni `onboarding`: son siempre Rumbo luminoso y necesitan un fondo de color, y Alert no tiene `background` configurable. */
    estado: Exclude<RumboEstadoExtendido, EstadoSiempreLuminoso>;
    /** Título en bold. Opcional. */
    titulo?: string;
    /** Texto libre. Tiene prioridad sobre `vozId`. */
    texto?: string;
    /** Id de una línea de la biblioteca de voz de Rumbo (voz-rumbo.json). */
    vozId?: string;
    /**
     * Si es `true`, Rumbo sustituye al icono outline (nunca coexisten, ver crítica de diseño).
     * Por defecto `false`: se usa el icono outline del nivel, más liviano para una alerta.
     */
    personaje?: boolean;
    host?: HTMLElement;
    /**
     * Sonido + háptica (brandkit sonido-haptica.json). `true` = el que le toca al `estado`
     * (exito, error, alerta; reposo/escuchando = aviso; el resto no suena). Una clave
     * (`"deposito"`, `"retiro"`…) fuerza ese sonido. Por defecto no suena.
     */
    sonido?: boolean | SonidoClave;
}
interface AlertHandle {
    el: HTMLElement;
    /** Detiene el ciclo de voz (pensando/cargando) si estaba activo y quita el elemento. */
    cerrar(): void;
}
/**
 * Alerta — misma estructura y MISMOS COLORES que Brand_kit_Fondika/03-design-system
 * componentes.html (§ALERTAS): barra de 4px, fondo tintado, icono o Rumbo, título + cuerpo.
 *
 * A diferencia de Toast, Alert no tiene parámetro de color: el color lo decide únicamente el
 * `estado` de Rumbo, vía la clasificación fija de `nivel.ts` (Información / Listo / Alerta /
 * Error / neutro) — no es personalizable por quien la llama.
 *
 * Siempre flota fija en la esquina superior derecha (capa `top-end`, la misma grilla que Toast) —
 * nunca se inserta inline en el flujo de la página.
 *
 * Prioridad de texto: `texto` > `vozId` > ninguno (sólo se ve el tipo de alerta, sin copy).
 * En `pensando` y `cargando`, si no se da `texto` ni `vozId`, el copy avanza solo con el tiempo
 * de espera (ver rumbo/voz-rumbo.json) — es la única razón por la que esta función devuelve un
 * `AlertHandle` con `cerrar()` en vez de ser un fire-and-forget.
 */
declare function crearAlert(options: AlertOptions): AlertHandle;

export { type AlertHandle, type AlertOptions, crearAlert };
