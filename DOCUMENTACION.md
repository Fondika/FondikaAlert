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
4. **El texto de cualquier componente que use a Rumbo sale sólo de `texto`** (antes: `texto` > `vozId` de la
   biblioteca > nada; `vozId` se eliminó, ver regla 45). Sin texto no hay copy (sólo se ve el tipo de alerta). El **estado** de Rumbo siempre es
   obligatorio — define la postura visual aunque no haya texto. No hay biblioteca de voz (se eliminó con `vozId`, regla 48).
5. **Ningún estado trae copy propio**: ni siquiera `pensando` y `cargando` (antes avanzaban solos con la biblioteca de voz; regla 48).
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
    seguía la forma real.

    **El triángulo tiene que sobresalir de la burbuja, no quedar a ras.** Con una caja 0×0 y
    borde de `--fdk-sp-2` (8px) a los 4 lados, el color puesto sólo en `border-left-color` (o
    `border-right-color`, espejado) dibuja un triángulo cuya base vive en el CENTRO de esa caja
    y cuya punta llega al borde opuesto — así que un offset de `right: calc(--fdk-sp-2 * -1)`
    deja la base escondida por dentro de la burbuja y la punta apenas tocando su borde (nada se
    ve sobresaliendo). El offset correcto es el doble: `right: calc(--fdk-sp-2 * -2)` (y su
    espejo `left: calc(--fdk-sp-2 * -2)` en posiciones "start") — recorre la caja completa un
    `sp-2` más, de modo que la BASE queda a ras del borde de la burbuja y la PUNTA sobresale
    `sp-2` (8px) hacia afuera, hacia el personaje. Así se lee como una pieza física que de verdad
    sale de la burbuja, en vez de un borde decorativo pegado a ella.
