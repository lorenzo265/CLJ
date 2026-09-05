import { addDays, format } from "date-fns";
import type { Atividade } from "@/lib/types";

/*
  Domínio puro da escala: não conhece banco nem React, e é por isso que é testável.
  A Opção A (Hoje · Esta semana · Depois) é a direção escolhida — ver
  docs/sdd-implementacao.md §1.1. As funções das opções B e C ficam aqui, testadas,
  para que trocar de direção custe uma tela e não uma refatoração.
*/

export type PapelNaAtividade = "responsavel" | "suplente" | "nenhum";

export interface AtividadeComPapel {
  atividade: Atividade;
  papel: PapelNaAtividade;
}

/** Anota o papel do viewer em cada atividade. Escrita uma vez, usada por qualquer tela. */
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
  const porDia = a.atividade.data.localeCompare(b.atividade.data);
  if (porDia !== 0) return porDia;
  return (a.atividade.hora ?? "99:99").localeCompare(b.atividade.hora ?? "99:99");
}

const hojeISO = (hoje: Date) => format(hoje, "yyyy-MM-dd");

/**
 * Agrupa em Hoje / Esta semana / Depois — a Opção A.
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

/** A próxima atividade do viewer (papel != "nenhum"), a partir de hoje — a manchete. */
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

const CONCLUIDOS = new Set(["publicado", "concluido"]);

/**
 * A dezena da semana: as contas do viewer na janela rolante de 7 dias, e quantas já
 * foram passadas. Sem punição — dezena incompleta só informa (decisoes-design.md §8).
 */
export function dezenaDaSemana(
  itens: AtividadeComPapel[],
  hoje: Date = new Date(),
): { total: number; passadas: number; itens: AtividadeComPapel[] } {
  const h = hojeISO(hoje);
  const fim = hojeISO(addDays(hoje, 7));

  const meus = itens
    .filter((i) => i.papel !== "nenhum" && i.atividade.data >= h && i.atividade.data <= fim)
    .sort(porData);

  return {
    total: meus.length,
    passadas: meus.filter((i) => CONCLUIDOS.has(i.atividade.status)).length,
    itens: meus,
  };
}

/** O que o departamento tem pela frente e não é seu — o terceiro nível da tela Hoje. */
export function doDepartamento(
  itens: AtividadeComPapel[],
  hoje: Date = new Date(),
  limite = 4,
): AtividadeComPapel[] {
  const h = hojeISO(hoje);
  return itens
    .filter((i) => i.papel === "nenhum" && i.atividade.data >= h)
    .sort(porData)
    .slice(0, limite);
}
