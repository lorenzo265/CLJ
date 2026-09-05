import "server-only";
import { addDays, format } from "date-fns";
import { getPessoas } from "@/lib/data/pessoas";
import { getAtividades } from "@/lib/data/atividades";
import type { Atividade } from "@/lib/types";

export interface ResumoPainel {
  participantesAtivos: number;
  /** Atividades sem responsável em qualquer data — o total do departamento. */
  semResponsavel: number;
  proximaReuniaoData: string | null;
  /** Furo: sem responsável e acontecendo nos próximos 7 dias. É o que urge. */
  furosEstaSemana: number;
  atividadesEmFuro: Atividade[];
}

export async function getResumoPainel(departamentoId: string): Promise<ResumoPainel> {
  const [pessoas, atividades] = await Promise.all([
    getPessoas(departamentoId),
    getAtividades(departamentoId),
  ]);

  const hoje = format(new Date(), "yyyy-MM-dd");
  const daquiSete = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const proximaReuniao = atividades
    .filter((a) => a.tipo === "reuniao" && a.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  const emFuro = atividades.filter(
    (a) => !a.responsavelId && a.data >= hoje && a.data <= daquiSete,
  );

  return {
    participantesAtivos: pessoas.filter((p) => p.status === "ativo").length,
    semResponsavel: atividades.filter((a) => !a.responsavelId).length,
    proximaReuniaoData: proximaReuniao?.data ?? null,
    furosEstaSemana: emFuro.length,
    atividadesEmFuro: emFuro,
  };
}
