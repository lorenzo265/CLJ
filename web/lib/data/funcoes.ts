import { funcoes, pessoaFuncoes } from "@/lib/mock/funcoes";
import { pessoas } from "@/lib/mock/pessoas";
import type { Funcao } from "@/lib/types";

export async function getFuncoes(departamentoId: string): Promise<Funcao[]> {
  return funcoes.filter((f) => f.departamentoId === departamentoId);
}

export async function getFuncao(id: string): Promise<Funcao | undefined> {
  return funcoes.find((f) => f.id === id);
}

export async function getPessoasDaFuncao(funcaoId: string) {
  const ids = pessoaFuncoes.filter((pf) => pf.funcaoId === funcaoId).map((pf) => pf.pessoaId);
  return pessoas.filter((p) => ids.includes(p.id));
}

export async function getContagemPessoasPorFuncao(departamentoId: string): Promise<Record<string, number>> {
  const idsDoDepartamento = new Set(pessoas.filter((p) => p.departamentoId === departamentoId).map((p) => p.id));
  const contagem: Record<string, number> = {};
  for (const pf of pessoaFuncoes) {
    if (!idsDoDepartamento.has(pf.pessoaId)) continue;
    contagem[pf.funcaoId] = (contagem[pf.funcaoId] ?? 0) + 1;
  }
  return contagem;
}
