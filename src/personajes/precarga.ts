import type { Personaje } from "./registro";

/** Descarga todas las imágenes antes de montar nada: durante la animación no puede haber huecos. */
export async function precargar(personajes: Personaje[]): Promise<void> {
  await Promise.all(
    personajes.map(
      (p) =>
        new Promise<void>((ok, fallo) => {
          const img = new Image();
          img.onload = () => ok();
          img.onerror = () => fallo(new Error(`No se pudo cargar la imagen del personaje "${p.id}"`));
          img.src = p.src;
        })
    )
  );
}
