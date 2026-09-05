import { addDays, format } from "date-fns";
import { getPessoas } from "@/lib/data/pessoas";
import { getAtividades } from "@/lib/data/atividades";
import { getReunioes } from "@/lib/data/reunioes";

export interface ResumoPainel {
  participantesAtivos: number;
  tarefasSemResponsavel: number;
  proximaReuniaoData: string | null;
  furosEstaSemana: number;
}

export async function getResumoPainel(departamentoId: string): Promise<ResumoPainel> {
  const [pessoas, atividades, reunioes] = await Promise.all([
    getPessoas(departamentoId),
    getAtividades(departamentoId),
    getReunioes(departamentoId),
  ]);

  const hoje = format(new Date(), "yyyy-MM-dd");
  const daqui7dias = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const proximaReuniao = reunioes
    .filter((r) => r.atividade.data >= hoje)
    .sort((a, b) => a.atividade.data.localeCompare(b.atividade.data))[0];

  const furos = atividades.filter(
    (a) => a.data >= hoje && a.data <= daqui7dias && !a.responsavelId
  ).length;

  return {
    participantesAtivos: pessoas.filter((p) => p.status === "ativo").length,
    tarefasSemResponsavel: atividades.filter((a) => !a.responsavelId).length,
    proximaReuniaoData: proximaReuniao?.atividade.data ?? null,
    furosEstaSemana: furos,
  };
}
