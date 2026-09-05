import "server-only";
import { getDb } from "@/lib/db";
import { novoId } from "@/lib/repos/comum";
import type { Funcao } from "@/lib/types";

interface LinhaFuncao {
  id: string;
  departamento_id: string;
  nome: string;
  descricao: string;
}

const paraFuncao = (l: LinhaFuncao): Funcao => ({
  id: l.id,
  departamentoId: l.departamento_id,
  nome: l.nome,
  descricao: l.descricao,
});

export function listarFuncoes(departamentoId: string): Funcao[] {
  return (
    getDb()
      .prepare("SELECT * FROM funcoes WHERE departamento_id = ? ORDER BY nome")
      .all(departamentoId) as LinhaFuncao[]
  ).map(paraFuncao);
}

export function buscarFuncao(id: string): Funcao | undefined {
  const l = getDb().prepare("SELECT * FROM funcoes WHERE id = ?").get(id) as
    | LinhaFuncao
    | undefined;
  return l ? paraFuncao(l) : undefined;
}

export function criarFuncao(departamentoId: string, nome: string, descricao: string): string {
  const id = novoId();
  getDb()
    .prepare("INSERT INTO funcoes (id, departamento_id, nome, descricao) VALUES (?, ?, ?, ?)")
    .run(id, departamentoId, nome, descricao);
  return id;
}

export function atualizarFuncao(id: string, nome: string, descricao: string): void {
  getDb().prepare("UPDATE funcoes SET nome = ?, descricao = ? WHERE id = ?").run(nome, descricao, id);
}

export function excluirFuncao(id: string): void {
  getDb().prepare("DELETE FROM funcoes WHERE id = ?").run(id);
}

/** Quantas atividades ainda apontam para a função — excluir com uso é bloqueado na action. */
export function atividadesUsandoFuncao(id: string): number {
  const { total } = getDb()
    .prepare("SELECT count(*) AS total FROM atividades WHERE funcao_id = ?")
    .get(id) as { total: number };
  return total;
}

export function contagemPessoasPorFuncao(departamentoId: string): Record<string, number> {
  const linhas = getDb()
    .prepare(
      `SELECT pf.funcao_id, count(*) AS total
         FROM pessoa_funcoes pf
         JOIN pessoas p ON p.id = pf.pessoa_id
        WHERE p.departamento_id = ?
        GROUP BY pf.funcao_id`,
    )
    .all(departamentoId) as { funcao_id: string; total: number }[];

  return Object.fromEntries(linhas.map((l) => [l.funcao_id, l.total]));
}

export function pessoasDaFuncao(funcaoId: string): string[] {
  return (
    getDb()
      .prepare("SELECT pessoa_id FROM pessoa_funcoes WHERE funcao_id = ?")
      .all(funcaoId) as { pessoa_id: string }[]
  ).map((l) => l.pessoa_id);
}
