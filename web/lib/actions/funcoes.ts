"use server";

import { revalidatePath } from "next/cache";
import { exigirCoordenadorEmAction } from "@/lib/auth/sessao";
import { texto } from "@/lib/actions/comum";
import * as repo from "@/lib/repos/funcoes";
import type { EstadoForm } from "@/lib/actions/auth";

function revalidar(): void {
  revalidatePath("/coordenador/funcoes");
  revalidatePath("/coordenador/escala");
  revalidatePath("/coordenador/participantes");
  revalidatePath("/voce");
}

export async function salvarFuncao(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const nome = texto(formData, "nome", 80);
  if (!nome) return { erro: "A função precisa de um nome." };
  const descricao = texto(formData, "descricao", 400);

  const id = texto(formData, "id", 64);
  if (id) {
    const atual = repo.buscarFuncao(id);
    if (!atual || atual.departamentoId !== coordenador.departamentoId) {
      return { erro: "Função não encontrada." };
    }
    repo.atualizarFuncao(id, nome, descricao);
  } else {
    repo.criarFuncao(coordenador.departamentoId, nome, descricao);
  }

  revalidar();
  return { ok: true };
}

/** Excluir função com atividade apontando para ela apagaria histórico — bloqueado. */
export async function excluirFuncao(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const id = texto(formData, "id", 64);
  const atual = repo.buscarFuncao(id);
  if (!atual || atual.departamentoId !== coordenador.departamentoId) {
    return { erro: "Função não encontrada." };
  }

  const emUso = repo.atividadesUsandoFuncao(id);
  if (emUso > 0) {
    return {
      erro: `Essa função está em ${emUso} ${emUso === 1 ? "atividade" : "atividades"} da escala. Troque a função dessas atividades antes de excluir.`,
    };
  }

  repo.excluirFuncao(id);
  revalidar();
  return { ok: true };
}
