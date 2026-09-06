"use server";

import { revalidatePath } from "next/cache";
import { exigirCoordenadorEmAction } from "@/lib/auth/sessao";
import {
  dataISO,
  hora,
  statusAtividade,
  texto,
  textoOuNulo,
  tipoAtividade,
  urlOuNulo,
} from "@/lib/actions/comum";
import * as repo from "@/lib/repos/atividades";
import { garantirReuniao } from "@/lib/repos/reunioes";
import { buscarPessoa } from "@/lib/repos/pessoas";
import { buscarFuncao } from "@/lib/repos/funcoes";
import type { EstadoForm } from "@/lib/actions/auth";
import type { DadosAtividade } from "@/lib/repos/atividades";

function revalidarEscala(): void {
  revalidatePath("/coordenador/escala");
  revalidatePath("/coordenador");
  revalidatePath("/escala");
  revalidatePath("/calendario");
  revalidatePath("/hoje");
  revalidatePath("/reunioes");
}

/** Pessoa de outro departamento nunca vira responsável — a checagem é no servidor. */
function pessoaDoDepartamento(id: string | null, departamentoId: string): string | null {
  if (!id) return null;
  const p = buscarPessoa(id);
  return p && p.departamentoId === departamentoId ? p.id : null;
}

function lerDados(formData: FormData, departamentoId: string): DadosAtividade | string {
  const titulo = texto(formData, "titulo", 160);
  if (!titulo) return "A atividade precisa de um título.";

  const data = dataISO(formData, "data");
  if (!data) return "Escolha a data da atividade.";

  const funcaoIdBruto = textoOuNulo(formData, "funcaoId", 64);
  const funcao = funcaoIdBruto ? buscarFuncao(funcaoIdBruto) : undefined;

  return {
    tipo: tipoAtividade(formData),
    titulo,
    funcaoId: funcao && funcao.departamentoId === departamentoId ? funcao.id : null,
    data,
    hora: hora(formData),
    responsavelId: pessoaDoDepartamento(textoOuNulo(formData, "responsavelId", 64), departamentoId),
    suplenteId: pessoaDoDepartamento(textoOuNulo(formData, "suplenteId", 64), departamentoId),
    status: statusAtividade(formData),
    linkMidia: urlOuNulo(formData, "linkMidia"),
  };
}

export async function salvarAtividade(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();
  const dados = lerDados(formData, coordenador.departamentoId);
  if (typeof dados === "string") return { erro: dados };

  const id = texto(formData, "id", 64);
  const motivo = texto(formData, "motivo", 200);

  if (id) {
    const atual = repo.buscarAtividade(id);
    if (!atual || atual.departamentoId !== coordenador.departamentoId) {
      return { erro: "Atividade não encontrada." };
    }
    repo.atualizarAtividade(id, dados, { feitaPor: coordenador.id, motivo });
    if (dados.tipo === "reuniao") garantirReuniao(id);
  } else {
    const novoIdCriado = repo.criarAtividade(coordenador.departamentoId, dados);
    if (dados.tipo === "reuniao") garantirReuniao(novoIdCriado);
  }

  revalidarEscala();
  return { ok: true };
}

/**
 * Trocar o responsável é a operação que a plataforma existe para tirar da conversa privada:
 * passa pelo mesmo caminho de atualização, que grava a troca no mesmo commit.
 */
export async function trocarResponsavel(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();

  const id = texto(formData, "id", 64);
  const atual = repo.buscarAtividade(id);
  if (!atual || atual.departamentoId !== coordenador.departamentoId) {
    return { erro: "Atividade não encontrada." };
  }

  const papel = texto(formData, "papel", 20) === "suplente" ? "suplente" : "responsavel";
  const para = pessoaDoDepartamento(
    textoOuNulo(formData, "pessoaId", 64),
    coordenador.departamentoId,
  );

  repo.atualizarAtividade(
    id,
    {
      tipo: atual.tipo,
      titulo: atual.titulo,
      funcaoId: atual.funcaoId,
      data: atual.data,
      hora: atual.hora,
      responsavelId: papel === "responsavel" ? para : atual.responsavelId,
      suplenteId: papel === "suplente" ? para : atual.suplenteId,
      status: atual.status,
      linkMidia: atual.linkMidia,
    },
    { feitaPor: coordenador.id, motivo: texto(formData, "motivo", 200) },
  );

  revalidarEscala();
  return { ok: true };
}

export async function mudarStatus(_estado: EstadoForm, formData: FormData): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();
  const id = texto(formData, "id", 64);
  const atual = repo.buscarAtividade(id);
  if (!atual || atual.departamentoId !== coordenador.departamentoId) {
    return { erro: "Atividade não encontrada." };
  }

  repo.definirStatus(id, statusAtividade(formData));
  revalidarEscala();
  return { ok: true };
}

export async function excluirAtividade(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const coordenador = await exigirCoordenadorEmAction();
  const id = texto(formData, "id", 64);
  const atual = repo.buscarAtividade(id);
  if (!atual || atual.departamentoId !== coordenador.departamentoId) {
    return { erro: "Atividade não encontrada." };
  }

  repo.excluirAtividade(id);
  revalidarEscala();
  return { ok: true };
}
