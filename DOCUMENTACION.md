# Documentación técnica — @fondika/alert

> Este archivo es la **memoria de diseño**: por qué existe cada pieza, qué decisiones se
> tomaron y por qué, y el estado real del proyecto fase por fase. Para instalar y usar la
> librería, ver [README.md](README.md) — ese es el punto de entrada para consumirla, este es
> el punto de entrada para entenderla o modificarla. Qué cambió entre versiones, en
> [CHANGELOG.md](CHANGELOG.md).

Librería de alertas, toasts y modales de FÓNDIKA con el personaje **Rumbo** integrado como
opción visual y de voz. Vanilla TS, cero dependencias en runtime, siguiendo la arquitectura de
`ARQUITECTURA-UI-KIT.md` (4 presentadores, tokens, distribución por tag de Git).

**Estado:** Alert, Toast, Modal (Confirmar/Notificar), Loader (pantalla/target/botón), Attach y
Mascota implementados y probados en el playground — todo el catálogo funcional del UI-Kit
(fases 0-4). **Fase 5 (distribución real) validada vía Docker**: `npm install`, `npm run
typecheck` y `npm run build` corren limpio — ver detalle y los 2 bugs reales que se encontraron
y corrigieron más abajo.

## Por qué existe

Fondika ya tenía tres piezas sueltas en `Brand_kit_Fondika/`:
- una paleta de color tokenizada (`02-color-y-tipografia`),
- un componente de alertas de 4 niveles (`03-design-system/assets/componentes.html`),
- un personaje de producto con 8 estados y una biblioteca de voz de 33 líneas (`04-personaje`).

Este proyecto las une en una librería que cualquier equipo de Fondika puede instalar, sin
redibujar a Rumbo ni reinventar el color cada vez.

## Reglas de origen (no se re-discuten sin evidencia nueva)

1. **Sólo los 18 colores de la "Paleta de color" (§02).** Nada de `naranja-deep-*` ni el
   degradado de marca (eso vive en §04 del brandkit y es decisión de campaña, no de producto).
   Ver `src/core/tokens.css`.
2. **Rumbo sustituye al icono, nunca coexisten** dentro de una alerta — dos señales de estado
   compitiendo es ruido (crítica de diseño de esta sesión). `personaje: true` decide cuál de
   los dos se muestra.
3. **Rumbo luminoso**: sobre fondos en los tonos 900/700 (los más oscuros/saturados) de naranja,
   turquesa o gris, el cuerpo naranja de Rumbo es ilegible — se usa la variante `luminoso`
   (cuerpo blanco + capas de degradado naranja detrás). En tonos 500/300/100 y en blanco se usa
   la variante `color` normal. Lógica en `src/rumbo/variante.ts`.
4. **Prioridad de texto en cualquier componente que use a Rumbo**: `texto` libre > `vozId` de la
   biblioteca > nada (sólo se ve el tipo de alerta, sin copy). El **estado** de Rumbo siempre es
   obligatorio — define la postura visual aunque no haya texto. Lógica en `src/rumbo/voz.ts`.
5. **`pensando` y `cargando` son cíclicos**: si no se da texto ni vozId, el copy avanza solo con
   el tiempo de espera (línea inicial + 2 subtipos, a los ~4s y ~10s) — biblioteca completa en
   `src/rumbo/voz-rumbo.json`.
6. **La barra izquierda de 4px es exclusiva de Alert** (`fdk-alert--barra` en `alert.css`). Toast
   nunca la lleva — es un aviso flotante limpio, sin ese acento.
7. **`background` (sólo en Toast) tiñe el propio componente, nunca la capa que lo contiene.** Es
   un token de la paleta de 18 colores (`RumboSuperficie`); por defecto usa el color del nivel.
   Si el tono es oscuro/saturado, el texto pasa a blanco y Rumbo cambia a luminoso automáticamente
   — mismo criterio que la regla 3. Ver `src/core/color.ts`. **Alert no tiene este parámetro**:
   su color siempre es fijo, ver regla 9.
