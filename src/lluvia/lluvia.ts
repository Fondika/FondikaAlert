import { ensureStyles } from "../core/styles";
import { animar } from "../core/anim";
import { registroGlobal } from "../personajes/registro";
import type { Personaje, RegistroPersonajes } from "../personajes/registro";
import { precargar } from "../personajes/precarga";
import { crearCapa, inyectarCssEfecto } from "./capa";
import type { Particula } from "./capa";
import { registroEfectos } from "./efectos";
import { normalizar, sortear } from "./opciones";
import type { ContextoParticula, EfectoLluvia, LluviaHandle, MotivoFin, OpcionesLluvia } from "./tipos";
import lluviaCss from "./lluvia.css";

function resolverPersonaje(p: OpcionesLluvia["personaje"], registro: RegistroPersonajes): Personaje {
  if (p && typeof p === "object") return p;
  const personaje = p === undefined ? registro.listar()[0] : registro.obtener(p);
  if (!personaje) throw new Error(p === undefined ? "No hay personajes registrados" : `El personaje "${p}" no está registrado`);
  return personaje;
}

function resolverEfecto(id: string = "recta"): EfectoLluvia {
  const efecto = registroEfectos.obtener(id);
  if (!efecto) throw new Error(`El efecto "${id}" no está registrado`);
  return efecto;
}

/**
 * Lluvia de personajes. Persistente (ADR-006): devuelve un `Handle` y quien la inicia puede
 * detenerla en cualquier momento; `terminada` avisa cuando ya no queda nada.
 *
 * Precarga la imagen ANTES de pintar nada (tarda lo que tarde en descargarse; rechaza si no carga).
 * Después crea los nodos UNA vez y los recicla: cuando un personaje termina su caída vuelve a
 * empezar arriba con otra posición, tamaño y opacidad — no se crea ni se borra ningún nodo. En modo
 * finito, pasada la duración los que ya caen terminan su caída y se apagan; al apagarse el último,
 * la lluvia se da por terminada. Sólo se animan `transform` y `opacity`, con los `@keyframes` CSS y
 * el `animar()` de la librería.
 */
export async function iniciarLluvia(options: OpcionesLluvia = {}): Promise<LluviaHandle> {
  const o = normalizar(options);
  const personaje = resolverPersonaje(options.personaje, options.personajes ?? registroGlobal);
  const efecto = resolverEfecto(options.efecto);

  await precargar([personaje]);
  ensureStyles(lluviaCss);
  inyectarCssEfecto(efecto);

  const { el: capa, particulas, restaurar } = crearCapa(options.host ?? document.body, efecto, o.cantidad, personaje.src);
  const porNodo = new Map<EventTarget, Particula>(particulas.map((p) => [p.el, p]));
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
  let temporizador: ReturnType<typeof setTimeout> | undefined;
  let resolver!: (m: MotivoFin) => void;
  const terminada = new Promise<MotivoFin>((r) => (resolver = r));

  function finalizar(motivo: MotivoFin): void {
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

  async function salir(motivo: MotivoFin, inmediato = false): Promise<void> {
    if (saliendo || cerrado) return;
    saliendo = true;
    clearTimeout(temporizador);
    if (!inmediato) await animar(capa, "fdk-anim-out", 250);
    finalizar(motivo);
  }

  function parar(p: Particula): void {
    if (!p.activa) return;
    p.activa = false;
    p.el.classList.add("fdk-lluvia__p--parada");
    if (--activas === 0) finalizar("completa");
  }

  const contexto = (p: Particula): ContextoParticula => ({
    ancho: dims.ancho,
    alto: dims.alto,
    tamano: p.tamano,
    velocidad: p.velocidad,
    rango: { tamano: o.tamano, velocidad: o.velocidad },
    rnd: o.random,
  });

  /** Sortea los parámetros del efecto para esta partícula y los deja como variables CSS. Devuelve la duración. */
  function aplicar(p: Particula): number {
    const r = efecto.particula(contexto(p));
    for (const [k, v] of Object.entries(r.vars)) p.el.style.setProperty(k, String(v));
    p.el.style.setProperty("--dur", `${r.duracionMs}ms`);
    return r.duracionMs;
  }

  function alIniciar(e: AnimationEvent): void {
    const p = porNodo.get(e.target as EventTarget);
    if (p) p.iniciada = true;
  }

  function alIterar(e: AnimationEvent): void {
    const p = porNodo.get(e.target as EventTarget); // las animaciones de la imagen (giro/balanceo) también burbujean: no son partículas
    if (!p || !p.activa) return;
    if (terminando) return parar(p);
    // vuelve a empezar arriba, fuera de la vista: cambiar posición, fase y amplitud no se nota. El tamaño y la velocidad
    // sorteados son la "identidad" del personaje y no cambian (otra duración re-ubicaría la animación a medias).
    const d = aplicar(p);
    if (Math.abs(d - p.duracionMs) > 1) {
      // la ventana cambió de alto: otra duración re-ubicaría la animación a medias, así que se reinicia (aquí está fuera de la vista)
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
      p.el.style.setProperty("--delay", `${Math.round(sortear(o.retrasoMs, o.random))}ms`); // que no caigan todos a la vez
    }
    capa.addEventListener("animationstart", alIniciar);
    capa.addEventListener("animationiteration", alIterar);
    if (o.duracionMs !== null) {
      temporizador = setTimeout(() => {
        terminando = true; // ya no se recicla; los que están cayendo terminan su caída y se apagan
        for (const p of [...particulas]) if (!p.iniciada) parar(p);
      }, o.duracionMs);
    }
  }

  options.onInicio?.();
  return { el: capa, terminada, detener: (opts) => salir("detenida", opts?.inmediato) };
}
