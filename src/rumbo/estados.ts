import type { RumboEstado } from "./types";

/**
 * Las escenas animadas de 04-personaje también son valores de `estado`. Cada una cuelga de uno
 * de los 8 estados base (del que hereda nivel de color y sonido) y, donde cabe una
 * ilustración (Modal, Mascota, Attach), se dibuja ella en vez del Rumbo de 8 estados.
 *
 * `saludo` y `onboarding` son Rumbo normal por defecto; su versión luminosa (cuerpo blanco) no es otro estado: se activa
 * con un fondo de color 900/700 (`background`/`superficie`) en las secciones que lo tienen. El modal no tiene fondo: siempre normal.
 *
 * Las escenas `error`, `offline`, `procesando`, `perfilamiento` y `documento` NO están aquí: repiten estados que
 * ya existen (`error`, `sin-conexion`, `cargando`, `escuchando`, `alerta`) y gana el nombre existente. Mapeo propio, no del brandkit.
 */
export const BASE_DE_ESCENA = {
  saludo: "reposo",
  vacia: "reposo",
  adios: "reposo",
  rendimiento: "reposo",
  asesor: "reposo",
  biometria: "escuchando",
  buscando: "pensando",
  "espera-larga": "cargando",
  "orden-manana": "cargando",
  deposito: "exito",
  retiro: "exito",
  domiciliacion: "exito",
  onboarding: "exito",
  mantenimiento: "sin-conexion",
  dormida: "sin-conexion",
} as const satisfies Record<string, RumboEstado>;

export type EscenaEstado = keyof typeof BASE_DE_ESCENA;

/** Los 8 estados base más las escenas. Los 8 solos siguen siendo `RumboEstado` (no se rompe quien ya lo usa). */
export type RumboEstadoExtendido = RumboEstado | EscenaEstado;

const propio = (obj: object, clave: string) => Object.prototype.hasOwnProperty.call(obj, clave);

export function escenaDe(estado: RumboEstadoExtendido | undefined): EscenaEstado | undefined {
  return estado !== undefined && propio(BASE_DE_ESCENA, estado) ? (estado as EscenaEstado) : undefined;
}

/** `Record` para que el compilador exija listar los 8 si `RumboEstado` cambia. */
const ESTADOS_BASE: Record<RumboEstado, true> = {
  reposo: true, escuchando: true, pensando: true, cargando: true, exito: true, error: true, alerta: true, "sin-conexion": true,
};

/**
 * Falla con un mensaje claro si `estado` no es uno de los 8 base ni una escena. `opcional` deja pasar `undefined`
 * (Modal, Loader, Attach y Mascota no exigen estado; Alert y Toast sí).
 */
export function validarEstado(estado: unknown, quien: string, opcional = false): void {
  if (estado === undefined && opcional) return;
  if (typeof estado === "string" && (propio(ESTADOS_BASE, estado) || propio(BASE_DE_ESCENA, estado))) return;
  const validos = [...Object.keys(ESTADOS_BASE), ...Object.keys(BASE_DE_ESCENA)].join(", ");
  throw new RangeError(`${quien}: \`estado\` ${typeof estado === "string" ? `"${estado}"` : String(estado)} no es válido. Usa uno de: ${validos}.`);
}

/** El estado base: el mismo si ya es uno de los 8, o aquel del que cuelga la escena. */
export function baseDe(estado: RumboEstadoExtendido): RumboEstado {
  const e = escenaDe(estado);
  return e ? BASE_DE_ESCENA[e] : (estado as RumboEstado);
}
