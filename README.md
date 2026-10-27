# @fondika/alert

Alertas, toasts, modales, loaders y una mascota flotante — todo usando a **Rumbo**, el personaje
de producto de FÓNDIKA, en vez de iconos genéricos. Vanilla TS, cero dependencias en runtime.

> ¿Buscas por qué está hecho así, las decisiones de diseño o el estado interno del proyecto?
> Eso vive en [DOCUMENTACION.md](DOCUMENTACION.md). Este archivo es sólo para usar la librería.
> Qué cambió entre versiones: [CHANGELOG.md](CHANGELOG.md).

## Instalación

```bash
npm install "@fondika/alert@git+https://github.com/Fondika/FondikaAlert.git#semver:^1.1"
```

No hay que importar ningún CSS aparte: cada función inyecta sus propios estilos en el
`<head>` la primera vez que se llama (idempotente, con guardia de SSR).

**Al actualizar desde 1.1** — lo que cambia de comportamiento (el detalle, en el [CHANGELOG](CHANGELOG.md)):

- `attachTo({ contenido: "<b>hola</b>" })` ya **no interpreta HTML**: un string es texto. Para markup propio usa
  `html: true` o pasa un elemento.
- Los valores inválidos (un `estado` que no existe, `timer: -1`, un `host` que es `null`…) **lanzan** en vez de pintar
  algo roto. Para «sin autocierre» usa `timer: 0`.
- Sobre un fondo naranja-900/700, turquesa-700 o gris-700 el texto es oscuro (antes blanco), por contraste AA: afecta a
  `saludo` y `onboarding`, que usan naranja-900.
- El modal sigue el tema del sistema (claro u oscuro), sus botones van en columna y mide hasta 440px.
  `tema: "claro"` lo deja siempre claro.

## Lo único que hay que saber antes de empezar

- **`estado` es obligatorio** en Alert, Toast, `confirmar()` y `notificar()` (en Loader por defecto es `"cargando"`, en
  Mascota `"reposo"`, y en Attach es opcional) — es uno de los 8 estados
  de Rumbo (`"reposo"`, `"escuchando"`, `"pensando"`, `"cargando"`, `"exito"`, `"error"`,
  `"alerta"`, `"sin-conexion"`). Define la postura visual de Rumbo aunque no le pongas texto.
- **Las entradas inválidas fallan al instante**, con un mensaje que dice qué se esperaba y qué llegó (lanzan de
  forma síncrona, antes de tocar la pantalla): un `estado` que no existe, una `posicion` fuera de la grilla 3×3,
  un `timer` negativo o no numérico (`0` = sin autocierre), o un `host`/`boton` que no es un elemento (p. ej. un
  `querySelector` que devolvió `null`). Con `fireToast`, el error se lanza en la llamada, no como promesa rechazada.
- **Prioridad de texto:** `texto` libre > `vozId` (biblioteca de voz de Rumbo) > nada. Sin
  ninguno de los dos, sólo se ve el tipo de aviso, sin copy.
- **`superficie`** (Toast, Loader, Attach, Mascota) es opcional y sólo importa si vas a montar el
  componente sobre un fondo oscuro/saturado propio (ej. un naranja-900) — Rumbo pasa a su
  variante blanca ("luminosa") automáticamente. Sin `superficie`, Rumbo se ve en su color normal.
- **Las opciones extra van al final y están apagadas por defecto**, para no cambiar a quien ya usa la librería:

  | Componente | `sonido` | `mirada` | `tema` |
  |---|:-:|:-:|:-:|
  | `crearAlert` | ✓ | — | — |
  | `fireToast` | ✓ | ✓ | — |
  | `confirmar`, `notificar` | ✓ | ✓ | ✓ |
  | `loaderScreen`, `loaderTarget`, `loaderBoton` | — | ✓ | — |
  | `attachTo`, `mostrarMascota` | ✓ | ✓ | — |
  | `iniciarLluvia` | — | — | — |

  `mirada` no existe en Alert ni en la lluvia: moverle los ojos a Rumbo cambiaría su aspecto ahí.

