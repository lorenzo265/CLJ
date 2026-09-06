import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { FuncoesManager, type FuncaoNaGestao } from "@/components/gestao/funcoes-manager";
import { exigirCoordenador } from "@/lib/auth/sessao";
import { getContagemPessoasPorFuncao, getFuncoes, getUsoDaFuncao } from "@/lib/data/funcoes";

export const metadata: Metadata = { title: "Funções · CLJ NSR" };

/**
 * O catálogo de papéis do departamento — a tela que alimenta a escala e o cadastro.
 * Cada linha carrega os dois números que decidem o que a coordenação pode fazer com ela:
 * quantas pessoas a assumem hoje e em quantas atividades ela já está comprometida.
 */
export default async function GestaoFuncoesPage() {
  const eu = await exigirCoordenador();

  const [funcoes, contagem] = await Promise.all([
    getFuncoes(eu.departamentoId),
    getContagemPessoasPorFuncao(eu.departamentoId),
  ]);

  // Uma consulta de uso por função, todas disparadas juntas: em série a tela esperaria
  // N idas ao banco enfileiradas só para saber quais botões de excluir pode oferecer.
  const usos = await Promise.all(funcoes.map((f) => getUsoDaFuncao(f.id)));

  const itens: FuncaoNaGestao[] = funcoes.map((f, i) => ({
    ...f,
    pessoas: contagem[f.id] ?? 0,
    naEscala: usos[i],
  }));

  return (
    <>
      <PageHeader title="Funções" subtitle="Os papéis que a escala usa para dividir o trabalho" />

      <div className="mx-auto w-full max-w-4xl px-5 pb-10 lg:px-8 lg:pt-6">
        <FuncoesManager funcoes={itens} />
      </div>
    </>
  );
}
