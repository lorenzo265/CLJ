import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  O caminho de entrada inteiro: convite do coordenador → conta com senha → login → sair.
  É o único caminho — não existe autocadastro —, então cada degrau dele é testado.
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
    throw Object.assign(new Error(`REDIRECT ${url}`), { destino: url });
  },
}));

const { COOKIE_SESSAO, getSessao } = await import("@/lib/auth/sessao");
const { criarSessao, buscarConvite } = await import("@/lib/repos/auth");
const { buscarPessoaPorEmail, definirStatus } = await import("@/lib/repos/pessoas");
const { convidarParticipante } = await import("@/lib/actions/participantes");
const { aceitarConvite, entrar, sair } = await import("@/lib/actions/auth");
const { SENHA_DEMO } = await import("@/lib/db/seed");

function form(campos: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.append(k, v);
  return fd;
}

/** As actions de entrada terminam em redirect — capturar o destino é como se testa isso. */
async function destinoDe(promessa: Promise<unknown>): Promise<string> {
  try {
    await promessa;
  } catch (e) {
    const destino = (e as { destino?: string }).destino;
    if (destino) return destino;
    throw e;
  }
  throw new Error("a action terminou sem redirecionar");
}

function entrarComoCoordenacao(): void {
  const maria = buscarPessoaPorEmail("maria@clj-nsr.local")!;
  potes.cookies.set(COOKIE_SESSAO, criarSessao(maria.id).token);
}

async function convidar(email: string, nome = "Convidada"): Promise<string> {
  entrarComoCoordenacao();
  const resultado = await convidarParticipante({}, form({ email, nome, papel: "participante" }));
  expect(resultado.link).toBeTruthy();
  potes.cookies.clear();
  return resultado.link!.replace("/convite/", "");
}

beforeEach(() => {
  potes.cookies.clear();
});

describe("convite", () => {
  it("gera um link para a coordenação mandar pelo canal que já usa", async () => {
    entrarComoCoordenacao();
    const resultado = await convidarParticipante(
      {},
      form({ email: "beatriz@clj-nsr.local", nome: "Beatriz", papel: "participante" }),
    );
    expect(resultado.link).toMatch(/^\/convite\/[A-Za-z0-9_-]+$/);
  });

  it("recusa e-mail inválido e e-mail que já é de alguém do departamento", async () => {
    entrarComoCoordenacao();
    expect((await convidarParticipante({}, form({ email: "não-é-email" }))).erro).toMatch(/válido/);
    expect(
      (await convidarParticipante({}, form({ email: "maria@clj-nsr.local" }))).erro,
    ).toMatch(/já existe/i);
  });

  it("só a coordenação convida", async () => {
    await expect(convidarParticipante({}, form({ email: "x@y.org" }))).rejects.toThrow(/Sessão/);
  });
});

describe("aceitar o convite", () => {
  it("cria a conta, abre a sessão e leva a pessoa pro próprio cadastro", async () => {
    const token = await convidar("carlos@clj-nsr.local", "Carlos");

    const destino = await destinoDe(
      aceitarConvite(
        {},
        form({ token, nome: "Carlos Eduardo", senha: "terco2026", confirmacao: "terco2026" }),
      ),
    );

    expect(destino).toBe("/voce");
    const criado = buscarPessoaPorEmail("carlos@clj-nsr.local");
    expect(criado?.nome).toBe("Carlos Eduardo");
    expect(criado?.temSenha).toBe(true);
    expect(await getSessao()).toMatchObject({ id: criado!.id });
  });

  it("o convite vale uma vez só", async () => {
    const token = await convidar("dora@clj-nsr.local", "Dora");
    await destinoDe(
      aceitarConvite({}, form({ token, nome: "Dora", senha: "terco2026", confirmacao: "terco2026" })),
    );
    potes.cookies.clear();

    const segunda = await aceitarConvite(
      {},
      form({ token, nome: "Impostora", senha: "outrasenha", confirmacao: "outrasenha" }),
    );
    expect(segunda.erro).toMatch(/não vale mais/);
  });

  it("token inventado não cria conta nenhuma", async () => {
    const resultado = await aceitarConvite(
      {},
      form({ token: "nao-existe", nome: "X", senha: "terco2026", confirmacao: "terco2026" }),
    );
    expect(resultado.erro).toMatch(/não vale mais/);
    expect(await getSessao()).toBeNull();
  });

  it("senhas diferentes, senha curta e nome vazio param antes de gravar", async () => {
    const token = await convidar("elisa@clj-nsr.local", "Elisa");

    expect(
      (await aceitarConvite({}, form({ token, nome: "Elisa", senha: "abcdefgh", confirmacao: "abcdefgi" })))
        .erro,
    ).toMatch(/não são iguais/);
    expect(
      (await aceitarConvite({}, form({ token, nome: "Elisa", senha: "123", confirmacao: "123" }))).erro,
    ).toMatch(/8 caracteres/);
    expect(
      (await aceitarConvite({}, form({ token, nome: "", senha: "terco2026", confirmacao: "terco2026" })))
        .erro,
    ).toMatch(/nome/);

    // Nada disso queimou o convite.
    expect(buscarConvite(token)?.usadoEm).toBeNull();
    expect(buscarPessoaPorEmail("elisa@clj-nsr.local")).toBeUndefined();
  });
});

describe("entrar e sair", () => {
  it("a senha certa abre a sessão e cai na manchete do dia", async () => {
    const destino = await destinoDe(
      entrar({}, form({ email: "ana@clj-nsr.local", senha: SENHA_DEMO })),
    );
    expect(destino).toBe("/hoje");
    expect(await getSessao()).toMatchObject({ email: "ana@clj-nsr.local" });
  });

  it("a mensagem de erro é a mesma para senha errada e e-mail que não existe", async () => {
    const senhaErrada = await entrar({}, form({ email: "ana@clj-nsr.local", senha: "chutei" }));
    const inexistente = await entrar({}, form({ email: "ninguem@clj-nsr.local", senha: "chutei" }));

    expect(senhaErrada.erro).toBe(inexistente.erro);
    expect(senhaErrada.erro).toMatch(/não conferem/);
    expect(await getSessao()).toBeNull();
  });

  it("pessoa inativada não entra, e a sessão dela morre no pedido seguinte", async () => {
    const pedro = buscarPessoaPorEmail("pedro@clj-nsr.local")!;
    potes.cookies.set(COOKIE_SESSAO, criarSessao(pedro.id).token);
    expect(await getSessao()).toMatchObject({ id: pedro.id });

    definirStatus(pedro.id, "inativo");
    expect(await getSessao()).toBeNull();
    expect((await entrar({}, form({ email: pedro.email, senha: SENHA_DEMO }))).erro).toMatch(
      /não conferem/,
    );

    definirStatus(pedro.id, "ativo");
  });

  it("sair revoga a sessão de verdade — o token não volta a servir", async () => {
    const joao = buscarPessoaPorEmail("joao@clj-nsr.local")!;
    const { token } = criarSessao(joao.id);
    potes.cookies.set(COOKIE_SESSAO, token);

    expect(await destinoDe(sair())).toBe("/login");

    potes.cookies.set(COOKIE_SESSAO, token);
    expect(await getSessao()).toBeNull();
  });
});
