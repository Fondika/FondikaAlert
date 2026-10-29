# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Este proyecto
sigue [versionado semántico](https://semver.org/lang/es/): mientras esté en `0.x`, cualquier
cambio puede romper compatibilidad sin previo aviso — a partir de `1.0.0`, un cambio que rompa
algo sube el número mayor (`MAJOR`), nunca un `minor` ni un `patch`.

## [Unreleased]

## [1.2.1] — 2026-10-29

### Removed

- **Se elimina la biblioteca de voz de Rumbo** (función obsoleta; nuevo estándar: el texto lo define quien llama): `src/rumbo/voz-rumbo.json`, `resolverVozRumbo`, `iniciarCicloVoz` y
  `RumboVozOptions` ya no existen ni se exportan. El texto sale sólo de `titulo` y/o `texto`; `pensando` y `cargando` ya no
  muestran copy de espera automático. Alert, Toast, Modal, Loader y Mascota quedan sin temporizadores de copy.

### Added

- **`loaderBoton` acepta `texto`** (opcional): Rumbo y el texto dentro del botón. Con texto, `keepWidth` fija el ancho
  mínimo del botón, no el exacto. Sobre una `superficie` luminosa (900/700) el texto es blanco. En el playground, la
  sección 04 tiene un campo «Texto (opcional)» para `loaderScreen`, `loaderBoton` y `loaderTarget`, con actualización en
  vivo.
- **`rumboEscena(nombre, size, { luminoso, mirada })`**: tercer argumento opcional. `luminoso` dibuja el cuerpo blanco de
  `saludo`/`onboarding` (las únicas con esa versión); `mirada` la dibuja como SVG en línea, con su CSS acotado por una
  clase única, para que `seguirMirada` pueda mover sus ojos.

### Changed

- **Attach: Rumbo llena su contenedor.** El tamaño lo da `size` (opcional) o, si falta, el del contenedor (24px, ajustable con `--fdk-attach-size`); las escenas escalan ×1.4 para que su cuerpo mida lo mismo.
- **Modal, Mascota y Attach: las escenas tienen el mismo tamaño de cuerpo que Rumbo** (escala ×168/120 sobre el tamaño de Rumbo: Modal 109.2px, Mascota 112px con `size` 80, Attach 33.6px con `size` 24; antes 106/120/120). Mascota y Attach escalan también un `size` explícito.
- **Toast y Alert: todos los estados de Rumbo tienen el mismo tamaño que Pensando.** Las escenas (`saludo`, `deposito`…)
  se dibujaban a 80px y su cuerpo salía de 47.6px, un 24% mayor que el de los 8 estados base (38.5px). Su lienzo es más
  ancho (168 frente a 120), así que ahora miden 64.7px (= 46.2 × 168/120) y el cuerpo mide 38.5px en los 23 estados. La
  altura de la tarjeta es la misma para todos (72px). Medido en navegador, en Toast y en Alert.
- **Se elimina `vozId`** (obsoleto): ya no se puede elegir una línea de la biblioteca de voz por su id. El copy sale sólo
  de `texto` en Alert, Toast, `confirmar`, `notificar`, Loader y Mascota; `RumboVozOptions` y `resolverVozRumbo` pierden
  el campo. En JavaScript, pasar `vozId` ya no muestra nada.
- **Loader: el texto sobre un fondo luminoso es blanco** (antes seguía gris `--fdk-ink`, ilegible sobre naranja, turquesa o
  rojo): `.fdk-overlay__texto` hereda el color y el overlay lo pone blanco con una `superficie` 900/700. Para el Loader,
  esto sustituye la tinta oscura de `colorTextoSobre`; Toast no cambia.
- **Las animaciones de Rumbo ya no están en bucle: cada una tiene un final** (sin opción, es la forma de animar). Al
  terminar, Rumbo queda quieto y sólo parpadea (110 ms, a intervalos desiguales de 3–6.5 s; CSS puro, también dentro de las
  escenas `<img>`) si tiene los ojos abiertos. Sigue en bucle únicamente lo que `rumbo-en-movimiento.html` marca
  `rep: Infinity`: los puntos de Vida de `cargando`, y en las escenas el cuerpo y/o Vida de `rendimiento`, `espera-larga`,
  `orden-manana`, `mantenimiento` y `dormida`. Antes todo corría en un ciclo infinito (los 8 estados y las 15 escenas).
  Tiempos: `reposo` 6.8 s, `escuchando` 2.9 s, `pensando` 4.9 s, `exito` 1.8 s, `error` 0.5 s, `alerta` 1.6 s. Las escenas se
  regeneraron a partir de los pasos de la referencia (retraso, duración, repeticiones, relleno). Con movimiento reducido
  se muestra la pose final de la referencia (`estadoFinal`), no la inicial. **Cambia el aspecto**: lo que antes se movía
  siempre ahora se detiene.
- **`error` y `alerta` ahora se mueven como en la referencia**: `error` se sacude, se inclina 4° y Vida se aleja y pasa de
  turquesa a rojo; en `alerta` Vida se convierte en el signo, que entra y late una vez. `escuchando` asiente tras las ondas.
- **`saludo` y `onboarding` son Rumbo normal por defecto** (cuerpo naranja) y **ya no ponen un fondo `naranja-900` por
  defecto** en Toast y Loader. La versión luminosa (cuerpo blanco) no es otro estado: aparece sola cuando el fondo es un
  tono 900/700 (`background` en Toast, `superficie` en Attach y Mascota). El modal, sin fondo, siempre los dibuja
  normales. Alert vuelve a admitirlos (antes los excluía por ser siempre luminosos). **Cambia el aspecto** de quien los
  usaba sin fondo propio: ahora salen naranjas sobre el fondo normal.
- **La mirada funciona en todos los estados**: se probó en el navegador con el Rumbo de los 8 estados (normal y
  luminoso) y las 15 escenas (más las dos luminosas), en las cuatro direcciones y devolviendo los ojos al centro. Antes
  las escenas no seguían al puntero porque son `<img>`. El punto de mira de una escena se calcula con su `viewBox`.
- **Se quita todo halo/degradado del modo luminoso, en todas partes**: el degradado naranja que se dibujaba detrás del
  cuerpo blanco (`capasLuminoso` en `rumboSvg`, y el `<radialGradient>`/`<ellipse>` de las escenas `saludo` y
  `onboarding`) **y** el degradado radial que el Loader pintaba sobre el fondo luminoso (`degradadoDeToken`, también en
  `loaderScreen` y `loaderTarget`). Ahora el overlay es el color plano del token. El cuerpo sigue siendo blanco. Comparado
  en los 8 fondos 900/700 (naranja, turquesa, gris y rojo) en Loader pantalla, Loader contenedor, Toast, Mascota y el demo
  de Attach: todos con `background-image: none`. Un toast con fondo luminoso conserva la sombra de elevación que tienen todos
  los toasts y alertas flotantes (no es del modo luminoso).

## [1.2.0] — 2026-10-27

### Added

- **`mirada` — los ojos de Rumbo siguen al puntero** (opt-in, `false` por defecto, último argumento): Toast,
  `confirmar()`/`notificar()`, `loaderScreen`/`loaderTarget`/`loaderBoton`, `attachTo` y `mostrarMascota` (también en
  `actualizar()`). Sigue `04-personaje/assets/rumbo-en-movimiento.html` («Sigue el cursor»): los ojos se desvían como
  máximo 3.4 unidades hacia el puntero (menos si está cerca, tope a 220px), con seguimiento suave, sin girar la
  cabeza; se desactiva con `prefers-reduced-motion`. **No se añade a Alert ni a Lluvia de personajes**, porque
  implicaría cambiar los elementos visuales de Rumbo ahí. Tampoco aplica a las escenas (son imágenes).
- **`seguirMirada(raiz)`** (export de `@fondika/alert` y `@fondika/alert/rumbo`): la misma función, para tus
  propios componentes; devuelve la función que la detiene.
- Rumbo ahora dibuja los ojos dentro de un grupo `<g class="fdk-rumbo__ojos">` (sin cambio visual).
- **Modal — tema oscuro**: `tema?: "auto" | "claro" | "oscuro"` (último argumento de `confirmar`, `notificar` y del
  motor, default `"auto"`). `"auto"` sigue `prefers-color-scheme` y reacciona si el sistema cambia con el modal
  abierto; los otros dos lo fijan. Fondo, título, descripción y botones salen de la imagen de referencia: fondo
  `#1b1f22`, título blanco, descripción `#b8babd`, acción principal naranja, secundaria oscura con borde fino (`#21262a` / borde `#373c41`, con los mismos saltos de luminosidad sobre el fondo que en la referencia).
  Un valor inválido lanza `RangeError`.
- **`configurarToast({ maxVisibles })`**: tope global de toasts a la vez (por defecto sin límite). Los que exceden
  esperan en cola y salen en orden conforme se cierran los visibles; su `timer` empieza al mostrarse. Sin el tope,
  300 toasts pedidos juntos se pintaban los 300 a la vez.
- **`configurarModal({ maxCola })`**: tope de modales en espera, sin contar el visible (por defecto sin límite).
  Con la cola llena, el modal nuevo no se muestra y su promesa resuelve ya con `{ accionId: null }` (`confirmar()`
  da `isConfirmed: false`).
- **`cerrarModal()`**: cierra por código el modal visible (resuelve con `accionId: null`, como Esc) y deja pasar
  al siguiente de la cola.

- **Lluvia de personajes** (`lluvia/`) — `iniciarLluvia()`: muchas copias de un
  personaje caen sobre toda la ventana, por encima del contenido, sin bloquear clics. 6 efectos (`recta`,
  `balanceo`, `giro`, `nieve`, `rebote`, `rafaga`), cantidad / duración o modo continuo / rangos de
  velocidad y tamaño / retraso aleatorio, `onInicio`/`onFin` y `detener()`. Los efectos y los personajes
  se agregan con `registrarEfecto()` y `registrarPersonaje()`. Módulo independiente (`@fondika/alert/lluvia`).
  Nodos reciclados, solo `transform`/`opacity`, adaptable al tamaño de la ventana y con
  `prefers-reduced-motion`.
- **Registro de personajes** (`personajes/`) — `registrarPersonaje()`, `crearRegistro()`, `registroGlobal`
  (arranca con los 8 estados de Rumbo como personajes, animados). Lo usa la lluvia y queda disponible para los demás componentes.
- **`npm test`** — primeras pruebas del repo (`node --test`, sin dependencias nuevas) para la lógica pura de la lluvia.

- **Escenas como estados** — `estado` acepta 15 escenas animadas del brandkit (`saludo`, `vacia`,
  `adios`, `rendimiento`, `asesor`, `biometria`, `buscando`, `espera-larga`, `orden-manana`,
  `deposito`, `retiro`, `domiciliacion`, `onboarding`, `mantenimiento`, `dormida`). Cada una hereda color, voz y sonido de su estado base; Modal,
  Mascota, Attach, Alert y Toast la dibujan (Alert y Toast a 80 px); Loader usa el Rumbo base. `error`, `offline`, `procesando`, `perfilamiento` y
  `documento` no se duplican: gana el nombre existente (`error`, `sin-conexion`, `cargando`,
  `escuchando`, `alerta`). `saludo` y `onboarding` pierden el fondo degradado del brandkit y quedan siempre como Rumbo
  luminoso (cuerpo blanco + halo naranja); su `background` (Toast) / `superficie` (Loader) por
  defecto es `naranja-900`, un tono luminoso, salvo que se pase otro. Alert no admite `saludo` ni `onboarding` (siempre luminosos, necesitan fondo de color).
  `RumboEstado` sigue siendo los 8 de siempre; la unión nueva es
  `RumboEstadoExtendido`. También `rumboEscena()` y `escenasInfo`. Se carga con `import()`. Datos
  generados con `python scripts/gen-escenas.py`.
- **Sonido + háptica** — `sonido?: boolean | SonidoClave` (último argumento, apagado por defecto)
  en Alert, Toast, `confirmar()`, `notificar()`, Mascota y Attach, más `sonar(clave)` y
  `configurarSonido({ baseUrl })`. Los 8 WAV del brandkit viajan en `sonidos/` (incluido en
  `files` del paquete); el consumidor los sirve. `rendimiento` nunca suena.

### Fixed

- **`seguirMirada` — fuga si el componente se quitaba del DOM sin cerrarlo** (cambio de ruta, `innerHTML` del body): el
  seguidor y el oyente de `pointermove` se quedaban para siempre. Ahora se sueltan solos en el siguiente cuadro.
- **Playground — la sección de lluvia no arrancaba** (desde el cambio de la onda de Rumbo): un comentario CSS con
  acentos graves (`` `r` ``), copiado dentro de una plantilla de JavaScript, cerraba el string y el `<script>` entero
  dejaba de compilar: las siete listas de «06 · Efímero · Overlay a pantalla completa» quedaban vacías en
  `showcase.html` y `index.html`. Se quitaron los acentos graves y un test compila ahora cada `<script>` de ambos.
- **Contraste del texto sobre fondos 900/700 (Toast con `background`, Loader con `superficie`)**: el texto era siempre
  blanco, que no llega a 4.5:1 (WCAG AA) sobre naranja-900 (2.05), naranja-700 (1.82), turquesa-700 (2.82) ni
  gris-700 (2.38). Ahora esos cuatro tonos llevan tinta casi negra (>= 5.8:1). **Cambia el aspecto**: `saludo` y
  `onboarding`, que usan naranja-900 por defecto, ahora llevan texto oscuro. Turquesa-900 sigue en blanco (3.71:1,
  sólo cumple para texto grande); gris-900 y los rojos ya cumplían. El cuerpo de Rumbo luminoso sigue blanco.
- **Entradas inválidas pintaban un componente roto o reventaban adentro**: un `estado` desconocido producía
  `fdk-alert--undefined`, y `loaderTarget(null)` / `attachTo(null)` / `loaderBoton(null)` fallaban con "Cannot read
  properties of null" desde el interior de la librería. Ahora lanzan al instante, antes de tocar el DOM o los
  contadores de referencias, con un mensaje que dice qué se esperaba y qué llegó (`RangeError` para valores,
  `TypeError` para elementos). Cubre `estado` (Alert, Toast, Modal, Loader, Attach, Mascota), `posicion` (Toast,
  Mascota), `timer` (Toast) y `host`/`boton` (loaderTarget, loaderBoton, attachTo).
  **Cambia el comportamiento** para quien pasaba valores inválidos: un `timer` negativo antes equivalía en silencio a
  `0` (sin autocierre) y ahora lanza; usa `0` para eso. `escenaDe("constructor")` ya no devuelve un falso positivo.
- **Resolución de tipos con `moduleResolution: node` (node10)**: el paquete sólo declaraba `exports`, que ese
  modo ignora, así que TypeScript no encontraba `@fondika/alert` ni sus subrutas. Se agregan `main`, `module`,
  `types` y `typesVersions` (uno por subruta). Los consumidores con `node16`/`nodenext`/`bundler` no cambian.
- **Toast — el auto-cierre sólo se pausaba con el ratón**: con el foco del teclado dentro del toast (p. ej. en su
  botón de cierre) desaparecía igual al cumplirse el `timer` (WCAG 2.2.1). Ahora se pausa con el puntero **o** el
  foco dentro, y se reanuda cuando no queda ninguno.
- **Modal sin `titulo` no tenía nombre accesible**: el lector de pantalla lo anunciaba como "diálogo" a secas. Ahora
  usa el `texto` como `aria-label` (o "Aviso" si tampoco hay texto).
- **Attach — XSS con `contenido` string** (cambio de comportamiento): un `contenido` string se insertaba con
  `innerHTML`, así que texto de usuario ejecutaba scripts (`<img onerror=…>`). Ahora un string se inserta como
  texto. Para markup propio, pasa un `HTMLElement` o `html: true` (nueva opción, última, `false` por defecto);
  p. ej. `attachTo(host, { contenido: rumboEscena("deposito"), html: true })`.
- **`loaderScreen` — el teclado llegaba a la página bloqueada**: el overlay de pantalla solo cubría con el
  ratón. Ahora el resto del `<body>` queda `inert` mientras dura el loader (menos toasts, modales y otras capas
  `fdk-`) y se restaura al cerrar; si el foco estaba en la página, se suelta.
- **Modal — cola bloqueada si se borraba el modal del DOM**: si la app quitaba el modal por su cuenta (cambio de
  ruta, `body.innerHTML = …`) nadie podía pulsar sus botones y todos los modales siguientes quedaban en espera
  para siempre, con el scroll bloqueado. Ahora el huérfano se cierra al pedir otro modal.

- **Loader — dos peticiones seguidas** (`loaderScreen`, `loaderTarget`): si se pedía un loader mientras el anterior
  se desvanecía (los 250 ms tras el último `close()`), el nuevo se quedaba sin overlay aunque su petición siguiera en
  curso. Ahora se reanima el mismo overlay y se cancela el cierre pendiente.
- **Loader — `close()` repetido**: llamar dos veces a `close()` de un mismo handle restaba dos referencias y apagaba el
  loader de otra petición que seguía abierta. Cada handle resta una sola vez.
- **`loaderBoton` — llamado dos veces sobre el mismo botón** (p. ej. un submit por Enter repetido): dejaba el botón
  deshabilitado con el spinner para siempre. Ahora cuenta referencias como los demás loaders. Además conserva los
  mismos nodos hijos del botón (antes los reemplazaba con `innerHTML`, lo que rompía referencias de React/Vue) y
  restaura el `width` inline que tuviera.

### Changed

- **Node.js 24.22.1 (LTS) como versión de desarrollo, sin versiones en fin de vida ni 24.x anteriores**: `.nvmrc`,
  `devEngines` en `package.json` (`>=24.22.1 <25`, falla si no se cumple) y comandos de Docker actualizados. El script
  `test` pasa de `node --test tests/` a `node --test "tests/*.test.mjs"` (Node 22+ ya no recorre directorios). La
  librería no cambia: es JavaScript de navegador.
- **Modal — botón secundario del tema claro**: relleno `#f4f5f6` y borde `#dcdee1` (antes fondo blanco con borde
  gris oscuro `--fdk-ink`), hover `#eceef0`, active `#e4e6e9`; el texto sigue siendo `--fdk-ink`. Misma lógica que el
  tema oscuro: relleno y borde suaves, sin borde duro.
- **Modal — tamaño y layout tomados del original**: `width: min(100%, 440px)` con `box-sizing: border-box` (440px es
  el ancho total; `wide` pasa a `min(100%, 640px)`), `padding: 24px`, `display: flex` en columna con
  `align-items: center`, `gap: 14px` entre bloques (ya no hay márgenes por bloque) y `text-align: center`. El margen de
  20px va como padding del fondo (`.fdk-backdrop`), no como `margin` del modal: así `width: 100%` no desborda y en
  móvil la tarjeta mide el ancho de pantalla − 40px. Sombra `0 30px 70px -20px #000000a6` en ambos temas. Sustituye los
  márgenes responsivos anteriores (22/32px) y el ancho de 370px + padding. Medido: 440px en 1280px, 320px en 360px,
  280px en 320px; botones al ~90%.
- **Modal — título y descripción**: título de 22 a 20px en móvil (22px desde 600px, como antes) con 10/12px de
  separación a la descripción (antes 8px); descripción con interlineado 1.75 (antes 1.55) y 15px en móvil, 16px
  desde 600px. Medido contra la referencia: en escritorio el título ocupa el 38% del ancho de la tarjeta (38,6% en la
  imagen) y la descripción queda en dos líneas como en ella.
- **Modal — botones al ~90% del ancho de la tarjeta** (como la referencia): se asoman al padding lateral y quedan a
  16px del borde en móvil, 22px desde 600px y 28px en `wide` (variables `--fdk-modal-pad-x` y
  `--fdk-modal-btn-inset`); el texto conserva su margen. Alto (44px), separación y tipografía no cambian: ya
  coincidían con la referencia. Medido: 90% en 360px y en 1280px.
- **Modal — más margen lateral, responsivo**: en móvil (< 600px) el padding pasa a `24px 22px 16px` (laterales 16 →
  22px) y desde 600px (tablet/escritorio) a `28px 32px 24px`; el modal ancho (`wide`) sube sus laterales a 44px.
  El ancho del contenido (370/640px) no cambia, así que la tarjeta crece lo que crece el padding (en escritorio, de
  402 a 434px); en pantallas estrechas sigue encogiéndose para no desbordar (medido en 320, 360, 768 y 1280px).
- **Modal — Rumbo más pequeño (110px → 78px)**: el cuerpo pasa a ocupar ~17% del ancho del modal, la proporción de
  la imagen de referencia (antes ~24%). Las escenas (`estado` de escena) también bajan, de 150 a 106px (×78/110, la misma reducción), así que el
  personaje de una escena queda del mismo tamaño que el Rumbo normal.
- **Modal — botones en columna y en forma de píldora (también en tema claro)**: antes iban en fila con `gap: 18%` y
  radio de 8px; ahora a todo el ancho, apilados, con la acción principal arriba, radio completo (`999px`) y borde de
  1px (antes 1.5px), como la referencia. Reemplaza el `gap` del 18% que se había fijado a mano.
- **README — piezas sueltas**: nueva sección con `rumboSvg`, `resolverVozRumbo`, `iniciarCicloVoz` y `nivelDeEstado`,
  que ya se exportaban pero no estaban documentadas (ejemplos ejecutados contra el bundle real).
- **Repo — la demo pasa a `index.html` en la raíz y `playground/` vuelve a `.gitignore`**: sólo se sube la demo sin
  build (copia de `playground/showcase.html`), que **reemplaza al `index.html` del primer commit** (versión anterior
  del mismo kit, 65 KB; sigue en el historial: `git show HEAD:index.html`); `package.json` publica sólo `dist` y `sonidos`, así que no viaja en el
  paquete.
- **Estilos — cada hoja se inyecta una sola vez**: cada componente inyectaba su propia mezcla
  (`layer+alert+rumbo`, `layer+modal+rumbo`, `loader+rumbo`…), así que `rumbo.css` y `layer.css` terminaban repetidos
  en el `<head>` una vez por combinación. Ahora `ensureStyles(...hojas)` inyecta cada hoja por separado y una vez, y
  mira el DOM (no una bandera): si algo borra un `<style>` (HMR, limpieza del head), se vuelve a inyectar. Antes la
  clave era la longitud del CSS, que podía chocar entre dos hojas distintas.
- **Personajes — `registroGlobal` se crea al primer uso**: armar los 8 SVG de Rumbo (con su CSS incrustado y
  codificado) ocurría al importar el módulo, aunque nadie usara la lluvia. Mismo API; el costo medido era de ~1,3 ms.
- **Rumbo `escuchando` — la onda anima `transform`, no `r`**: `r` no se compone en GPU y obliga a recalcular la
  geometría del SVG en cada cuadro. Mismo aspecto (círculo de r=16 escalado de 10/16 a 30/16, trazo constante con
  `vector-effect: non-scaling-stroke`), menos trabajo por cuadro. Las escenas (`src/escenas/datos.ts`) siguen
  animando `fill` en algunos SVG: vienen generadas del brand kit y no se tocaron.
- **Alert** — con `personaje: true`, el fondo tintado plano del nivel se reemplaza por fondo
  blanco (`--fdk-surface`) + una sombra de color derivada del nivel (`.fdk-alert--sombra`); el
  texto se queda en `--fdk-ink` (gris-900), sin cambios.
- **Toast** — el fondo por defecto (sin `background` explícito) pasa de ser el tinte plano del
  nivel a blanco + sombra de color, igual que Alert con `personaje`. Única excepción:
  `sin-conexion`, que conserva su fondo gris de siempre. `background` ahora sólo admite los 8
  tonos 900/700 (sólidos/oscuros) de la paleta — los tonos claros ya no se recomiendan por
  contraste. Además, en los estados `reposo`/`escuchando`/`pensando`/`cargando`/`exito`,
  `turquesa-900`/`turquesa-700` quedan excluidos: Vida (y otros acentos turquesa de Rumbo en esos
  estados) se pierden contra ese fondo.
- **Alert / Toast** — Rumbo (y el icono) crecen un 5% más (44px → 46.2px), y `.fdk-alert` gana
  8.5px de padding arriba/abajo (antes 0) para que ya no toque el borde de la tarjeta.
- **Modal** — la tarjeta pasa de un alto libre a una forma base cuadrada (420×420), y sólo crece
  verticalmente cuando el contenido lo exige (`min-height`, nunca `width`). Rumbo dentro del
  modal crece un 15% (96px → 110px) para compensar la tarjeta más grande.
- **Modal (ajuste posterior)** — se revierte la forma cuadrada: forzar `min-height` agrandaba la
  tarjeta con contenido corto en vez de reducir su espacio en blanco, que era el objetivo real.
  El alto ahora es sólo el que pide el contenido; el padding baja de 32px/24px/24px a
  24px/16px/16px, y el gap entre los dos botones de `confirmar()` sube un 10% (12px → 13.2px).
- **Mascota** — el triángulo de la burbuja de diálogo ahora sobresale de la burbuja hacia Rumbo
  (8px), en vez de quedar con la punta a ras del borde y la base escondida por dentro.

## [0.1.0] — 2026-09-14

Primera versión funcional completa: los 6 módulos del catálogo, compilando y tipando limpio.

### Added

- **Alert** — flota fija en `top-end`, color fijo por nivel (Información/Listo/Alerta/Error,
  tomado literal de `componentes.html`), con la barra izquierda de 4px exclusiva de este módulo.
- **Toast** — efímero, con timer y pausa al pasar el mouse; único módulo con `background`
  configurable (tiñe el propio componente, nunca la capa que lo contiene).
- **Modal** — sólo dos tipos públicos: `confirmar()` (dos botones, `{ isConfirmed }`) y
  `notificar()` (un botón). Ninguno se cierra con Esc/backdrop/X — sólo con sus botones. El
  motor interno (`abrirModal`) no se expone.
- **Loader** — `loaderScreen()`/`loaderTarget()` con contador de referencias (3 llamadas
  paralelas → 1 sola pantalla, se cierra hasta la 3ª `close()`), y `loaderBoton()` para el
  estado de carga dentro de un `<button>`.
- **Attach** — inyecta contenido (o a Rumbo directamente) dentro de un elemento ya existente,
  sin cubrirlo.
- **Mascota** — Rumbo persistente y flotante fuera de cualquier aviso, con burbuja de diálogo
  (triángulo apuntando hacia el personaje) y `actualizar()`/`ocultar()`/`cerrar()`.
- **Rumbo** (`rumboSvg`) — SVG por estado (los 8: reposo/escuchando/pensando/cargando/exito/
  error/alerta/sin-conexion), variante `color`/`luminoso` automática según la superficie donde
  se monta, y la biblioteca de voz (33 líneas + ciclo automático en `pensando`/`cargando`).
- Tokens de color: exactamente los 18 de la "Paleta de color" de marca (§02 del brandkit), sin
  tonos de campaña.
- `playground/index.html` — demo interactiva sin paso de build.

### Fixed

- 3 errores de tipos (`alert.ts`, `toast.ts`, `modal.ts`) detectados al correr `tsc` por primera
  vez: `iniciarCicloVoz()` exige `"pensando" | "cargando"`, pero TypeScript no estrecha ese tipo
  a través de una variable booleana intermedia cuando la expresión original es un acceso a
  propiedad (`options.estado`). Se corrigió destructurando a una constante local antes del `if`.
- `package.json` prometía un subpath `./styles.css` que `tsup` nunca genera (la librería inyecta
  CSS en runtime). Se quitó del `exports` map.

### Sin validar todavía

- Namespace y nombre de paquete (`@fondika/alert`) son marcadores de posición.
- Nunca se instaló este paquete en un proyecto piloto real (criterio de terminado de la fase 6
  del UI-Kit).

Ver [DOCUMENTACION.md](DOCUMENTACION.md) para el detalle completo de decisiones y pendientes.
