import "server-only";
import * as repo from "@/lib/repos/pessoas";
import { listarFuncoes } from "@/lib/repos/funcoes";
import type { Funcao, Pessoa } from "@/lib/types";

/*
  Leitura. É a única porta que página e componente atravessam para chegar aos dados —
  as assinaturas seguem `async` (docs/sdd-implementacao.md §2, regra 1) para que trocar
  SQLite por um banco remoto não mude um único chamador.
*/

export async function getPessoas(departamentoId: string): Promise<Pessoa[]> {
  return repo.listarPessoas(departamentoId);
}

export async function getPessoasAtivas(departamentoId: string): Promise<Pessoa[]> {
  return repo.listarPessoas(departamentoId).filter((p) => p.status === "ativo");
}

export async function getPessoa(id: string): Promise<Pessoa | undefined> {
  return repo.buscarPessoa(id);
}

export async function getPessoaPorEmail(email: string): Promise<Pessoa | undefined> {
  return repo.buscarPessoaPorEmail(email);
}

export async function getFuncoesDaPessoa(pessoaId: string): Promise<Funcao[]> {
  const ids = new Set(repo.funcoesDaPessoa(pessoaId));
  const pessoa = repo.buscarPessoa(pessoaId);
  if (!pessoa) return [];
  return listarFuncoes(pessoa.departamentoId).filter((f) => ids.has(f.id));
}

export async function getIdsDeFuncoesDaPessoa(pessoaId: string): Promise<string[]> {
  return repo.funcoesDaPessoa(pessoaId);
}

export async function getFuncoesPorPessoaDoDepartamento(
  departamentoId: string,
): Promise<Record<string, string[]>> {
  return repo.funcoesPorPessoa(departamentoId);
}
