import { atividades } from "@/lib/mock/atividades";
import type { Atividade } from "@/lib/types";

export async function getAtividades(departamentoId: string): Promise<Atividade[]> {
  return atividades.filter((a) => a.departamentoId === departamentoId);
}

export async function getAtividade(id: string): Promise<Atividade | undefined> {
  return atividades.find((a) => a.id === id);
}
