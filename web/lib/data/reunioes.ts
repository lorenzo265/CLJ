import { atividades } from "@/lib/mock/atividades";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";
import { reunioes, reuniaoPresentes } from "@/lib/mock/reunioes";
import type { Atividade, Reuniao } from "@/lib/types";

export interface ReuniaoCompleta extends Reuniao {
  atividade: Atividade;
  presentes: string[]; // pessoaIds
}

export async function getReunioes(departamentoId: string): Promise<ReuniaoCompleta[]> {
  return reunioes
    .map((r) => {
      const atividade = atividades.find((a) => a.id === r.atividadeId);
      if (!atividade || atividade.departamentoId !== departamentoId) return null;
      const presentes = reuniaoPresentes
        .filter((rp) => rp.atividadeId === r.atividadeId)
        .map((rp) => rp.pessoaId);
      return { ...r, atividade, presentes };
    })
    .filter((r): r is ReuniaoCompleta => r !== null)
    .sort((a, b) => b.atividade.data.localeCompare(a.atividade.data));
}

export async function getReuniao(atividadeId: string): Promise<ReuniaoCompleta | undefined> {
  const todas = await getReunioes(DEPARTAMENTO_CULTURAL);
  return todas.find((r) => r.atividadeId === atividadeId);
}
