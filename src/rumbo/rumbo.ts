import type { RumboOptions } from "./types";
import { resolveRumboVariante } from "./variante";
import { baseDe } from "./estados";

/** Path del cuerpo, verbatim de Brand_kit_Fondika/04-personaje/assets/rumbo.html — nunca se re-dibuja a mano. */
const CUERPO_PATH =
  "M32 98 A22 22 0 0 1 10 76 L10 68 A22 22 0 0 1 26.6 46.6 L82.6 26.2 A22 22 0 0 1 110 47.2 L110 76 A22 22 0 0 1 88 98 Z";

const TURQUESA = "#0092a6";
const NARANJA = "#ff9f19";
const DEEP = "#ca5610"; // sólo para el signo de alerta, ya existente en el asset original
const ROJO = "#ad332b";
const GRIS_OJOS = "#3f4245";
const GRIS_OFF = "#b1b1b1";
const GRIS_OFF_RASGO = "#82858a";

function cuerpoColor(variante: "color" | "luminoso"): string {
  return variante === "luminoso" ? "#ffffff" : NARANJA;
}

function ojos(cy: number, r: number, variante: "color" | "luminoso"): string {
  const color = variante === "luminoso" ? GRIS_OJOS : GRIS_OJOS;
  return `<g class="fdk-rumbo__ojos"><circle cx="72" cy="${cy}" r="${r}" fill="${color}"/><circle cx="95" cy="${cy}" r="${r}" fill="${color}"/></g>`;
}

function svgWrap(size: number, inner: string, claseAnim: string): string {
  // --fdk-fase: cada Rumbo empieza a parpadear en un momento distinto (0–9 s), para que varios en pantalla no lo hagan a la vez
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="fdk-rumbo ${claseAnim}" style="--fdk-fase:${(Math.random() * 9).toFixed(1)}s" aria-hidden="true" focusable="false">${inner}</svg>`;
}

/** Genera el SVG inline de Rumbo para un estado y una superficie dados. */
export function rumboSvg(options: RumboOptions): string {
  const { estado, size = 44 } = options;
  const variante = resolveRumboVariante(options.superficie);
  const cuerpo = cuerpoColor(variante);

  switch (baseDe(estado)) {
    case "reposo":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo fdk-rumbo__respira"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(62, 6.6, variante)}</g>
        <circle class="fdk-rumbo__vida fdk-rumbo__flota" cx="99" cy="15" r="9.5" fill="${TURQUESA}"/>`, "s-reposo");

    case "escuchando":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(62, 8.4, variante)}</g>
        <circle class="fdk-rumbo__onda fdk-rumbo__o1" cx="99" cy="15" r="16" fill="none" stroke="${TURQUESA}" stroke-width="2.4"/>
        <circle class="fdk-rumbo__onda fdk-rumbo__o2" cx="99" cy="15" r="16" fill="none" stroke="${TURQUESA}" stroke-width="2.4"/>
        <circle class="fdk-rumbo__vida" cx="99" cy="15" r="9.5" fill="${TURQUESA}"/>`, "s-escuchando");

    case "pensando":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(59, 6.6, variante)}</g>
        <circle class="fdk-rumbo__p fdk-rumbo__p1" cx="78" cy="14" r="4" fill="${TURQUESA}"/>
        <circle class="fdk-rumbo__p fdk-rumbo__p2" cx="89" cy="11" r="5.6" fill="${TURQUESA}"/>
        <circle class="fdk-rumbo__p fdk-rumbo__p3" cx="103" cy="16" r="9.5" fill="${TURQUESA}"/>`, "s-pensando");

    case "cargando":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(62, 6.6, variante)}</g>
        <circle class="fdk-rumbo__c fdk-rumbo__c1" cx="40" cy="40" r="5" fill="${TURQUESA}"/>
        <circle class="fdk-rumbo__c fdk-rumbo__c2" cx="63" cy="31" r="6.6" fill="${TURQUESA}"/>
        <circle class="fdk-rumbo__c fdk-rumbo__c3" cx="86" cy="22" r="8" fill="${TURQUESA}"/>
        <circle class="fdk-rumbo__c fdk-rumbo__c4" cx="108" cy="13" r="9.5" fill="${TURQUESA}"/>`, "s-cargando");

    case "exito":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo fdk-rumbo__salta"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>
          <g class="fdk-rumbo__ojos">
            <path d="M65 64.5 A7 7 0 0 1 79 64.5" fill="none" stroke="${GRIS_OJOS}" stroke-width="5" stroke-linecap="round"/>
            <path d="M88 64.5 A7 7 0 0 1 102 64.5" fill="none" stroke="${GRIS_OJOS}" stroke-width="5" stroke-linecap="round"/></g></g>
        <circle class="fdk-rumbo__vida fdk-rumbo__sube" cx="99" cy="11" r="11" fill="${TURQUESA}"/>`, "s-exito");

    case "error":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo fdk-rumbo__cae"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(65, 6.6, variante)}</g>
        <circle class="fdk-rumbo__vida fdk-rumbo__aleja" cx="110" cy="40" r="7.5" fill="${ROJO}"/>`, "s-error");

    case "alerta":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo"><path d="${CUERPO_PATH}" fill="${cuerpo}"/>${ojos(62, 8.4, variante)}</g>
        <g class="fdk-rumbo__alerta-signo">
          <path d="M99 4 v13.5" stroke="${DEEP}" stroke-width="7.5" stroke-linecap="round"/>
          <circle cx="99" cy="27" r="4" fill="${DEEP}"/>
        </g>`, "s-alerta");

    case "sin-conexion":
      return svgWrap(size, `
        <g class="fdk-rumbo__cuerpo"><path d="${CUERPO_PATH}" fill="${GRIS_OFF}"/>
          <g class="fdk-rumbo__ojos">
            <path d="M65.4 62 h13.2" stroke="${GRIS_OFF_RASGO}" stroke-width="5" stroke-linecap="round"/>
            <path d="M88.4 62 h13.2" stroke="${GRIS_OFF_RASGO}" stroke-width="5" stroke-linecap="round"/></g></g>
        <circle cx="99" cy="15" r="9.5" fill="none" stroke="${GRIS_OFF}" stroke-width="3" stroke-dasharray="4.5 4.5"/>`, "s-off");
  }
}