19. **Rumbo en Alert/Toast: 46.2px (44px + 5%), con 8.5px de respiro arriba/abajo.** El `padding-
    block` de `.fdk-alert` (antes `0`, sólo llevaba `padding-inline-start`) es un valor fijo en px
    — no `%` real — porque `.fdk-alert` vive dentro de `.fdk-layer`, cuyo ancho es auto/shrink-to-
    fit: un padding porcentual ahí resuelve contra un ancho indefinido y colapsa el layout (bug
    real, encontrado al probarlo). 8.5px es igualmente "2.5% de los 340px de `.fdk-alert--
    flotante`", sólo que precalculado a mano.
20. **`.fdk-alert--sombra`: fondo blanco + sombra de color, en vez de relleno plano.** Cuando Rumbo
    reemplaza al icono, un fondo tintado detrás de Rumbo compite visualmente con el propio
    personaje — se quita el tinte, queda `--fdk-surface` (blanco) y el color del nivel pasa a vivir
    como `box-shadow` (vía `color-mix()` contra `--fdk-alert-border`). El texto no cambia: sigue en
    `--fdk-ink` (gris-900), que ya era el color por defecto de `.fdk-alert`. Dos usos:
    - **Alert**: sólo cuando `personaje: true` (regla 2) — sin Rumbo, el icono sigue sobre el
      fondo tintado normal.
    - **Toast**: es el fondo **por defecto** (sin `background` explícito), reemplazando el tinte
      plano del nivel que tenía antes. Única excepción: `sin-conexion` conserva su fondo gris de
      siempre — no tiene nivel de color propio que mostrar como sombra.

    Consecuencia directa sobre la regla 7: `background` en Toast ahora sólo admite los 8 tonos
    900/700 (sólidos/oscuros) de la paleta de 18 — los tonos claros no se ofrecen porque no dan
    contraste suficiente contra el texto blanco que activan. Además, en los estados donde Vida (y,
    en `escuchando`/`pensando`/`cargando`, también sus acentos) son turquesa —
    `reposo`/`escuchando`/`pensando`/`cargando`/`exito` — `turquesa-900`/`turquesa-700` quedan
    excluidos del todo: una parte de Rumbo se pierde visualmente contra ese fondo. `sin-conexion`
    no tiene esta restricción (no usa Rumbo en su forma habitual, y conserva su propio fondo).
21. **El Modal NO tiene una forma base cuadrada — el objetivo siempre fue reducir el espacio en
    blanco, no forzar una proporción.** Una iteración anterior fijó `min-height: 420px` (= `width`)
    para lograr esa reducción, pero el efecto fue el contrario en contenido corto: agrandaba la
    tarjeta con alto artificial en vez de recortar el que ya sobraba. Se revirtió: `.fdk-modal` ya
    no tiene `min-height` ni `justify-content: center` — el alto es sólo el que pide el contenido
    real. El espacio en blanco se reduce directamente bajando el padding, de
    `var(--fdk-sp-6) var(--fdk-sp-5) var(--fdk-sp-5)` (32px/24px/24px) a
    `var(--fdk-sp-5) var(--fdk-sp-4) var(--fdk-sp-4)` (24px/16px/16px). Rumbo mantiene el 96px →
    110px (+15%) de la iteración anterior, que sigue vigente.
22. **El gap entre botones de `.fdk-modal__acciones` sube un 10%** (`var(--fdk-sp-3)` = 12px →
    13.2px, valor fijo en vez de token). Sólo se nota visualmente en `confirmar()` — `notificar()`
    tiene un único botón, así que el gap no tiene con qué separar nada ahí.
23. **Sonido: opt-in, sin audio empaquetado en JS, y sin sonido donde el brandkit lo prohíbe.**
    Los 8 WAV (`sonidos/`, copia de `03-design-system/assets/sonido/`) no se incrustan en `dist/`
    (~230 KB en base64): el consumidor los sirve y llama `configurarSonido({ baseUrl })`. Mapa
    estado→sonido en `sonido/sonido.ts`: exito/error/alerta tienen el suyo, reposo/escuchando usan
    `aviso`; `pensando`, `cargando` y `sin-conexion` no suenan (regla "nada en bucle"). `marca`,
    `deposito`, `retiro` y `toque` no son de un estado, así que sólo salen por clave
    (`sonido: "deposito"` o `sonar("toque")`). Háptica = patrones web de `sonido-haptica.json`,
    siempre junto al sonido. El silencio del sistema lo respeta el propio `Audio` del navegador; un
    autoplay bloqueado se ignora sin error.
24. **Las escenas de Rumbo SON estados (`RumboEstadoExtendido`), sin duplicar los que ya existen.**
    Decisión explícita del equipo, que se aparta de la regla 8 del brandkit ("no inventes estados
    nuevos"). 15 escenas se suman a los 8 base; `error`, `offline`, `procesando`, `perfilamiento` y
    `documento` se descartan porque repiten `error`, `sin-conexion`, `cargando`, `escuchando` y
    `alerta` — **el nombre existente tiene prioridad**. Los nombres
    compuestos pasan a kebab-case como `sin-conexion` (`esperaLarga` → `espera-larga`,
    `ordenManana` → `orden-manana`); el archivo del brandkit conserva el suyo. Cada escena cuelga de
    un estado base (`rumbo/estados.ts`, mapeo propio, no del brandkit) y de él hereda nivel de color
    (`nivelDeEstado`), voz y sonido: `baseDe(estado)`. `rumboSvg` dibuja el Rumbo base; Modal,
    Mascota, Attach, Alert y Toast dibujan la escena (`escenaDe(estado)`; en Alert/Toast a 80px con
    `.fdk-alert__rumbo--escena`, porque a los 46px del Rumbo normal no se lee, y en Alert un
    estado-escena implica `personaje`); Loader (28–96px) dibuja el Rumbo base. El ciclo
    de voz mira el estado crudo, así que `espera-larga`/`orden-manana` NO rotan textos. `rendimiento`
    nunca suena (brandkit). Se sirven como `<img src="data:image/svg+xml…">`, no SVG en línea: cada
    escena trae un `<style>` global (`[data-p]`) y dos juntas se pisarían. `saludo` y
    `onboarding` no existen en Alert (`AlertOptions.estado` los excluye con
    `EstadoSiempreLuminoso`): necesitan un fondo de color y Alert no lo tiene configurable (regla 9).
    Son siempre Rumbo luminoso (y su fondo por defecto, en Toast y Loader, es
    `naranja-900` —un tono clasificado como luminoso— en vez del fondo del nivel; un `background`/
    `superficie` explícito siempre gana): el brandkit los trae sobre un fondo degradado naranja a
    pantalla completa; aquí se les quita ese fondo y se reemplaza por el halo naranja del luminoso
    (mismos valores que `capasLuminoso`), porque con el cuerpo blanco y sin halo se perderían sobre
    una superficie blanca. Datos en
    `src/escenas/datos.ts`, generados con `scripts/gen-escenas.py` — no se editan a mano; su tipo
    `Record<EscenaEstado, …>` obliga a que la lista de `estados.ts` y los datos coincidan.
25. **Compatibilidad al actualizar: nada obligatorio, nada que cambie de significado.** `RumboEstado`
    sigue siendo los 8 originales (quien tiene un `Record<RumboEstado, …>` no se rompe); las
    opciones aceptan la unión ampliada `RumboEstadoExtendido`. `sonido` va AL FINAL de cada
    interfaz de opciones y apagado por defecto. Las escenas se cargan con `import("./escenas")`
    desde `escenas/pintar.ts` — no estático — para que los ~90 KB no entren al bundle de
    Modal/Mascota/Attach de quien no las usa (verificado en `dist/`: `modal.js`, `attach.js` y
    `mascota.js` pesan <400 B y no importan el chunk de escenas).
    En el playground/Artifact no hay un apartado de escenas aparte: las 15 van dentro del select
    "Estado de Rumbo" de cada sección (Alert, Toast, Confirmar, Notificar, Loader, Attach, Mascota),
    como opciones planas (sin `<optgroup>`: todos son estados de Rumbo) debajo de los 8 de siempre,
    que no se tocaron (ni valor ni texto). La etiqueta de cada nueva es solo su nombre en código
    (`deposito`, `espera-larga`…), sin descripción.
    En los demos de "togglear" (Loader.screen, Loader.target, Attach) cambiar el estado o el
    background con el componente ya activo lo repinta en vivo; es solo del playground — los
    `Handle` de la librería (`LoaderHandle`, `AttachHandle`) no tienen `actualizar()`: para cambiar
    de estado se cierra y se vuelve a abrir.
    Cada sección que implementa `sonido` (todas menos Loader) lo expone como un checkbox propio, el
    último campo del formulario, apagado por defecto.
26. **Lluvia de personajes: un módulo independiente cuyas piezas se reemplazan sin tocar a las demás.**
    `src/lluvia/` no importa Alert, Toast, Modal, Loader, Attach ni Mascota (verificado con el metafile de
    esbuild: solo arrastra `lluvia/`, `personajes/` y `core/` — estilos, `animar`, z-index — más el dibujo de
    Rumbo para el personaje por defecto). Responsabilidades separadas: `opciones.ts` (defaults y validación),
    `efectos.ts` (registro de efectos), `efectos-base.ts` (los 6 efectos), `capa.ts` (DOM) y `lluvia.ts`
    (ciclo de vida). Cada efecto es una **estrategia** con el mismo
    contrato (`EfectoLluvia`: `id`, `nombre`, `clase`, `css?`, `particula(ctx)`), así que agregar uno es
    `registrarEfecto()`; el motor solo conoce esa interfaz. El **registro de personajes** vive en
    `personajes/` (no dentro de la lluvia) para que lo reutilicen los demás componentes sin duplicarlo.

    Decisiones de implementación (cada una con su porqué):
    - **CSS, no JS por cuadro.** Cada partícula es un nodo con un `@keyframes` y variables CSS (`--xp`,
      `--k`, `--dur`…) que sortea `particula()`. Solo se animan `transform` y `opacity`; el tamaño sale de
      `scale(tamaño / 64)` (nunca de width/height) y la posición del centro se calcula en CSS. Lo que se
      escribe por JS son solo variables CSS, y solo cuando una partícula reaparece fuera de la vista.
    - **Unidades de contenedor (`cqw`/`cqh`).** La capa es `container-type: size`, así que los `@keyframes`
      miden en "ancho/alto de la capa": la lluvia se adapta sola al redimensionar la ventana, y la misma
      CSS sirve para la capa de pantalla completa y para la lluvia dentro de un `host` más chico.
    - **Reciclado.** Los nodos se crean una vez; en `animationiteration` (la partícula está arriba, fuera de
      la vista) se vuelven a sortear posición, fase y amplitud. **Tamaño y velocidad son la "identidad" de
      cada personaje y no cambian:** cambiar la duración de una animación en marcha la re-ubicaría a medias.
      Si la ventana cambió de alto y la duración debe cambiar, se reinicia la animación en ese momento
      (la única lectura de layout, `offsetWidth`, ocurre solo ahí).
    - **Duración finita.** `duracionMs` es el tiempo durante el que siguen apareciendo personajes: al
      cumplirse, los que no habían arrancado se apagan y los que caen terminan su caída; al apagarse el
      último, `terminada` resuelve `"completa"` y se libera todo. `detener()` desvanece la capa con el
      `animar()` de la librería (250 ms; `{ inmediato: true }` la quita ya) y es idempotente.
    - **Movimiento reducido.** Se lee en cada inicio (no se cachea). Sin caída: hasta 12 personajes quietos
      con un fundido (`fdk-lluvia--quieta`), que duran como máximo 2,5 s o hasta `detener()` si es continua.
    - **z-index.** `zIndex.lluvia` (9250): sobre el contenido y los popups, bajo el loader de pantalla.
    - **Sin panel visual.** Los parámetros (personaje, efecto, cantidad, duración, rangos…) se pasan por código a
      `iniciarLluvia()`: la librería no incluye ninguna interfaz para configurarlos, porque en la aplicación final
      no se configura de forma visual en pantalla. Una versión anterior traía `abrirPanelLluvia()` (personaje y efecto
      con vista previa); se eliminó. El playground arma la misma llamada con listas desplegables solo para probarla
      (muestra el código resultante antes de invocarla).
    - **Sin carrete.** Una versión anterior de esta tarea pidió un selector tipo tragamonedas
      (carrete de personajes que frena en el elegido); se descartó al corregirse el pedido y su código no
      está en el repo.
    - **Pruebas.** El repo no tenía convención de pruebas (ni runner ni carpeta), así que se estableció una
      mínima: `npm test` compila los módulos que prueba (ver `tsup.test.config.ts`) y corre `tests/*.test.mjs` con
      `node --test` (sin dependencias nuevas). Cubren la lógica pura (registros, validación de opciones y el contrato de
      cada efecto), los contadores de referencias del Loader, y —con un DOM falso mínimo en `tests/dom-falso.mjs`
      (eventos, foco, selectores simples; no hay jsdom y no se agregó)— Toast (validación, tope con cola, pausa por
      foco), Modal (cola, `cerrarModal`, huérfano, tope, nombre accesible), Attach (texto vs HTML), Alert (roles) y la
      inyección de estilos. Si un test puede dejar un temporizador vivo al fallar, lo limpia en `finally`: si no, una
      aserción fallida cuelga todo el proceso. El comportamiento con DOM (capa a pantalla completa, caída, reciclado,
      detener, reduced-motion, redimensionado) se verificó en el navegador y **no está automatizado
      en el repo**.
    - **Demo.** En el playground/Artifact se incrusta el bundle real (`npx esbuild src/lluvia/index.ts
      --bundle --minify --format=iife --global-name=FdkLluvia --loader:.css=text`) entre los marcadores
      `/*lluvia:inicio*/` y `/*lluvia:fin*/`, en lugar de reimplementar la lógica: no hay dos copias que
      se desincronicen. Si cambia `src/lluvia/`, hay que volver a incrustarlo.

## Estructura

```
src/
├── core/       tokens.css (paleta de 18 colores), color.ts (token → background + contraste),
│               zstack.ts, layer.ts/.css (grilla 3×3), anim.ts (animationend + timeout de
│               respaldo), styles.ts (inyección en runtime)
├── rumbo/      rumbo.ts (SVG por estado), variante.ts (color/luminoso)
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
index.html      demo funcional SIN build — ábrelo directo en el navegador (Alert, Toast, Modal, Loader,
                Attach, Mascota y Lluvia, con controles para probar cada uno). Es lo único que se sube.
