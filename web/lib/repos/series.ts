import "server-only";
import { getDb } from "@/lib/db";
import { agoraISO, novoId } from "@/lib/repos/comum";
import type { DiaSemana, Serie, StatusAtividade, TipoAtividade } from "@/lib/types";
import { DIAS_SEMANA } from "@/lib/types";

/*
  SQL cru da série. A criação e a redistribuição são TRANSAÇÕES: ou a série nasce com as
  trinta atividades dela, ou não nasce nenhuma. Meia série no banco seria pior que série
  nenhuma — a coordenação teria de descobrir onde parou.
*/

interface LinhaSerie {
  id: string;
  departamento_id: string;
  titulo: string;
  tipo: TipoAtividade;
  funcao_id: string | null;
  hora: string | null;
  dias: string;
  inicio: string;
  fim: string;
  criado_por: string;
  criado_em: string;
}

const lerDias = (csv: string): DiaSemana[] =>
  csv
    .split(",")
    .map((d) => d.trim())
    .filter((d): d is DiaSemana => (DIAS_SEMANA as string[]).includes(d));

const paraSerie = (l: LinhaSerie): Serie => ({
  id: l.id,
  departamentoId: l.departamento_id,
  titulo: l.titulo,
  tipo: l.tipo,
  funcaoId: l.funcao_id,
  hora: l.hora,
  dias: lerDias(l.dias),
  inicio: l.inicio,
  fim: l.fim,
  criadoPor: l.criado_por,
  criadoEm: l.criado_em,
});

export function listarSeries(departamentoId: string): Serie[] {
  return (
    getDb()
      .prepare("SELECT * FROM series WHERE departamento_id = ? ORDER BY inicio DESC, titulo")
      .all(departamentoId) as LinhaSerie[]
  ).map(paraSerie);
}

export function buscarSerie(id: string): Serie | undefined {
  const l = getDb().prepare("SELECT * FROM series WHERE id = ?").get(id) as LinhaSerie | undefined;
  return l ? paraSerie(l) : undefined;
}

export interface DadosSerie {
  titulo: string;
  tipo: TipoAtividade;
  funcaoId: string | null;
  hora: string | null;
  dias: DiaSemana[];
  inicio: string;
  fim: string;
}

/** Uma data já resolvida da série: quem faz, com quem de reserva. */
export interface OcorrenciaSerie {
  data: string;
  responsavelId: string | null;
  suplenteId: string | null;
}

/**
 * Grava a série e as atividades dela num commit só. `status` nasce em 'agendado' quando
 * já tem responsável e 'ideia' quando é furo — o furo não é um compromisso ainda.
 */
