import { EFECTOS_BASE } from "./efectos-base";
import type { EfectoLluvia } from "./tipos";

export interface RegistroEfectos {
  registrar(efecto: EfectoLluvia): void;
  quitar(id: string): boolean;
  listar(): EfectoLluvia[];
  obtener(id: string): EfectoLluvia | undefined;
}

export function crearRegistroEfectos(iniciales: EfectoLluvia[] = []): RegistroEfectos {
  const mapa = new Map<string, EfectoLluvia>();

  function registrar(e: EfectoLluvia): void {
    for (const campo of ["id", "nombre", "clase"] as const) {
      if (typeof e?.[campo] !== "string" || !e[campo]) throw new TypeError(`Efecto inválido: falta "${campo}"`);
    }
    if (typeof e.particula !== "function") throw new TypeError('Efecto inválido: "particula" debe ser una función');
    if (mapa.has(e.id)) throw new Error(`Ya hay un efecto registrado con id "${e.id}"`);
    mapa.set(e.id, e);
  }
  iniciales.forEach(registrar);

  return { registrar, quitar: (id) => mapa.delete(id), listar: () => [...mapa.values()], obtener: (id) => mapa.get(id) };
}

/** Registro global de efectos: arranca con los 6 base. Un efecto nuevo se agrega con `registrarEfecto`. */
export const registroEfectos = crearRegistroEfectos(EFECTOS_BASE);

export function registrarEfecto(efecto: EfectoLluvia): void {
  registroEfectos.registrar(efecto);
}
