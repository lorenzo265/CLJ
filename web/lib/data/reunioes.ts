import "server-only";
import * as repo from "@/lib/repos/reunioes";
import { listarAtividades, buscarAtividade } from "@/lib/repos/atividades";
import type { Atividade, Reuniao } from "@/lib/types";

export interface ReuniaoCompleta extends Reuniao {
  atividade: Atividade;
  presentes: string[]; // pessoaIds
}

/** Reunião "realizada" é a que já foi concluída — a tela só conhece esses dois estados. */
export function reuniaoRealizada(atividade: Atividade): boolean {
  return atividade.status === "concluido" || atividade.status === "publicado";
}

export async function getReunioes(departamentoId: string): Promise<ReuniaoCompleta[]> {
  const porId = new Map(listarAtividades(departamentoId).map((a) => [a.id, a]));
  const presentes = repo.presentesPorReuniao(departamentoId);

  return repo
    .listarReunioes(departamentoId)
    .map((r) => {
      const atividade = porId.get(r.atividadeId);
      return atividade ? { ...r, atividade, presentes: presentes[r.atividadeId] ?? [] } : null;
    })
    .filter((r): r is ReuniaoCompleta => r !== null)
    .sort((a, b) => b.atividade.data.localeCompare(a.atividade.data));
}

export async function getReuniao(atividadeId: string): Promise<ReuniaoCompleta | undefined> {
  const reuniao = repo.buscarReuniao(atividadeId);
  const atividade = buscarAtividade(atividadeId);
  if (!reuniao || !atividade) return undefined;
  return { ...reuniao, atividade, presentes: repo.listarPresentes(atividadeId) };
}