playground/     (en .gitignore) showcase.html: la copia de trabajo que se publica como Artifact
```

## Cómo probarlo hoy (sin Node instalado)

Este entorno no tiene Node/npm. `index.html` (raíz) es una reimplementación en JS plano de
la misma lógica de `src/`, pensada para verse funcionando sin paso de build. Ábrelo directo en
el navegador.

## Cómo compilar la librería real

Este entorno no tiene Node instalado, pero sí Docker — el proyecto se desarrolla y se valida
con **Node.js 24.22.1** (LTS; la versión mínima, ya parcheada contra la vulnerabilidad del decodificador Brotli)
dentro de un contenedor, sin tocar el sistema:

```bash
docker run --rm -v "$(pwd)":/app -w /app node:24.22.1-alpine npm install
docker run --rm -v "$(pwd)":/app -w /app node:24.22.1-alpine npm run typecheck
docker run --rm -v "$(pwd)":/app -w /app node:24.22.1-alpine npm test
docker run --rm -v "$(pwd)":/app -w /app node:24.22.1-alpine npm run build
```

(En Git Bash de Windows hace falta `MSYS_NO_PATHCONV=1` antes de `docker run`, si no, monta mal
la ruta del volumen.) Con Node instalado directamente, es sólo `npm install && npm run build` (`.nvmrc` fija 24.22.1).

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

- ✅ `index.html` (raíz) — demo interactiva sin build.
- ✅ `README.md` de recetas (un ejemplo de código real por módulo, no sólo referencia).
- ✅ `CHANGELOG.md` — primera entrada (`0.1.0`) con todo lo construido hasta ahora. A partir de
  aquí, todo cambio real (no cosmético) debería sumar una entrada, no reescribir la anterior.
- ❌ Criterio de terminado real de esta fase (según `ARQUITECTURA-UI-KIT.md`): *"un desarrollador
  ajeno al proyecto implementa un toast y un loader sin abrir el código fuente"* — nunca se
  probó con nadie fuera de esta sesión. El README nuevo apunta a eso, pero no está validado.

27. **Entradas de usuario nunca son HTML por defecto; los bloqueos no dependen de que la UI siga en el DOM.**
    (a) `attachTo({ contenido: string })` inserta texto; el HTML exige `html: true` (opción explícita, última).
    (b) `Loader.screen` pone `inert` al resto del `<body>` salvo lo de la librería (clase `fdk-…`), porque el
    overlay no puede ser hijo de un elemento `inert`; `Loader.target` ya lo hacía sobre su host.
    (c) La cola del Modal detecta un modal huérfano (`!backdrop.isConnected`) y lo cierra antes de encolar otro,
    y `cerrarModal()` permite cerrarlo por código. Se descartó una API de handle por modal: `confirmar`/`notificar`
    devuelven promesas (ADR-006) y la cola sigue siendo interna.

28. **Accesibilidad de Toast y Modal.** El auto-cierre del Toast se pausa con puntero o foco (dos banderas,
    `sobre` y `foco`; `armar()` es idempotente para no duplicar temporizadores). El Modal siempre tiene nombre
    accesible: `aria-labelledby` si hay título; si no, `aria-label` = texto o "Aviso". Alert **no** necesita su propio
    `prefers-reduced-motion`: `alert.css` no define animaciones ni transiciones; el movimiento que aparece dentro de un
    Alert/Toast es de Rumbo (`rumbo.css`: `.fdk-rumbo * { animation: none }`) y de las escenas (cada SVG trae su media
    query), y la entrada/salida del Toast tiene la suya en `toast.css`. Añadir una regla vacía en `alert.css` sería ruido.

29. **Validación en el borde público, una sola vez y antes de tocar nada.** `core/validar.ts`
    (`exigirElemento`, `validarPosicion`, `validarMs`) y `validarEstado` (en `rumbo/estados.ts`, que es dueño de la
    lista de estados) se llaman en la primera línea de cada función pública. Lanzan síncronamente —igual que
    `lluvia/opciones.ts`—, no rechazan una promesa: es un error de programación, no un fallo de ejecución. Se
    verifica el elemento con `nodeType === 1` y no con `instanceof HTMLElement` (un nodo de otro iframe no es
    instancia de esta ventana). `Record<RumboEstado, true>` obliga al compilador a mantener la lista de los 8 al día.
    No se valida más allá del borde (tamaños, textos): el costo de código no compensa lo que evita.
30. **`package.json` sirve a los tres modos de resolución de TypeScript.** `exports` para node16/bundler;
    `main`/`module`/`types` para la raíz y `typesVersions` para cada subruta en `node10`, que ignora `exports`.
    Al agregar un subpath nuevo en `exports`, agrégalo también en `typesVersions` y en `tsup.config.ts`.

31. **`package.json` lleva la versión del próximo release, no la del último.** Estaba en `0.1.0` mientras los tags
    iban por `v1.1.1`. Ahora dice `1.2.0` (decisión del dueño del repo, aun con dos cambios de comportamiento: Attach
    trata strings como texto y un `timer` negativo lanza). Pasos del release, siguiendo ADR-007: pasar `[Unreleased]`
    del CHANGELOG a `[1.2.0] — fecha`, `npm run build`, `git add -f dist`, commit y tag `v1.2.0`. Hasta entonces
    `dist/` conserva el de v1.1: se reconstruye sólo en ese commit.

32. **Topes opcionales, globales y apagados por defecto; y la onda de Rumbo anima `transform`.** `configurarToast`
    y `configurarModal` (mismo patrón que `configurarSonido`) existen porque sin tope la librería pinta todo lo que
    le piden. Quedan apagados (sin límite) para no cambiar a quien ya la usa. Al exceder, el Toast espera en cola
    (es informativo, no se pierde) y el Modal se descarta con `accionId: null` (un modal que llega tarde y fuera de
    contexto es peor que ninguno; `confirmar` lo lee como "no confirmado"). El tope del Toast cuenta los que
    están en pantalla, así que uno con `timer: 0` retiene su lugar. La onda de `escuchando` usa
    `transform: scale` con `vector-effect: non-scaling-stroke` (antes animaba `r`); las escenas generadas del brand
    kit, que animan `fill`, no se tocaron: regenerarlas depende de los assets de origen.

33. **Los estilos se inyectan por hoja, no por componente; y lo que importa de Toast/Modal/Attach/Alert está
    cubierto por tests.** `ensureStyles(...hojas)` guarda un id por hoja (los tokens se llaman `tokens`) y consulta el
    `<head>` antes de inyectar. El orden de cascada se conserva: Toast inyecta `alert.css` antes de `toast.css`, así
    que `toast.css` siempre va después. Los tests no reemplazan la verificación visual (el DOM falso no calcula
    estilos): la confirmación de que los estilos y la animación se ven igual sigue siendo en el navegador.
    `registroGlobal` es un objeto con la misma interfaz que delega en un registro creado al primer uso.

34. **Qué se sube y qué no.** `playground/` va en `.gitignore` (decisión del dueño del repo; durante un tiempo estuvo
    versionado y se revirtió). Lo único que se sube es `index.html` en la raíz: la demo sin build, copia exacta de
    `playground/showcase.html`. No entra al paquete npm (`files: ["dist", "sonidos"]`). Sigue siendo un espejo sin build
    del código de `src/`: al cambiar un comportamiento visible, se actualiza a mano (regla de trabajo, no automatizada).

35. **Color del texto sobre un fondo 900/700: por contraste, no siempre blanco.** `colorTextoSobre(token)`
    (`core/color.ts`) devuelve tinta `#1f2123` en naranja-900/700, turquesa-700 y gris-700, y blanco en el resto. Medido
    (blanco/fondo): naranja-900 2.05, naranja-700 1.82, turquesa-700 2.82, gris-700 2.38 — todos bajo 4.5:1; con el
    gris de marca sobre naranja tampoco se llega (~3.6), por eso es casi negro y no `--fdk-ink`. Decisión del dueño
    del repo, aun cambiando el aspecto de `saludo`/`onboarding`. **Pendiente de diseño:** turquesa-900 queda en blanco
    (3.71:1, sólo texto grande) — si se quiere AA para texto normal, también debería ir con tinta oscura (5.7:1).

