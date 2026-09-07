import { describe, expect, it } from "vitest";
import {
  MAX_DATAS_DA_SERIE,
  datasDaSerie,
  diaSemanaDe,
  distribuirRodizio,
  resumoDaDivisao,
} from "@/lib/escala/serie";

// 2026-10-01 é uma quinta-feira. Todas as datas abaixo se apoiam nisso.

describe("datasDaSerie", () => {
  it("segunda a sexta de um mês devolve só dias úteis, em ordem", () => {
    const datas = datasDaSerie({
      dias: ["seg", "ter", "qua", "qui", "sex"],
      inicio: "2026-10-01",
      fim: "2026-10-11",
    });

    expect(datas).toEqual([
      "2026-10-01", "2026-10-02", // qui, sex
      "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", // seg-sex
    ]);
    expect(datas.every((d) => !["sab", "dom"].includes(diaSemanaDe(d)))).toBe(true);
  });

  it("um dia só da semana devolve uma data por semana", () => {
    expect(
      datasDaSerie({ dias: ["sab"], inicio: "2026-10-01", fim: "2026-10-31" }),
    ).toEqual(["2026-10-03", "2026-10-10", "2026-10-17", "2026-10-24", "2026-10-31"]);
  });

  it("inclui o último dia do intervalo", () => {
    expect(datasDaSerie({ dias: ["qui"], inicio: "2026-10-01", fim: "2026-10-01" })).toEqual([
      "2026-10-01",
    ]);
  });

  it("sem dia marcado não gera nada — a tela cobra antes, o domínio não confia", () => {
    expect(datasDaSerie({ dias: [], inicio: "2026-10-01", fim: "2026-10-31" })).toEqual([]);
  });

  it("intervalo invertido devolve vazio em vez de laço infinito", () => {
    expect(
      datasDaSerie({ dias: ["seg"], inicio: "2026-10-31", fim: "2026-10-01" }),
    ).toEqual([]);
  });

  it("um ano errado no fim para no teto em vez de encher o banco", () => {
    const datas = datasDaSerie({
      dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
      inicio: "2026-10-01",
      fim: "2206-10-01",
    });
    expect(datas).toHaveLength(MAX_DATAS_DA_SERIE);
  });
});

describe("distribuirRodizio", () => {
  const semRestricao = (id: string) => ({ id, dias: [] });

  it("três pessoas sem restrição recebem partes iguais, sem ninguém dobrar", () => {
    const datas = datasDaSerie({
      dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
      inicio: "2026-10-01",
      fim: "2026-10-09",
    });
    const alocacoes = distribuirRodizio(datas, ["p1", "p2", "p3"].map(semRestricao));

    const { porPessoa, furos } = resumoDaDivisao(alocacoes);
    expect(furos).toBe(0);
    expect(porPessoa.map((p) => p.total)).toEqual([3, 3, 3]);
  });

  it("resto sobrando não cai todo na mesma pessoa: a diferença nunca passa de um", () => {
    const datas = datasDaSerie({
      dias: ["seg", "ter", "qua", "qui", "sex", "sab", "dom"],
      inicio: "2026-10-01",
      fim: "2026-10-10", // 10 datas para 3 pessoas
    });
    const { porPessoa } = resumoDaDivisao(
      distribuirRodizio(datas, ["p1", "p2", "p3"].map(semRestricao)),
    );
    expect(porPessoa.map((p) => p.total)).toEqual([4, 3, 3]);
  });

  it("respeita a disponibilidade — quem só pode segunda não pega terça", () => {
    const datas = datasDaSerie({
      dias: ["seg", "ter"],
      inicio: "2026-10-05",
      fim: "2026-10-13",
    }); // seg 05, ter 06, seg 12, ter 13
    const alocacoes = distribuirRodizio(datas, [
      { id: "so-segunda", dias: ["seg"] },
      { id: "qualquer", dias: [] },
    ]);

    const porData = Object.fromEntries(alocacoes.map((a) => [a.data, a.pessoaId]));
    expect(porData["2026-10-06"]).toBe("qualquer");
    expect(porData["2026-10-13"]).toBe("qualquer");
    expect(alocacoes.filter((a) => a.pessoaId === "so-segunda").every((a) => a.data.endsWith("05") || a.data.endsWith("12"))).toBe(true);
  });

  it("prefere deixar furo a escalar quem não pode naquele dia", () => {
    const alocacoes = distribuirRodizio(["2026-10-03"], [{ id: "p1", dias: ["seg"] }]); // sábado
    expect(alocacoes).toEqual([{ data: "2026-10-03", pessoaId: null }]);
    expect(resumoDaDivisao(alocacoes).furos).toBe(1);
  });

  it("grupo vazio vira uma série inteira de furos — as datas existem, os nomes faltam", () => {
    const datas = datasDaSerie({ dias: ["qui"], inicio: "2026-10-01", fim: "2026-10-22" });
    const alocacoes = distribuirRodizio(datas, []);
    expect(alocacoes).toHaveLength(4);
    expect(resumoDaDivisao(alocacoes).furos).toBe(4);
  });

  it("a mesma entrada produz sempre a mesma escala — a prévia não pode mentir", () => {
    const datas = datasDaSerie({ dias: ["seg", "qua"], inicio: "2026-10-01", fim: "2026-11-01" });
    const grupo = ["p1", "p2", "p3"].map(semRestricao);
    expect(distribuirRodizio(datas, grupo)).toEqual(distribuirRodizio(datas, grupo));
  });

  it("carga inicial continua a divisão em vez de zerar quem já vinha carregando", () => {
    const datas = ["2026-10-05", "2026-10-06"];
    const alocacoes = distribuirRodizio(datas, ["p1", "p2"].map(semRestricao), { p1: 5 });
    // p1 já tem 5; as duas datas vão para p2 até empatar a conta.
    expect(alocacoes.map((a) => a.pessoaId)).toEqual(["p2", "p2"]);
  });
});

describe("resumoDaDivisao", () => {
  it("ordena de quem levou mais para quem levou menos, e conta os furos à parte", () => {
    const resumo = resumoDaDivisao([
      { data: "2026-10-01", pessoaId: "p1" },
      { data: "2026-10-02", pessoaId: "p2" },
      { data: "2026-10-03", pessoaId: "p1" },
      { data: "2026-10-04", pessoaId: null },
    ]);
    expect(resumo.porPessoa).toEqual([
      { pessoaId: "p1", total: 2 },
      { pessoaId: "p2", total: 1 },
    ]);
    expect(resumo.furos).toBe(1);
  });
});
