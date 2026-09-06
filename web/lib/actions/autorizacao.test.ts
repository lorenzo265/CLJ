import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  As regras que não podem quebrar sem alguém notar: quem pode escrever o quê.
  Autorização é verificada no servidor, dentro da action — esconder o botão não conta
  (docs/sdd-implementacao.md §2, regra 3). Aqui as actions são chamadas direto, como um
  POST cru faria, sem passar por tela nenhuma.
*/

const potes = vi.hoisted(() => ({ cookies: new Map<string, string>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      potes.cookies.has(nome) ? { name: nome, value: potes.cookies.get(nome)! } : undefined,
    set: (nome: string, valor: string) => void potes.cookies.set(nome, valor),
    delete: (nome: string) => void potes.cookies.delete(nome),
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error(`REDIRECT ${url}`), { url });
  },
}));

const { COOKIE_SESSAO } = await import("@/lib/auth/sessao");
const { criarSessao } = await import("@/lib/repos/auth");
const { buscarPessoaPorEmail } = await import("@/lib/repos/pessoas");
const { listarAtividades, listarTrocas } = await import("@/lib/repos/atividades");
const { listarFuncoes } = await import("@/lib/repos/funcoes");
const { DEPARTAMENTO_CULTURAL } = await import("@/lib/departamento");
const { salvarFuncao, excluirFuncao } = await import("@/lib/actions/funcoes");
const { trocarResponsavel, salvarAtividade } = await import("@/lib/actions/escala");
const { alternarPresenca } = await import("@/lib/actions/reunioes");
const { alternarStatusPessoa, cancelarConvite, mudarPapel } = await import(
  "@/lib/actions/participantes",
);
const { criarConvite, buscarConvite } = await import("@/lib/repos/auth");
const { salvarMeuCadastro } = await import("@/lib/actions/cadastro");
const { buscarPessoa, funcoesDaPessoa } = await import("@/lib/repos/pessoas");

const COORDENADORA = "maria@clj-nsr.local";
const PARTICIPANTE = "ana@clj-nsr.local";

function entrarComo(email: string): string {
  const pessoa = buscarPessoaPorEmail(email)!;
  const { token } = criarSessao(pessoa.id);
  potes.cookies.set(COOKIE_SESSAO, token);
  return pessoa.id;
}

function form(campos: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    for (const v of Array.isArray(valor) ? valor : [valor]) fd.append(chave, v);
  }
  return fd;
}

beforeEach(() => {
  potes.cookies.clear();
});

describe("actions de coordenação", () => {
  it("recusam quem não está logado", async () => {
    await expect(salvarFuncao({}, form({ nome: "Invadida" }))).rejects.toThrow(/Sessão/);
  });

  it("recusam participante — mesmo chamadas direto, sem passar pela tela", async () => {
    entrarComo(PARTICIPANTE);

    await expect(salvarFuncao({}, form({ nome: "Invadida" }))).rejects.toThrow(/coordenação/i);
    await expect(excluirFuncao({}, form({ id: "f1" }))).rejects.toThrow(/coordenação/i);
    await expect(
      trocarResponsavel({}, form({ id: "a4", papel: "responsavel", pessoaId: "p2" })),
    ).rejects.toThrow(/coordenação/i);
    await expect(alternarStatusPessoa({}, form({ id: "p2" }))).rejects.toThrow(/coordenação/i);
  });

  it("aceitam a coordenação", async () => {
    entrarComo(COORDENADORA);
    const antes = listarFuncoes(DEPARTAMENTO_CULTURAL).length;

    await expect(salvarFuncao({}, form({ nome: "Coral", descricao: "" }))).resolves.toEqual({
      ok: true,
    });
    expect(listarFuncoes(DEPARTAMENTO_CULTURAL)).toHaveLength(antes + 1);
  });
});

