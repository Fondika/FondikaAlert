# Regenera src/escenas/datos.ts desde las 20 escenas del brandkit. Uso: python scripts/gen-escenas.py
import json, os, re
aqui = os.path.dirname(os.path.abspath(__file__))
base = os.path.join(aqui, "..", "Brand_kit_Fondika", "04-personaje", "assets", "escenas")
meta = json.load(open(os.path.join(base, "escenas.json"), encoding="utf-8"))
# repiten estados que ya existen (error, sin-conexion, cargando, escuchando, alerta): gana el nombre existente
DUPLICADAS = {"error", "offline", "procesando", "perfilamiento", "documento"}
# saludo y onboarding traen un fondo degradado naranja (rect a pantalla completa) y cuerpo blanco. Aquí
# siempre son Rumbo "luminoso": cuerpo blanco + halo naranja detrás (mismos valores que capasLuminoso
# en src/rumbo/rumbo.ts), sin fondo propio — así se ven sobre cualquier superficie y no tapan nada.
GLOW_DEFS = ('<defs><radialGradient id="g" cx="45%" cy="42%" r="65%">'
             '<stop offset="0%" stop-color="#ff9f19" stop-opacity=".55"/>'
             '<stop offset="55%" stop-color="#ff9f19" stop-opacity=".22"/>'
             '<stop offset="100%" stop-color="#ff9f19" stop-opacity="0"/></radialGradient></defs>')
GLOW_ELIPSE = '<ellipse cx="58" cy="66" rx="72" ry="60" fill="url(#g)"/>'

def quitar_fondo(svg):
    svg, n1 = re.subn(r'<defs><radialGradient id="g".*?</defs>', lambda m: GLOW_DEFS, svg, count=1)
    svg, n2 = re.subn(r'<rect x="-24" y="-14" width="168" height="162" fill="url\(#g\)"/>', lambda m: GLOW_ELIPSE, svg, count=1)
    assert n1 == 1 and n2 == 1, "el fondo degradado ya no tiene la forma esperada"
    return svg

out = {}
for k, m in meta.items():
    if k in DUPLICADAS:
        continue
    svg = re.sub(r">\s+<", "><", open(os.path.join(base, "svg", f"rumbo-{k}.svg"), encoding="utf-8").read()).strip()
    if m["fondo"] == "degradado":
        svg = quitar_fondo(svg)
    out[re.sub(r"([A-Z])", lambda x: "-" + x.group(1).lower(), k)] = {"nombre": m["nombre"], "linea": m["linea"], "svg": svg}
dest = os.path.join(aqui, "..", "src", "escenas", "datos.ts")
open(dest, "w", encoding="utf-8", newline="\n").write(
    "// GENERADO por scripts/gen-escenas.py — no editar a mano.\n"
    'import type { EscenaEstado } from "../rumbo/estados";\n'
    f"export const ESCENAS: Record<EscenaEstado, {{ nombre: string; linea: string; svg: string }}> = {json.dumps(out, ensure_ascii=False, indent=1)};\n")
