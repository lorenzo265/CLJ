import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { DEPARTAMENTO_CULTURAL } from "@/lib/departamento";
import { SENHA_DEMO } from "@/lib/db/seed";
import { conferirSenha } from "@/lib/auth/senha";
import * as atividades from "@/lib/repos/atividades";
import * as auth from "@/lib/repos/auth";
import * as funcoes from "@/lib/repos/funcoes";
import * as pessoas from "@/lib/repos/pessoas";

/*
  Roda contra o banco em memória migrado e semeado por vitest.setup.ts — o mesmo caminho
  que o app percorre no primeiro boot. Se a migração ou a semeadura quebrarem, isto quebra.
*/

beforeAll(() => {
  getDb();
});

describe("migração e semeadura", () => {
  it("o banco vazio nasce com o departamento de demonstração inteiro", () => {
    expect(pessoas.listarPessoas(DEPARTAMENTO_CULTURAL)).toHaveLength(6);
    expect(funcoes.listarFuncoes(DEPARTAMENTO_CULTURAL)).toHaveLength(5);
    expect(atividades.listarAtividades(DEPARTAMENTO_CULTURAL).length).toBeGreaterThan(5);
  });

  it("as chaves estrangeiras estão ligadas — o banco recusa lixo", () => {
    expect(() =>
      getDb()
        .prepare("INSERT INTO pessoa_funcoes (pessoa_id, funcao_id) VALUES ('fantasma', 'f1')")
        .run(),
    ).toThrow();
  });

  it("o CHECK de status recusa um valor fora do vocabulário", () => {
    expect(() =>
      getDb()
        .prepare(
          `INSERT INTO atividades (id, departamento_id, tipo, titulo, data, status)
           VALUES ('x', 'cultural', 'post', 'X', '2026-01-01', 'inventado')`,
        )
        .run(),
    ).toThrow();
  });

  it("e-mail é único sem diferenciar maiúsculas", () => {
    expect(() =>
      pessoas.criarPessoa({
        nome: "Sósia",
        email: "MARIA@clj-nsr.local",
        departamentoId: DEPARTAMENTO_CULTURAL,
        papelSistema: "participante",
      }),
    ).toThrow();
  });
});

describe("pessoas", () => {
  it("a senha semeada é a documentada, e o hash nunca sai do repositório", () => {
    const maria = pessoas.buscarPessoaPorEmail("maria@clj-nsr.local");
    expect(maria?.papelSistema).toBe("coordenador");
    expect(maria).not.toHaveProperty("senhaHash");
    expect(maria?.temSenha).toBe(true);
    expect(conferirSenha(SENHA_DEMO, pessoas.hashDaPessoa(maria!.id))).toBe(true);
  });

  it("busca por e-mail ignora caixa e espaços", () => {
    expect(pessoas.buscarPessoaPorEmail("  Maria@CLJ-NSR.local ")?.nome).toBe("Maria Aparecida");
  });

  it("disponibilidade volta como conjunto validado, não como texto", () => {
    const ana = pessoas.buscarPessoaPorEmail("ana@clj-nsr.local")!;
    expect(ana.disponibilidade.dias).toEqual(["seg", "qua", "sex"]);
    expect(ana.disponibilidade.periodos).toEqual(["tarde", "noite"]);
  });

  it("salvar o cadastro troca dados e funções de uma vez", () => {
    const carla = pessoas.buscarPessoaPorEmail("carla@clj-nsr.local")!;
    expect(carla.cadastroCompleto).toBe(false);

    pessoas.salvarCadastro(carla.id, {
      nome: "Carla Souza",
      contato: "(11) 90000-0000",
      dias: ["ter", "qui"],
      periodos: ["noite"],
      funcoes: ["f1", "f2"],
    });

    const depois = pessoas.buscarPessoa(carla.id)!;
    expect(depois.cadastroCompleto).toBe(true);
    expect(depois.disponibilidade.dias).toEqual(["ter", "qui"]);
    expect(pessoas.funcoesDaPessoa(carla.id).sort()).toEqual(["f1", "f2"]);
  });

  it("uma pessoa convidada ainda não tem senha", () => {
    const id = pessoas.criarPessoa({
      nome: "Recém-convidada",
      email: "nova@clj-nsr.local",
      departamentoId: DEPARTAMENTO_CULTURAL,
      papelSistema: "participante",
    });
    expect(pessoas.buscarPessoa(id)?.temSenha).toBe(false);

    pessoas.definirSenha(id, "scrypt$16384$8$1$aa$bb");
    expect(pessoas.buscarPessoa(id)?.temSenha).toBe(true);
  });
});

describe("funções", () => {
  it("conta as pessoas de cada função num SELECT só", () => {
    const contagem = funcoes.contagemPessoasPorFuncao(DEPARTAMENTO_CULTURAL);
    expect(contagem.f1).toBeGreaterThan(0);
  });

  it("sabe dizer se está em uso antes de deixar excluir", () => {
    expect(funcoes.atividadesUsandoFuncao("f1")).toBeGreaterThan(0);

    const id = funcoes.criarFuncao(DEPARTAMENTO_CULTURAL, "Nova função", "descrição");
    expect(funcoes.atividadesUsandoFuncao(id)).toBe(0);
    funcoes.excluirFuncao(id);
    expect(funcoes.buscarFuncao(id)).toBeUndefined();
  });
});