describe("regras de negócio que a UI não pode contornar", () => {
  it("função em uso não é excluída, e o erro explica o caminho", async () => {
    entrarComo(COORDENADORA);
    const resultado = await excluirFuncao({}, form({ id: "f1" }));
    expect(resultado.erro).toMatch(/atividades da escala/);
    expect(listarFuncoes(DEPARTAMENTO_CULTURAL).some((f) => f.id === "f1")).toBe(true);
  });

  it("a coordenação não inativa a si mesma e tranca o departamento", async () => {
    const eu = entrarComo(COORDENADORA);
    const resultado = await alternarStatusPessoa({}, form({ id: eu }));
    expect(resultado.erro).toMatch(/a si mesmo/);
    expect(buscarPessoa(eu)?.status).toBe("ativo");
  });

  it("o departamento não fica sem coordenação", async () => {
    const eu = entrarComo(COORDENADORA);
    const resultado = await mudarPapel({}, form({ id: eu, papel: "participante" }));
    expect(resultado.erro).toMatch(/pelo menos uma pessoa na coordenação/);
    expect(buscarPessoa(eu)?.papelSistema).toBe("coordenador");
  });

  it("convite de outro departamento não é revogável pelo token", async () => {
    entrarComo(COORDENADORA);
    const alheio = criarConvite({
      email: "de-outra-paroquia@exemplo.org",
      nome: "",
      papelSistema: "participante",
      departamentoId: "outro-departamento",
      criadoPor: "p1",
    });

    const resultado = await cancelarConvite({}, form({ token: alheio.token }));
    expect(resultado.erro).toMatch(/não encontrado/);
    expect(buscarConvite(alheio.token)).toBeDefined();
  });

  it("atividade de outro departamento não é alcançável pelo id", async () => {
    entrarComo(COORDENADORA);
    const resultado = await trocarResponsavel(
      {},
      form({ id: "id-inventado", papel: "responsavel", pessoaId: "p2" }),
    );
    expect(resultado.erro).toMatch(/não encontrada/);
  });

  it("trocar responsável grava a troca com o motivo e quem fez", async () => {
    const eu = entrarComo(COORDENADORA);
    const alvo = listarAtividades(DEPARTAMENTO_CULTURAL).find((a) => a.responsavelId === "p3")!;

    await trocarResponsavel(
      {},
      form({ id: alvo.id, papel: "responsavel", pessoaId: "p2", motivo: "trocaram entre si" }),
    );

    expect(listarTrocas(alvo.id)[0]).toMatchObject({
      paraPessoaId: "p2",
      motivo: "trocaram entre si",
      feitaPor: eu,
    });
  });
});

describe("saneamento de entrada", () => {
  it("link de mídia só aceita http(s) — o campo não vira vetor de javascript:", async () => {
    entrarComo(COORDENADORA);
    await salvarAtividade(
      {},
      form({
        tipo: "post",
        titulo: "Post com link torto",
        data: "2026-12-01",
        status: "ideia",
        linkMidia: "javascript:alert(1)",
      }),
    );

    const criada = listarAtividades(DEPARTAMENTO_CULTURAL).find(
      (a) => a.titulo === "Post com link torto",
    )!;
    expect(criada.linkMidia).toBeNull();
  });

  it("status fora do vocabulário não entra no banco", async () => {
    entrarComo(COORDENADORA);
    await salvarAtividade(
      {},
      form({ tipo: "post", titulo: "Status inventado", data: "2026-12-02", status: "publicadão" }),
    );

    const criada = listarAtividades(DEPARTAMENTO_CULTURAL).find(
      (a) => a.titulo === "Status inventado",
    )!;
    expect(criada.status).toBe("ideia");
  });

  it("atividade sem título ou sem data é recusada com uma frase, não com um erro cru", async () => {
    entrarComo(COORDENADORA);
    expect((await salvarAtividade({}, form({ titulo: "", data: "2026-12-01" }))).erro).toMatch(
      /título/,
    );
    expect((await salvarAtividade({}, form({ titulo: "X", data: "" }))).erro).toMatch(/data/);
  });
});

describe("o participante escreve o que é dele", () => {
  it("o cadastro salva sempre em quem está na sessão, e ignora id vindo do formulário", async () => {
    const eu = entrarComo(PARTICIPANTE);

    await salvarMeuCadastro(
      {},
      form({
        // Um id de outra pessoa no formulário não muda de dono.
        id: "p1",
        nome: "Ana Paula",
        contato: "(11) 90000-1111",
        dias: ["seg", "sex"],
        periodos: ["noite"],
        funcoes: ["f1"],
      }),
    );

    const depois = buscarPessoa(eu)!;
    expect(depois.contato).toBe("(11) 90000-1111");
    expect(depois.disponibilidade.dias).toEqual(["seg", "sex"]);
    expect(funcoesDaPessoa(eu)).toEqual(["f1"]);
    expect(buscarPessoa("p1")?.contato).not.toBe("(11) 90000-1111");
  });

  it("função inexistente enviada no formulário é descartada em silêncio", async () => {
    const eu = entrarComo(PARTICIPANTE);
    await salvarMeuCadastro({}, form({ nome: "Ana Paula", funcoes: ["f1", "f-fantasma"] }));
    expect(funcoesDaPessoa(eu)).toEqual(["f1"]);
  });

  it("ninguém confirma presença no lugar de outra pessoa", async () => {
    entrarComo(PARTICIPANTE);
    const resultado = await alternarPresenca(
      {},
      form({ atividadeId: "a3", pessoaId: "p4", presente: "1" }),
    );
    expect(resultado.erro).toMatch(/sua própria presença/);
  });

  it("mas confirma a própria", async () => {
    const eu = entrarComo(PARTICIPANTE);
    await expect(
      alternarPresenca({}, form({ atividadeId: "a3", pessoaId: eu, presente: "1" })),
    ).resolves.toEqual({ ok: true });
  });
});
