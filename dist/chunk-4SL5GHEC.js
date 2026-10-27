// src/escenas/pintar.ts
function pintarEscena(el, nombre, size) {
  el.dataset.escena = nombre;
  import("./escenas.js").then((m) => {
    if (el.dataset.escena === nombre) el.innerHTML = m.rumboEscena(nombre, size);
  });
}

export {
  pintarEscena
};
