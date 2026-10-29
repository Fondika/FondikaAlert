import { defineConfig } from "tsup";

/** Compila sólo lo que prueban los tests (`npm test`), a una carpeta temporal: no toca `dist/`. */
export default defineConfig({
  entry: {
    lluvia: "src/lluvia/index.ts",
    loader: "src/loader/index.ts",
    toast: "src/toast/toast.ts",
    modal: "src/modal/index.ts",
    attach: "src/attach/attach.ts",
    alert: "src/alert/alert.ts",
    color: "src/core/color.ts",
    mirada: "src/rumbo/mirada.ts",
    datos: "src/escenas/datos.ts",
    escenas: "src/escenas/escenas.ts",
  },
  format: ["esm"],
  dts: false,
  clean: false,
  outDir: "node_modules/.tmp-test",
  loader: { ".css": "text" },
});