36. **Modal: tema oscuro automático y botones en columna.** `tema` es la última opción (apagada = `"auto"`, así que
    no cambia a quien ya usa el modal en un sistema claro). Se resuelve al abrir y se sigue con `matchMedia('change')`
    sólo si es `"auto"`; el oyente se quita al cerrar. Los tonos oscuros (`#1b1f22` de fondo, `#21262a` (botón secundario), `#373c41` (su borde), `#b8babd`)
    salen de la imagen de referencia y **no están en la paleta de 18**: son neutros exclusivos de este tema.
    La columna usa `flex-direction: column-reverse`: en el DOM sigue primero "cancelar" (el foco inicial cae en la
    opción segura y el orden de Tab no cambia), pero visualmente la acción principal queda arriba. A cambio, el
    orden de Tab es el inverso del visual (WCAG 2.4.3, mínimo): si se prefiere coherencia, se invierte el orden en
    `confirmar.ts` y el foco inicial pasa a "confirmar". El gap del 18% que se había fijado a mano se reemplaza. Botón secundario claro: `#f4f5f6` / borde `#dcdee1` (texto `--fdk-ink` ≈ 6.7:1 sobre el relleno). Valores míos, derivados
    de la lógica del tema oscuro, no de una imagen: ajustables. Tamaño del modal (valores del original, que reemplazan los márgenes responsivos de antes): `width: min(100%, 440px)`
    border-box, `padding: 24px`, columna centrada con `gap: 14px`; el margen de 20px es padding del fondo para que el
    ancho 100% no desborde. La sombra `0 30px 70px -20px #000000a6` es la misma en ambos temas (está en `.fdk-modal`, no en la
    variante oscura). Tipografía del modal: título 20px/22px y descripción 15px/16px (móvil/≥600px), interlineado 1.75. Las reglas
    `min-width: 600px` de tipografía van DESPUÉS de las base (misma especificidad: gana la última); un primer intento
    las dejó antes y no se aplicaban. Los botones se asoman al padding con margen negativo (`btn-inset` = ~5% de la tarjeta, la referencia) para
    ocupar ~90% del ancho sin quitarle margen al texto. Rumbo en el modal mide 78px (antes 110px), medido sobre la referencia: el cuerpo ocupa ~17% del ancho, no el
    24% anterior; las escenas, con la misma reducción (150 → 106px). Los botones son píldora (`border-radius: 999px`) con borde
    de 1px, también en tema claro, para que ambos temas compartan la forma de la referencia.

