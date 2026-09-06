import "server-only";
import { getDb } from "@/lib/db";
import { lerJsonLista, novoId } from "@/lib/repos/comum";
import type { ItemFollowUp, Reuniao } from "@/lib/types";

interface LinhaReuniao {
  atividade_id: string;
  pauta: string;
  decisoes: string;
}

interface LinhaFollowUp {
  id: string;
  acao: string;
  responsavel_id: string | null;
  prazo: string;
}

function montar(l: LinhaReuniao): Reuniao {
  return {
    atividadeId: l.atividade_id,
    pauta: lerJsonLista(l.pauta),
    decisoes: lerJsonLista(l.decisoes),
    followUp: listarFollowUp(l.atividade_id),
  };
}

export function buscarReuniao(atividadeId: string): Reuniao | undefined {
  const l = getDb().prepare("SELECT * FROM reunioes WHERE atividade_id = ?").get(atividadeId) as
    | LinhaReuniao
    | undefined;
  return l ? montar(l) : undefined;
}

export function listarReunioes(departamentoId: string): Reuniao[] {
  return (
    getDb()
      .prepare(
        `SELECT r.* FROM reunioes r
           JOIN atividades a ON a.id = r.atividade_id
          WHERE a.departamento_id = ?
          ORDER BY a.data DESC`,
      )
      .all(departamentoId) as LinhaReuniao[]
  ).map(montar);
}

/** Cria a extensão de reunião se ainda não existir — chamado ao criar atividade do tipo. */
export function garantirReuniao(atividadeId: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO reunioes (atividade_id, pauta, decisoes) VALUES (?, '[]', '[]')")
    .run(atividadeId);
}

export function salvarPautaEDecisoes(
  atividadeId: string,
  pauta: string[],
  decisoes: string[],
): void {
  const db = getDb();
  db.transaction(() => {
    garantirReuniao(atividadeId);
    db.prepare("UPDATE reunioes SET pauta = ?, decisoes = ? WHERE atividade_id = ?").run(
      JSON.stringify(pauta),
      JSON.stringify(decisoes),
      atividadeId,
    );
  })();
}

export function listarFollowUp(atividadeId: string): ItemFollowUp[] {
  return (
    getDb()
      .prepare(
        "SELECT id, acao, responsavel_id, prazo FROM reuniao_followup WHERE atividade_id = ? ORDER BY ordem, id",
      )
      .all(atividadeId) as LinhaFollowUp[]
  ).map((l) => ({
    id: l.id,
    acao: l.acao,
    responsavelId: l.responsavel_id,
    prazo: l.prazo,
  }));
}

/** Substitui a lista inteira: a tela edita o follow-up como um bloco. */
export function salvarFollowUp(
  atividadeId: string,
  itens: { acao: string; responsavelId: string | null; prazo: string }[],
): void {
  const db = getDb();
  db.transaction(() => {
    garantirReuniao(atividadeId);
    db.prepare("DELETE FROM reuniao_followup WHERE atividade_id = ?").run(atividadeId);
    const ins = db.prepare(
      `INSERT INTO reuniao_followup (id, atividade_id, acao, responsavel_id, prazo, ordem)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    itens.forEach((item, i) => {
      if (!item.acao.trim()) return;
      ins.run(novoId(), atividadeId, item.acao.trim(), item.responsavelId, item.prazo, i);
    });
  })();
}

export function listarPresentes(atividadeId: string): string[] {
  return (
    getDb()
      .prepare("SELECT pessoa_id FROM reuniao_presentes WHERE atividade_id = ?")
      .all(atividadeId) as { pessoa_id: string }[]
  ).map((l) => l.pessoa_id);
}

export function presentesPorReuniao(departamentoId: string): Record<string, string[]> {
  const linhas = getDb()
    .prepare(
      `SELECT rp.atividade_id, rp.pessoa_id
         FROM reuniao_presentes rp
         JOIN atividades a ON a.id = rp.atividade_id
        WHERE a.departamento_id = ?`,
    )
    .all(departamentoId) as { atividade_id: string; pessoa_id: string }[];

  const porReuniao: Record<string, string[]> = {};
  for (const l of linhas) (porReuniao[l.atividade_id] ??= []).push(l.pessoa_id);
  return porReuniao;
}

export function definirPresenca(atividadeId: string, pessoaId: string, presente: boolean): void {
  const db = getDb();
  if (presente) {
    db.prepare(
      "INSERT OR IGNORE INTO reuniao_presentes (atividade_id, pessoa_id) VALUES (?, ?)",
    ).run(atividadeId, pessoaId);
  } else {
    db.prepare("DELETE FROM reuniao_presentes WHERE atividade_id = ? AND pessoa_id = ?").run(
      atividadeId,
      pessoaId,
    );
  }
}
