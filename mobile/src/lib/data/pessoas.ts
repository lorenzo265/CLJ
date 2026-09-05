import { pessoas } from "@/lib/mock/pessoas";
import { pessoaFuncoes, funcoes } from "@/lib/mock/funcoes";
import type { Pessoa } from "@/lib/types";

// Assinaturas async desde o dia 1: hoje leem um array em memória, depois viram
// `await supabase.from(...)` sem os chamadores mudarem uma linha.

export async function getPessoas(departamentoId: string): Promise<Pessoa[]> {
  return pessoas.filter((p) => p.departamentoId === departamentoId);
}

export async function getPessoa(id: string): Promise<Pessoa | undefined> {
  return pessoas.find((p) => p.id === id);
}

export async function getFuncoesDaPessoa(pessoaId: string) {
  const ids = pessoaFuncoes.filter((pf) => pf.pessoaId === pessoaId).map((pf) => pf.funcaoId);
  return funcoes.filter((f) => ids.includes(f.id));
}

export async function getFuncoesPorPessoaDoDepartamento(
  departamentoId: string
): Promise<Record<string, string[]>> {
  const idsDoDepartamento = new Set(getPessoasSync(departamentoId).map((p) => p.id));
  const porPessoa: Record<string, string[]> = {};
  for (const pf of pessoaFuncoes) {
    if (!idsDoDepartamento.has(pf.pessoaId)) continue;
    (porPessoa[pf.pessoaId] ??= []).push(pf.funcaoId);
  }
  return porPessoa;
}

function getPessoasSync(departamentoId: string) {
  return pessoas.filter((p) => p.departamentoId === departamentoId);
}
