import "server-only";
import * as repo from "@/lib/repos/atividades";
import type { Atividade, Troca } from "@/lib/types";

export async function getAtividades(departamentoId: string): Promise<Atividade[]> {
  return repo.listarAtividades(departamentoId);
}

export async function getAtividade(id: string): Promise<Atividade | undefined> {
  return repo.buscarAtividade(id);
}

/** O histórico de trocas de uma atividade — a memória que saiu da conversa privada. */
export async function getTrocas(atividadeId: string): Promise<Troca[]> {
  return repo.listarTrocas(atividadeId);
}
