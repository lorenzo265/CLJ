import "server-only";
import { randomUUID } from "node:crypto";
import type { DiaSemana, Periodo } from "@/lib/types";
import { DIAS_SEMANA, PERIODOS } from "@/lib/types";

/** Camada de SQL cru. Só lib/data/ e lib/actions/ falam com estes módulos. */

export function novoId(): string {
  return randomUUID();
}

export function agoraISO(): string {
  return new Date().toISOString();
}

/** CSV → conjunto validado. Valor estranho no banco é descartado, não quebra a tela. */
export function lerDias(csv: string): DiaSemana[] {
  const set = new Set(csv.split(",").map((s) => s.trim()));
  return DIAS_SEMANA.filter((d) => set.has(d));
}

export function lerPeriodos(csv: string): Periodo[] {
  const set = new Set(csv.split(",").map((s) => s.trim()));
  return PERIODOS.filter((p) => set.has(p));
}

export function escreverLista(valores: readonly string[]): string {
  return valores.join(",");
}

export function lerJsonLista(texto: string): string[] {
  try {
    const v = JSON.parse(texto);
    return Array.isArray(v) ? v.filter((i): i is string => typeof i === "string") : [];
  } catch {
    return [];
  }
}