37. **Mirada: opt-in, compartida y fuera de Alert y Lluvia.** `src/rumbo/mirada.ts` (`seguirMirada(raiz)`) copia las
    constantes de `rumbo-en-movimiento.html`: tope 3.4 unidades del lienzo, suavidad 0.14 por cuadro, distancia 220px,
    punto de mira al 72%/56% del SVG. Un solo oyente `pointermove` y un solo `requestAnimationFrame` para todos los
    seguidores (el bucle se duerme al llegar), que busca `.fdk-rumbo__ojos` cada cuadro: sobrevive a que `actualizar()`
    cambie el SVG. Para poder mover los ojos, Rumbo los envuelve en un grupo `fdk-rumbo__ojos` (sin cambio visual).
    La opción es `mirada?: boolean` (apagada) y va **al final**, tras `sonido`/`tema`. **Excluidos por pedido:** Alert
    (`01 · Persistente · Popup fijo`) y la lluvia (`06 · Efímero · Overlay a pantalla completa`), porque tocar los
    ojos cambia los elementos visuales de Rumbo en ellos. Las escenas son `<img>`: sus ojos no son alcanzables.
    En el playground se verificó con eventos sintéticos (el panel de prueba frena `requestAnimationFrame` si está
    oculto): ±3.35 en cada sección y 0 seguidores al cerrar.

