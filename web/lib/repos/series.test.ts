import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { DEPARTAMENTO_CULTURAL } from "@/lib/departamento";
import { datasDaSerie, distribuirRodizio } from "@/lib/escala/serie";
import * as atividades from "@/lib/repos/atividades";
import * as series from "@/lib/repos/series";

/*
  A série contra o banco migrado de verdade — inclusive a coluna `serie_id`, que em bancos
  antigos entra por ALTER e não pelo CREATE.
*/

beforeAll(() => {
  getDb();
});

const REGRA = { dias: ["seg", "qua", "sex"] as const, inicio: "2026-10-05", fim: "2026-10-30" };

function criarSerieDeTeste(titulo: string, grupo: string[]) {
  const datas = datasDaSerie({ dias: [...REGRA.dias], inicio: REGRA.inicio, fim: REGRA.fim });
  const alocacoes = distribuirRodizio(
    datas,
    grupo.map((id) => ({ id, dias: [] })),
  );

  return {
    datas,
    ...series.criarSerie(
      DEPARTAMENTO_CULTURAL,
      {
        titulo,
        tipo: "post",
        funcaoId: "f1",
        hora: "07:00",
        dias: [...REGRA.dias],
        inicio: REGRA.inicio,
        fim: REGRA.fim,
      },
      alocacoes.map((a) => ({ data: a.data, responsavelId: a.pessoaId, suplenteId: null })),
      "p1",
    ),
  };
}

describe("criarSerie", () => {
  it("cria a série e todas as atividades dela num commit só", () => {
    const { serieId, criadas, datas } = criarSerieDeTeste("Terço Diário", ["p2", "p3"]);

    expect(criadas).toBe(datas.length);
    expect(criadas).toBeGreaterThan(9);
    expect(series.buscarSerie(serieId)?.dias).toEqual(["seg", "qua", "sex"]);
    expect(series.contagemPorSerie(DEPARTAMENTO_CULTURAL)[serieId]).toBe(criadas);
  });

  it("cada atividade aponta de volta para a série e herda hora e função", () => {
    const { serieId } = criarSerieDeTeste("Herança", ["p2"]);
    const filhas = atividades
      .listarAtividades(DEPARTAMENTO_CULTURAL)
      .filter((a) => a.serieId === serieId);

    expect(filhas.length).toBeGreaterThan(0);
    expect(filhas.every((a) => a.hora === "07:00" && a.funcaoId === "f1")).toBe(true);
  });

  it("com responsável nasce 'agendado'; sem ninguém, nasce 'ideia' — furo não é compromisso", () => {
    const comGente = criarSerieDeTeste("Com gente", ["p2"]);
    const semGente = criarSerieDeTeste("Sem gente", []);

    const daSerie = (id: string) =>
      atividades.listarAtividades(DEPARTAMENTO_CULTURAL).filter((a) => a.serieId === id);

    expect(daSerie(comGente.serieId).every((a) => a.status === "agendado")).toBe(true);
    expect(daSerie(semGente.serieId).every((a) => a.status === "ideia")).toBe(true);
    expect(daSerie(semGente.serieId).every((a) => a.responsavelId === null)).toBe(true);
  });

  it("atividade criada avulsa continua sem série", () => {
    const id = atividades.criarAtividade(DEPARTAMENTO_CULTURAL, {
      tipo: "post",
      titulo: "Avulsa",
      funcaoId: null,
      data: "2026-10-07",
      hora: null,
      responsavelId: null,
      suplenteId: null,
      status: "ideia",
      linkMidia: null,
    });
    expect(atividades.buscarAtividade(id)?.serieId).toBeNull();
  });
});

