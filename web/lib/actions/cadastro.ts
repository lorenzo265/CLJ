"use server";

import { revalidatePath } from "next/cache";
import { exigirPessoaEmAction } from "@/lib/auth/sessao";
import { dias, lista, periodos, texto } from "@/lib/actions/comum";
import { listarFuncoes } from "@/lib/repos/funcoes";
import { salvarCadastro } from "@/lib/repos/pessoas";
import type { EstadoForm } from "@/lib/actions/auth";

/**
 * O cadastro é da própria pessoa: a action ignora qualquer id vindo do formulário e
 * escreve sempre em quem está na sessão.
 */
export async function salvarMeuCadastro(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const pessoa = await exigirPessoaEmAction();

  const nome = texto(formData, "nome", 120);
  if (!nome) return { erro: "Escreva seu nome." };

  // Só funções do próprio departamento entram — o formulário não define o catálogo.
  const validas = new Set(listarFuncoes(pessoa.departamentoId).map((f) => f.id));
  const funcoes = lista(formData, "funcoes").filter((id) => validas.has(id));

  salvarCadastro(pessoa.id, {
    nome,
    contato: texto(formData, "contato", 60),
    dias: dias(formData),
    periodos: periodos(formData),
    funcoes,
  });

  revalidatePath("/voce");
  revalidatePath("/hoje");
  return { ok: true };
}
