// src/core/anim.ts
function animar(el, clase, ms = 400) {
  return new Promise((resolve) => {
    const listo = () => {
      clearTimeout(timer);
      el.removeEventListener("animationend", listo);
      resolve();
    };
    const timer = setTimeout(listo, ms + 50);
    el.addEventListener("animationend", listo, { once: true });
    el.classList.add(clase);
  });
}

export {
  animar
};
