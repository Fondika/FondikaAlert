import { rumboSvg } from "../rumbo/rumbo";
import type { RumboEstado } from "../rumbo/types";
import rumboCss from "../rumbo/rumbo.css";
/** Un personaje registrable. `src` es una URL de imagen (o data URI); se precarga antes de usarlo. */
export interface Personaje {
  id: string;
  nombre: string;
  src: string;
}

export interface RegistroPersonajes {
  registrar(personaje: Personaje): void;
  quitar(id: string): boolean;
  listar(): Personaje[];
  obtener(id: string): Personaje | undefined;
}

/** Un registro propio, por si no quieres tocar el global (los componentes aceptan el suyo en `personajes`). */
export function crearRegistro(iniciales: Personaje[] = []): RegistroPersonajes {
  const mapa = new Map<string, Personaje>();

  function registrar(p: Personaje): void {
    for (const campo of ["id", "nombre", "src"] as const) {
      if (typeof p?.[campo] !== "string" || !p[campo]) throw new TypeError(`Personaje inválido: falta "${campo}"`);
    }
    if (mapa.has(p.id)) throw new Error(`Ya hay un personaje registrado con id "${p.id}"`);
    mapa.set(p.id, Object.freeze({ ...p }));
  }
  iniciales.forEach(registrar);

  return {
    registrar,
    quitar: (id) => mapa.delete(id),
    listar: () => [...mapa.values()],
    obtener: (id) => mapa.get(id),
  };
}

/** Los 8 estados de Rumbo, cada uno un personaje: `reposo`, `escuchando`, `pensando`, `cargando`, `exito`, `error`, `alerta`, `sin-conexion`. */
const ESTADOS_RUMBO: RumboEstado[] = ["reposo", "escuchando", "pensando", "cargando", "exito", "error", "alerta", "sin-conexion"];

/**
 * El SVG de Rumbo para usarlo como imagen suelta (data URI). `rumboSvg` sale pensado para ir en línea en
 * HTML: sin `xmlns` el navegador lo rechaza como imagen, y su animación vive en el CSS de la página
 * (que una imagen no ve), así que se incrusta aquí — si no, quedaría quieto.
 */
function imagenRumbo(estado: RumboEstado): string {
  const svg = rumboSvg({ estado, size: 96 }).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg [^>]*>)/, `$1<style>${rumboCss}</style>`);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Se crea al primer uso: armar los 8 SVG (con su CSS incrustado y codificado) al importar encarecía hasta a quien no usa la lluvia. */
let global: RegistroPersonajes | undefined;
const obtenerGlobal = () => (global ??= crearRegistro(ESTADOS_RUMBO.map((e) => ({ id: e, nombre: `Rumbo · ${e}`, src: imagenRumbo(e) }))));

/** Registro global de personajes (mascotas): arranca con los 8 estados de Rumbo. Los demás se agregan con `registrarPersonaje`. */
export const registroGlobal: RegistroPersonajes = {
  registrar: (p) => obtenerGlobal().registrar(p),
  quitar: (id) => obtenerGlobal().quitar(id),
  listar: () => obtenerGlobal().listar(),
  obtener: (id) => obtenerGlobal().obtener(id),
};

export function registrarPersonaje(personaje: Personaje): void {
  registroGlobal.registrar(personaje);
}
