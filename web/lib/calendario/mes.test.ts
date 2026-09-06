import { describe, expect, it } from "vitest";
import {
  formatarMesAno,
  formatarMesAnoCurto,
  formatarReferenciaMes,
  getGradeDoMes,
  mesAnterior,
  mesSeguinte,
  parseReferenciaMes,
} from "@/lib/calendario/mes";

const AGOSTO = new Date(2026, 7, 1);
const HOJE = new Date(2026, 7, 25);

describe("getGradeDoMes", () => {
  it("tem sempre 42 dias — trocar de mês não faz a página pular", () => {
    expect(getGradeDoMes(AGOSTO, HOJE)).toHaveLength(42);
    expect(getGradeDoMes(new Date(2026, 1, 1), HOJE)).toHaveLength(42);
  });

  it("começa num domingo, como o cabeçalho DOM…SÁB promete", () => {
    const [primeiro] = getGradeDoMes(AGOSTO, HOJE);
    expect(new Date(`${primeiro.data}T12:00:00`).getDay()).toBe(0);
  });

  it("marca o que é do mês e o que veio de fora para completar a grade", () => {
    const grade = getGradeDoMes(AGOSTO, HOJE);
    expect(grade.filter((d) => d.ehDoMesAtual)).toHaveLength(31);
    expect(grade[0].ehDoMesAtual).toBe(false); // 26/07, arrastado pra fechar a semana
  });

  it("marca hoje uma vez só, e só quando hoje está na grade", () => {
    const comHoje = getGradeDoMes(AGOSTO, HOJE).filter((d) => d.ehHoje);
    expect(comHoje).toHaveLength(1);
    expect(comHoje[0].data).toBe("2026-08-25");

    const dezembro = getGradeDoMes(new Date(2026, 11, 1), HOJE);
    expect(dezembro.some((d) => d.ehHoje)).toBe(false);
  });
});

describe("parseReferenciaMes — a querystring é entrada de usuário", () => {
  it("aceita o formato do link e devolve o primeiro dia do mês", () => {
    const ref = parseReferenciaMes("2026-02", HOJE);
    expect(formatarReferenciaMes(ref)).toBe("2026-02");
    expect(ref.getDate()).toBe(1);
  });

  it("cai no mês de hoje quando o valor falta ou não faz sentido", () => {
    for (const entrada of [undefined, "", "agosto", "2026-13", "2026-00", "26-8"]) {
      expect(formatarReferenciaMes(parseReferenciaMes(entrada, HOJE))).toBe("2026-08");
    }
  });
});

describe("navegação de mês", () => {
  it("atravessa a virada do ano nos dois sentidos", () => {
    expect(formatarReferenciaMes(mesSeguinte(new Date(2026, 11, 1)))).toBe("2027-01");
    expect(formatarReferenciaMes(mesAnterior(new Date(2026, 0, 1)))).toBe("2025-12");
  });
});

describe("rótulos do mês", () => {
  it("por extenso no desktop, abreviado no celular", () => {
    expect(formatarMesAno(AGOSTO)).toBe("Agosto 2026");
    expect(formatarMesAnoCurto(AGOSTO)).toBe("AGO 2026");
  });
});
