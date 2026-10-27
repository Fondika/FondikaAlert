import type { Personaje, RegistroPersonajes } from "../personajes/registro";

/** Lo que recibe un efecto para sortear UNA partícula (un personaje que cae). */
export interface ContextoParticula {
  /** Tamaño de la capa en px (para convertir velocidad en duración). */
  ancho: number;
  alto: number;
  /** Tamaño y velocidad ya sorteados dentro de los rangos configurados (px y px/s). */
  tamano: number;
  velocidad: number;
  /** Los rangos de donde salieron, por si el efecto necesita la posición relativa (profundidad). */
  rango: { tamano: [number, number]; velocidad: [number, number] };
  /** Fuente de azar (inyectable para pruebas). */
  rnd: () => number;
}

export interface ParametrosParticula {
  /** Duración de UNA caída completa, en ms. */
  duracionMs: number;
  /** Variables CSS que leen los `@keyframes` del efecto (`--xp`, `--k`, `--amp`…). */
  vars: Record<string, string | number>;
}

/**
 * Un efecto de caída. Todos cumplen el MISMO contrato, así que agregar uno es registrarlo
 * (`registrarEfecto`) sin tocar el código existente: el motor sólo conoce esta interfaz.
 */
export interface EfectoLluvia {
  id: string;
  nombre: string;
  /**
   * Clase que se pone en la CAPA mientras el efecto corre. Sus reglas CSS apuntan a
   * `.fdk-lluvia__p` (la partícula, que cae) y `.fdk-lluvia__img` (la imagen, para giro/balanceo).
   */
  clase: string;
  /** `@keyframes` y reglas propias del efecto. Los efectos base viven en `lluvia.css` y no lo usan. */
  css?: string;
  /** Sortea los parámetros de una partícula. */
  particula(ctx: ContextoParticula): ParametrosParticula;
}

export type MotivoFin = "completa" | "detenida";

export interface OpcionesLluvia {
  /** `id` registrado o un `Personaje` suelto. Por defecto, el primero del registro. */
  personaje?: string | Personaje;
  /** `id` de un efecto registrado. Por defecto `"recta"`. */
  efecto?: string;
  /** Dónde se pinta. Por defecto `document.body`: capa fija sobre toda la ventana. Otro elemento: capa dentro de él. */
  host?: HTMLElement;
  /** Personajes en pantalla a la vez (se reciclan). Por defecto 40, máximo 300. */
  cantidad?: number;
  /** Cuánto tiempo siguen apareciendo personajes, en ms; los que ya caen terminan su caída. Por defecto 6000. */
  duracionMs?: number;
  /** Modo continuo: no termina hasta `detener()`. Ignora `duracionMs`. */
  continuo?: boolean;
  /** Rango de velocidad de caída en px/s (cada personaje sortea la suya). Por defecto [220, 520]. */
  velocidad?: [number, number];
  /** Rango de tamaño en px. Por defecto [28, 64]. */
  tamano?: [number, number];
  /** Rango del retraso aleatorio de aparición, en ms. Por defecto [0, 2500]. */
  retrasoMs?: [number, number];
  /** Registro de personajes. Por defecto el global. */
  personajes?: RegistroPersonajes;
  /** Se llama una vez cuando la lluvia empieza. */
  onInicio?: () => void;
  /** Se llama una vez cuando termina (por completo o porque se detuvo). */
  onFin?: (motivo: MotivoFin) => void;
  /** Fuente de azar (inyectable para pruebas). */
  random?: () => number;
}

export interface LluviaHandle {
  /** La capa de la lluvia (mientras exista). */
  el: HTMLElement;
  /** Resuelve cuando la lluvia terminó y se liberó todo. Nunca rechaza. */
  terminada: Promise<MotivoFin>;
  /** La detiene: se desvanece en 250 ms (`inmediato: true` la quita ya) y libera todo. Es idempotente. */
  detener(opts?: { inmediato?: boolean }): Promise<void>;
}
