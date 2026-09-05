"use server";

import { redirect } from "next/navigation";
import { DEPARTAMENTO_CULTURAL } from "@/lib/departamento";
import { conferirSenha, hashSenha, validarSenha } from "@/lib/auth/senha";
import { abrirSessao, fecharSessao } from "@/lib/auth/sessao";
import { buscarConvite, conviteValido, marcarConviteUsado } from "@/lib/repos/auth";
import {
  buscarPessoaPorEmail,
  criarPessoa,
  definirSenha,
  hashDaPessoa,
} from "@/lib/repos/pessoas";

export interface EstadoForm {
  erro?: string;
  ok?: boolean;
}

/*
  Freio de força bruta, na memória do processo. Não é defesa contra um atacante distribuído —
  é o suficiente para um app de departamento e não depende de serviço externo.
*/
const TENTATIVAS = new Map<string, { n: number; ate: number }>();
const LIMITE = 8;
const JANELA_MS = 10 * 60 * 1000;

function bloqueado(chave: string): boolean {
  const t = TENTATIVAS.get(chave);
  if (!t) return false;
  if (Date.now() > t.ate) {
    TENTATIVAS.delete(chave);
    return false;
  }
  return t.n >= LIMITE;
}

function registrarFalha(chave: string): void {
  const t = TENTATIVAS.get(chave);
  if (!t || Date.now() > t.ate) {
    TENTATIVAS.set(chave, { n: 1, ate: Date.now() + JANELA_MS });
    return;
  }
  t.n += 1;
}

export async function entrar(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const chave = email.toLowerCase();
  if (bloqueado(chave)) {
    return { erro: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }

  const pessoa = buscarPessoaPorEmail(email);
  // Mesma mensagem para e-mail inexistente, senha errada e conta inativa: a tela de login
  // não conta a ninguém quem faz parte do departamento.
  const generico = { erro: "E-mail ou senha não conferem." };

  if (!pessoa || pessoa.status !== "ativo") {
    registrarFalha(chave);
    return generico;
  }
  if (!conferirSenha(senha, hashDaPessoa(pessoa.id))) {
    registrarFalha(chave);
    return generico;
  }

  TENTATIVAS.delete(chave);
  await abrirSessao(pessoa.id);
  redirect("/hoje");
}

export async function sair(): Promise<void> {
  await fecharSessao();
  redirect("/login");
}

/**
 * O convite do coordenador vira conta: define a senha e já entra.
 * Se a pessoa já existir com esse e-mail (reconvite), só define a senha.
 */
export async function aceitarConvite(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const token = String(formData.get("token") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  const convite = buscarConvite(token);
  if (!conviteValido(convite)) {
    return { erro: "Este convite não vale mais. Peça um novo ao coordenador." };
  }
  if (!nome) return { erro: "Escreva seu nome." };
  if (senha !== confirmacao) return { erro: "As duas senhas não são iguais." };

  const problema = validarSenha(senha);
  if (problema) return { erro: problema };

  const existente = buscarPessoaPorEmail(convite.email);
  const pessoaId = existente
    ? existente.id
    : criarPessoa({
        nome,
        email: convite.email,
        departamentoId: convite.departamentoId || DEPARTAMENTO_CULTURAL,
        papelSistema: convite.papelSistema,
      });

  definirSenha(pessoaId, hashSenha(senha));
  marcarConviteUsado(token);

  await abrirSessao(pessoaId);
  redirect("/voce");
}
