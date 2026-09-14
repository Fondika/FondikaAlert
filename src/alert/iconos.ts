import type { AlertNivel } from "./nivel";

/** Iconos outline verbatim de componentes.html, recoloreados con tokens de la paleta §02. */
const ICONOS: Record<AlertNivel, string> = {
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-turquesa-900)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M12 11v5.4M12 7.6v.05"/></svg>`,
  exito: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-turquesa-900)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.7"/><path d="M7.8 12.4l2.9 2.9 5.5-6"/></svg>`,
  alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-naranja-900)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4l8.6 15H3.4z"/><path d="M12 9.6v3.9M12 16.6v.05"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-rojo-900)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  neutro: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-gris-700)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M8 12h8"/></svg>`,
};

export function iconoDeNivel(nivel: AlertNivel): string {
  return ICONOS[nivel];
}
