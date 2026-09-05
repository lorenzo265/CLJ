import { describe, expect, it } from "vitest";
import {
  formatarDataCurta,
  formatarDataKicker,
  formatarDiaEMes,
  formatarHora,
  formatarQuando,
  iniciaisDe,
  nomeCurto,
} from "@/lib/format";

const TERCA = new Date(2026, 7, 25); // 25/08/2026

describe("formatarQuando — a data como uma pessoa fala", () => {
  it("usa as palavras do dia a dia perto de hoje", () => {
    expect(formatarQuando("2026-08-25", TERCA)).toBe("hoje");
    expect(formatarQuando("2026-08-26", TERCA)).toBe("amanhã");
    expect(formatarQuando("2026-08-24", TERCA)).toBe("ontem");
  });

  it("dentro da semana, o nome do dia basta", () => {
    expect(formatarQuando("2026-08-28", TERCA)).toBe("na sexta");
  });

  it("longe demais para nome de dia, cai na data", () => {
    expect(formatarQuando("2026-09-15", TERCA)).toBe("em 15/09");
  });
});

describe("formatarHora — zero à esquerda não se fala", () => {
  it("hora redonda sai sem minutos", () => {
    expect(formatarHora("07:00")).toBe("7h");
  });

  it("hora quebrada mantém os minutos", () => {
    expect(formatarHora("19:30")).toBe("19h30");
  });

  it("sem hora, sem texto — a frase não pode ganhar um 'às' solto", () => {
    expect(formatarHora(null)).toBe("");
  });
});

describe("rótulos de data", () => {
  it("data curta traz o dia da semana abreviado", () => {
    expect(formatarDataCurta("2026-08-28")).toBe("Sex, 28/08");
  });

  it("o kicker é a mesma data em caixa alta", () => {
    expect(formatarDataKicker("2026-08-28")).toBe("SEX 28/08");
  });

  it("dia e mês por extenso, em português", () => {
    expect(formatarDiaEMes("2026-08-25")).toBe("25 de agosto");
  });
});

describe("nomeCurto — como o departamento se chama entre si", () => {
  it("primeiro nome mais a inicial do segundo", () => {
    expect(nomeCurto("Ana Paula Ribeiro")).toBe("Ana P.");
  });

  it("nome único fica como está", () => {
    expect(nomeCurto("Pedro")).toBe("Pedro");
  });

  it("espaços sobrando não viram inicial vazia", () => {
    expect(nomeCurto("  Maria   Aparecida  ")).toBe("Maria A.");
  });
});

describe("iniciaisDe — o avatar do app é tipográfico", () => {
  it("pega a inicial dos dois primeiros nomes", () => {
    expect(iniciaisDe("Maria Aparecida")).toBe("MA");
    expect(iniciaisDe("Ana Paula Ribeiro")).toBe("AP");
  });

  it("nome único vira uma letra só, e espaço sobrando não vira inicial vazia", () => {
    expect(iniciaisDe("Pedro")).toBe("P");
    expect(iniciaisDe("  joão   marcelo ")).toBe("JM");
  });
});
