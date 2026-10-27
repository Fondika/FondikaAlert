import type { RumboEstado } from "../rumbo/types";
import { baseDe } from "../rumbo/estados";
import type { RumboEstadoExtendido } from "../rumbo/estados";

/** Los 8 sonidos de sonido-haptica.json (brandkit 03-design-system). */
export type SonidoClave = "marca" | "exito" | "deposito" | "retiro" | "aviso" | "alerta" | "error" | "toque";

// Patrones web de `hapticos` en sonido-haptica.json. La háptica nunca va sola: siempre acompaña al sonido.
const HAPTICA: Partial<Record<SonidoClave, number[]>> = {
  exito: [12, 60, 24],
  deposito: [10, 40, 20],
  retiro: [10, 40, 20],
  alerta: [24, 70, 12],
  error: [26, 50, 26],
  toque: [10],
};

// pensando / cargando / sin-conexion no suenan: "nada en bucle" y el error/offline ya los dice Rumbo en pantalla.
const POR_ESTADO: Partial<Record<RumboEstado, SonidoClave>> = {
  exito: "exito",
  error: "error",
  alerta: "alerta",
  reposo: "aviso",
  escuchando: "aviso",
};

let baseUrl = "/sonidos/";

/** Dónde sirve tu app los .wav de `node_modules/@fondika/alert/sonidos`. Por defecto `/sonidos/`. */
export function configurarSonido(options: { baseUrl: string }): void {
  baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : options.baseUrl + "/";
}

/** Reproduce un sonido (y su háptica). Silencioso si el navegador bloquea el autoplay o no hay Audio. */
export function sonar(clave: SonidoClave): void {
  if (typeof Audio === "undefined") return;
  new Audio(`${baseUrl}fdk-${clave}.wav`).play().catch(() => {});
  const h = HAPTICA[clave];
  if (h) navigator.vibrate?.(h);
}

/** `true` = el sonido que le toca al estado (si tiene); una clave = ese sonido, sea cual sea el estado. */
export function sonarPara(sonido: boolean | SonidoClave | undefined, estado?: RumboEstadoExtendido): void {
  if (estado === "rendimiento") return; // brandkit: ningún sonido para el rendimiento, ni al subir ni al bajar
  const clave = typeof sonido === "string" ? sonido : sonido && estado ? POR_ESTADO[baseDe(estado)] : undefined;
  if (clave) sonar(clave);
}
