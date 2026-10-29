/**
 * Posiciones como grilla 3×3 (ADR-003 del UI-Kit). Nomenclatura lógica, no física:
 * soporta RTL sin código adicional porque usa `inset-inline-start/end`.
 */
type Block = "top" | "middle" | "bottom";
type Inline = "start" | "center" | "end";
type Position = `${Block}-${Inline}`;

export type { Position as P };
