import type { Atividade, Pessoa, StatusAtividade } from "@/lib/types";
import { STATUS_ATIVIDADE } from "@/lib/types";

/*
  Domínio puro do quadro: como as atividades viram colunas. Sem React e sem banco, porque é
  aqui que mora a decisão de produto — quem aparece, em que ordem, e o que some.
  Ver docs/sdd-implementacao.md §8, Fase 9.
*/

/** A coluna dos furos. Não é um id de pessoa, e por isso não pode colidir com um. */
export const SEM_NINGUEM = "__sem__";

export type Agrupamento = "pessoa" | "status";

export interface ColunaDoQuadro {
  chave: string;
  titulo: string;
  /** "furo" pede destaque; "apagado" é quem saiu do departamento e ainda tem conta na mão. */
  tom?: "furo" | "apagado";
  itens: Atividade[];
}

/**
 * Uma coluna por pessoa, e os furos primeiro — furo é o que pede decisão, e o que estiver
 * na primeira coluna é o que se lê antes de rolar.
 *
 * Quem saiu do departamento só aparece se ainda tiver conta na mão: some quando esvazia,
 * mas nunca esconde trabalho pendurado num nome que ninguém vai cobrar.
 */
export function colunasPorPessoa(atividades: Atividade[], pessoas: Pessoa[]): ColunaDoQuadro[] {
  const furos: ColunaDoQuadro = {
    chave: SEM_NINGUEM,
    titulo: "Sem responsável",
    tom: "furo",
    itens: atividades.filter((a) => !a.responsavelId),
  };

  const das = pessoas.map((p) => ({
    chave: p.id,
    titulo: p.nome,
    tom: p.status === "inativo" ? ("apagado" as const) : undefined,
    itens: atividades.filter((a) => a.responsavelId === p.id),
  }));

  return [furos, ...das.filter((c) => c.tom !== "apagado" || c.itens.length > 0)];
}

/**
 * Uma coluna por status, na ordem do vocabulário — que não foi inventada para o quadro:
 * `ideia → rascunho → agendado → publicado → concluido` está no CHECK do banco desde a
 * Fase 2. Colunas vazias ficam: são o destino de um arrasto.
 */
export function colunasPorStatus(atividades: Atividade[]): ColunaDoQuadro[] {
  return STATUS_ATIVIDADE.map((s) => ({
    chave: s,
    itens: atividades.filter((a) => a.status === s),
    titulo: s,
  }));
}

/** A maior coluna — a régua das barras de carga. Nunca zero, para não dividir por ele. */
export function maiorColuna(colunas: ColunaDoQuadro[]): number {
  return Math.max(1, ...colunas.map((c) => c.itens.length));
}

/** A coluna em que a atividade está hoje — o valor atual do seletor de mover. */
export function colunaAtual(atividade: Atividade, agrupamento: Agrupamento): string {
  return agrupamento === "pessoa"
    ? (atividade.responsavelId ?? SEM_NINGUEM)
    : atividade.status;
}

/**
 * O que soltar numa coluna significa. `null` = a atividade já está lá e nada acontece —
 * é o que impede um arrasto que não sai do lugar de virar uma troca registrada à toa.
 */
export function movimentoAoSoltar(
  atividade: Atividade,
  destino: string,
  agrupamento: Agrupamento,
): { campo: "responsavel"; valor: string | null } | { campo: "status"; valor: StatusAtividade } | null {
  if (colunaAtual(atividade, agrupamento) === destino) return null;

  if (agrupamento === "pessoa") {
    return { campo: "responsavel", valor: destino === SEM_NINGUEM ? null : destino };
  }
  if (!(STATUS_ATIVIDADE as string[]).includes(destino)) return null;
  return { campo: "status", valor: destino as StatusAtividade };
}