export function criarSerie(
  departamentoId: string,
  d: DadosSerie,
  ocorrencias: OcorrenciaSerie[],
  criadoPor: string,
): { serieId: string; criadas: number } {
  const db = getDb();
  const serieId = novoId();

  db.transaction(() => {
    db.prepare(
      `INSERT INTO series
         (id, departamento_id, titulo, tipo, funcao_id, hora, dias, inicio, fim,
          criado_por, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      serieId,
      departamentoId,
      d.titulo,
      d.tipo,
      d.funcaoId,
      d.hora,
      d.dias.join(","),
      d.inicio,
      d.fim,
      criadoPor,
      agoraISO(),
    );

    const inserir = db.prepare(
      `INSERT INTO atividades
         (id, departamento_id, tipo, titulo, funcao_id, data, hora,
          responsavel_id, suplente_id, status, link_midia, serie_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    );

    for (const o of ocorrencias) {
      const status: StatusAtividade = o.responsavelId ? "agendado" : "ideia";
      inserir.run(
        novoId(),
        departamentoId,
        d.tipo,
        d.titulo,
        d.funcaoId,
        o.data,
        d.hora,
        o.responsavelId,
        o.suplenteId,
        status,
        serieId,
      );
    }
  })();

  return { serieId, criadas: ocorrencias.length };
}

interface LinhaAtividadeDaSerie {
  id: string;
  data: string;
  responsavel_id: string | null;
  status: StatusAtividade;
}

const CUMPRIDOS = "('publicado', 'concluido')";

/**
 * As atividades da série que ainda dá para remexer: da data de corte em diante e ainda
 * não cumpridas. Redistribuir não reescreve o passado nem apaga o que já saiu no ar.
 */
export function atividadesRemanejaveis(
  serieId: string,
  aPartirDe: string,
): { id: string; data: string; responsavelId: string | null }[] {
  return (
    getDb()
      .prepare(
        `SELECT id, data, responsavel_id, status FROM atividades
          WHERE serie_id = ? AND data >= ? AND status NOT IN ${CUMPRIDOS}
          ORDER BY data, id`,
      )
      .all(serieId, aPartirDe) as LinhaAtividadeDaSerie[]
  ).map((l) => ({ id: l.id, data: l.data, responsavelId: l.responsavel_id }));
}

/** Quantas contas cada pessoa já carrega na série, contando o que não será remexido. */
export function cargaFixadaDaSerie(serieId: string, aPartirDe: string): Record<string, number> {
  const linhas = getDb()
    .prepare(
      `SELECT responsavel_id AS pessoa, COUNT(*) AS total FROM atividades
        WHERE serie_id = ? AND responsavel_id IS NOT NULL
          AND (data < ? OR status IN ${CUMPRIDOS})
        GROUP BY responsavel_id`,
    )
    .all(serieId, aPartirDe) as { pessoa: string; total: number }[];

  return Object.fromEntries(linhas.map((l) => [l.pessoa, l.total]));
}

/**
 * Reatribui em bloco e registra cada mudança em `trocas` — a redistribuição é feita de
 * trocas, e nenhuma delas escapa do registro (decisoes-estrutura.md §5).
 */
export function aplicarRedistribuicao(
  novos: { id: string; deId: string | null; paraId: string | null }[],
  contexto: { feitaPor: string; motivo: string },
): number {
  const db = getDb();
  let mudadas = 0;

  db.transaction(() => {
    const atualizar = db.prepare(
      `UPDATE atividades
          SET responsavel_id = ?,
              status = CASE WHEN ? IS NULL AND status = 'agendado' THEN 'ideia'
                            WHEN ? IS NOT NULL AND status = 'ideia' THEN 'agendado'
                            ELSE status END
        WHERE id = ?`,
    );
    const registrar = db.prepare(
      `INSERT INTO trocas
         (id, atividade_id, papel, de_pessoa_id, para_pessoa_id, motivo, feita_por, criado_em)
       VALUES (?, ?, 'responsavel', ?, ?, ?, ?, ?)`,
    );

    for (const n of novos) {
      if (n.deId === n.paraId) continue;
      atualizar.run(n.paraId, n.paraId, n.paraId, n.id);
      registrar.run(novoId(), n.id, n.deId, n.paraId, contexto.motivo, contexto.feitaPor, agoraISO());
      mudadas += 1;
    }
  })();

  return mudadas;
}

/**
 * Apaga a série e as atividades dela que ainda não foram cumpridas, a partir da data de
 * corte. O que já saiu no ar fica — vira atividade avulsa (`serie_id` volta a NULL pela
 * FK), porque apagar histórico é pior que deixar um órfão.
 */
export function excluirSerie(id: string, aPartirDe: string): number {
  const db = getDb();
  let apagadas = 0;

  db.transaction(() => {
    apagadas = db
      .prepare(
        `DELETE FROM atividades
          WHERE serie_id = ? AND data >= ? AND status NOT IN ${CUMPRIDOS}`,
      )
      .run(id, aPartirDe).changes;
    db.prepare("DELETE FROM series WHERE id = ?").run(id);
  })();

  return apagadas;
}

/** Quantas atividades cada série ainda tem no banco — um SELECT para a tela inteira. */
export function contagemPorSerie(departamentoId: string): Record<string, number> {
  const linhas = getDb()
    .prepare(
      `SELECT serie_id AS serie, COUNT(*) AS total FROM atividades
        WHERE departamento_id = ? AND serie_id IS NOT NULL
        GROUP BY serie_id`,
    )
    .all(departamentoId) as { serie: string; total: number }[];

  return Object.fromEntries(linhas.map((l) => [l.serie, l.total]));
}
