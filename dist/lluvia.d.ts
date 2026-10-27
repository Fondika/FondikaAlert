/** Un personaje registrable. `src` es una URL de imagen (o data URI); se precarga antes de usarlo. */
interface Personaje {
    id: string;
    nombre: string;
    src: string;
}
interface RegistroPersonajes {
    registrar(personaje: Personaje): void;
    quitar(id: string): boolean;
    listar(): Personaje[];
    obtener(id: string): Personaje | undefined;
}
/** Un registro propio, por si no quieres tocar el global (los componentes aceptan el suyo en `personajes`). */
declare function crearRegistro(iniciales?: Personaje[]): RegistroPersonajes;
/** Registro global de personajes (mascotas): arranca con los 8 estados de Rumbo. Los demás se agregan con `registrarPersonaje`. */
declare const registroGlobal: RegistroPersonajes;
declare function registrarPersonaje(personaje: Personaje): void;

/** Lo que recibe un efecto para sortear UNA partícula (un personaje que cae). */
interface ContextoParticula {
    /** Tamaño de la capa en px (para convertir velocidad en duración). */
    ancho: number;
    alto: number;
    /** Tamaño y velocidad ya sorteados dentro de los rangos configurados (px y px/s). */
    tamano: number;
    velocidad: number;
    /** Los rangos de donde salieron, por si el efecto necesita la posición relativa (profundidad). */
    rango: {
        tamano: [number, number];
        velocidad: [number, number];
    };
    /** Fuente de azar (inyectable para pruebas). */
    rnd: () => number;
}
interface ParametrosParticula {
    /** Duración de UNA caída completa, en ms. */
    duracionMs: number;
    /** Variables CSS que leen los `@keyframes` del efecto (`--xp`, `--k`, `--amp`…). */
    vars: Record<string, string | number>;
}
/**
 * Un efecto de caída. Todos cumplen el MISMO contrato, así que agregar uno es registrarlo
 * (`registrarEfecto`) sin tocar el código existente: el motor sólo conoce esta interfaz.
 */
interface EfectoLluvia {
    id: string;
    nombre: string;
    /**
     * Clase que se pone en la CAPA mientras el efecto corre. Sus reglas CSS apuntan a
     * `.fdk-lluvia__p` (la partícula, que cae) y `.fdk-lluvia__img` (la imagen, para giro/balanceo).
     */
    clase: string;
    /** `@keyframes` y reglas propias del efecto. Los efectos base viven en `lluvia.css` y no lo usan. */
    css?: string;
    /** Sortea los parámetros de una partícula. */
    particula(ctx: ContextoParticula): ParametrosParticula;
}
type MotivoFin = "completa" | "detenida";
interface OpcionesLluvia {
    /** `id` registrado o un `Personaje` suelto. Por defecto, el primero del registro. */
    personaje?: string | Personaje;
    /** `id` de un efecto registrado. Por defecto `"recta"`. */
    efecto?: string;
    /** Dónde se pinta. Por defecto `document.body`: capa fija sobre toda la ventana. Otro elemento: capa dentro de él. */
    host?: HTMLElement;
    /** Personajes en pantalla a la vez (se reciclan). Por defecto 40, máximo 300. */
    cantidad?: number;
    /** Cuánto tiempo siguen apareciendo personajes, en ms; los que ya caen terminan su caída. Por defecto 6000. */
    duracionMs?: number;
    /** Modo continuo: no termina hasta `detener()`. Ignora `duracionMs`. */
    continuo?: boolean;
    /** Rango de velocidad de caída en px/s (cada personaje sortea la suya). Por defecto [220, 520]. */
    velocidad?: [number, number];
    /** Rango de tamaño en px. Por defecto [28, 64]. */
    tamano?: [number, number];
    /** Rango del retraso aleatorio de aparición, en ms. Por defecto [0, 2500]. */
    retrasoMs?: [number, number];
    /** Registro de personajes. Por defecto el global. */
    personajes?: RegistroPersonajes;
    /** Se llama una vez cuando la lluvia empieza. */
    onInicio?: () => void;
    /** Se llama una vez cuando termina (por completo o porque se detuvo). */
    onFin?: (motivo: MotivoFin) => void;
    /** Fuente de azar (inyectable para pruebas). */
    random?: () => number;
}
interface LluviaHandle {
    /** La capa de la lluvia (mientras exista). */
    el: HTMLElement;
    /** Resuelve cuando la lluvia terminó y se liberó todo. Nunca rechaza. */
    terminada: Promise<MotivoFin>;
    /** La detiene: se desvanece en 250 ms (`inmediato: true` la quita ya) y libera todo. Es idempotente. */
    detener(opts?: {
        inmediato?: boolean;
    }): Promise<void>;
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
declare function iniciarLluvia(options?: OpcionesLluvia): Promise<LluviaHandle>;

interface RegistroEfectos {
    registrar(efecto: EfectoLluvia): void;
    quitar(id: string): boolean;
    listar(): EfectoLluvia[];
    obtener(id: string): EfectoLluvia | undefined;
}
declare function crearRegistroEfectos(iniciales?: EfectoLluvia[]): RegistroEfectos;
/** Registro global de efectos: arranca con los 6 base. Un efecto nuevo se agrega con `registrarEfecto`. */
declare const registroEfectos: RegistroEfectos;
declare function registrarEfecto(efecto: EfectoLluvia): void;

/**
 * Caída vertical estándar. Los efectos que sólo cambian el movimiento (balanceo, giro, nieve…) la
 * reutilizan y le agregan sus variables; también sirve para efectos registrados desde fuera.
 * `factorVelocidad` multiplica la velocidad sorteada (1 = tal cual).
 */
declare function caidaBase(ctx: ContextoParticula, extra?: Record<string, string | number>, factorVelocidad?: number): ParametrosParticula;
declare const EFECTOS_BASE: EfectoLluvia[];

export { type ContextoParticula, EFECTOS_BASE, type EfectoLluvia, type LluviaHandle, type MotivoFin, type OpcionesLluvia, type ParametrosParticula, type Personaje, type RegistroEfectos, type RegistroPersonajes, caidaBase, crearRegistro, crearRegistroEfectos, iniciarLluvia, registrarEfecto, registrarPersonaje, registroEfectos, registroGlobal };
