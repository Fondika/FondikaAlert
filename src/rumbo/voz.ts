import voz from "./voz-rumbo.json";
import type { RumboEstadoExtendido } from "./estados";
import { baseDe } from "./estados";

interface LineaVoz {
  id: string;
  texto: string;
  esperaMs?: number;
}

interface EstadoVoz {
  ciclo: boolean;
  lineas: LineaVoz[];
}

const ESTADOS = (voz as { estados: Record<string, EstadoVoz> }).estados;

export interface RumboVozOptions {
  estado: RumboEstadoExtendido;
  /** Texto libre. Si se define, siempre gana sobre `vozId` (regla de prioridad). */
  texto?: string;
  /** Id de una línea de la biblioteca (ver voz-rumbo.json). Ignorado si `texto` está definido. */
  vozId?: string;
}

/**
 * Resuelve qué texto mostrar bajo las tres reglas del brief:
 * 1. `texto` tiene prioridad si está definido.
 * 2. Si no, se usa `vozId` (o la primera línea del estado si no se especifica ninguna).
 * 3. Si no hay ni `texto` ni `vozId`, no se muestra texto — sólo el tipo de alerta según el estado.
 * El estado (`estado`) es obligatorio siempre: define la postura visual de Rumbo aunque no haya texto.
 */
export function resolverVozRumbo(opts: RumboVozOptions & { mostrarPorDefecto?: boolean }): string | null {
  if (opts.texto) return opts.texto;
  if (!opts.vozId && !opts.mostrarPorDefecto) return null;

  const bloque = ESTADOS[baseDe(opts.estado)];
  if (!bloque) return null;

  if (opts.vozId) {
    const linea = bloque.lineas.find((l) => l.id === opts.vozId);
    return linea ? linea.texto : null;
  }

  return bloque.lineas[0]?.texto ?? null;
}

/**
 * Sólo para `pensando` y `cargando`: arranca un ciclo que avanza a la siguiente línea de voz
 * a medida que pasa el tiempo de espera (cada estado define su propio `esperaMs`). Llama a
 * `onCambio` con el texto correspondiente cada vez que se cruza un umbral.
 *
 * Devuelve una función para detener el ciclo — quien la use debe llamarla al cerrar el
 * loader/alerta (ADR-006: los persistentes se cierran explícitamente, nunca solos).
 */
export function iniciarCicloVoz(
  estado: "pensando" | "cargando",
  onCambio: (texto: string) => void
): () => void {
  const bloque = ESTADOS[estado];
  if (!bloque || !bloque.ciclo) {
    return () => {};
  }

  const timers: ReturnType<typeof setTimeout>[] = [];
  onCambio(bloque.lineas[0].texto);

  for (const linea of bloque.lineas.slice(1)) {
    const ms = linea.esperaMs ?? 0;
    timers.push(setTimeout(() => onCambio(linea.texto), ms));
  }

  return () => timers.forEach(clearTimeout);
}