8. **Alert siempre flota fija en la esquina superior derecha** (capa `top-end`, la misma grilla
   de posiciones que usa Toast) — nunca se inserta inline en el flujo de la página.
9. **El color de Alert no es configurable.** Usa siempre los colores literales de
   `Brand_kit_Fondika/03-design-system/assets/componentes.html` (§ALERTAS), vía la clasificación
   fija de estado → nivel en `alert/nivel.ts`:
   - **Información** → `reposo`, `escuchando`, `pensando`, `cargando`
   - **Listo** → `exito`
   - **Alerta** ("Ten en cuenta") → `alerta`
   - **Error** ("No se pudo completar") → `error`
   - `sin-conexion` usa el tratamiento `neutro` por defecto (no está en componentes.html)

   El borde de `alerta` es una excepción documentada a la regla 1: usa `#ca5610` (`deep-700`),
   literal en `tokens.css`, porque así está en componentes.html — ese tono no vive en la paleta
   de 18 y no se usa en ningún otro lugar de la librería.
10. **Modal sólo tiene dos tipos** (regla del brief): `confirmar()` (dos botones, resuelve
    `{ isConfirmed: boolean }`, textos por defecto "Cancelar"/"Aceptar") y `notificar()` (un solo
    botón "OK", sólo para avisar). El motor interno (`abrirModal`, en `modal/modal.ts`) no se
    expone en la API pública — no existe un tercer modal de acciones libres. Ambos requieren
    `estado` de Rumbo, igual que Alert/Toast.
11. **Ni Confirm ni Notificación se cierran solos** (`cerrable: false` fijo en ambos, sin
    excepción): sin X, sin Esc, sin click en el backdrop. La única salida es presionar uno de
    sus botones — así el sistema siempre sabe qué decisión tomó el usuario, nunca "se cerró".
12. **`superficie` en Loader (pantalla/target) pinta un halo de luz LOCALIZADO alrededor de
    Rumbo, en dos capas** (`core/color.ts#degradadoDeToken`): encima, una **elipse horizontal**
    (más ancha que alta, como luz real, no un círculo de UI) que va del color resaltado en el
    centro a **transparente** hacia afuera — se pierde en la capa de abajo en vez de terminar en
    un borde duro (antes se notaba "el círculo" con un corte visible a los 30%). Abajo, el color
    plano del token. Mismo criterio que la regla 7, pero aplicado al fondo que el propio Loader
    crea (a diferencia de Attach, que se inyecta dentro de un host ya existente y no tiñe nada
    por sí mismo — el playground tiñe el card del demo sólo para que se vea, y centra a Rumbo con
    una columna de grid dedicada en vez de empujarlo con `margin-left:auto`).
13. **`Loader.screen`/`Loader.target` aceptan `estado`** (por defecto `"cargando"`) — no están
    forzados a ese estado; un loader puede quedarse fijo mostrando `error` o `exito`, por ejemplo.
14. **Rumbo siempre lleva `position: relative; z-index: 1`** (`rumbo/rumbo.css`), y **ningún
    contenedor de Rumbo usa `overflow: hidden`** — sus animaciones (`salta`, `flota`, `sube`,
    `respira`) mueven partes del personaje (típicamente Vida, arriba) fuera de su propia caja
    con `transform`; sin estas dos reglas, un hermano en el flujo normal puede pintarse encima y
    tapar justo esa parte, o el contenedor puede recortarla. `Toast` tenía `overflow: hidden`
    heredado de un supuesto de diseño que nunca hizo falta — se quitó.
15. **`.fdk-overlay__media` centra con `display:flex; justify-content:center`, nunca con
    `text-align:center`.** Rumbo es un `<svg>` `display:block`; `text-align` sólo centra
    contenido inline, así que sobre un hijo de bloque no hace nada. El bug real: ese div, sin
    ancho propio, se estira al 100% del contenedor (los bloques ocupan el ancho disponible por
    defecto) cuando el texto de al lado es más ancho que Rumbo — y Rumbo, pegado a la izquierda
    dentro de ese div ancho, se ve descentrado aunque el div en sí esté bien centrado por el
    `.fdk-overlay` de afuera. `flex` + `justify-content:center` centra al hijo real,
    independientemente del ancho del contenedor.
