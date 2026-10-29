import {
  zIndex
} from "./chunk-WBGATSQU.js";
import {
  animar
} from "./chunk-DU34MBEM.js";
import {
  ensureStyles,
  rumbo_default
} from "./chunk-6JBUCDJC.js";
import {
  rumboSvg
} from "./chunk-BMHUI4L2.js";

// src/personajes/registro.ts
function crearRegistro(iniciales = []) {
  const mapa = /* @__PURE__ */ new Map();
  function registrar(p) {
    for (const campo of ["id", "nombre", "src"]) {
      if (typeof p?.[campo] !== "string" || !p[campo]) throw new TypeError(`Personaje inv\xE1lido: falta "${campo}"`);
    }
    if (mapa.has(p.id)) throw new Error(`Ya hay un personaje registrado con id "${p.id}"`);
    mapa.set(p.id, Object.freeze({ ...p }));
  }
  iniciales.forEach(registrar);
  return {
    registrar,
    quitar: (id) => mapa.delete(id),
    listar: () => [...mapa.values()],
    obtener: (id) => mapa.get(id)
  };
}
var ESTADOS_RUMBO = ["reposo", "escuchando", "pensando", "cargando", "exito", "error", "alerta", "sin-conexion"];
function imagenRumbo(estado) {
  const svg = rumboSvg({ estado, size: 96 }).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg [^>]*>)/, `$1<style>${rumbo_default}</style>`);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
var global;
var obtenerGlobal = () => global ?? (global = crearRegistro(ESTADOS_RUMBO.map((e) => ({ id: e, nombre: `Rumbo \xB7 ${e}`, src: imagenRumbo(e) }))));
var registroGlobal = {
  registrar: (p) => obtenerGlobal().registrar(p),
  quitar: (id) => obtenerGlobal().quitar(id),
  listar: () => obtenerGlobal().listar(),
  obtener: (id) => obtenerGlobal().obtener(id)
};
function registrarPersonaje(personaje) {
  registroGlobal.registrar(personaje);
}

// src/personajes/precarga.ts
async function precargar(personajes) {
  await Promise.all(
    personajes.map(
      (p) => new Promise((ok, fallo) => {
        const img = new Image();
        img.onload = () => ok();
        img.onerror = () => fallo(new Error(`No se pudo cargar la imagen del personaje "${p.id}"`));
        img.src = p.src;
      })
    )
  );
}

// src/lluvia/capa.ts
function crearCapa(host, efecto, cantidad, src) {
  const el = document.createElement("div");
  const enPantalla = host === document.body;
  el.className = `fdk-lluvia ${enPantalla ? "fdk-lluvia--pantalla" : "fdk-lluvia--contenida"} ${efecto.clase}`;
  el.setAttribute("aria-hidden", "true");
  el.style.setProperty("--fdk-z", String(zIndex.lluvia));
  let restaurar = () => {
  };
  if (!enPantalla && getComputedStyle(host).position === "static") {
    const previa = host.style.position;
    host.style.position = "relative";
    restaurar = () => {
      host.style.position = previa;
    };
  }
  const particulas = Array.from({ length: cantidad }, () => {
    const p = document.createElement("div");
    p.className = "fdk-lluvia__p";
    const img = new Image();
    img.className = "fdk-lluvia__img";
    img.alt = "";
    img.draggable = false;
    img.src = src;
    p.appendChild(img);
    el.appendChild(p);
    return { el: p, iniciada: false, activa: true, velocidad: 0, tamano: 0, duracionMs: 0 };
  });
  host.appendChild(el);
  return { el, particulas, restaurar };
}
function inyectarCssEfecto(efecto) {
  if (!efecto.css || document.querySelector(`style[data-fdk-efecto="${CSS.escape(efecto.id)}"]`)) return;
  const style = document.createElement("style");
  style.setAttribute("data-fdk-efecto", efecto.id);
  style.textContent = efecto.css;
  document.head.appendChild(style);
}

