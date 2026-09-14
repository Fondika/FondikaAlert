# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Este proyecto
sigue [versionado semántico](https://semver.org/lang/es/): mientras esté en `0.x`, cualquier
cambio puede romper compatibilidad sin previo aviso — a partir de `1.0.0`, un cambio que rompa
algo sube el número mayor (`MAJOR`), nunca un `minor` ni un `patch`.

## [Unreleased]

### Changed

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
