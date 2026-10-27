import {
  baseDe
} from "./chunk-DNUNKU7K.js";

// src/rumbo/voz-rumbo.json
var voz_rumbo_default = {
  _fuente: "Brand_kit_Fondika/04-personaje/assets/voz-rumbo.html \u2014 33 l\xEDneas, copiadas verbatim.",
  _reglas: "M\xE1ximo 2 l\xEDneas, nunca 'yo' en operaciones, el sistema se hace responsable, sin humor con dinero de por medio, cero promesa/urgencia.",
  estados: {
    reposo: {
      ciclo: false,
      lineas: [
        { id: "primera-vez", texto: "Soy Rumbo. Te acompa\xF1o mientras decides." },
        { id: "regreso", texto: "Qu\xE9 bueno verte. \xBFPor d\xF3nde seguimos?" },
        { id: "nada-pendiente", texto: "Todo en orden por hoy." },
        { id: "estado-vacio", texto: "Aqu\xED van a aparecer tus movimientos. Todav\xEDa no hay ninguno." }
      ]
    },
    escuchando: {
      ciclo: false,
      lineas: [
        { id: "chat-abierto", texto: "Te escucho." },
        { id: "grabando-nota", texto: "Grabando. Habla con calma." },
        { id: "esperando-dato", texto: "Cuando quieras." }
      ]
    },
    pensando: {
      ciclo: true,
      lineas: [
        { id: "consulta-corta", texto: "D\xE9jame ver\u2026", esperaMs: 0 },
        { id: "busqueda", texto: "Estoy buscando eso en tu contrato.", esperaMs: 4e3 },
        { id: "calculo", texto: "Un momento, estoy haciendo la cuenta.", esperaMs: 1e4 }
      ]
    },
    cargando: {
      ciclo: true,
      lineas: [
        { id: "normal", texto: "Estamos procesando tu solicitud.", esperaMs: 0 },
        { id: "lento", texto: "Esto toma unos segundos m\xE1s de lo normal.", esperaMs: 4e3 },
        { id: "muy-largo", texto: "Sigue en proceso. Puedes cerrar la app: te avisamos cuando termine.", esperaMs: 1e4 }
      ]
    },
    exito: {
      ciclo: false,
      lineas: [
        { id: "operacion", texto: "Listo. Tu dep\xF3sito qued\xF3 registrado." },
        { id: "tramite", texto: "Qued\xF3. Un asesor te contacta hoy." },
        { id: "perfilamiento", texto: "Terminaste tu perfil. Ya podemos ver opciones juntos." },
        { id: "meta-alcanzada", texto: "Llegaste a lo que te propusiste." }
      ]
    },
    error: {
      ciclo: false,
      lineas: [
        { id: "dato-invalido", texto: "Revisa la CLABE: debe tener 18 d\xEDgitos." },
        { id: "falla-nuestra", texto: "Algo fall\xF3 de nuestro lado. Int\xE9ntalo otra vez en un minuto." },
        { id: "sesion-vencida", texto: "Tu sesi\xF3n se cerr\xF3 por seguridad. Entra otra vez." },
        { id: "sin-resultados", texto: "No encontr\xE9 nada con eso. Prueba con el n\xFAmero de contrato." }
      ]
    },
    alerta: {
      ciclo: false,
      lineas: [
        { id: "antes-de-firmar", texto: "Antes de continuar: el retiro anticipado tiene una comisi\xF3n desde 1.8 %." },
        { id: "irreversible", texto: "Esta operaci\xF3n no se puede deshacer." },
        { id: "documento-pendiente", texto: "Falta tu comprobante de domicilio para activar la cuenta." },
        { id: "plazo", texto: "Tu constancia fiscal vence este mes." }
      ]
    },
    "sin-conexion": {
      ciclo: false,
      lineas: [
        { id: "se-cayo-la-red", texto: "Sin conexi\xF3n. Guard\xE9 lo que llevabas." },
        { id: "modo-lectura", texto: "No hay red. Puedes ver tus datos, pero no operar." },
        { id: "vuelve", texto: "Ya hay conexi\xF3n. Seguimos donde estabas." }
      ]
    }
  }
};

// src/rumbo/voz.ts
var ESTADOS = voz_rumbo_default.estados;
function resolverVozRumbo(opts) {
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
function iniciarCicloVoz(estado, onCambio) {
  const bloque = ESTADOS[estado];
  if (!bloque || !bloque.ciclo) {
    return () => {
    };
  }
  const timers = [];
  onCambio(bloque.lineas[0].texto);
  for (const linea of bloque.lineas.slice(1)) {
    const ms = linea.esperaMs ?? 0;
    timers.push(setTimeout(() => onCambio(linea.texto), ms));
  }
  return () => timers.forEach(clearTimeout);
}

export {
  resolverVozRumbo,
  iniciarCicloVoz
};
