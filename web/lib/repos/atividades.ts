import "server-only";
import { getDb } from "@/lib/db";
import { agoraISO, novoId } from "@/lib/repos/comum";
import type { Atividade, StatusAtividade, TipoAtividade, Troca } from "@/lib/types";

interface LinhaAtividade {
  id: string;
  departamento_id: string;
  tipo: TipoAtividade;
  titulo: string;
  funcao_id: string | null;
  data: string;
  hora: string | null;
  responsavel_id: string | null;
  suplente_id: string | null;
  status: StatusAtividade;
  link_midia: string | null;
}

const paraAtividade = (l: LinhaAtividade): Atividade => ({
  id: l.id,
  departamentoId: l.departamento_id,
  tipo: l.tipo,
  titulo: l.titulo,
  funcaoId: l.funcao_id,
  data: l.data,
  hora: l.hora,
  responsavelId: l.responsavel_id,
  suplenteId: l.suplente_id,
  status: l.status,
  linkMidia: l.link_midia,
});

export function listarAtividades(departamentoId: string): Atividade[] {
  return (
    getDb()
      .prepare("SELECT * FROM atividades WHERE departamento_id = ? ORDER BY data, hora, titulo")
      .all(departamentoId) as LinhaAtividade[]
  ).map(paraAtividade);
}

export function buscarAtividade(id: string): Atividade | undefined {
  const l = getDb().prepare("SELECT * FROM atividades WHERE id = ?").get(id) as
    | LinhaAtividade
    | undefined;
  return l ? paraAtividade(l) : undefined;
}

export interface DadosAtividade {
  tipo: TipoAtividade;
  titulo: string;
  funcaoId: string | null;
  data: string;
  hora: string | null;
  responsavelId: string | null;
  suplenteId: string | null;
  status: StatusAtividade;
  linkMidia: string | null;
}

export function criarAtividade(departamentoId: string, d: DadosAtividade): string {
  const id = novoId();
  getDb()
    .prepare(
      `INSERT INTO atividades
         (id, departamento_id, tipo, titulo, funcao_id, data, hora,
          responsavel_id, suplente_id, status, link_midia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      departamentoId,
      d.tipo,
      d.titulo,
      d.funcaoId,
      d.data,
      d.hora,
      d.responsavelId,
      d.suplenteId,
      d.status,
      d.linkMidia,
    );
  return id;
}

/**
 * Atualiza a atividade e, quando responsável ou suplente mudam, grava a troca no mesmo
 * commit — não existe caminho que troque alguém sem deixar registro
 * (decisoes-estrutura.md §5).
 */
export function atualizarAtividade(
  id: string,
  d: DadosAtividade,
  contexto: { feitaPor: string; motivo?: string },
): void {
  const db = getDb();
  db.transaction(() => {
    const antes = buscarAtividade(id);
    if (!antes) return;

    db.prepare(
      `UPDATE atividades
          SET tipo = ?, titulo = ?, funcao_id = ?, data = ?, hora = ?,
              responsavel_id = ?, suplente_id = ?, status = ?, link_midia = ?
        WHERE id = ?`,
    ).run(
      d.tipo,
      d.titulo,
      d.funcaoId,
      d.data,
      d.hora,
      d.responsavelId,
      d.suplenteId,
      d.status,
      d.linkMidia,
      id,
    );

    if (antes.responsavelId !== d.responsavelId) {
      inserirTroca(id, "responsavel", antes.responsavelId, d.responsavelId, contexto);
    }
    if (antes.suplenteId !== d.suplenteId) {
      inserirTroca(id, "suplente", antes.suplenteId, d.suplenteId, contexto);
    }
  })();
}

export function definirStatus(id: string, status: StatusAtividade): void {
  getDb().prepare("UPDATE atividades SET status = ? WHERE id = ?").run(status, id);
}

export function excluirAtividade(id: string): void {
  getDb().prepare("DELETE FROM atividades WHERE id = ?").run(id);
}

function inserirTroca(
  atividadeId: string,
  papel: "responsavel" | "suplente",
  de: string | null,
  para: string | null,
  contexto: { feitaPor: string; motivo?: string },
): void {
  getDb()
    .prepare(
      `INSERT INTO trocas
         (id, atividade_id, papel, de_pessoa_id, para_pessoa_id, motivo, feita_por, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(novoId(), atividadeId, papel, de, para, contexto.motivo ?? "", contexto.feitaPor, agoraISO());
}


interface LinhaTroca {
  id: string;
  atividade_id: string;
  papel: "responsavel" | "suplente";
  de_pessoa_id: string | null;
  para_pessoa_id: string | null;
  motivo: string;
  feita_por: string;
  criado_em: string;
}

/** Todo o histórico do departamento num SELECT — a tela de escala mostra o de cada linha. */
export function trocasDoDepartamento(departamentoId: string): Record<string, Troca[]> {
  const linhas = getDb()
    .prepare(
      `SELECT t.* FROM trocas t
         JOIN atividades a ON a.id = t.atividade_id
        WHERE a.departamento_id = ?
        ORDER BY t.criado_em DESC`,
    )
    .all(departamentoId) as LinhaTroca[];

  const porAtividade: Record<string, Troca[]> = {};
  for (const l of linhas) (porAtividade[l.atividade_id] ??= []).push(paraTroca(l));
  return porAtividade;
}

export function listarTrocas(atividadeId: string): Troca[] {
  return (
    getDb()
      .prepare("SELECT * FROM trocas WHERE atividade_id = ? ORDER BY criado_em DESC")
      .all(atividadeId) as LinhaTroca[]
  ).map(paraTroca);
}

const paraTroca = (l: LinhaTroca): Troca => ({
  id: l.id,
  atividadeId: l.atividade_id,
  papel: l.papel,
  dePessoaId: l.de_pessoa_id,
  paraPessoaId: l.para_pessoa_id,
  motivo: l.motivo,
  feitaPor: l.feita_por,
  criadoEm: l.criado_em,
});
