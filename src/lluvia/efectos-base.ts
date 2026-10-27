import { TAMANO_BASE } from "./opciones";
import type { ContextoParticula, EfectoLluvia, ParametrosParticula } from "./tipos";

/** Px extra de recorrido: la partícula arranca y termina fuera de la ventana (110px arriba, 110px abajo). */
const MARGEN = 220;

/**
 * Caída vertical estándar. Los efectos que sólo cambian el movimiento (balanceo, giro, nieve…) la
 * reutilizan y le agregan sus variables; también sirve para efectos registrados desde fuera.
 * `factorVelocidad` multiplica la velocidad sorteada (1 = tal cual).
 */
export function caidaBase(ctx: ContextoParticula, extra: Record<string, string | number> = {}, factorVelocidad = 1): ParametrosParticula {
  return {
    duracionMs: ((ctx.alto + MARGEN) / (ctx.velocidad * factorVelocidad)) * 1000,
    vars: { "--xp": ctx.rnd().toFixed(4), "--k": (ctx.tamano / TAMANO_BASE).toFixed(4), ...extra },
  };
}

/** 0 = el tamaño más chico del rango (lejos), 1 = el más grande (cerca). */
const profundidad = (ctx: ContextoParticula): number => {
  const [a, b] = ctx.rango.tamano;
  return b > a ? (ctx.tamano - a) / (b - a) : 1;
};

const entre = (ctx: ContextoParticula, a: number, b: number) => a + (b - a) * ctx.rnd();

export const EFECTOS_BASE: EfectoLluvia[] = [
  {
    id: "recta",
    nombre: "Lluvia recta",
    clase: "fdk-lluvia--recta",
    particula: (c) => caidaBase(c),
  },
  {
    id: "balanceo",
    nombre: "Balanceo",
    clase: "fdk-lluvia--balanceo",
    particula: (c) =>
      caidaBase(c, { "--amp": `${entre(c, 18, 50).toFixed(1)}px`, "--per": `${Math.round(entre(c, 1800, 3600))}ms`, "--fase": c.rnd().toFixed(3), "--rot": "14deg" }, 0.8),
  },
  {
    id: "giro",
    nombre: "Giro",
    clase: "fdk-lluvia--giro",
    particula: (c) => caidaBase(c, { "--per": `${Math.round(entre(c, 900, 3100))}ms`, "--dir": c.rnd() < 0.5 ? 1 : -1, "--fase": c.rnd().toFixed(3) }),
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
        0.45 * (0.6 + 0.4 * d) // lenta, y más lenta cuanto más "lejos"
      );
    },
  },
  {
    id: "rebote",
    nombre: "Rebote",
    clase: "fdk-lluvia--rebote",
    particula: (c) => {
      // la caída hasta el piso ocupa el 55 % de la animación; el resto son los rebotes y el desvanecido
      const p = caidaBase(c, { "--rb": entre(c, 16, 32).toFixed(1) });
      p.duracionMs = ((c.alto + MARGEN / 2) / c.velocidad) * 1000 / 0.55;
      return p;
    },
  },
  {
    id: "rafaga",
    nombre: "Ráfaga",
    clase: "fdk-lluvia--rafaga",
    particula: (c) => {
      const f = entre(c, 0.2, 0.45); // cuánto se desplaza de lado, como fracción del ancho
      const ang = (Math.atan((f * c.ancho) / (c.alto + MARGEN)) * 180) / Math.PI;
      // arranca más a la izquierda para que la diagonal cubra todo el ancho
      return caidaBase(c, { "--xp": (c.rnd() * (1 + f) - f).toFixed(4), "--dx": `${(f * 100).toFixed(2)}cqw`, "--ang": `${ang.toFixed(2)}deg` }, 2.3);
    },
  },
];