// src/lluvia/opciones.ts
var TAMANO_BASE = 64;
var MAX_CANTIDAD = 300;
var DEFECTOS = {
  cantidad: 40,
  duracionMs: 6e3,
  velocidad: [220, 520],
  tamano: [28, 64],
  retrasoMs: [0, 2500]
};
var sortear = ([min, max], rnd) => min + (max - min) * rnd();
function rango(nombre, valor, defecto, minimo, estricto) {
  const r = valor ?? defecto;
  const ok = Array.isArray(r) && r.length === 2 && r.every(Number.isFinite) && r[0] <= r[1] && (estricto ? r[0] > minimo : r[0] >= minimo);
  if (!ok) throw new RangeError(`${nombre} debe ser [m\xEDn, m\xE1x] con m\xEDn \u2264 m\xE1x y ${estricto ? "m\xEDn > " : "m\xEDn \u2265 "}${minimo}`);
  return [r[0], r[1]];
}
function normalizar(o) {
  const cantidad = o.cantidad ?? DEFECTOS.cantidad;
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) throw new RangeError(`cantidad debe ser un entero entre 1 y ${MAX_CANTIDAD}`);
  const duracion = o.duracionMs ?? DEFECTOS.duracionMs;
  if (!Number.isFinite(duracion) || duracion < 0) throw new RangeError("duracionMs debe ser un n\xFAmero \u2265 0");
  return {
    cantidad,
    duracionMs: o.continuo || duracion === 0 ? null : duracion,
    velocidad: rango("velocidad", o.velocidad, DEFECTOS.velocidad, 0, true),
    tamano: rango("tamano", o.tamano, DEFECTOS.tamano, 0, true),
    retrasoMs: rango("retrasoMs", o.retrasoMs, DEFECTOS.retrasoMs, 0, false),
    random: o.random ?? Math.random
  };
}

// src/lluvia/efectos-base.ts
var MARGEN = 220;
function caidaBase(ctx, extra = {}, factorVelocidad = 1) {
  return {
    duracionMs: (ctx.alto + MARGEN) / (ctx.velocidad * factorVelocidad) * 1e3,
    vars: { "--xp": ctx.rnd().toFixed(4), "--k": (ctx.tamano / TAMANO_BASE).toFixed(4), ...extra }
  };
}
var profundidad = (ctx) => {
  const [a, b] = ctx.rango.tamano;
  return b > a ? (ctx.tamano - a) / (b - a) : 1;
};
var entre = (ctx, a, b) => a + (b - a) * ctx.rnd();
var EFECTOS_BASE = [
  {
    id: "recta",
    nombre: "Lluvia recta",
    clase: "fdk-lluvia--recta",
    particula: (c) => caidaBase(c)
  },
  {
    id: "balanceo",
    nombre: "Balanceo",
    clase: "fdk-lluvia--balanceo",
    particula: (c) => caidaBase(c, { "--amp": `${entre(c, 18, 50).toFixed(1)}px`, "--per": `${Math.round(entre(c, 1800, 3600))}ms`, "--fase": c.rnd().toFixed(3), "--rot": "14deg" }, 0.8)
  },
  {
    id: "giro",
    nombre: "Giro",
    clase: "fdk-lluvia--giro",
    particula: (c) => caidaBase(c, { "--per": `${Math.round(entre(c, 900, 3100))}ms`, "--dir": c.rnd() < 0.5 ? 1 : -1, "--fase": c.rnd().toFixed(3) })
  },
  {
    id: "nieve",
    nombre: "Nieve",
    clase: "fdk-lluvia--nieve",
    particula: (c) => {
      const d = profundidad(c);
      return caidaBase(
        c,
        { "--o": (0.35 + 0.65 * d).toFixed(3), "--amp": `${entre(c, 6, 20).toFixed(1)}px`, "--per": `${Math.round(entre(c, 3200, 5600))}ms`, "--fase": c.rnd().toFixed(3), "--rot": "4deg" },
        0.45 * (0.6 + 0.4 * d)
        // lenta, y más lenta cuanto más "lejos"
      );
    }
  },
  {
    id: "rebote",
    nombre: "Rebote",
    clase: "fdk-lluvia--rebote",
    particula: (c) => {
      const p = caidaBase(c, { "--rb": entre(c, 16, 32).toFixed(1) });
      p.duracionMs = (c.alto + MARGEN / 2) / c.velocidad * 1e3 / 0.55;
      return p;
    }
  },
  {
    id: "rafaga",
    nombre: "R\xE1faga",
    clase: "fdk-lluvia--rafaga",
    particula: (c) => {
      const f = entre(c, 0.2, 0.45);
      const ang = Math.atan(f * c.ancho / (c.alto + MARGEN)) * 180 / Math.PI;
      return caidaBase(c, { "--xp": (c.rnd() * (1 + f) - f).toFixed(4), "--dx": `${(f * 100).toFixed(2)}cqw`, "--ang": `${ang.toFixed(2)}deg` }, 2.3);
    }
  }
];

