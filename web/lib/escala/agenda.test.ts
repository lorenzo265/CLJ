import { describe, expect, it } from "vitest";
import {
  agruparPorPrazo,
  comPapel,
  dezenaDaSemana,
  doDepartamento,
  filtrarMeus,
  getProximaAtividade,
  getSemanaAtual,
  ordenarCronologico,
} from "@/lib/escala/agenda";
import type { Atividade, StatusAtividade, TipoAtividade } from "@/lib/types";

const HOJE = new Date(2026, 7, 25); // terça, 25/08/2026

function atividade(over: Partial<Atividade> & { id: string; data: string }): Atividade {
  return {
    departamentoId: "cultural",
    tipo: "post" as TipoAtividade,
    titulo: "Post — Terço Diário",
    funcaoId: "f1",
    hora: "07:00",
    responsavelId: null,
    suplenteId: null,
    status: "agendado" as StatusAtividade,
    linkMidia: null,
    ...over,
  };
}

describe("comPapel", () => {
  it("distingue responsável, suplente e o resto do departamento", () => {
    const itens = comPapel(
      [
        atividade({ id: "a", data: "2026-08-25", responsavelId: "eu" }),
        atividade({ id: "b", data: "2026-08-26", suplenteId: "eu", responsavelId: "outra" }),
        atividade({ id: "c", data: "2026-08-27", responsavelId: "outra" }),
      ],
      "eu",
    );

    expect(itens.map((i) => i.papel)).toEqual(["responsavel", "suplente", "nenhum"]);
  });

  it("não confunde responsável nulo com o id de ninguém", () => {
    const [item] = comPapel([atividade({ id: "a", data: "2026-08-25" })], "eu");
    expect(item.papel).toBe("nenhum");
  });
});

describe("agruparPorPrazo", () => {
  const itens = comPapel(
    [
      atividade({ id: "hoje", data: "2026-08-25", responsavelId: "eu" }),
      atividade({ id: "amanha", data: "2026-08-26", responsavelId: "eu" }),
      atividade({ id: "limite", data: "2026-09-01", responsavelId: "eu" }),
      atividade({ id: "depois", data: "2026-09-02", responsavelId: "eu" }),
      atividade({ id: "ontem", data: "2026-08-24", responsavelId: "eu" }),
    ],
    "eu",
  );

  it("separa hoje, os sete dias seguintes e o resto", () => {
    const { hoje, estaSemana, depois } = agruparPorPrazo(itens, HOJE);

    expect(hoje.map((i) => i.atividade.id)).toEqual(["hoje"]);
    expect(estaSemana.map((i) => i.atividade.id)).toEqual(["amanha", "limite"]);
    expect(depois.map((i) => i.atividade.id)).toEqual(["depois"]);
  });

  it("deixa o passado de fora dos três grupos — a escala olha pra frente", () => {
    const { hoje, estaSemana, depois } = agruparPorPrazo(itens, HOJE);
    const mostrados = [...hoje, ...estaSemana, ...depois].map((i) => i.atividade.id);
    expect(mostrados).not.toContain("ontem");
  });

  it("a janela é rolante: numa sexta ela ainda cobre sete dias", () => {
    const sexta = new Date(2026, 7, 28);
    const { estaSemana } = agruparPorPrazo(
      comPapel([atividade({ id: "quarta", data: "2026-09-02", responsavelId: "eu" })], "eu"),
      sexta,
    );
    expect(estaSemana.map((i) => i.atividade.id)).toEqual(["quarta"]);
  });

  it("ordena o mesmo dia pela hora, e sem hora vai por último", () => {
    const doDia = comPapel(
      [
        atividade({ id: "tarde", data: "2026-08-25", hora: "17:00" }),
        atividade({ id: "semhora", data: "2026-08-25", hora: null }),
        atividade({ id: "cedo", data: "2026-08-25", hora: "07:00" }),
      ],
      "eu",
    );
    const { hoje } = agruparPorPrazo(doDia, HOJE);
    expect(hoje.map((i) => i.atividade.id)).toEqual(["cedo", "tarde", "semhora"]);
  });
});

