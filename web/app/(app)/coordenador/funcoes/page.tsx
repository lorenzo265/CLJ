import { PageHeader } from "@/components/shell/page-header";
import { FuncoesManager } from "@/components/gestao/funcoes-manager";
import { getContagemPessoasPorFuncao, getFuncoes } from "@/lib/data/funcoes";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function GestaoFuncoesPage() {
  const [funcoes, contagem] = await Promise.all([
    getFuncoes(DEPARTAMENTO_CULTURAL),
    getContagemPessoasPorFuncao(DEPARTAMENTO_CULTURAL),
  ]);

  const funcoesComContagem = funcoes.map((f) => ({ ...f, contagem: contagem[f.id] ?? 0 }));

  return (
    <>
      <PageHeader title="Funções" subtitle="Catálogo de papéis do departamento" />
      <div className="p-4 sm:p-6">
        <FuncoesManager funcoesIniciais={funcoesComContagem} />
      </div>
    </>
  );
}
