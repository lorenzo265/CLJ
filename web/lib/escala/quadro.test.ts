import { describe, expect, it } from "vitest";
import {
  SEM_NINGUEM,
  colunaAtual,
  colunasPorPessoa,
  colunasPorStatus,
  maiorColuna,
  movimentoAoSoltar,
} from "@/lib/escala/quadro";
import type { Atividade, Pessoa, StatusAtividade } from "@/lib/types";

function atividade(over: Partial<Atividade> & { id: string }): Atividade {
  return {
    departamentoId: "cultural",
    tipo: "post",
    titulo: "Terço Diário",
    funcaoId: null,
    data: "2026-10-05",
    hora: null,
    responsavelId: null,
    suplenteId: null,
    status: "ideia" as StatusAtividade,
    linkMidia: null,
    serieId: null,
    ...over,
  };
}

function pessoa(id: string, nome: string, status: Pessoa["status"] = "ativo"): Pessoa {
  return {
    id,
    nome,
    contato: "",
    email: `${id}@clj-nsr.local`,
    departamentoId: "cultural",
    papelSistema: "participante",
    disponibilidade: { dias: [], periodos: [] },
    cadastroCompleto: true,
    status,
    temSenha: true,
  };
}

describe("colunasPorPessoa", () => {
  const pessoas = [pessoa("p1", "Ana"), pessoa("p2", "João")];

  it("os furos vêm na primeira coluna — é o que pede decisão", () => {
    const colunas = colunasPorPessoa(
      [atividade({ id: "a1" }), atividade({ id: "a2", responsavelId: "p1" })],
      pessoas,
    );

    expect(colunas[0].chave).toBe(SEM_NINGUEM);
    expect(colunas[0].tom).toBe("furo");
    expect(colunas[0].itens.map((a) => a.id)).toEqual(["a1"]);
  });

  it("cada pessoa ativa vira coluna, mesmo sem nada — coluna vazia é destino de arrasto", () => {
    const colunas = colunasPorPessoa([atividade({ id: "a1", responsavelId: "p1" })], pessoas);
    expect(colunas.map((c) => c.chave)).toEqual([SEM_NINGUEM, "p1", "p2"]);
    expect(colunas[2].itens).toEqual([]);
  });

  it("quem saiu do departamento some — a não ser que ainda tenha conta na mão", () => {
    const comSaida = [...pessoas, pessoa("p3", "Rafael", "inativo")];

    expect(colunasPorPessoa([], comSaida).map((c) => c.chave)).not.toContain("p3");

    const aindaCarrega = colunasPorPessoa(
      [atividade({ id: "a1", responsavelId: "p3" })],
      comSaida,
    );
    const dele = aindaCarrega.find((c) => c.chave === "p3");
    expect(dele?.tom).toBe("apagado");
    expect(dele?.itens).toHaveLength(1);
  });

  it("toda atividade cai em exatamente uma coluna", () => {
    const todas = [
      atividade({ id: "a1" }),
      atividade({ id: "a2", responsavelId: "p1" }),
      atividade({ id: "a3", responsavelId: "p2" }),
    ];
    const espalhadas = colunasPorPessoa(todas, pessoas).flatMap((c) => c.itens.map((a) => a.id));
    expect(espalhadas.sort()).toEqual(["a1", "a2", "a3"]);
  });
});

describe("colunasPorStatus", () => {
  it("segue a ordem do vocabulário do banco, e mantém as vazias", () => {
    const colunas = colunasPorStatus([atividade({ id: "a1", status: "agendado" })]);
    expect(colunas.map((c) => c.chave)).toEqual([
      "ideia",
      "rascunho",
      "agendado",
      "publicado",
      "concluido",
    ]);
    expect(colunas.find((c) => c.chave === "agendado")?.itens).toHaveLength(1);
    expect(colunas.find((c) => c.chave === "ideia")?.itens).toEqual([]);
  });
});

describe("maiorColuna", () => {
  it("nunca é zero — a barra de carga divide por ela", () => {
    expect(maiorColuna(colunasPorStatus([]))).toBe(1);
  });

  it("é o tamanho da coluna mais cheia", () => {
    const colunas = colunasPorStatus([
      atividade({ id: "a1", status: "ideia" }),
      atividade({ id: "a2", status: "ideia" }),
      atividade({ id: "a3", status: "agendado" }),
    ]);
    expect(maiorColuna(colunas)).toBe(2);
  });
});

describe("movimentoAoSoltar", () => {
  it("soltar na coluna em que já está não é movimento nenhum", () => {
    const a = atividade({ id: "a1", responsavelId: "p1" });
    expect(movimentoAoSoltar(a, "p1", "pessoa")).toBeNull();
    expect(movimentoAoSoltar(atividade({ id: "a2" }), SEM_NINGUEM, "pessoa")).toBeNull();
    expect(movimentoAoSoltar(atividade({ id: "a3" }), "ideia", "status")).toBeNull();
  });

  it("soltar noutra pessoa troca o responsável", () => {
    expect(movimentoAoSoltar(atividade({ id: "a1", responsavelId: "p1" }), "p2", "pessoa")).toEqual({
      campo: "responsavel",
      valor: "p2",
    });
  });

  it("soltar na coluna de furos tira o responsável", () => {
    expect(
      movimentoAoSoltar(atividade({ id: "a1", responsavelId: "p1" }), SEM_NINGUEM, "pessoa"),
    ).toEqual({ campo: "responsavel", valor: null });
  });

  it("soltar noutra coluna de status avança o status", () => {
    expect(movimentoAoSoltar(atividade({ id: "a1" }), "publicado", "status")).toEqual({
      campo: "status",
      valor: "publicado",
    });
  });

  it("destino que não é status recusado — a chave da coluna vem do DOM, não é de confiar", () => {
    expect(movimentoAoSoltar(atividade({ id: "a1" }), "inventado", "status")).toBeNull();
  });
});

describe("colunaAtual", () => {
  it("é o valor que o seletor de mover mostra", () => {
    expect(colunaAtual(atividade({ id: "a1", responsavelId: "p1" }), "pessoa")).toBe("p1");
    expect(colunaAtual(atividade({ id: "a2" }), "pessoa")).toBe(SEM_NINGUEM);
    expect(colunaAtual(atividade({ id: "a3", status: "publicado" }), "status")).toBe("publicado");
  });
});