38. **Las demos se validan sin navegador.** `tests/lluvia-demo.test.mjs` lee `index.html` (raíz) y, si existe, `playground/showcase.html` (se omite si no está: no se sube) y
    comprueba que (a) cada `<script>` en línea compila (`vm.Script`) —un backtick en un comentario CSS copiado dentro
    de una plantilla de JS dejó muerta la sección de lluvia sin avisar—, (b) la sección «06 · Efímero · Overlay a
    pantalla completa» tiene sus 7 listas, (c) existen los 23 personajes (8 estados + 15 escenas) y los 7 efectos (6
    base + «pulso» que registra la demo) que ofrecen, y (d) la librería acepta cada valor de las 5 listas numéricas
    (20 valores; un `RangeError` los rechazaría). Verificado por mutación: cantidad 301 hace fallar el test.
    Regla al copiar CSS a una plantilla de JS: nada de acentos graves ni `${` en los comentarios.

39. **`index.html` (raíz) es una copia exacta de `playground/showcase.html`.** Antes era una versión anterior (sin
    navegación ni secciones numeradas 01–06, y con el título «FÓNDIKA Alert · playground») y vivía en `playground/`. Al
    cambiar uno hay que copiar el otro (`cp playground/showcase.html index.html`).

40. **Node.js 24.22.1 como mínimo, sin versiones en fin de vida.** Se fija en tres sitios: `.nvmrc` (`24.22.1`),
    `devEngines.runtime` de `package.json` (`>=24.22.1 <25`, `onFail: "error"`: npm se niega a trabajar con Node 20/22 o
    con un 24.x anterior) y las imágenes `node:24.22.1-alpine` de los comandos de arriba. Es `devEngines` y no `engines`
    a propósito: la librería corre en el navegador, y `engines` haría saltar avisos a quien la instala con otro Node.
    Al subir de Node 20 a 24 cambió una cosa en el repo: `node --test tests/` ya no recorre el directorio (desde Node 22
    el argumento es un archivo o patrón), así que el script `test` usa `node --test "tests/*.test.mjs"`. Verificado en
    `node:24.22.1-alpine`: `tsc --noEmit`, 47/47 tests y `tsup` (build en un directorio temporal, `dist/` intacto).
    Pendiente fuera del repo: CI/hosting (no hay workflows) y cualquier máquina de desarrollo con otro Node.

