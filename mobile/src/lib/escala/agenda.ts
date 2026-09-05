import { addDays, format } from "date-fns";
import type { Atividade } from "@/lib/types";

export type PapelNaAtividade = "responsavel" | "suplente" | "nenhum";

export interface AtividadeComPapel {
  atividade: Atividade;
  papel: PapelNaAtividade;
}

/** Anota o papel do viewer em cada atividade. Escrita uma vez, usada por qualquer opção visual. */
export function comPapel(atividades: Atividade[], pessoaId: string): AtividadeComPapel[] {
  return atividades.map((atividade) => {
    const papel: PapelNaAtividade =
      atividade.responsavelId === pessoaId
        ? "responsavel"
        : atividade.suplenteId === pessoaId
          ? "suplente"
          : "nenhum";
    return { atividade, papel };
  });
}

function porData(a: AtividadeComPapel, b: AtividadeComPapel): number {
  return a.atividade.data.localeCompare(b.atividade.data);
}

const hojeISO = (hoje: Date) => format(hoje, "yyyy-MM-dd");

/**
 * Agrupa em Hoje / Esta semana / Depois — alimenta a Opção A.
 * "Esta semana" é uma janela ROLANTE (hoje+1..hoje+7), não a semana-calendário,
 * pra não esvaziar toda sexta/sábado.
 */
export function agruparPorPrazo(itens: AtividadeComPapel[], hoje: Date = new Date()) {
  const h = hojeISO(hoje);
  const fimSemana = hojeISO(addDays(hoje, 7));

  const doHoje = itens.filter((i) => i.atividade.data === h).sort(porData);
  const daSemana = itens
    .filter((i) => i.atividade.data > h && i.atividade.data <= fimSemana)
    .sort(porData);
  const depois = itens.filter((i) => i.atividade.data > fimSemana).sort(porData);

  return { hoje: doHoje, estaSemana: daSemana, depois };
}

/** A próxima atividade do viewer (papel != "nenhum"), a partir de hoje — Opção B (card). */
export function getProximaAtividade(itens: AtividadeComPapel[], hoje: Date = new Date()) {
  const h = hojeISO(hoje);
  return itens
    .filter((i) => i.papel !== "nenhum" && i.atividade.data >= h)
    .sort(porData)[0];
}

export interface DiaComTag {
  data: string;
  ehHoje: boolean;
  itens: AtividadeComPapel[];
}

/** Os 7 dias da semana corrente (seg-dom) com o que cai em cada um — Opção B (faixa). */
export function getSemanaAtual(itens: AtividadeComPapel[], hoje: Date = new Date()): DiaComTag[] {
  const diaSemana = (hoje.getDay() + 6) % 7; // 0=segunda
  const segunda = addDays(hoje, -diaSemana);
  const h = hojeISO(hoje);

  return Array.from({ length: 7 }, (_, i) => {
    const data = hojeISO(addDays(segunda, i));
    return {
      data,
      ehHoje: data === h,
      itens: itens.filter((it) => it.atividade.data === data),
    };
  });
}

/** Ordem cronológica simples, do mais antigo ao mais recente — Opção C (linha do tempo). */
export function ordenarCronologico(itens: AtividadeComPapel[]) {
  return [...itens].sort(porData);
}

/** Toggle "Meus" — exclui o que não é do viewer. */
export function filtrarMeus(itens: AtividadeComPapel[]) {
  return itens.filter((i) => i.papel !== "nenhum");
}