describe("redistribuir", () => {
  it("só alcança o que vem da data de corte para a frente e ainda não foi publicado", () => {
    const { serieId } = criarSerieDeTeste("Corte", ["p2"]);
    const todas = atividades
      .listarAtividades(DEPARTAMENTO_CULTURAL)
      .filter((a) => a.serieId === serieId);

    const publicada = todas[todas.length - 1];
    atividades.definirStatus(publicada.id, "publicado");

    const corte = todas[2].data;
    const remanejaveis = series.atividadesRemanejaveis(serieId, corte);
    const ids = new Set(remanejaveis.map((a) => a.id));

    expect(ids.has(todas[0].id)).toBe(false); // antes do corte
    expect(ids.has(publicada.id)).toBe(false); // já saiu no ar
    expect(ids.has(todas[2].id)).toBe(true);
  });

  it("a carga fixada conta o que ficou de fora, para a fila não recomeçar do zero", () => {
    const { serieId } = criarSerieDeTeste("Carga", ["p2"]);
    const todas = atividades
      .listarAtividades(DEPARTAMENTO_CULTURAL)
      .filter((a) => a.serieId === serieId);

    const carga = series.cargaFixadaDaSerie(serieId, todas[3].data);
    expect(carga.p2).toBe(3);
  });

  it("cada mudança de mãos vira uma troca registrada, e o que não mudou não vira nada", () => {
    const { serieId } = criarSerieDeTeste("Trocas", ["p2"]);
    const alvos = series.atividadesRemanejaveis(serieId, REGRA.inicio).slice(0, 3);

    const mudadas = series.aplicarRedistribuicao(
      [
        { id: alvos[0].id, deId: "p2", paraId: "p3" },
        { id: alvos[1].id, deId: "p2", paraId: "p2" }, // sem mudança
        { id: alvos[2].id, deId: "p2", paraId: null }, // vira furo
      ],
      { feitaPor: "p1", motivo: "o João saiu do departamento" },
    );

    expect(mudadas).toBe(2);
    expect(atividades.buscarAtividade(alvos[0].id)?.responsavelId).toBe("p3");
    expect(atividades.listarTrocas(alvos[1].id)).toHaveLength(0);
    expect(atividades.listarTrocas(alvos[0].id)[0]).toMatchObject({
      dePessoaId: "p2",
      paraPessoaId: "p3",
      motivo: "o João saiu do departamento",
    });
  });

  it("ficar sem responsável devolve a atividade para 'ideia'; ganhar um a põe em 'agendado'", () => {
    const { serieId } = criarSerieDeTeste("Status", ["p2"]);
    const [a, b] = series.atividadesRemanejaveis(serieId, REGRA.inicio);

    series.aplicarRedistribuicao([{ id: a.id, deId: "p2", paraId: null }], {
      feitaPor: "p1",
      motivo: "",
    });
    expect(atividades.buscarAtividade(a.id)?.status).toBe("ideia");

    series.aplicarRedistribuicao([{ id: a.id, deId: null, paraId: "p3" }], {
      feitaPor: "p1",
      motivo: "",
    });
    expect(atividades.buscarAtividade(a.id)?.status).toBe("agendado");

    // 'publicado' não é rebaixado por uma troca de mãos.
    atividades.definirStatus(b.id, "publicado");
    series.aplicarRedistribuicao([{ id: b.id, deId: "p2", paraId: null }], {
      feitaPor: "p1",
      motivo: "",
    });
    expect(atividades.buscarAtividade(b.id)?.status).toBe("publicado");
  });
});

describe("excluirSerie", () => {
  it("apaga o que vem pela frente, poupa o que já saiu no ar e some da lista", () => {
    const { serieId } = criarSerieDeTeste("Desfazer", ["p2"]);
    const todas = atividades
      .listarAtividades(DEPARTAMENTO_CULTURAL)
      .filter((a) => a.serieId === serieId);

    const publicada = todas[0];
    atividades.definirStatus(publicada.id, "publicado");

    const apagadas = series.excluirSerie(serieId, REGRA.inicio);

    expect(apagadas).toBe(todas.length - 1);
    expect(series.buscarSerie(serieId)).toBeUndefined();
    expect(series.listarSeries(DEPARTAMENTO_CULTURAL).map((s) => s.id)).not.toContain(serieId);

    // A publicada sobrevive e vira avulsa — a FK devolve serie_id para NULL.
    const sobrevivente = atividades.buscarAtividade(publicada.id);
    expect(sobrevivente?.status).toBe("publicado");
    expect(sobrevivente?.serieId).toBeNull();
  });
});
