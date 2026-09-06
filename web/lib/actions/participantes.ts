"use server";

import { revalidatePath } from "next/cache";
import { exigirCoordenadorEmAction } from "@/lib/auth/sessao";
import { emailValido, lista, texto } from "@/lib/actions/comum";
import { buscarConvite, criarConvite, revogarConvite } from "@/lib/repos/auth";
import { listarFuncoes } from "@/lib/repos/funcoes";
import * as repo from "@/lib/repos/pessoas";
import type { EstadoForm } from "@/lib/actions/auth";

function revalidar(): void {
  revalidatePath("/coordenador/participantes");
  revalidatePath("/coordenador");
  revalidatePath("/coordenador/escala");
}

export interface EstadoConvite extends EstadoForm {
  /** O link que o coordenador copia e manda pelo canal que já usa (WhatsApp, e-mail). */
  link?: string;
}

export async function convidarParticipante(
  _estado: EstadoConvite,
  formData: FormData,
): Promise<EstadoConvite> {
  const coordenador = await exigirCoordenadorEmAction();

  const email = texto(formData, "email", 254);
  if (!emailValido(email)) return { erro: "Escreva um e-mail válido." };

  if (repo.buscarPessoaPorEmail(email)) {
    return { erro: "Já existe alguém no departamento com esse e-mail." };
  }

  const convite = criarConvite({
    email,
    nome: texto(formData, "nome", 120),
    papelSistema: texto(formData, "papel", 20) === "coordenador" ? "coordenador" : "participante",
    departamentoId: coordenador.departamentoId,
    criadoPor: coordenador.id,
  });

  revalidar();
  return { ok: true, link: `/convite/${convite.token}` };
}

export async function cancelarConvite(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  // O token vem cru do formulário: sem conferir o departamento, uma coordenação poderia
  // revogar o convite de outro — a mesma checagem que as outras quatro actions fazem.
  const token = texto(formData, "token", 200);
  const convite = buscarConvite(token);
  if (!convite || convite.departamentoId !== coordenador.departamentoId) {
    return { erro: "Convite não encontrado." };
  }

  revogarConvite(token);
  revalidar();
  return { ok: true };
}

export async function alternarStatusPessoa(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const id = texto(formData, "id", 64);
  const pessoa = repo.buscarPessoa(id);
  if (!pessoa || pessoa.departamentoId !== coordenador.departamentoId) {
    return { erro: "Pessoa não encontrada." };
  }
  // Inativar a si mesmo tranca a coordenação do lado de fora.
  if (pessoa.id === coordenador.id) return { erro: "Você não pode inativar a si mesmo." };

  repo.definirStatus(id, pessoa.status === "ativo" ? "inativo" : "ativo");
  revalidar();
  return { ok: true };
}

export async function salvarFuncoesDaPessoa(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const id = texto(formData, "id", 64);
  const pessoa = repo.buscarPessoa(id);
  if (!pessoa || pessoa.departamentoId !== coordenador.departamentoId) {
    return { erro: "Pessoa não encontrada." };
  }

  const validas = new Set(listarFuncoes(coordenador.departamentoId).map((f) => f.id));
  repo.definirFuncoesDaPessoa(id, lista(formData, "funcoes").filter((f) => validas.has(f)));

  revalidar();
  return { ok: true };
}

/** O departamento não pode ficar sem coordenação: rebaixar o último é recusado. */
export async function mudarPapel(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const id = texto(formData, "id", 64);
  const pessoa = repo.buscarPessoa(id);
  if (!pessoa || pessoa.departamentoId !== coordenador.departamentoId) {
    return { erro: "Pessoa não encontrada." };
  }

  const novo = texto(formData, "papel", 20) === "coordenador" ? "coordenador" : "participante";
  if (novo === "participante") {
    const outros = repo
      .listarPessoas(coordenador.departamentoId)
      .filter((p) => p.papelSistema === "coordenador" && p.status === "ativo" && p.id !== id);
    if (outros.length === 0) {
      return { erro: "O departamento precisa de pelo menos uma pessoa na coordenação." };
    }
  }

  repo.definirPapel(id, novo);
  revalidar();
  return { ok: true };
}
