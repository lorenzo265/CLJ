import "server-only";
import * as repo from "@/lib/repos/funcoes";
import { buscarPessoa } from "@/lib/repos/pessoas";
import type { Funcao, Pessoa } from "@/lib/types";

export async function getFuncoes(departamentoId: string): Promise<Funcao[]> {
  return repo.listarFuncoes(departamentoId);
}

export async function getFuncao(id: string): Promise<Funcao | undefined> {
  return repo.buscarFuncao(id);
}

export async function getPessoasDaFuncao(funcaoId: string): Promise<Pessoa[]> {
  return repo
    .pessoasDaFuncao(funcaoId)
    .map(buscarPessoa)
    .filter((p): p is Pessoa => p !== undefined);
}

export async function getContagemPessoasPorFuncao(
  departamentoId: string,
): Promise<Record<string, number>> {
  return repo.contagemPessoasPorFuncao(departamentoId);
}

/** Excluir função em uso apagaria o vínculo de atividades — a tela precisa saber antes. */
export async function getUsoDaFuncao(id: string): Promise<number> {
  return repo.atividadesUsandoFuncao(id);
}
