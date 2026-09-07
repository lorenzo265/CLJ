import { describe, expect, it } from "vitest";
import { cargaDoMes } from "@/lib/calendario/carga";
import type { Atividade, Pessoa } from "@/lib/types";

const atividade = (id: string, data: string, responsavelId: string | null): Atividade => ({
  id,
  departamentoId: "cultural",
  tipo: "post",
  titulo: "Terço Diário",
  funcaoId: null,
  data,
  hora: null,
  responsavelId,
  suplenteId: null,
  status: "agendado",
  linkMidia: null,
  serieId: null,
});

const pessoa = (id: string, nome: string): Pessoa => ({
  id,
  nome,
  contato: "",
  email: `${id}@clj-nsr.local`,
  departamentoId: "cultural",
  papelSistema: "participante",
  disponibilidade: { dias: [], periodos: [] },
  cadastroCompleto: true,
  status: "ativo",
  temSenha: true,
});

const PESSOAS = [pessoa("p1", "Ana"), pessoa("p2", "João"), pessoa("p3", "Bia")];

describe("cargaDoMes", () => {
  it("conta por pessoa dentro do mês e ignora o resto", () => {
    const carga = cargaDoMes(
      [
        atividade("a1", "2026-10-01", "p1"),
        atividade("a2", "2026-10-15", "p1"),
        atividade("a3", "2026-10-20", "p2"),
        atividade("a4", "2026-11-01", "p1"), // outro mês
      ],
      PESSOAS,
      "2026-10",
    );

    expect(carga.total).toBe(3);
    expect(carga.porPessoa).toEqual([
      { pessoaId: "p1", nome: "Ana", total: 2 },
      { pessoaId: "p2", nome: "João", total: 1 },
    ]);
  });

  it("quem tem zero não aparece — coluna vazia não é informação", () => {
    const carga = cargaDoMes([atividade("a1", "2026-10-01", "p1")], PESSOAS, "2026-10");
    expect(carga.porPessoa.map((p) => p.pessoaId)).toEqual(["p1"]);
  });

  it("furo é contado à parte, não vira uma pessoa chamada 'ninguém'", () => {
    const carga = cargaDoMes(
      [atividade("a1", "2026-10-01", null), atividade("a2", "2026-10-02", "p1")],
      PESSOAS,
      "2026-10",
    );
    expect(carga.furos).toBe(1);
    expect(carga.porPessoa).toHaveLength(1);
  });

  it("empate resolve pelo nome — a lista não dança entre dois carregamentos", () => {
    const carga = cargaDoMes(
      [
        atividade("a1", "2026-10-01", "p2"), // João
        atividade("a2", "2026-10-02", "p3"), // Bia
        atividade("a3", "2026-10-03", "p1"), // Ana
      ],
      PESSOAS,
      "2026-10",
    );
    expect(carga.porPessoa.map((p) => p.nome)).toEqual(["Ana", "Bia", "João"]);
  });

  it("quem saiu do departamento continua contando enquanto tiver conta na mão", () => {
    const carga = cargaDoMes([atividade("a1", "2026-10-01", "fantasma")], PESSOAS, "2026-10");
    expect(carga.porPessoa).toEqual([
      { pessoaId: "fantasma", nome: "Fora do departamento", total: 1 },
    ]);
  });

  it("mês vazio devolve zeros em vez de explodir", () => {
    expect(cargaDoMes([], PESSOAS, "2026-10")).toEqual({ porPessoa: [], furos: 0, total: 0 });
  });
});