describe("atividades e o registro de trocas", () => {
  function dadosDe(id: string) {
    const a = atividades.buscarAtividade(id)!;
    return {
      tipo: a.tipo,
      titulo: a.titulo,
      funcaoId: a.funcaoId,
      data: a.data,
      hora: a.hora,
      responsavelId: a.responsavelId,
      suplenteId: a.suplenteId,
      status: a.status,
      linkMidia: a.linkMidia,
    };
  }

  it("trocar o responsável grava a troca no mesmo commit", () => {
    const antes = atividades.buscarAtividade("a4")!;
    expect(atividades.listarTrocas("a4")).toHaveLength(0);

    atividades.atualizarAtividade(
      "a4",
      { ...dadosDe("a4"), responsavelId: "p2" },
      { feitaPor: "p1", motivo: "Ana avisou que viaja" },
    );

    const [troca] = atividades.listarTrocas("a4");
    expect(troca).toMatchObject({
      papel: "responsavel",
      dePessoaId: antes.responsavelId,
      paraPessoaId: "p2",
      motivo: "Ana avisou que viaja",
      feitaPor: "p1",
    });
  });

  it("editar sem mexer em quem faz não inventa troca nenhuma", () => {
    const antes = atividades.listarTrocas("a4").length;
    atividades.atualizarAtividade(
      "a4",
      { ...dadosDe("a4"), titulo: "Post — Terço Diário (revisado)" },
      { feitaPor: "p1" },
    );
    expect(atividades.listarTrocas("a4")).toHaveLength(antes);
    expect(atividades.buscarAtividade("a4")?.titulo).toBe("Post — Terço Diário (revisado)");
  });

  it("tirar o responsável também é uma troca — o furo fica registrado", () => {
    atividades.atualizarAtividade(
      "a5",
      { ...dadosDe("a5"), responsavelId: null },
      { feitaPor: "p1", motivo: "" },
    );
    expect(atividades.listarTrocas("a5")[0]).toMatchObject({ paraPessoaId: null });
  });

  it("o banco de demonstração tem furos — o painel precisa deles", () => {
    const semResponsavel = atividades
      .listarAtividades(DEPARTAMENTO_CULTURAL)
      .filter((a) => a.responsavelId === null);
    expect(semResponsavel.length).toBeGreaterThan(0);
  });
});

describe("sessões e convites", () => {
  it("a sessão criada encontra a pessoa, e apagá-la revoga na hora", () => {
    const { token } = auth.criarSessao("p1");
    expect(auth.pessoaDaSessao(token)).toBe("p1");

    auth.apagarSessao(token);
    expect(auth.pessoaDaSessao(token)).toBeNull();
  });

  it("token desconhecido não abre porta", () => {
    expect(auth.pessoaDaSessao("token-que-nunca-existiu")).toBeNull();
  });

  it("sessão vencida é recusada e some do banco na leitura", () => {
    const { token } = auth.criarSessao("p1");
    getDb()
      .prepare("UPDATE sessoes SET expira_em = '2000-01-01T00:00:00.000Z' WHERE token = ?")
      .run(token);

    expect(auth.pessoaDaSessao(token)).toBeNull();
    expect(getDb().prepare("SELECT 1 FROM sessoes WHERE token = ?").get(token)).toBeUndefined();
  });

  it("o convite vale uma vez só", () => {
    const convite = auth.criarConvite({
      email: "convidada@clj-nsr.local",
      nome: "Convidada",
      papelSistema: "participante",
      departamentoId: DEPARTAMENTO_CULTURAL,
      criadoPor: "p1",
    });

    expect(auth.conviteValido(auth.buscarConvite(convite.token))).toBe(true);
    auth.marcarConviteUsado(convite.token);
    expect(auth.conviteValido(auth.buscarConvite(convite.token))).toBe(false);
  });

  it("convite vencido não vale, mesmo sem ter sido usado", () => {
    const convite = auth.criarConvite({
      email: "atrasada@clj-nsr.local",
      nome: "",
      papelSistema: "participante",
      departamentoId: DEPARTAMENTO_CULTURAL,
      criadoPor: "p1",
    });
    getDb()
      .prepare("UPDATE convites SET expira_em = '2000-01-01T00:00:00.000Z' WHERE token = ?")
      .run(convite.token);

    expect(auth.conviteValido(auth.buscarConvite(convite.token))).toBe(false);
    expect(auth.convitesPendentes(DEPARTAMENTO_CULTURAL).map((c) => c.token)).not.toContain(
      convite.token,
    );
  });

  it("convite inexistente é recusado sem explodir", () => {
    expect(auth.conviteValido(auth.buscarConvite("nada"))).toBe(false);
  });
});