41. **Rumbo luminoso sin halo; Saludo/Onboarding normales por defecto.** Por pedido del usuario se quitó la «sombra» del
    luminoso: el degradado radial naranja detrás del cuerpo blanco (`capasLuminoso` y el `<radialGradient>`+`<ellipse>`
    de las escenas). Esto revierte la parte de la regla 24 que justificaba el halo. Un primer intento añadió dos
    estados `saludo-no-luminoso`/`onboarding-no-luminoso`; se descartó: se pidió «un solo estado por defecto» en el modal.
    Modelo final: `saludo` y `onboarding` son UN estado cada uno, Rumbo normal (cuerpo `#ff9f19`, ojos `#3f4245`); la versión
    luminosa (`ESCENAS_LUMINOSAS` en `datos.ts`, cuerpo blanco) no es un estado sino una variante que se elige con un
    fondo 900/700, igual que ya funcionaba `rumboSvg` con `superficie`. Por eso desaparecieron `superficiePorDefecto`
    (el `naranja-900` automático) y `EstadoSiempreLuminoso` (Alert vuelve a admitirlos). El modal no tiene fondo → sólo
    la versión normal. Mascota y Attach usan `superficie`; Toast, `background`; el Loader dibuja el Rumbo base. Como
    `scripts/gen-escenas.py` ya no está en el repo, `datos.ts` se edita a mano. No se tocó el degradado del fondo del
    Loader (`degradadoDeToken`): es el fondo del overlay, no el halo del personaje.
42. **La mirada cubre todos los estados, incluidas las escenas.** Las escenas eran `<img>` y sus ojos son inalcanzables;
    con `mirada` se dibujan como SVG en línea (`rumboEscena(..., { mirada: true })`). El problema de siempre de esa
    opción (el `<style>` de cada escena usa `[data-p…]` globales y dos escenas se pisan) se resuelve prefijando cada
    selector con una clase única por llamada (`fdk-escena-N`); los `@keyframes` ya llevan el nombre de su escena.
    `seguirMirada` mueve `.fdk-rumbo__ojos` y `[data-p^="ojos-"]` (los tres grupos de ojos de la escena, juntos) y
    calcula el punto de mira con el `viewBox`: ojos en (83.5, 62) de su lienzo. Verificado en navegador: 8 estados (normal y
    luminoso) + 15 escenas + 2 luminosas, cuatro direcciones, y vuelta al centro. Hallazgo al verificar: un seguidor cuyo
    componente se quitaba del DOM por fuera nunca se soltaba; ahora `paso()` lo suelta si `raiz.isConnected === false`.
    Nota de método: con el panel de pruebas oculto los temporizadores se frenan y salen «fallos» que no lo son (el valor
    es el de la dirección anterior); hay que traer la pestaña al frente y esperar a que converja.

43. **Las animaciones terminan; sólo se repite lo que la referencia repite.** Criterio único: `rep: Infinity` en
    `rumbo-en-movimiento.html`. Se extrajeron los pasos de sus 20 escenas (script puntual, no se conserva): sólo `procesando`
    (≈`cargando`: Vida), `rendimiento` y `esperaLarga` (cuerpo y Vida), `ordenManana` (Vida), `dormida` y `mantenimiento`
    (cuerpo) tienen elementos infinitos; `saludo`, `onboarding`, `adios`, `deposito`, `retiro`, `domiciliacion`, `vacia`,
    `biometria`, `asesor` y `buscando` terminan (algunos repiten finito: `cuerpo×2`). Las escenas ya no usan una línea de
    tiempo única en bucle: cada paso es una animación CSS con su `delay` (t), duración (d), repeticiones (rep+1) y relleno
    (`fin`), como el `animate()` de la referencia; varias animaciones sobre el mismo elemento van en una lista
    (la última gana). Diferencia asumida: WAAPI aplica el `easing` a toda la iteración y CSS entre cada par de
    fotogramas; sólo importa en pasos de 3+ fotogramas y ya era así en las escenas originales.
    **Parpadeo:** la referencia lo hace con `setTimeout` (2.8–7 s al azar, 110 ms). Aquí es CSS puro —un ciclo de ~16–22 s
    con 4 parpadeos desiguales por escena— porque una escena es una `<img>` y ningún script llega a sus ojos; arranca cuando
    termina lo finito y sólo si los ojos terminan abiertos y Rumbo a la vista (no en `onboarding`, `adios`, `dormida`). En
    los estados base, cada Rumbo lleva `--fdk-fase` al azar (0–9 s) para no parpadear al unísono; las escenas, al ser
    `<img>` estáticas, no pueden desfasarse. El parpadeo de los estados base aplasta los círculos de los ojos
    (`scaleY(.08)`) en vez de cambiar a los trazos cerrados. Movimiento reducido: sin animación, y en las escenas la pose
    final de `estadoFinal`. Estados base sin referencia directa (`reposo`, `pensando`, `exito`) usan sus duraciones de
    siempre, finitas: `reposo` respira 2 veces como el `cuerpo×2` de la referencia.
    Verificado en navegador (animaciones activas de cada estado y escena, y el cambio de ojos en pleno parpadeo) y con
    `tests/animaciones.test.mjs`, que falla si se cuela un bucle (comprobado inyectando dos).

