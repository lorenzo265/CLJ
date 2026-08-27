import { PageHeader } from "@/components/shell/page-header";
import { AtividadesManager } from "@/components/gestao/atividades-manager";
import { getAtividades } from "@/lib/data/atividades";
import { getPessoas } from "@/lib/data/pessoas";
import { getFuncoes } from "@/lib/data/funcoes";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function GestaoEscalaPage() {
  const [atividades, pessoas, funcoes] = await Promise.all([
    getAtividades(DEPARTAMENTO_CULTURAL),
    getPessoas(DEPARTAMENTO_CULTURAL),
    getFuncoes(DEPARTAMENTO_CULTURAL),
  ]);

  return (
    <>
      <PageHeader title="Gestão de Escala" subtitle="Posts, tarefas, eventos e reuniões" />
      <div className="p-4 sm:p-6">
        <AtividadesManager atividadesIniciais={atividades} pessoas={pessoas} funcoes={funcoes} />
      </div>
    </>
  );
}
