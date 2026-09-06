import { describe, expect, it } from "vitest";
import { contextoDaAtividade, fraseDaAtividade } from "@/lib/escala/frase";
import type { Atividade, Pessoa } from "@/lib/types";

const HOJE = new Date(2026, 7, 25);

const POST: Atividade = {
  id: "a1",
  departamentoId: "cultural",
  tipo: "post",
  titulo: "Post — Terço Diário",
  funcaoId: "f1",
  data: "2026-08-26",
  hora: "07:00",
  responsavelId: "p1",
  suplenteId: null,
  status: "agendado",
  linkMidia: null,
};

function pessoa(nome: string): Pessoa {
  return {
    id: nome,
    nome,
    contato: "",
    email: `${nome}@x.local`,
    departamentoId: "cultural",
    papelSistema: "participante",
    disponibilidade: { dias: [], periodos: [] },
    cadastroCompleto: true,
    status: "ativo",
    temSenha: true,
  };
}

describe("fraseDaAtividade — situação, o que é seu, um próximo passo", () => {
  it("é a manchete inteira numa linha, para quem é responsável", () => {
    expect(fraseDaAtividade(POST, "responsavel", {}, HOJE)).toBe(
      "Sai amanhã às 7h · você é o responsável",
    );
  });

  it("quem tem suplência sabe quem é, sem abrir outra tela", () => {
    expect(
      fraseDaAtividade(POST, "responsavel", { suplente: pessoa("Ana Paula") }, HOJE),
    ).toBe("Sai amanhã às 7h · você é o responsável · Ana P. é sua suplência");
  });

  it("o suplente sabe de quem é suplente", () => {
    expect(
      fraseDaAtividade(POST, "suplente", { responsavel: pessoa("Pedro Lucas") }, HOJE),
    ).toBe("Sai amanhã às 7h · você é suplente de Pedro L.");
  });

  it("o que não é seu diz de quem é — informação, não cobrança", () => {
    expect(
      fraseDaAtividade(POST, "nenhum", { responsavel: pessoa("Pedro Lucas") }, HOJE),
    ).toBe("Sai amanhã às 7h · Pedro L. é o responsável");
  });

  it("atividade sem responsável é nomeada como tal, não escondida", () => {
    expect(fraseDaAtividade(POST, "nenhum", {}, HOJE)).toBe(
      "Sai amanhã às 7h · ainda sem responsável",
    );
  });

  it("cada tipo ganha o verbo certo", () => {
    const reuniao = { ...POST, tipo: "reuniao" as const, hora: "19:30" };
    expect(fraseDaAtividade(reuniao, "responsavel", {}, HOJE)).toContain(
      "Acontece amanhã às 19h30",
    );
    const tarefa = { ...POST, tipo: "tarefa" as const, hora: null };
    expect(fraseDaAtividade(tarefa, "responsavel", {}, HOJE)).toBe(
      "Vence amanhã · você é o responsável",
    );
  });
});

describe("contextoDaAtividade — a versão curta da linha da lista", () => {
  it("não repete a data, que já aparece ao lado", () => {
    expect(contextoDaAtividade("responsavel", {})).toBe("Você é responsável");
    expect(contextoDaAtividade("suplente", { responsavel: pessoa("Ana Paula") })).toBe(
      "Você é suplente · Ana P. é responsável",
    );
    expect(contextoDaAtividade("nenhum", {})).toBe("Ainda sem responsável");
  });
});