44. **El modo luminoso no lleva ninguna sombra ni degradado.** La regla 41 quitó el halo de Rumbo y de las escenas pero dejó el
    degradado radial del fondo del Loader (`degradadoDeToken`); el usuario señaló que seguía en la sección 4. Se eliminó la
    función y `loaderScreen`/`loaderTarget` pintan el color plano del token; el demo de Attach (que teñía su host igual) también.
    Revierte la regla 12 (halo de luz localizado en el Loader). Comparación hecha en navegador, por tono (naranja, turquesa,
    gris y rojo, 900 y 700) y sección: Loader pantalla y contenedor, Toast, Mascota y Attach → color plano. Rumbo luminoso: sin
    `radialGradient`, `ellipse`, `filter` ni `drop-shadow`. **No se tocó** la sombra de elevación de las tarjetas flotantes
    (`.fdk-alert--flotante`, la burbuja y el botón de la Mascota): es común a todos los toasts y mascotas, luminosos o no, y
    no es del modo luminoso; si se quiere un toast luminoso sin ella, es un cambio aparte. `tests/loader.test.mjs` vigila el
    fondo plano y que no vuelva ningún `radial-gradient` a loader, color o Rumbo.

45. **Sin `vozId`; texto opcional en los tres loaders, blanco sobre fondo luminoso.** `vozId` (el id de una línea de la
    biblioteca de voz) se eliminó de todos los componentes, de `RumboVozOptions` y del playground: el copy sale sólo de
    `texto`. `resolverVozRumbo` queda como `texto` o `null` (con `mostrarPorDefecto`, la primera línea del estado). **Se
    conserva** el ciclo automático de `pensando`/`cargando` cuando no hay texto (es el copy de espera, no un id): la
    biblioteca `voz-rumbo.json` sigue existiendo sólo para eso. Era una función obsoleta (TypeScript avisa; en JS el texto se
    pierde en silencio).
    **Loader:** `loaderBoton` gana `texto?` (Rumbo + texto en el botón; con texto, `keepWidth` fija `min-width` y no
    `width`); `loaderScreen`/`loaderTarget` ya lo tenían. El bug real era CSS: `.fdk-overlay__texto` fijaba
    `color: var(--fdk-ink)` y el overlay luminoso no podía teñirlo; ahora el texto hereda (`color: inherit`) y el overlay
    pone `#fff` cuando `esTonoOscuro(superficie)`. **Esto revierte para el Loader** la regla 35 (`colorTextoSobre`: tinta
    oscura sobre naranja, turquesa-700 y gris-700): por pedido, el texto del loader es siempre blanco sobre luminoso, aun
    cuando blanco/naranja-900 es 2.05:1 (no llega a AA). Toast sigue con `colorTextoSobre`: la inconsistencia entre
    Toast y Loader es consciente y queda para decidir. En el playground, un solo campo «Texto (opcional)» alimenta a los
    tres loaders y actualiza en vivo los abiertos.

46. **El tamaño del personaje en Toast y Alert se mide por el CUERPO, no por el SVG.** Rumbo tiene un lienzo de 120 y su cuerpo
    ocupa 100 → a 46.2px de caja el cuerpo mide 38.5px (Pensando y los otros 7 estados base). Una escena tiene un lienzo de
    168 con el mismo cuerpo de 100: a 80px (el tamaño de antes) el cuerpo medía 47.6px. Igualar el SVG no iguala al personaje;
    hay que escalar por el lienzo: `tamaño_escena = 46.2 × 168/120 = 64.7px`. Verificado midiendo el `getBBox` del cuerpo en los
    23 estados, Toast y Alert (38.49–38.50px), y con `tests/attach-alert.test.mjs`. Si cambia el 46.2 o el lienzo de las
    escenas, hay que recalcular. Modal, Mascota y Attach tienen sus propios tamaños y no se tocaron.

47. **Modal, Mascota y Attach: el cuerpo de una escena mide lo mismo que el de Rumbo (escala ×168/120)**, como la regla 46.
    Modal: 78 → 109.2px; Mascota: `size` (80) × 1.4 = 112px; Attach: caja `size` × 1.4. **Attach cambia de significado:**
    `size` ya no es el ancho/alto del SVG sino el del *contenedor* (`--fdk-attach-tam`), y Rumbo lo llena (`.fdk-attach > svg`
    al 100%). Sin `size`, el contenedor mide 24px, ajustable por CSS con `--fdk-attach-size`. Las escenas usan
    `.fdk-attach[data-escena]` con la caja ×1.4. Versión `1.2.1`. Pendiente verificar en navegador con la librería real (el
    playground sí está verificado) y recompilar los tests (en esta máquina faltan los binarios de rollup para Windows).

48. **Se elimina la biblioteca de voz.** `vozId` ya no existe (regla 45) y con él se borran `src/rumbo/voz.ts`,
    `src/rumbo/voz-rumbo.json`, `resolverVozRumbo`, `iniciarCicloVoz` y `RumboVozOptions` (también de los exports). El copy de
    todos los componentes sale sólo de `titulo` y/o `texto`; sin ellos no hay texto, tampoco en `pensando` y `cargando` (que
    ya no tienen ciclo de espera). Alert, Toast, Modal, Loader y Mascota quedan sin temporizadores de copy, y el playground
    pierde su mirror (`VOZ`, `iniciarCiclo`). Era una función **obsoleta**: el texto definido por quien llama es el nuevo estándar, no un cambio incompatible que pida subir de versión mayor (se queda en `1.2.1`). **Revierte** la parte de la regla 45 que conservaba el ciclo.
    Verificado en el playground (`pensando` sin texto → sin copy; con texto → lo muestra) y con `tsc`; los tests no se pudieron
    recompilar en esta máquina.

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
