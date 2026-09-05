import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apagarSessao, criarSessao, pessoaDaSessao } from "@/lib/repos/auth";
import { buscarPessoa } from "@/lib/repos/pessoas";
import type { Pessoa } from "@/lib/types";

export const COOKIE_SESSAO = "clj_sessao";

/*
  Quem está logado. A sessão vive numa tabela e o cookie carrega só o token —
  sair da conta revoga de verdade, e inativar alguém tira o acesso no próximo pedido.
*/

/** Uma leitura por requisição, por mais páginas e componentes que perguntem. */
export const getSessao = cache(async function getSessao(): Promise<Pessoa | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;

  const pessoaId = pessoaDaSessao(token);
  if (!pessoaId) return null;

  const pessoa = buscarPessoa(pessoaId);
  // Pessoa inativada perde o acesso na hora, sem esperar a sessão vencer.
  if (!pessoa || pessoa.status !== "ativo") return null;

  return pessoa;
});

export async function exigirPessoa(): Promise<Pessoa> {
  const pessoa = await getSessao();
  if (!pessoa) redirect("/login");
  return pessoa;
}

/**
 * A guarda de coordenação. Vale para página E para action: esconder o botão não é
 * autorização (docs/sdd-implementacao.md §2, regra 3).
 */
export async function exigirCoordenador(): Promise<Pessoa> {
  const pessoa = await exigirPessoa();
  if (pessoa.papelSistema !== "coordenador") redirect("/hoje");
  return pessoa;
}

/** Igual à anterior, mas para dentro de action: falha alto em vez de redirecionar. */
export async function exigirCoordenadorEmAction(): Promise<Pessoa> {
  const pessoa = await getSessao();
  if (!pessoa) throw new Error("Sessão expirada.");
  if (pessoa.papelSistema !== "coordenador") throw new Error("Ação restrita à coordenação.");
  return pessoa;
}

export async function exigirPessoaEmAction(): Promise<Pessoa> {
  const pessoa = await getSessao();
  if (!pessoa) throw new Error("Sessão expirada.");
  return pessoa;
}

/** Só em Server Action ou Route Handler — cookie não se escreve durante render. */
export async function abrirSessao(pessoaId: string): Promise<void> {
  const { token, expiraEm } = criarSessao(pessoaId);
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiraEm),
  });
}

export async function fecharSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (token) apagarSessao(token);
  jar.delete(COOKIE_SESSAO);
}
