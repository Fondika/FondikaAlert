import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    alert: "src/alert/alert.ts",
    toast: "src/toast/toast.ts",
    modal: "src/modal/index.ts",
    loader: "src/loader/index.ts",
    attach: "src/attach/index.ts",
    mascota: "src/mascota/index.ts",
    rumbo: "src/rumbo/index.ts",
    escenas: "src/escenas/escenas.ts",
    lluvia: "src/lluvia/index.ts",
    sonido: "src/sonido/sonido.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  // Permite `import css from "./archivo.css"` sin depender de sintaxis de Vite.
  loader: { ".css": "text" },
});
