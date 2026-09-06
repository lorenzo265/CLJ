import "server-only";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { agoraISO } from "@/lib/repos/comum";
import type { Convite, PapelSistema } from "@/lib/types";

const DIAS_SESSAO = 30;
const DIAS_CONVITE = 14;

function token(): string {
  return randomBytes(32).toString("base64url");
}

function emDias(dias: number): string {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();
}

/* ---------------------------------------------------------------- sessões */

export function criarSessao(pessoaId: string): { token: string; expiraEm: string } {
  const t = token();
  const expiraEm = emDias(DIAS_SESSAO);
  getDb()
    .prepare("INSERT INTO sessoes (token, pessoa_id, criado_em, expira_em) VALUES (?, ?, ?, ?)")
    .run(t, pessoaId, agoraISO(), expiraEm);
  return { token: t, expiraEm };
}

/** Sessão expirada é apagada na leitura — a limpeza não precisa de rotina própria. */
export function pessoaDaSessao(t: string): string | null {
  const db = getDb();
  const linha = db.prepare("SELECT pessoa_id, expira_em FROM sessoes WHERE token = ?").get(t) as
    | { pessoa_id: string; expira_em: string }
    | undefined;
  if (!linha) return null;
  if (linha.expira_em <= agoraISO()) {
    db.prepare("DELETE FROM sessoes WHERE token = ?").run(t);
    return null;
  }
  return linha.pessoa_id;
}

export function apagarSessao(t: string): void {
  getDb().prepare("DELETE FROM sessoes WHERE token = ?").run(t);
}

/* --------------------------------------------------------------- convites */

interface LinhaConvite {
  token: string;
  email: string;
  nome: string;
  papel_sistema: PapelSistema;
  departamento_id: string;
  criado_por: string;
  criado_em: string;
  expira_em: string;
  usado_em: string | null;
}

const paraConvite = (l: LinhaConvite): Convite => ({
  token: l.token,
  email: l.email,
  nome: l.nome,
  papelSistema: l.papel_sistema,
  departamentoId: l.departamento_id,
  criadoPor: l.criado_por,
  criadoEm: l.criado_em,
  expiraEm: l.expira_em,
  usadoEm: l.usado_em,
});

export function criarConvite(dados: {
  email: string;
  nome: string;
  papelSistema: PapelSistema;
  departamentoId: string;
  criadoPor: string;
}): Convite {
  const t = token();
  const convite: LinhaConvite = {
    token: t,
    email: dados.email.trim(),
    nome: dados.nome.trim(),
    papel_sistema: dados.papelSistema,
    departamento_id: dados.departamentoId,
    criado_por: dados.criadoPor,
    criado_em: agoraISO(),
    expira_em: emDias(DIAS_CONVITE),
    usado_em: null,
  };
  getDb()
    .prepare(
      `INSERT INTO convites
         (token, email, nome, papel_sistema, departamento_id, criado_por, criado_em, expira_em, usado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    )
    .run(
      convite.token,
      convite.email,
      convite.nome,
      convite.papel_sistema,
      convite.departamento_id,
      convite.criado_por,
      convite.criado_em,
      convite.expira_em,
    );
  return paraConvite(convite);
}

export function buscarConvite(t: string): Convite | undefined {
  const l = getDb().prepare("SELECT * FROM convites WHERE token = ?").get(t) as
    | LinhaConvite
    | undefined;
  return l ? paraConvite(l) : undefined;
}

export function marcarConviteUsado(t: string): void {
  getDb().prepare("UPDATE convites SET usado_em = ? WHERE token = ?").run(agoraISO(), t);
}

/** Convites pendentes: nem usados, nem vencidos. É o que a tela de participantes lista. */
export function convitesPendentes(departamentoId: string): Convite[] {
  return (
    getDb()
      .prepare(
        `SELECT * FROM convites
          WHERE departamento_id = ? AND usado_em IS NULL AND expira_em > ?
          ORDER BY criado_em DESC`,
      )
      .all(departamentoId, agoraISO()) as LinhaConvite[]
  ).map(paraConvite);
}

export function revogarConvite(t: string): void {
  getDb().prepare("DELETE FROM convites WHERE token = ?").run(t);
}

export function conviteValido(convite: Convite | undefined): convite is Convite {
  return !!convite && convite.usadoEm === null && convite.expiraEm > agoraISO();
}
