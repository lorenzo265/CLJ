import "server-only";
import { getDb } from "@/lib/db";
import { agoraISO, escreverLista, lerDias, lerPeriodos, novoId } from "@/lib/repos/comum";
import type { DiaSemana, PapelSistema, Periodo, Pessoa } from "@/lib/types";

interface LinhaPessoa {
  id: string;
  nome: string;
  contato: string;
  email: string;
  departamento_id: string;
  papel_sistema: PapelSistema;
  senha_hash: string | null;
  dias: string;
  periodos: string;
  cadastro_completo: number;
  status: "ativo" | "inativo";
}

/** O hash NUNCA sai daqui: `Pessoa` só carrega `temSenha`. */
function paraPessoa(l: LinhaPessoa): Pessoa {
  return {
    id: l.id,
    nome: l.nome,
    contato: l.contato,
    email: l.email,
    departamentoId: l.departamento_id,
    papelSistema: l.papel_sistema,
    disponibilidade: { dias: lerDias(l.dias), periodos: lerPeriodos(l.periodos) },
    cadastroCompleto: l.cadastro_completo === 1,
    status: l.status,
    temSenha: l.senha_hash !== null,
  };
}

const COLUNAS = `id, nome, contato, email, departamento_id, papel_sistema, senha_hash,
                 dias, periodos, cadastro_completo, status`;

export function listarPessoas(departamentoId: string): Pessoa[] {
  return (
    getDb()
      .prepare(`SELECT ${COLUNAS} FROM pessoas WHERE departamento_id = ? ORDER BY nome`)
      .all(departamentoId) as LinhaPessoa[]
  ).map(paraPessoa);
}

export function buscarPessoa(id: string): Pessoa | undefined {
  const l = getDb().prepare(`SELECT ${COLUNAS} FROM pessoas WHERE id = ?`).get(id) as
    | LinhaPessoa
    | undefined;
  return l ? paraPessoa(l) : undefined;
}

export function buscarPessoaPorEmail(email: string): Pessoa | undefined {
  const l = getDb()
    .prepare(`SELECT ${COLUNAS} FROM pessoas WHERE lower(email) = lower(?)`)
    .get(email.trim()) as LinhaPessoa | undefined;
  return l ? paraPessoa(l) : undefined;
}

/** Uso exclusivo do login. Devolve o hash e nada mais. */
export function hashDaPessoa(id: string): string | null {
  const l = getDb().prepare("SELECT senha_hash FROM pessoas WHERE id = ?").get(id) as
    | { senha_hash: string | null }
    | undefined;
  return l?.senha_hash ?? null;
}

export function criarPessoa(dados: {
  nome: string;
  email: string;
  departamentoId: string;
  papelSistema: PapelSistema;
  senhaHash?: string | null;
  contato?: string;
}): string {
  const id = novoId();
  getDb()
    .prepare(
      `INSERT INTO pessoas
         (id, nome, contato, email, departamento_id, papel_sistema, senha_hash,
          dias, periodos, cadastro_completo, status, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', '', 0, 'ativo', ?)`,
    )
    .run(
      id,
      dados.nome,
      dados.contato ?? "",
      dados.email.trim(),
      dados.departamentoId,
      dados.papelSistema,
      dados.senhaHash ?? null,
      agoraISO(),
    );
  return id;
}

export function definirSenha(pessoaId: string, hash: string): void {
  getDb().prepare("UPDATE pessoas SET senha_hash = ? WHERE id = ?").run(hash, pessoaId);
}

export function definirStatus(pessoaId: string, status: "ativo" | "inativo"): void {
  getDb().prepare("UPDATE pessoas SET status = ? WHERE id = ?").run(status, pessoaId);
}

export function definirPapel(pessoaId: string, papel: PapelSistema): void {
  getDb().prepare("UPDATE pessoas SET papel_sistema = ? WHERE id = ?").run(papel, pessoaId);
}

/** O cadastro do participante: dados, funções e disponibilidade, numa transação só. */
export function salvarCadastro(
  pessoaId: string,
  dados: {
    nome: string;
    contato: string;
    dias: DiaSemana[];
    periodos: Periodo[];
    funcoes: string[];
  },
): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare(
      `UPDATE pessoas
          SET nome = ?, contato = ?, dias = ?, periodos = ?, cadastro_completo = 1
        WHERE id = ?`,
    ).run(
      dados.nome,
      dados.contato,
      escreverLista(dados.dias),
      escreverLista(dados.periodos),
      pessoaId,
    );
    definirFuncoesDaPessoaSemTransacao(pessoaId, dados.funcoes);
  })();
}

function definirFuncoesDaPessoaSemTransacao(pessoaId: string, funcoes: string[]): void {
  const db = getDb();
  db.prepare("DELETE FROM pessoa_funcoes WHERE pessoa_id = ?").run(pessoaId);
  const ins = db.prepare(
    "INSERT OR IGNORE INTO pessoa_funcoes (pessoa_id, funcao_id) VALUES (?, ?)",
  );
  for (const funcaoId of new Set(funcoes)) ins.run(pessoaId, funcaoId);
}

export function definirFuncoesDaPessoa(pessoaId: string, funcoes: string[]): void {
  getDb().transaction(() => definirFuncoesDaPessoaSemTransacao(pessoaId, funcoes))();
}

export function funcoesDaPessoa(pessoaId: string): string[] {
  return (
    getDb()
      .prepare("SELECT funcao_id FROM pessoa_funcoes WHERE pessoa_id = ?")
      .all(pessoaId) as { funcao_id: string }[]
  ).map((l) => l.funcao_id);
}

/** Um SELECT só para a tabela inteira de participantes — evita N+1 na tela de gestão. */
export function funcoesPorPessoa(departamentoId: string): Record<string, string[]> {
  const linhas = getDb()
    .prepare(
      `SELECT pf.pessoa_id, pf.funcao_id
         FROM pessoa_funcoes pf
         JOIN pessoas p ON p.id = pf.pessoa_id
        WHERE p.departamento_id = ?`,
    )
    .all(departamentoId) as { pessoa_id: string; funcao_id: string }[];

  const porPessoa: Record<string, string[]> = {};
  for (const l of linhas) (porPessoa[l.pessoa_id] ??= []).push(l.funcao_id);
  return porPessoa;
}
