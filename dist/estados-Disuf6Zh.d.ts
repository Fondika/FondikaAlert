/**
 * Los ocho estados de Rumbo. No se agregan estados nuevos sin documentarlos en
 * Brand_kit_Fondika/04-personaje/README.md (regla #8 de "Qué no hacer").
 */
type RumboEstado = "reposo" | "escuchando" | "pensando" | "cargando" | "exito" | "error" | "alerta" | "sin-conexion";
/**
 * Tono de superficie sobre el que se monta Rumbo. Determina automáticamente si se usa
 * la variante `color` (cuerpo naranja, sobre fondos claros) o `luminoso` (cuerpo blanco
 * con capas de degradado detrás, sobre fondos oscuros/saturados).
 *
 * Reduce el problema a los 18 tokens de la paleta (§02) — nada fuera de ahí.
 */
type RumboSuperficie = "naranja-900" | "naranja-700" | "naranja-500" | "naranja-300" | "naranja-100" | "turquesa-900" | "turquesa-700" | "turquesa-500" | "turquesa-300" | "turquesa-100" | "gris-900" | "gris-700" | "gris-500" | "gris-300" | "gris-100" | "rojo-900" | "rojo-700" | "rojo-100" | "blanco";
type RumboVariante = "color" | "luminoso";
interface RumboOptions {
    estado: RumboEstadoExtendido;
    /** Superficie donde se monta. Por defecto "blanco" → variante `color`. */
    superficie?: RumboSuperficie;
    /** Tamaño en px del lienzo (120×120 nativo). Mínimo recomendado 28px (Vida deja de leerse debajo). */
    size?: number;
}

/**
 * Las escenas animadas de 04-personaje también son valores de `estado`. Cada una cuelga de uno
 * de los 8 estados base (del que hereda nivel de color, voz y sonido) y, donde cabe una
 * ilustración (Modal, Mascota, Attach), se dibuja ella en vez del Rumbo de 8 estados.
 *
 * Las escenas `error`, `offline`, `procesando`, `perfilamiento` y `documento` NO están aquí: repiten estados que
 * ya existen (`error`, `sin-conexion`, `cargando`, `escuchando`, `alerta`) y gana el nombre existente. Mapeo propio, no del brandkit.
 */
declare const BASE_DE_ESCENA: {
    readonly saludo: "reposo";
    readonly vacia: "reposo";
    readonly adios: "reposo";
    readonly rendimiento: "reposo";
    readonly asesor: "reposo";
    readonly biometria: "escuchando";
    readonly buscando: "pensando";
    readonly "espera-larga": "cargando";
    readonly "orden-manana": "cargando";
    readonly deposito: "exito";
    readonly retiro: "exito";
    readonly domiciliacion: "exito";
    readonly onboarding: "exito";
    readonly mantenimiento: "sin-conexion";
    readonly dormida: "sin-conexion";
};
type EscenaEstado = keyof typeof BASE_DE_ESCENA;
/** Los 8 estados base más las escenas. Los 8 solos siguen siendo `RumboEstado` (no se rompe quien ya lo usa). */
type RumboEstadoExtendido = RumboEstado | EscenaEstado;
/** Los dos estados que siempre son Rumbo luminoso: necesitan un fondo de color (ver `superficiePorDefecto`). */
type EstadoSiempreLuminoso = "saludo" | "onboarding";
declare function escenaDe(estado: RumboEstadoExtendido | undefined): EscenaEstado | undefined;
/** El estado base: el mismo si ya es uno de los 8, o aquel del que cuelga la escena. */
declare function baseDe(estado: RumboEstadoExtendido): RumboEstado;

export { BASE_DE_ESCENA as B, type EscenaEstado as E, type RumboEstadoExtendido as R, type RumboEstado as a, type RumboOptions as b, type RumboSuperficie as c, type RumboVariante as d, baseDe as e, escenaDe as f, type EstadoSiempreLuminoso as g };