describe("getProximaAtividade", () => {
  it("é a próxima conta do viewer, ignorando o que não é dele", () => {
    const itens = comPapel(
      [
        atividade({ id: "de-outra", data: "2026-08-25", responsavelId: "outra" }),
        atividade({ id: "minha", data: "2026-08-27", suplenteId: "eu" }),
        atividade({ id: "minha-depois", data: "2026-08-30", responsavelId: "eu" }),
      ],
      "eu",
    );
    expect(getProximaAtividade(itens, HOJE)?.atividade.id).toBe("minha");
  });

  it("não volta ao passado", () => {
    const itens = comPapel([atividade({ id: "velha", data: "2026-08-01", responsavelId: "eu" })], "eu");
    expect(getProximaAtividade(itens, HOJE)).toBeUndefined();
  });
});

describe("dezenaDaSemana", () => {
  it("conta as contas do viewer nos sete dias e quantas já foram passadas", () => {
    const itens = comPapel(
      [
        atividade({ id: "feita", data: "2026-08-25", responsavelId: "eu", status: "publicado" }),
        atividade({ id: "aberta", data: "2026-08-27", responsavelId: "eu" }),
        atividade({ id: "suplencia", data: "2026-08-28", suplenteId: "eu" }),
        atividade({ id: "de-outra", data: "2026-08-28", responsavelId: "outra" }),
        atividade({ id: "fora-da-janela", data: "2026-09-20", responsavelId: "eu" }),
      ],
      "eu",
    );

    const dezena = dezenaDaSemana(itens, HOJE);
    expect(dezena.total).toBe(3);
    expect(dezena.passadas).toBe(1);
  });

  it("semana sem nada seu é uma dezena vazia, não um erro", () => {
    expect(dezenaDaSemana([], HOJE)).toMatchObject({ total: 0, passadas: 0 });
  });
});

describe("doDepartamento", () => {
  it("traz só o que não é do viewer, do mais próximo em diante", () => {
    const itens = comPapel(
      [
        atividade({ id: "minha", data: "2026-08-26", responsavelId: "eu" }),
        atividade({ id: "delas-2", data: "2026-08-30", responsavelId: "outra" }),
        atividade({ id: "delas-1", data: "2026-08-27", responsavelId: "outra" }),
      ],
      "eu",
    );
    expect(doDepartamento(itens, HOJE).map((i) => i.atividade.id)).toEqual([
      "delas-1",
      "delas-2",
    ]);
  });

  it("respeita o limite pedido — a tela Hoje mostra poucos", () => {
    const muitas = comPapel(
      Array.from({ length: 10 }, (_, i) =>
        atividade({ id: `x${i}`, data: `2026-09-0${i % 9 + 1}`, responsavelId: "outra" }),
      ),
      "eu",
    );
    expect(doDepartamento(muitas, HOJE, 4)).toHaveLength(4);
  });
});

describe("opções B e C (mantidas para troca barata de direção)", () => {
  const itens = comPapel(
    [
      atividade({ id: "seg", data: "2026-08-24", responsavelId: "eu" }),
      atividade({ id: "ter", data: "2026-08-25", responsavelId: "eu" }),
    ],
    "eu",
  );

  it("getSemanaAtual devolve sete dias começando na segunda", () => {
    const semana = getSemanaAtual(itens, HOJE);
    expect(semana).toHaveLength(7);
    expect(semana[0].data).toBe("2026-08-24");
    expect(semana[1].ehHoje).toBe(true);
    expect(semana[6].data).toBe("2026-08-30");
  });

  it("ordenarCronologico não altera o array original", () => {
    const copia = [...itens];
    ordenarCronologico(itens);
    expect(itens).toEqual(copia);
  });
});

describe("filtrarMeus", () => {
  it("é o toggle 'Meus': some com o que não tem seu papel", () => {
    const itens = comPapel(
      [
        atividade({ id: "minha", data: "2026-08-25", responsavelId: "eu" }),
        atividade({ id: "outra", data: "2026-08-25", responsavelId: "alguem" }),
      ],
      "eu",
    );
    expect(filtrarMeus(itens).map((i) => i.atividade.id)).toEqual(["minha"]);
  });
});