## Alert

Flota fija en la esquina superior derecha. Su color **no es configurable** — lo decide el
`estado` (Información/Listo/Alerta/Error, con los colores oficiales de marca).

```ts
import { crearAlert } from "@fondika/alert";

const handle = crearAlert({
  estado: "alerta",
  titulo: "Ten en cuenta",
  texto: "El retiro anticipado tiene una comisión desde 1.8 %.",
});

// más tarde, si hace falta cerrarla desde código:
handle.cerrar();
```

| Opción | Tipo | Default | Nota |
|---|---|---|---|
| `estado` | `RumboEstado` | — (obligatorio) | |
| `titulo` | `string` | — | |
| `texto` | `string` | — | prioridad sobre `vozId` |
| `vozId` | `string` | — | línea de la biblioteca de voz para ese `estado` |
| `personaje` | `boolean` | `false` | `true` = Rumbo en vez del icono outline |
| `host` | `HTMLElement` | `document.body` | dónde montar la capa flotante |
| `sonido` | `boolean \| SonidoClave` | `false` | ver [Sonido y háptica](#sonido-y-háptica) |

## Toast

Efímero: se autocierra con timer, se pausa al pasar el mouse. Por defecto es blanco con una
sombra del color del nivel (`info`/`exito`/`alerta`/`error`) — excepto `sin-conexion`, que
conserva su fondo gris. A diferencia de Alert, sí admite `background` para forzar un color propio,
pero sólo entre los 8 tonos 900/700 (sólidos/oscuros) de la paleta; en `reposo`, `escuchando`,
`pensando`, `cargando` y `exito` evita `turquesa-900`/`turquesa-700` — Vida (y sus acentos) son
turquesa y se pierden contra ese fondo.

```ts
import { fireToast } from "@fondika/alert";

await fireToast({
  estado: "exito",
  texto: "Listo. Tu depósito quedó registrado.",
  posicion: "top-end",   // grilla 3×3: top/middle/bottom × start/center/end
  timer: 4000,           // 0 = no se autocierra, el usuario lo cierra a mano
});
```

`fireToast()` devuelve una `Promise<void>` que resuelve cuando el toast termina de cerrarse (por
timer o porque lo cerraron a mano) — útil para encadenar algo después. El timer se pausa con el mouse o con el
foco del teclado dentro del toast.

Si tu app puede disparar muchos de golpe, pon un tope: `configurarToast({ maxVisibles: 3 })` deja visibles
como máximo 3 y el resto espera su turno (el `timer` de cada uno corre desde que se muestra). Sin llamarlo no hay
límite. Un toast con `timer: 0` ocupa su lugar hasta que se cierre a mano.

| Opción | Tipo | Default |
|---|---|---|
| `estado` | `RumboEstado` | — (obligatorio) |
| `titulo` / `texto` / `vozId` | `string` | — |
| `personaje` | `boolean` | `true` |
| `background` | `RumboSuperficie` | blanco + sombra del nivel (gris por defecto en `sin-conexion`) |
| `posicion` | `Position` | `"top-end"` |
| `timer` | `number` (ms) | `4000` |
| `host` | `HTMLElement` | `document.body` |
| `sonido` | `boolean \| SonidoClave` | `false` |
| `mirada` | `boolean` | `false` |

El texto del toast es blanco sobre `background` oscuro, salvo sobre naranja-900/700, turquesa-700 y gris-700, donde es
oscuro (el blanco no llega a contraste AA ahí).

## Modal — sólo dos tipos

`cerrarModal()` cierra por código el modal visible (p. ej. al cambiar de ruta); su promesa resuelve como descartada (`accionId: null`, `isConfirmed: false`) aunque el modal no se pueda cerrar con Esc.

`configurarModal({ maxCola: 2 })` limita cuántos modales pueden esperar su turno (sin contar el visible; sin
llamarlo no hay límite). Con la cola llena, el nuevo no se muestra y resuelve de inmediato como descartado:
`confirmar()` da `isConfirmed: false`, el resultado seguro.

**Tema claro / oscuro.** Por defecto el modal sigue el tema del sistema (`prefers-color-scheme`) y lo actualiza si
cambia mientras está abierto. Para fijarlo, el último argumento de `confirmar()`, `notificar()` y del motor es
`tema: "auto" | "claro" | "oscuro"` (default `"auto"`). Aplica sólo a los modales. Los botones van en columna y a
todo el ancho: la acción principal arriba y la de cancelar debajo. El modal mide hasta 440px y en pantallas estrechas
ocupa el ancho disponible menos 20px de margen a cada lado.

```ts
await confirmar({ estado: "exito", titulo: "¡Sueño creado!", tema: "oscuro" });
```

No hay un modal de "acciones libres": únicamente `confirmar()` y `notificar()`. Ninguno de los
dos se cierra con Esc, click fuera, ni una X — sólo con sus botones.

```ts
import { confirmar, notificar } from "@fondika/alert";

const { isConfirmed } = await confirmar({
  estado: "alerta",
  titulo: "Antes de continuar",
  texto: "Esta operación no se puede deshacer.",
  danger: true,                 // botón de confirmar en rojo
  confirmarTexto: "Sí, continuar",
  cancelarTexto: "Mejor no",
});

await notificar({
  estado: "exito",
  titulo: "Listo",
  texto: "Tu depósito quedó registrado.",
  okTexto: "Entendido",         // default "OK"
});
```

Los popups se **encolan**: si abres un segundo mientras el primero sigue en pantalla, el segundo
espera a que el usuario resuelva el primero.

## Loader — pantalla completa, un contenedor, o un botón

Persistentes: no se cierran solos, devuelven un `Handle` con `close()`.

```ts
import { loaderScreen, loaderTarget, loaderBoton } from "@fondika/alert";

// pantalla completa — con contador de referencias: pedirlo 3 veces requiere cerrarlo 3 veces
const pantalla = loaderScreen({ texto: "Estamos procesando tu solicitud." });
await guardarFormulario();
await pantalla.close();

// sólo cubre un contenedor (una tabla, una card)
const tabla = loaderTarget(document.querySelector("#tabla-movimientos")!);
await cargarMovimientos();
await tabla.close();

// dentro de un <button> — lo deshabilita y muestra a Rumbo cargando en vez del texto
const boton = loaderBoton(miBoton, { keepWidth: true });
await enviarFormulario();
boton.close();
```

Los tres cuentan referencias: pedir el mismo loader varias veces (o el mismo botón) necesita el mismo número de
`close()`, **cada handle cuenta una sola vez** (repetir `close()` no resta de más), y si se vuelve a pedir mientras
se está cerrando, se reanima el mismo overlay en vez de dejar la nueva petición sin loader.

`loaderScreen`/`loaderTarget` aceptan `estado` (default `"cargando"`) — puedes dejar un loader
fijo mostrando `"error"` si algo se cae a medio camino, por ejemplo.

## Attach — fijar a Rumbo dentro de un elemento tuyo

A diferencia de Loader, no cubre nada: se inyecta dentro de un elemento que ya existe (un botón,
un badge, un div), sin taparlo.

```ts
import { attachTo } from "@fondika/alert";

const handle = attachTo(document.querySelector("#badge-notificaciones")!, {
  estado: "exito",
  size: 24,
});

handle.close(); // cuando ya no haga falta
```

También acepta contenido libre en vez de Rumbo: `attachTo(host, { contenido: miElemento })` o
`{ contenido: "texto" }`. Un string se inserta como **texto** (seguro con datos de usuario); para markup propio
pasa un elemento o `html: true` — nunca con texto de usuario:
`attachTo(host, { contenido: "<span>texto</span>", html: true })`.

## Mascota — Rumbo suelto en una esquina

Un widget de ayuda persistente, fuera de cualquier aviso. Sólo una mascota por posición: llamar
de nuevo la actualiza en vez de apilar una segunda.

```ts
import { mostrarMascota } from "@fondika/alert";

const mascota = mostrarMascota({
  estado: "reposo",
  texto: "Soy Rumbo. Te acompaño mientras decides.",
  posicion: "bottom-end",
  onClick: () => abrirChat(),
});

// más tarde, cambiar lo que dice sin recrearla:
mascota.actualizar({ estado: "exito", texto: "Listo. Tu depósito quedó registrado." });

mascota.ocultar();  // fade out, se puede volver a traer con mascota.mostrar()
mascota.cerrar();   // la destruye del todo
```

## Lluvia de personajes

Hace caer muchas copias de un personaje por toda la ventana, por encima del contenido, y desaparecen
al salir por abajo. La capa ocupa toda la pantalla, **no bloquea clics ni mueve nada de la página**.
Persistente: devuelve un `Handle` y se puede detener en cualquier momento.

```ts
import { iniciarLluvia } from "@fondika/alert"; // o "@fondika/alert/lluvia": se importa sin cargar el resto

const lluvia = await iniciarLluvia({
  personaje: "exito",        // id del registro de personajes (por defecto arranca con los 8 estados de Rumbo)
  efecto: "nieve",           // uno de los 6 efectos (ver abajo); por defecto "recta"
  cantidad: 60,
  duracionMs: 5000,          // o `continuo: true` hasta detenerla
  onInicio: () => console.log("empezó"),
  onFin: (motivo) => console.log("terminó:", motivo), // "completa" | "detenida"
});

lluvia.detener();            // en cualquier momento (se desvanece en 250 ms)
await lluvia.terminada;      // resuelve con el motivo cuando ya no queda nada
```

`iniciarLluvia()` **precarga la imagen antes de pintar** (tarda lo que tarde en descargarse y rechaza
si no carga). Si pasas un valor inválido (`cantidad: 0`, un rango al revés…) rechaza con `RangeError`.

| Opción | Tipo | Default | Nota |
|---|---|---|---|
| `personaje` | `string \| Personaje` | primero del registro | un `id` registrado o un objeto `{ id, nombre, src }` suelto |
| `efecto` | `string` | `"recta"` | id de un efecto registrado |
| `cantidad` | `number` | `40` | personajes en pantalla a la vez (1–300); se reciclan |
| `duracionMs` | `number` | `6000` | cuánto tiempo siguen apareciendo; los que ya caen terminan su caída. `0` = continuo |
| `continuo` | `boolean` | `false` | no termina hasta `detener()` (ignora `duracionMs`) |
| `velocidad` | `[min, max]` | `[220, 520]` | px/s; **cada personaje sortea la suya** dentro del rango |
| `tamano` | `[min, max]` | `[28, 64]` | px; cada personaje sortea el suyo |
| `retrasoMs` | `[min, max]` | `[0, 2500]` | retraso aleatorio de aparición, para que no caigan todos a la vez |
| `host` | `HTMLElement` | `document.body` | con otro elemento, la lluvia cae **dentro** de él en vez de en toda la ventana |
| `personajes` | `RegistroPersonajes` | el global | registro propio |
| `onInicio` / `onFin` | `function` | — | se llaman una vez cada una |

La posición horizontal es aleatoria a lo ancho de toda la pantalla. Cada personaje conserva su tamaño y
su velocidad; al volver a empezar arriba cambia de posición (y de fase, en los efectos que oscilan).

### Los 6 tipos de animación

| `efecto` | Cómo cae |
|---|---|
| `recta` | Caída vertical directa, velocidad constante |
| `balanceo` | Caída con oscilación lateral suave y leve inclinación, como hojas |
| `giro` | Caída con rotación sobre su propio eje (cada uno, su velocidad y sentido) |
| `nieve` | Lenta; tamaños y opacidades variados (lo chico es más tenue y más lento) para dar profundidad |
| `rebote` | Cae, rebota dos veces al llegar al borde inferior y se desvanece |
| `rafaga` | Rápida y en diagonal, como lluvia con viento |

```ts
await iniciarLluvia({ efecto: "recta" });                                                  // lluvia recta
await iniciarLluvia({ efecto: "balanceo", cantidad: 25, velocidad: [120, 260] });          // hojas
await iniciarLluvia({ efecto: "giro", tamano: [40, 80], cantidad: 20 });                   // giro
await iniciarLluvia({ efecto: "nieve", cantidad: 120, tamano: [10, 48], velocidad: [90, 200], duracionMs: 12000 }); // nieve
await iniciarLluvia({ efecto: "rebote", cantidad: 15, duracionMs: 4000 });                 // rebote
await iniciarLluvia({ efecto: "rafaga", cantidad: 80, velocidad: [500, 900] });            // ráfaga
await iniciarLluvia({ efecto: "nieve", continuo: true, host: document.querySelector("#hero") }); // continua, dentro de un elemento
```

### Los parámetros se pasan por código

La librería **no trae ningún panel ni interfaz visual** para configurar la lluvia: en tu aplicación la
llamas con sus parámetros, tal cual los eliges en el código (o los recibes de tu propia configuración).
El demo del playground solo usa listas desplegables para armar esa misma llamada y probarla.

```ts
const lluvia = await iniciarLluvia({
  personaje: usuario.mascota,          // lo que haya elegido tu aplicación
  efecto: "balanceo",
  cantidad: 50,
  velocidad: [120, 260],
});
```

### Personajes y efectos nuevos

Se agregan registrándolos; no se toca el código existente. El registro de personajes es el mismo que
usa el resto de la librería. Arranca con los 8 estados de Rumbo como personajes (`reposo`, `escuchando`, `pensando`, `cargando`, `exito`, `error`, `alerta`, `sin-conexion`), animados.

```ts
import { registrarPersonaje, registrarEfecto, caidaBase } from "@fondika/alert";

registrarPersonaje({ id: "sofia", nombre: "Sofía", src: "/img/sofia.svg" });

registrarEfecto({
  id: "pulso",
  nombre: "Pulso",
  clase: "mi-lluvia--pulso",                // se pone en la capa; tu CSS apunta a sus hijos
  css: `.mi-lluvia--pulso .fdk-lluvia__p   { animation-name: fdk-lluvia-recta; }   /* reutiliza el keyframe de caída */
        .mi-lluvia--pulso .fdk-lluvia__img { animation: pulso 650ms ease-in-out infinite alternate; }
        @keyframes pulso { from { transform: scale(.7); } to { transform: scale(1.3); } }`,
  particula: (ctx) => caidaBase(ctx),       // sortea los parámetros de UNA partícula (ver `ContextoParticula`)
});
```

### Cómo funciona (y qué esperar)

- **Solo se animan `transform` y `opacity`**, con `@keyframes` CSS y el mismo `animar()` que usan los demás
  componentes. El tamaño de cada personaje sale de `scale()`: nada provoca reflow.
- **Los nodos se reciclan:** se crean una sola vez y, cuando uno sale por abajo, vuelve a entrar por arriba.
- **Se adapta a la ventana:** las distancias se miden en `cqw`/`cqh` (unidades de *container queries*:
  Chrome 105+, Safari 16+, Firefox 110+), así que al redimensionar la ventana la lluvia sigue cubriéndola.
- **`prefers-reduced-motion`:** no cae nada. Aparecen unos pocos personajes quietos, con un fundido, y se
  quedan hasta que acaba la duración (máx. 2,5 s) o se detiene.
- **Al terminar o detenerse se libera todo:** capa, nodos, observadores y listeners.
- `duracionMs` es cuánto tiempo siguen **apareciendo** personajes; la lluvia termina cuando el último
  sale por abajo, así que dura un poco más.

## Escenas como estados

Además de los 8 estados base, `estado` acepta **15 escenas animadas** del brandkit
(`04-personaje/assets/escenas`). Cada una cuelga de un estado base, del que hereda color de nivel,
voz y sonido:

| Estado base | Escenas |
|---|---|
| `reposo` | `saludo`, `vacia`, `adios`, `rendimiento`, `asesor` |
| `escuchando` | `biometria` |
| `pensando` | `buscando` |
| `cargando` | `espera-larga`, `orden-manana` |
| `exito` | `deposito`, `retiro`, `domiciliacion`, `onboarding` |
| `sin-conexion` | `mantenimiento`, `dormida` |

`error`, `offline`, `procesando`, `perfilamiento` y `documento` del brandkit **no son estados
nuevos**: repiten `error`, `sin-conexion`, `cargando`, `escuchando` y `alerta`, y gana el nombre
que ya existía. Todos los estados (los 8 y las 15 escenas) son estados de Rumbo por igual y se
llaman por su nombre, sin etiqueta ni grupo aparte.

```ts
notificar({ estado: "deposito", titulo: "Depósito acreditado", sonido: "deposito" });
mostrarMascota({ estado: "saludo", texto: "Hola de nuevo." });   // size por defecto 120 con escena
attachTo(host, { estado: "vacia", size: 160 });                   // size por defecto 120 con escena
fireToast({ estado: "deposito" });                                // Toast y Alert también la dibujan (80 px)
```

- Se dibuja la escena en **Modal** (`confirmar`/`notificar`), **Mascota**, **Attach**, **Alert** y
  **Toast** (en estos dos a 80 px, y en Alert un estado-escena usa siempre a Rumbo aunque no pases
  `personaje`). En **Loader** (spinner de 32–96 px) se dibuja el Rumbo de su estado base.
- Quien ya usaba los 8 estados no cambia nada: el tipo `RumboEstado` sigue siendo esos 8, y la
  unión ampliada es `RumboEstadoExtendido`.
- `saludo` y `onboarding` se dibujan siempre como Rumbo luminoso (cuerpo blanco con halo naranja)
  y sin fondo propio. Si no pasas `background` (Toast) o `superficie` (Loader), su fondo por defecto
  es `naranja-900`, un tono luminoso; si pasas otro, gana el tuyo.
- **Alert no admite `saludo` ni `onboarding`** (el tipo `AlertOptions` los excluye): son siempre Rumbo
  luminoso y necesitan un fondo de color, y el color de Alert no es configurable.
- Las escenas no hacen ciclo de voz (`espera-larga` no rota textos aunque cuelgue de `cargando`) y
  `rendimiento` nunca suena: el brandkit prohíbe sonorizar el rendimiento.
- El módulo de escenas (~90 KB) se carga con `import()` la primera vez que se usa una; quien no la
  usa no paga ese peso. Las "de estado" (`dormida`, `mantenimiento`…) deberían quedarse en su
  postura y las "de suceso" (`deposito`, `saludo`…) corren en bucle aquí.
- `rumboEscena(nombre, size?)` devuelve el `<img>` por si la quieres en tu propio HTML, y
  `escenasInfo` da nombre y descripción de cada una.

## Sonido y háptica

Opcional y **apagado por defecto** (sin `sonido`, o con `sonido: false`, no suena nada). Alert, Toast, `confirmar()`, `notificar()`, `attachTo()` y `mostrarMascota()` aceptan `sonido`:

```ts
import { configurarSonido, sonar, fireToast, notificar } from "@fondika/alert";

// una vez: dónde sirve tu app los .wav (copia node_modules/@fondika/alert/sonidos a tu carpeta pública)
configurarSonido({ baseUrl: "/sonidos/" });

fireToast({ estado: "exito", texto: "Listo.", sonido: true });          // suena el de su estado
notificar({ estado: "exito", titulo: "Depósito acreditado", sonido: "deposito" }); // o uno concreto
sonar("toque");                                                          // suelto, p. ej. el botón que mueve dinero
```

`sonido: true` usa `exito`→confirmado, `error`→falló, `alerta`→atención, `reposo`/`escuchando`→aviso;
`pensando`, `cargando` y `sin-conexion` no suenan (nada en bucle, eso lo dice Rumbo en pantalla).
Los otros cuatro (`marca`, `deposito`, `retiro`, `toque`) se piden por clave. Cada uno lleva su
vibración (`navigator.vibrate`). Reglas completas en `sonido-haptica.json` del brandkit: nunca
sonorizar rendimiento, y un sonido siempre acompaña algo ya visible.

## Los 8 estados y cuándo usar cada uno

| Estado | Para qué |
|---|---|
| `reposo` | Nada en curso — saludo, estado por defecto |
| `escuchando` | El usuario está dictando o el sistema espera una respuesta |
| `pensando` | Procesando una consulta corta |
| `cargando` | Una operación en curso (el que usan los Loader por defecto) |
| `exito` | Algo se completó |
| `error` | Algo falló |
| `alerta` | Requiere atención, no es una falla ("ten en cuenta...") |
| `sin-conexion` | No hay red |

`pensando` y `cargando` son especiales: si no les das `texto` ni `vozId`, el copy avanza solo
con el tiempo de espera (una línea inicial y dos más, a los ~4s y ~10s), tomado de la biblioteca
de voz de Rumbo.

## Mirada — los ojos de Rumbo siguen al puntero

Opt-in y **apagado por defecto**. `mirada: true` (último argumento) funciona en Toast, `confirmar()`, `notificar()`,
`loaderScreen`, `loaderTarget`, `loaderBoton`, `attachTo` y `mostrarMascota`:

```ts
fireToast({ estado: "exito", texto: "Listo", mirada: true });
```

Los ojos se desvían como máximo 3.4 unidades hacia el puntero (menos cuanto más cerca está), con un seguimiento suave;
nunca gira la cabeza. Con `prefers-reduced-motion` no hace nada. No existe en Alert ni en la lluvia de personajes, ni
afecta a las escenas (son imágenes). Para tus propios componentes: `const parar = seguirMirada(elemento)` y llama a
`parar()` al cerrarlos.

## Piezas sueltas — para armar tu propio componente

Todo lo que usan Alert, Toast y Modal por dentro también se exporta, por si quieres un componente propio con la
misma voz, el mismo color y el mismo personaje:

```ts
import { rumboSvg, resolverVozRumbo, iniciarCicloVoz, nivelDeEstado } from "@fondika/alert";

// Rumbo como string SVG, listo para `innerHTML` (tamaño en px, 44 por defecto; mínimo recomendado 28).
// `superficie` sólo importa sobre un fondo 900/700: ahí Rumbo pasa a su variante luminosa.
host.innerHTML = rumboSvg({ estado: "exito", size: 48 });

// Qué texto mostrar, con la prioridad de siempre: `texto` > `vozId` > nada (devuelve `null`).
resolverVozRumbo({ estado: "error", vozId: "sesion-vencida" });
resolverVozRumbo({ estado: "error" });                              // null: sin texto ni vozId no hay copy
resolverVozRumbo({ estado: "error", mostrarPorDefecto: true });      // la primera línea del estado

// Para `pensando`/`cargando`: el copy que avanza con la espera. Devuelve la función que lo detiene —
// llámala al cerrar tu componente, o los temporizadores siguen corriendo.
const detener = iniciarCicloVoz("cargando", (texto) => (p.textContent = texto));
// …al terminar:
detener();

// El nivel de color (`info` | `exito` | `alerta` | `error` | `neutro`) que le toca a un estado,
// por si quieres teñir tu componente igual que Alert/Toast. Acepta también las escenas.
nivelDeEstado("sin-conexion"); // "neutro"
```

`rumboSvg` devuelve markup: úsalo sólo con estados que tú controlas (como cualquier `innerHTML`).

## Ver todo en vivo

`index.html` (en la raíz del repo) tiene un control interactivo para cada módulo de esta guía — ábrelo
directo en el navegador, no necesita build. Es la forma más rápida de probar una combinación de
opciones antes de escribirla en código.
