import type { RumboEstado } from "../rumbo/types";

/** Los 4 niveles visuales definidos en Brand_kit_Fondika/03-design-system/assets/componentes.html. */
export type AlertNivel = "info" | "exito" | "alerta" | "error" | "neutro";

/**
 * Clasificación de los 8 estados de Rumbo en los niveles de color de Alert (dada explícitamente
 * en esta sesión, no inferida):
 *
 *   Información              → reposo, escuchando, pensando, cargando
 *   Listo                    → exito
 *   Alerta ("Ten en cuenta") → alerta
 *   Error ("No se pudo completar") → error
 *   sin-conexion             → su color por defecto (neutro) está bien tal cual, no está en
 *                               componentes.html — no se le asigna ninguno de los 4 niveles de marca.
 */
export const NIVEL_POR_ESTADO: Record<RumboEstado, AlertNivel> = {
  reposo: "info",
  escuchando: "info",
  pensando: "info",
  cargando: "info",
  exito: "exito",
  error: "error",
  alerta: "alerta",
  "sin-conexion": "neutro",
};

export function nivelDeEstado(estado: RumboEstado): AlertNivel {
  return NIVEL_POR_ESTADO[estado];
}
