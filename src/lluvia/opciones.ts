import type { OpcionesLluvia } from "./tipos";

/** Tamaño en px del nodo de cada partícula. El tamaño real se logra con `scale(tamaño / TAMANO_BASE)`: sin tocar el layout. */
export const TAMANO_BASE = 64;
export const MAX_CANTIDAD = 300;

export const DEFECTOS = {
  cantidad: 40,
  duracionMs: 6000,
  velocidad: [220, 520] as [number, number],
  tamano: [28, 64] as [number, number],
  retrasoMs: [0, 2500] as [number, number],
};

export interface OpcionesNormalizadas {
  cantidad: number;
  /** `null` = continuo. */
  duracionMs: number | null;
  velocidad: [number, number];
  tamano: [number, number];
  retrasoMs: [number, number];
  random: () => number;
}

export const sortear = ([min, max]: [number, number], rnd: () => number): number => min + (max - min) * rnd();

function rango(nombre: string, valor: [number, number] | undefined, defecto: [number, number], minimo: number, estricto: boolean): [number, number] {
  const r = valor ?? defecto;
  const ok = Array.isArray(r) && r.length === 2 && r.every(Number.isFinite) && r[0] <= r[1] && (estricto ? r[0] > minimo : r[0] >= minimo);
  if (!ok) throw new RangeError(`${nombre} debe ser [mín, máx] con mín ≤ máx y ${estricto ? "mín > " : "mín ≥ "}${minimo}`);
  return [r[0], r[1]];
}

/** Aplica defectos y valida. Es lo único que mira las opciones: el motor recibe valores ya buenos. */
export function normalizar(o: OpcionesLluvia): OpcionesNormalizadas {
  const cantidad = o.cantidad ?? DEFECTOS.cantidad;
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) throw new RangeError(`cantidad debe ser un entero entre 1 y ${MAX_CANTIDAD}`);
  const duracion = o.duracionMs ?? DEFECTOS.duracionMs;
  if (!Number.isFinite(duracion) || duracion < 0) throw new RangeError("duracionMs debe ser un número ≥ 0");
  return {
    cantidad,
    duracionMs: o.continuo || duracion === 0 ? null : duracion,
    velocidad: rango("velocidad", o.velocidad, DEFECTOS.velocidad, 0, true),
    tamano: rango("tamano", o.tamano, DEFECTOS.tamano, 0, true),
    retrasoMs: rango("retrasoMs", o.retrasoMs, DEFECTOS.retrasoMs, 0, false),
    random: o.random ?? Math.random,
  };
}
