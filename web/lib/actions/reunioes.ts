"use server";

import { revalidatePath } from "next/cache";
import { exigirCoordenadorEmAction, exigirPessoaEmAction } from "@/lib/auth/sessao";
import { lista, texto, textoOuNulo } from "@/lib/actions/comum";
import { buscarAtividade } from "@/lib/repos/atividades";
import { buscarPessoa } from "@/lib/repos/pessoas";
import * as repo from "@/lib/repos/reunioes";
import type { EstadoForm } from "@/lib/actions/auth";

function revalidar(): void {
  revalidatePath("/reunioes");
  revalidatePath("/coordenador/reunioes");
  revalidatePath("/hoje");
}

export async function salvarReuniao(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const atividadeId = texto(formData, "atividadeId", 64);
  const atividade = buscarAtividade(atividadeId);
  if (!atividade || atividade.departamentoId !== coordenador.departamentoId) {
    return { erro: "Reunião não encontrada." };
  }

  const pauta = lista(formData, "pauta").slice(0, 40);
  const decisoes = lista(formData, "decisoes").slice(0, 40);
  repo.salvarPautaEDecisoes(atividadeId, pauta, decisoes);

  // Follow-up chega como três listas paralelas — a i-ésima ação casa com o i-ésimo prazo.
  const acoes = formData.getAll("fuAcao").map((v) => String(v).trim());
  const responsaveis = formData.getAll("fuResponsavel").map((v) => String(v).trim());
  const prazos = formData.getAll("fuPrazo").map((v) => String(v).trim());

  const itens = acoes.slice(0, 40).map((acao, i) => {
    const candidato = responsaveis[i] ?? "";
    const pessoa = candidato ? buscarPessoa(candidato) : undefined;
    const prazo = prazos[i] ?? "";
    return {
      acao,
      responsavelId:
        pessoa && pessoa.departamentoId === coordenador.departamentoId ? pessoa.id : null,
      prazo: /^\d{4}-\d{2}-\d{2}$/.test(prazo) ? prazo : "",
    };
  });
  repo.salvarFollowUp(atividadeId, itens);

  revalidar();
  return { ok: true };
}

/** Cada pessoa confirma a própria presença. O coordenador pode marcar por outra. */
export async function alternarPresenca(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const eu = await exigirPessoaEmAction();

  const atividadeId = texto(formData, "atividadeId", 64);
  const atividade = buscarAtividade(atividadeId);
  if (!atividade || atividade.departamentoId !== eu.departamentoId) {
    return { erro: "Reunião não encontrada." };
  }

  const alvoBruto = textoOuNulo(formData, "pessoaId", 64);
  if (alvoBruto && alvoBruto !== eu.id && eu.papelSistema !== "coordenador") {
    return { erro: "Você só pode confirmar a sua própria presença." };
  }

  const alvo = alvoBruto ?? eu.id;
  const pessoa = buscarPessoa(alvo);
  if (!pessoa || pessoa.departamentoId !== eu.departamentoId) {
    return { erro: "Pessoa não encontrada." };
  }

  repo.definirPresenca(atividadeId, alvo, texto(formData, "presente", 10) === "1");
  revalidar();
  return { ok: true };
}