16. **Mascota es Floating pero NUNCA comparte contenedor con Toast**, aunque usen la misma
    posición (ej. `bottom-end`): `getLayer()` ahora incluye el z-index en su clave de caché
    (`core/layer.ts`), así Toast (`zIndex.floating`, 9100) y Mascota (`zIndex.mascot`, 9150)
    tienen cada uno su propia capa — si compartieran una, su orden de apilado dependería del
    orden del DOM en vez del z-index reservado en `zstack.ts`. Sólo una mascota por posición:
    `mostrarMascota()` de nuevo actualiza la existente (`actualizar()`), no apila una segunda.
17. **La burbuja de la Mascota tiene un triángulo (`::after`) que apunta hacia Rumbo**, nunca
    hacia abajo — a diferencia de una burbuja de chat clásica, la Mascota es una fila horizontal
    (burbuja + personaje), así que el triángulo sale del borde de la burbuja más cercano al
    personaje. En posiciones "end" (Rumbo a la derecha) sale por la derecha; en "start" (Rumbo a
    la izquierda) se espejea automáticamente vía el mismo selector `.fdk-layer--*-start` que ya
    invierte el `flex-direction`. El personaje (`<button>`) no tiene hover — es un personaje
    flotante, no una acción; la regla explícita también blinda contra un `button:hover` genérico
    del proyecto anfitrión.
18. **El triángulo lleva `filter: drop-shadow`, no sólo color.** Un triángulo hecho con el truco
    del borde CSS es blanco (igual que la burbuja) — sobre una página con fondo también blanco es
    literalmente invisible sin una sombra propia que lo separe visualmente. `box-shadow` no sirve
    aquí porque sigue la caja rectangular del elemento, no la silueta triangular; `drop-shadow` sí
    seguía la forma real. El ancho del triángulo es `--fdk-sp-2` (el mismo valor que el `gap` de
    la fila), para que la punta llegue exactamente hasta el personaje sin quedar corta.

## Estructura

```
src/
├── core/       tokens.css (paleta de 18 colores), color.ts (token → background + contraste),
│               zstack.ts, layer.ts/.css (grilla 3×3), anim.ts (animationend + timeout de
│               respaldo), styles.ts (inyección en runtime)
├── rumbo/      rumbo.ts (SVG por estado), variante.ts (color/luminoso), voz.ts + voz-rumbo.json
├── alert/      alert.ts (Floating, persistente, fija en top-end, con barra izquierda),
│               nivel.ts (estado → nivel de alerta), iconos.ts
├── toast/      toast.ts (Floating, efímero: fire() → Promise<void>, timer + pausa en hover,
│               sin barra izquierda)
├── modal/      modal.ts (motor Popup interno: abrirModal(), cola de popups — NO exportado
│               públicamente), confirmar.ts y notificar.ts (los únicos dos tipos públicos)
├── loader/     loader.ts (Overlay, persistente: loaderScreen()/loaderTarget() con refcount —
│               3 llamadas paralelas, 1 sola pantalla), boton.ts (Inline: loaderBoton())
├── attach/     attach.ts (Inline, persistente: attachTo() — monta contenido libre o a Rumbo
│               directamente dentro de un elemento, ej. un icono de estado en un botón)
├── mascota/    mascota.ts (Floating, persistente: mostrarMascota()/actualizar()/ocultar()/
│               cerrar() — Rumbo suelto en una esquina, fuera de cualquier aviso; burbuja de
│               voz opcional)
└── index.ts
playground/
└── index.html  demo funcional SIN build — ábrelo directo en el navegador (Alert, Toast,
                 Modal, Loader, Attach y Mascota, con controles para probar cada uno)
```

## Cómo probarlo hoy (sin Node instalado)

Este entorno no tiene Node/npm. `playground/index.html` es una reimplementación en JS plano de
la misma lógica de `src/`, pensada para verse funcionando sin paso de build. Ábrelo directo en
el navegador.

## Cómo compilar la librería real

