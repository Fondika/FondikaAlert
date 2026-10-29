import { R as RumboEstadoExtendido } from './estados-8m_MyFGM.js';
import { SonidoClave } from './sonido.js';

interface AlertOptions {
    /** Estado de Rumbo. Obligatorio: define la postura visual aunque no haya texto (regla del brief).
     * Sin `saludo` ni `onboarding`: son siempre Rumbo luminoso y necesitan un fondo de color, y Alert no tiene `background` configurable. */
    estado: RumboEstadoExtendido;
    /** Título en bold. Opcional. */
    titulo?: string;
    /** El texto. Si falta, sólo se ve el tipo de alerta (en `pensando`/`cargando`, el copy de espera). */
    texto?: string;
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
    /** Quita el elemento. */
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
 * El copy sale sólo de `texto`; sin él, sólo se ve el tipo de alerta.
 *
 * Devuelve un `AlertHandle` con `cerrar()`: el llamador decide cuándo cerrarla.
 */
declare function crearAlert(options: AlertOptions): AlertHandle;

export { type AlertHandle, type AlertOptions, crearAlert };
