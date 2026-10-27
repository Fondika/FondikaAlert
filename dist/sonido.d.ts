import { R as RumboEstadoExtendido } from './estados-Disuf6Zh.js';

/** Los 8 sonidos de sonido-haptica.json (brandkit 03-design-system). */
type SonidoClave = "marca" | "exito" | "deposito" | "retiro" | "aviso" | "alerta" | "error" | "toque";
/** Dónde sirve tu app los .wav de `node_modules/@fondika/alert/sonidos`. Por defecto `/sonidos/`. */
declare function configurarSonido(options: {
    baseUrl: string;
}): void;
/** Reproduce un sonido (y su háptica). Silencioso si el navegador bloquea el autoplay o no hay Audio. */
declare function sonar(clave: SonidoClave): void;
/** `true` = el sonido que le toca al estado (si tiene); una clave = ese sonido, sea cual sea el estado. */
declare function sonarPara(sonido: boolean | SonidoClave | undefined, estado?: RumboEstadoExtendido): void;

export { type SonidoClave, configurarSonido, sonar, sonarPara };