// src/lluvia/efectos.ts
function crearRegistroEfectos(iniciales = []) {
  const mapa = /* @__PURE__ */ new Map();
  function registrar(e) {
    for (const campo of ["id", "nombre", "clase"]) {
      if (typeof e?.[campo] !== "string" || !e[campo]) throw new TypeError(`Efecto inv\xE1lido: falta "${campo}"`);
    }
    if (typeof e.particula !== "function") throw new TypeError('Efecto inv\xE1lido: "particula" debe ser una funci\xF3n');
    if (mapa.has(e.id)) throw new Error(`Ya hay un efecto registrado con id "${e.id}"`);
    mapa.set(e.id, e);
  }
  iniciales.forEach(registrar);
  return { registrar, quitar: (id) => mapa.delete(id), listar: () => [...mapa.values()], obtener: (id) => mapa.get(id) };
}
var registroEfectos = crearRegistroEfectos(EFECTOS_BASE);
function registrarEfecto(efecto) {
  registroEfectos.registrar(efecto);
}

// src/lluvia/lluvia.css
var lluvia_default = "/*\n * Lluvia de personajes. La capa es `container-type: size`: las distancias de los @keyframes se miden\n * en `cqw`/`cqh` (ancho/alto de la capa), as\xED que la lluvia se adapta sola al redimensionar la ventana\n * \u2014 o al caber dentro de un elemento (`host`). S\xF3lo se animan `transform` y\n * `opacity`; el tama\xF1o de cada personaje sale de `scale()`, nunca de width/height.\n */\n.fdk-lluvia {\n  inset: 0;\n  overflow: hidden;\n  pointer-events: none; /* nunca bloquea clics */\n  container-type: size;\n  z-index: var(--fdk-z, 9250);\n}\n.fdk-lluvia--pantalla { position: fixed; }\n.fdk-lluvia--contenida { position: absolute; z-index: auto; }\n\n.fdk-lluvia__p {\n  /* posici\xF3n del centro: --xp (0..1) reparte a lo ancho; --k es la escala */\n  --x: calc(var(--k, 1) * 32px + var(--xp, .5) * (100cqw - 64px * var(--k, 1)) - 32px);\n  --y: calc(var(--yp, .5) * (100cqh - 64px * var(--k, 1)));\n  --g: calc(100cqh - 32px - 32px * var(--k, 1)); /* y del piso, para el rebote */\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 64px;\n  height: 64px;\n  opacity: var(--o, 1);\n  will-change: transform;\n  transform: translate3d(0, -200px, 0); /* hasta que arranca su animaci\xF3n, fuera de la vista */\n  animation-duration: var(--dur, 4s);\n  animation-delay: var(--delay, 0ms);\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n  animation-fill-mode: backwards;\n}\n.fdk-lluvia__p--parada { display: none; }\n.fdk-lluvia__img {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  user-select: none;\n  -webkit-user-drag: none;\n}\n\n/* ---- efectos base: la clase va en la capa; cada efecto elige el keyframe de la part\xEDcula y/o de la imagen ---- */\n.fdk-lluvia--recta .fdk-lluvia__p,\n.fdk-lluvia--balanceo .fdk-lluvia__p,\n.fdk-lluvia--giro .fdk-lluvia__p,\n.fdk-lluvia--nieve .fdk-lluvia__p { animation-name: fdk-lluvia-recta; }\n.fdk-lluvia--rebote .fdk-lluvia__p { animation-name: fdk-lluvia-rebote; }\n.fdk-lluvia--rafaga .fdk-lluvia__p { animation-name: fdk-lluvia-rafaga; }\n\n.fdk-lluvia--balanceo .fdk-lluvia__img,\n.fdk-lluvia--nieve .fdk-lluvia__img {\n  animation: fdk-lluvia-balanceo var(--per, 2.4s) ease-in-out calc(var(--per, 2.4s) * var(--fase, 0) * -1) infinite alternate;\n}\n.fdk-lluvia--giro .fdk-lluvia__img {\n  animation: fdk-lluvia-giro var(--per, 2s) linear calc(var(--per, 2s) * var(--fase, 0) * -1) infinite;\n}\n\n@keyframes fdk-lluvia-recta {\n  from { transform: translate3d(var(--x), -110px, 0) scale(var(--k, 1)); }\n  to { transform: translate3d(var(--x), calc(100cqh + 110px), 0) scale(var(--k, 1)); }\n}\n@keyframes fdk-lluvia-balanceo {\n  from { transform: translateX(calc(var(--amp, 30px) * -1)) rotate(calc(var(--rot, 14deg) * -1)); }\n  to { transform: translateX(var(--amp, 30px)) rotate(var(--rot, 14deg)); }\n}\n@keyframes fdk-lluvia-giro {\n  to { transform: rotate(calc(360deg * var(--dir, 1))); }\n}\n@keyframes fdk-lluvia-rafaga {\n  from { transform: translate3d(var(--x), -110px, 0) rotate(calc(var(--ang, 20deg) * -1)) scale(var(--k, 1)); }\n  to { transform: translate3d(calc(var(--x) + var(--dx, 30cqw)), calc(100cqh + 110px), 0) rotate(calc(var(--ang, 20deg) * -1)) scale(var(--k, 1)); }\n}\n@keyframes fdk-lluvia-rebote {\n  0% { transform: translate3d(var(--x), -110px, 0) scale(var(--k, 1)); animation-timing-function: cubic-bezier(.55, 0, 1, .45); }\n  55% { transform: translate3d(var(--x), var(--g), 0) scale(var(--k, 1)); animation-timing-function: cubic-bezier(0, .55, .45, 1); }\n  70% { transform: translate3d(var(--x), calc(var(--g) - var(--rb, 24) * 1cqh), 0) scale(var(--k, 1)); animation-timing-function: cubic-bezier(.55, 0, 1, .45); }\n  82% { transform: translate3d(var(--x), var(--g), 0) scale(var(--k, 1)); animation-timing-function: cubic-bezier(0, .55, .45, 1); }\n  90% { transform: translate3d(var(--x), calc(var(--g) - var(--rb, 24) * .35cqh), 0) scale(var(--k, 1)); animation-timing-function: cubic-bezier(.55, 0, 1, .45); }\n  96% { transform: translate3d(var(--x), var(--g), 0) scale(var(--k, 1)); opacity: var(--o, 1); }\n  100% { transform: translate3d(var(--x), var(--g), 0) scale(var(--k, 1)); opacity: 0; }\n}\n\n/* detener(): la capa se desvanece con el mismo `animar()` que usan los dem\xE1s componentes */\n.fdk-lluvia.fdk-anim-out { animation: fdk-lluvia-salida 250ms ease-out forwards; }\n@keyframes fdk-lluvia-salida { to { opacity: 0; } }\n\n/*\n * prefers-reduced-motion: no cae nada. Unos pocos personajes aparecen quietos, con un fundido, en\n * posiciones al azar (el motor pone --xp/--yp/--k). Se quedan hasta que termina la duraci\xF3n o se detiene.\n */\n.fdk-lluvia--quieta .fdk-lluvia__p {\n  transform: translate3d(var(--x), var(--y), 0) scale(var(--k, 1));\n  animation: fdk-lluvia-fundido 500ms ease-out var(--delay, 0ms) 1 backwards !important;\n}\n.fdk-lluvia--quieta .fdk-lluvia__img { animation: none !important; }\n@keyframes fdk-lluvia-fundido { from { opacity: 0; } }\n";