Este entorno no tiene Node instalado, pero sí Docker — la fase 5 se validó corriendo Node 20
dentro de un contenedor, sin tocar el sistema:

```bash
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine npm install
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine npm run typecheck
docker run --rm -v "$(pwd)":/app -w /app node:20-alpine npm run build
```

(En Git Bash de Windows hace falta `MSYS_NO_PATHCONV=1` antes de `docker run`, si no, monta mal
la ruta del volumen.) Con Node instalado directamente, es sólo `npm install && npm run build`.

### Fase 5 — validada, 2 bugs reales encontrados y corregidos

La primera corrida de `npm run typecheck` **falló** con 3 errores de tipos reales en
`alert.ts`, `toast.ts` y `modal.ts` — nunca se habían visto porque todo lo probado antes fue la
reimplementación en JS plano del playground, no `src/` compilando de verdad:

- **TS2345** en los tres: `iniciarCicloVoz()` exige el tipo literal `"pensando" | "cargando"`,
  pero el código llamaba con `options.estado` (tipo `RumboEstado`) dentro de un `if` que
  comprobaba una variable booleana derivada (`esCiclico`) en vez de comparar `options.estado`
  directamente. TypeScript no propaga el estrechamiento de tipo (*narrowing*) a través de un
  booleano intermedio cuando la expresión es un acceso a propiedad (`options.estado`) — sólo lo
  hace con variables locales simples. `loader.ts` ya evitaba el problema porque destructuraba
  `estado` a una constante local antes del `if`; se aplicó el mismo patrón en los otros tres.
- **`package.json` prometía un subpath `"./styles.css"` que `tsup` nunca genera** — la librería
  inyecta CSS en runtime (ADR-005), nunca emite una hoja de estilos aparte, así que ese export
  apuntaba a un archivo que no existe. Se quitó del `exports` map.

Después de esas dos correcciones: `npm run typecheck` limpio, `npm run build` genera los 8
entry points (`index`, `alert`, `toast`, `modal`, `loader`, `attach`, `mascota`, `rumbo`) en ESM
+ `.d.ts`. Prueba de humo adicional: se importó cada `dist/*.js` en Node puro (sin DOM) y no
truena — confirma en la práctica el invariante de SSR (#12: nada de `document`/`window` en el
nivel superior de un módulo). También se confirmó que `dist/modal.js` no exporta `abrirModal`
(regla 10: sólo `confirmar`/`notificar` son públicos).

## Fase 6 — Adopción

- ✅ `playground/index.html` — demo interactiva sin build.
- ✅ `README.md` de recetas (un ejemplo de código real por módulo, no sólo referencia).
- ✅ `CHANGELOG.md` — primera entrada (`0.1.0`) con todo lo construido hasta ahora. A partir de
  aquí, todo cambio real (no cosmético) debería sumar una entrada, no reescribir la anterior.
- ❌ Criterio de terminado real de esta fase (según `ARQUITECTURA-UI-KIT.md`): *"un desarrollador
  ajeno al proyecto implementa un toast y un loader sin abrir el código fuente"* — nunca se
  probó con nadie fuera de esta sesión. El README nuevo apunta a eso, pero no está validado.

## Pendiente

- Mapeo formal de qué estados de Rumbo aplican a cada módulo: `pensando`/`cargando`/`escuchando`
  son estados de proceso (Toast/Loader), no de alerta — hoy `Alert` los acepta todos por
  flexibilidad, pero la guía de uso final debe restringirlo.
- `sin-conexion` no tiene nivel de alerta en el brandkit original; se resolvió como `neutro`
  (gris) dentro de la paleta de 18 — validar con marca si ese es el tratamiento correcto.
- Namespace y nombre de paquete (`@fondika/alert`) son marcadores de posición — fijar antes de
  publicar (ver Q1 de `ARQUITECTURA-UI-KIT.md`, aplica igual aquí).
- Generar un `dist/styles.css` real para quien prefiera `<link>` manual en vez de inyección en
  runtime (era la intención original de ADR-005, nunca implementada) — o formalizar que la
  inyección en runtime es la única vía y quitar la mención de esa alternativa del ADR.
