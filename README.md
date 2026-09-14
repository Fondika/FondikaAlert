# @fondika/alert

Alertas, toasts, modales, loaders y una mascota flotante — todo usando a **Rumbo**, el personaje
de producto de FÓNDIKA, en vez de iconos genéricos. Vanilla TS, cero dependencias en runtime.

> ¿Buscas por qué está hecho así, las decisiones de diseño o el estado interno del proyecto?
> Eso vive en [DOCUMENTACION.md](DOCUMENTACION.md). Este archivo es sólo para usar la librería.
> Qué cambió entre versiones: [CHANGELOG.md](CHANGELOG.md).

## Instalación

```bash
npm install "@fondika/alert@git+https://github.com/tu-org/fondika-alert.git#semver:^0.1.0"
```

No hay que importar ningún CSS aparte: cada función inyecta sus propios estilos en el
`<head>` la primera vez que se llama (idempotente, con guardia de SSR).

## Lo único que hay que saber antes de empezar

- **`estado` es obligatorio** en Alert, Toast, Modal, Loader y Mascota — es uno de los 8 estados
  de Rumbo (`"reposo"`, `"escuchando"`, `"pensando"`, `"cargando"`, `"exito"`, `"error"`,
  `"alerta"`, `"sin-conexion"`). Define la postura visual de Rumbo aunque no le pongas texto.
- **Prioridad de texto:** `texto` libre > `vozId` (biblioteca de voz de Rumbo) > nada. Sin
  ninguno de los dos, sólo se ve el tipo de aviso, sin copy.
- **`superficie`** (Toast, Loader, Attach, Mascota) es opcional y sólo importa si vas a montar el
  componente sobre un fondo oscuro/saturado propio (ej. un naranja-900) — Rumbo pasa a su
  variante blanca ("luminosa") automáticamente. Sin `superficie`, Rumbo se ve en su color normal.

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

## Toast

Efímero: se autocierra con timer, se pausa al pasar el mouse. A diferencia de Alert, sí admite
`background` para teñirse de cualquier color de la paleta.

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
timer o porque lo cerraron a mano) — útil para encadenar algo después.

| Opción | Tipo | Default |
|---|---|---|
| `estado` | `RumboEstado` | — (obligatorio) |
| `titulo` / `texto` / `vozId` | `string` | — |
| `personaje` | `boolean` | `true` |
| `background` | `RumboSuperficie` | color del nivel |
| `posicion` | `Position` | `"top-end"` |
| `timer` | `number` (ms) | `4000` |

## Modal — sólo dos tipos

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
`{ contenido: "<span>texto</span>" }`.

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

## Ver todo en vivo

`playground/index.html` tiene un control interactivo para cada módulo de esta guía — ábrelo
directo en el navegador, no necesita build. Es la forma más rápida de probar una combinación de
opciones antes de escribirla en código.
