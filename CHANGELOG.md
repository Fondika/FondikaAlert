# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Este proyecto
sigue [versionado semántico](https://semver.org/lang/es/): mientras esté en `0.x`, cualquier
cambio puede romper compatibilidad sin previo aviso — a partir de `1.0.0`, un cambio que rompa
algo sube el número mayor (`MAJOR`), nunca un `minor` ni un `patch`.

## [Unreleased]

Nada todavía — la próxima entrada empieza aquí.

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
