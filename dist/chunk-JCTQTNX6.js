// src/alert/nivel.ts
var NIVEL_POR_ESTADO = {
  reposo: "info",
  escuchando: "info",
  pensando: "info",
  cargando: "info",
  exito: "exito",
  error: "error",
  alerta: "alerta",
  "sin-conexion": "neutro"
};
function nivelDeEstado(estado) {
  return NIVEL_POR_ESTADO[estado];
}

// src/alert/iconos.ts
var ICONOS = {
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-turquesa-900)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M12 11v5.4M12 7.6v.05"/></svg>`,
  exito: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-turquesa-900)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.7"/><path d="M7.8 12.4l2.9 2.9 5.5-6"/></svg>`,
  alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-naranja-900)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4l8.6 15H3.4z"/><path d="M12 9.6v3.9M12 16.6v.05"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-rojo-900)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  neutro: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--fdk-gris-700)" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.7"/><path d="M8 12h8"/></svg>`
};
function iconoDeNivel(nivel) {
  return ICONOS[nivel];
}

// src/alert/alert.css
var alert_default = '/**\n * Base compartida por Alert y Toast: fondo tintado por nivel, icono o Rumbo, t\xEDtulo + cuerpo.\n * La barra izquierda de 4px (`--barra`) es EXCLUSIVA de Alert \u2014 Toast no la lleva, ver toast.css.\n *\n * El padding NO vive en el contenedor: s\xF3lo lleva el padding izquierdo, el que antecede a Rumbo.\n * Todo el resto del padding (arriba/abajo/derecha) vive en `.fdk-alert__cuerpo` \u2014 as\xED el \xEDcono/\n * Rumbo puede crecer o encogerse sin que el texto pierda su propio respiro.\n */\n.fdk-alert {\n  display: flex;\n  gap: var(--fdk-sp-3);\n  padding: 0;\n  padding-inline-start: var(--fdk-sp-3);\n  border-radius: var(--fdk-radius-md);\n  font-size: 14px;\n  font-family: var(--fdk-font);\n  color: var(--fdk-ink);\n  line-height: 1.5;\n  align-items: center; /* centrado vertical de todo el contenido: media, texto y bot\xF3n de cierre */\n}\n\n/* S\xF3lo Alert: la barra izquierda de 4px de componentes.html (\xA7ALERTAS). Resta el ancho del borde. */\n.fdk-alert--barra {\n  border-radius: var(--fdk-radius-sm);\n  border-left: 4px solid var(--fdk-alert-border, transparent);\n  padding-inline-start: calc(var(--fdk-sp-3) - 4px);\n}\n\n/* Alert siempre flota fija en la esquina superior derecha (layer top-end) \u2014 nunca inline. */\n.fdk-alert--flotante {\n  width: 340px;\n  max-width: calc(100vw - 2 * var(--fdk-sp-4));\n  box-shadow: 0 6px 16px rgba(83, 86, 89, .14), 0 2px 4px rgba(83, 86, 89, .06);\n}\n\n/*\n * Icono y Rumbo ocupan la MISMA huella (44px, "avatar de chat" del brandkit) \u2014 as\xED el alto de\n * la fila no cambia seg\xFAn cu\xE1l de los dos se muestre, y ambos quedan centrados dentro de ella.\n */\n.fdk-alert__icono,\n.fdk-alert__rumbo {\n  flex: 0 0 auto;\n  width: 44px;\n  height: 44px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.fdk-alert__icono svg { width: 20px; height: 20px; display: block; }\n\n/* Rumbo sustituye al icono \u2014 nunca coexisten (recomendaci\xF3n de la cr\xEDtica de dise\xF1o). */\n.fdk-alert__rumbo .fdk-rumbo { width: 100%; height: 100%; }\n\n.fdk-alert__titulo { display: block; margin-bottom: 2px; font-weight: 700; }\n\n/*\n * Padding del texto: arriba = abajo = derecha (mismo valor); izquierda = un tercio de ese valor\n * (ya hay `gap` entre Rumbo y el texto, as\xED que no necesita el mismo respiro que el resto).\n * sp-3 (12px) / 3 = sp-1 (4px) exacto, por eso se usan esos dos tokens.\n */\n.fdk-alert__cuerpo {\n  flex: 1;\n  margin: 0;\n  padding: var(--fdk-sp-3) var(--fdk-sp-3) var(--fdk-sp-3) var(--fdk-sp-1);\n}\n\n/*\n * Cada nivel define su fondo por defecto Y expone `--fdk-alert-border` (la usa `.fdk-alert--barra`).\n * `background` expl\xEDcito (ver alert.ts / toast.ts) sobreescribe este fondo con `style.background`.\n */\n.fdk-alert--info    { background: var(--fdk-alert-info-bg);   --fdk-alert-border: var(--fdk-alert-info-border); }\n.fdk-alert--exito   { background: var(--fdk-alert-exito-bg);  --fdk-alert-border: var(--fdk-alert-exito-border); }\n.fdk-alert--alerta  { background: var(--fdk-alert-alerta-bg); --fdk-alert-border: var(--fdk-alert-alerta-border); }\n.fdk-alert--error   { background: var(--fdk-alert-error-bg);  --fdk-alert-border: var(--fdk-alert-error-border); }\n.fdk-alert--neutro  { background: var(--fdk-gris-100);        --fdk-alert-border: var(--fdk-gris-700); }\n';

export {
  nivelDeEstado,
  iconoDeNivel,
  alert_default
};