// src/lluvia/lluvia.ts
function resolverPersonaje(p, registro) {
  if (p && typeof p === "object") return p;
  const personaje = p === void 0 ? registro.listar()[0] : registro.obtener(p);
  if (!personaje) throw new Error(p === void 0 ? "No hay personajes registrados" : `El personaje "${p}" no est\xE1 registrado`);
  return personaje;
}
function resolverEfecto(id = "recta") {
  const efecto = registroEfectos.obtener(id);
  if (!efecto) throw new Error(`El efecto "${id}" no est\xE1 registrado`);
  return efecto;
}
async function iniciarLluvia(options = {}) {
  const o = normalizar(options);
  const personaje = resolverPersonaje(options.personaje, options.personajes ?? registroGlobal);
  const efecto = resolverEfecto(options.efecto);
  await precargar([personaje]);
  ensureStyles(lluvia_default);
  inyectarCssEfecto(efecto);
  const { el: capa, particulas, restaurar } = crearCapa(options.host ?? document.body, efecto, o.cantidad, personaje.src);
  const porNodo = new Map(particulas.map((p) => [p.el, p]));
  const dims = { ancho: capa.clientWidth || innerWidth, alto: capa.clientHeight || innerHeight };
  const ro = new ResizeObserver(([e]) => {
    dims.ancho = e.contentRect.width;
    dims.alto = e.contentRect.height;
  });
  ro.observe(capa);
  let cerrado = false;
  let saliendo = false;
  let terminando = false;
  let activas = particulas.length;
  let temporizador;
  let resolver;
  const terminada = new Promise((r) => resolver = r);
  function finalizar(motivo) {
    if (cerrado) return;
    cerrado = true;
    clearTimeout(temporizador);
    ro.disconnect();
    capa.removeEventListener("animationstart", alIniciar);
    capa.removeEventListener("animationiteration", alIterar);
    capa.remove();
    restaurar();
    porNodo.clear();
    particulas.length = 0;
    resolver(motivo);
    options.onFin?.(motivo);
  }
  async function salir(motivo, inmediato = false) {
    if (saliendo || cerrado) return;
    saliendo = true;
    clearTimeout(temporizador);
    if (!inmediato) await animar(capa, "fdk-anim-out", 250);
    finalizar(motivo);
  }
  function parar(p) {
    if (!p.activa) return;
    p.activa = false;
    p.el.classList.add("fdk-lluvia__p--parada");
    if (--activas === 0) finalizar("completa");
  }
  const contexto = (p) => ({
    ancho: dims.ancho,
    alto: dims.alto,
    tamano: p.tamano,
    velocidad: p.velocidad,
    rango: { tamano: o.tamano, velocidad: o.velocidad },
    rnd: o.random
  });
  function aplicar(p) {
    const r = efecto.particula(contexto(p));
    for (const [k, v] of Object.entries(r.vars)) p.el.style.setProperty(k, String(v));
    p.el.style.setProperty("--dur", `${r.duracionMs}ms`);
    return r.duracionMs;
  }
  function alIniciar(e) {
    const p = porNodo.get(e.target);
    if (p) p.iniciada = true;
  }
  function alIterar(e) {
    const p = porNodo.get(e.target);
    if (!p || !p.activa) return;
    if (terminando) return parar(p);
    const d = aplicar(p);
    if (Math.abs(d - p.duracionMs) > 1) {
      p.duracionMs = d;
      p.el.style.setProperty("--delay", "0ms");
      p.el.style.animationName = "none";
      void p.el.offsetWidth;
      p.el.style.animationName = "";
    }
  }
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducido) {
    capa.classList.add("fdk-lluvia--quieta");
    particulas.forEach((p, i) => {
      if (i >= 12) return parar(p);
      p.el.style.setProperty("--xp", o.random().toFixed(4));
      p.el.style.setProperty("--yp", o.random().toFixed(4));
      p.el.style.setProperty("--k", (sortear(o.tamano, o.random) / 64).toFixed(4));
      p.el.style.setProperty("--delay", `${Math.round(o.random() * 400)}ms`);
    });
    if (o.duracionMs !== null) temporizador = setTimeout(() => void salir("completa"), Math.min(o.duracionMs, 2500));
  } else {
    for (const p of particulas) {
      p.velocidad = sortear(o.velocidad, o.random);
      p.tamano = sortear(o.tamano, o.random);
      p.duracionMs = aplicar(p);
      p.el.style.setProperty("--delay", `${Math.round(sortear(o.retrasoMs, o.random))}ms`);
    }
    capa.addEventListener("animationstart", alIniciar);
    capa.addEventListener("animationiteration", alIterar);
    if (o.duracionMs !== null) {
      temporizador = setTimeout(() => {
        terminando = true;
        for (const p of [...particulas]) if (!p.iniciada) parar(p);
      }, o.duracionMs);
    }
  }
  options.onInicio?.();
  return { el: capa, terminada, detener: (opts) => salir("detenida", opts?.inmediato) };
}

export {
  crearRegistro,
  registroGlobal,
  registrarPersonaje,
  caidaBase,
  EFECTOS_BASE,
  crearRegistroEfectos,
  registroEfectos,
  registrarEfecto,
  iniciarLluvia
};
