import { describe, expect, it } from "vitest";
import type { Atividade } from "../types";
import {
  agruparPorPrazo,
  comPapel,
  filtrarMeus,
} from "./agenda";

const HOJE = new Date("2026-08-25T12:00:00");

function atividade(overrides: Partial<Atividade>): Atividade {
  return {
    id: "x",
    departamentoId: "cultural",
    tipo: "post",
    titulo: "Post",
    funcaoId: "f1",
    data: "2026-08-25",
    responsavelId: "p1",
    status: "agendado",
    ...overrides,
  };
}

describe("comPapel", () => {
  it("marca responsável, suplente e nenhum corretamente", () => {
    const itens = comPapel(
      [
        atividade({ id: "a", responsavelId: "p1" }),
        atividade({ id: "b", responsavelId: "p2", suplenteId: "p1" }),
        atividade({ id: "c", responsavelId: "p2", suplenteId: "p3" }),
      ],
      "p1"
    );
    expect(itens.find((i) => i.atividade.id === "a")?.papel).toBe("responsavel");
    expect(itens.find((i) => i.atividade.id === "b")?.papel).toBe("suplente");
    expect(itens.find((i) => i.atividade.id === "c")?.papel).toBe("nenhum");
  });
});

describe("agruparPorPrazo", () => {
  const itens = comPapel(
    [
      atividade({ id: "hoje", data: "2026-08-25" }),
      atividade({ id: "em3dias", data: "2026-08-28" }),
      atividade({ id: "mesQueVem", data: "2026-09-20" }),
      atividade({ id: "noLimiteDaSemana", data: "2026-09-01" }), // hoje+7
    ],
    "p1"
  );
  const { hoje, estaSemana, depois } = agruparPorPrazo(itens, HOJE);

  it('coloca a atividade de hoje no bucket "hoje"', () => {
    expect(hoje.map((i) => i.atividade.id)).toEqual(["hoje"]);
  });

  it('coloca uma atividade em 3 dias em "esta semana"', () => {
    expect(estaSemana.map((i) => i.atividade.id)).toContain("em3dias");
  });

  it('inclui o limite exato hoje+7 em "esta semana", não em "depois"', () => {
    expect(estaSemana.map((i) => i.atividade.id)).toContain("noLimiteDaSemana");
  });

  it('coloca uma atividade do mês que vem em "depois"', () => {
    expect(depois.map((i) => i.atividade.id)).toEqual(["mesQueVem"]);
  });
});

describe("filtrarMeus", () => {
  it('exclui atividades com papel "nenhum"', () => {
    const itens = comPapel(
      [
        atividade({ id: "minha", responsavelId: "p1" }),
        atividade({ id: "da-equipe", responsavelId: "p2" }),
      ],
      "p1"
    );
    expect(filtrarMeus(itens).map((i) => i.atividade.id)).toEqual(["minha"]);
  });
});
