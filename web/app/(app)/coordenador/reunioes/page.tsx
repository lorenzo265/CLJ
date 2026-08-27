import { PageHeader } from "@/components/shell/page-header";
import { ReunioesManager } from "@/components/gestao/reunioes-manager";
import { getReunioes } from "@/lib/data/reunioes";
import { getPessoas } from "@/lib/data/pessoas";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function GestaoReunioesPage() {
  const [reunioes, pessoas] = await Promise.all([
    getReunioes(DEPARTAMENTO_CULTURAL),
    getPessoas(DEPARTAMENTO_CULTURAL),
  ]);

  return (
    <>
      <PageHeader title="Gestão de Reuniões" subtitle="Pauta, decisões e follow-up" />
      <div className="p-4 sm:p-6">
        <ReunioesManager reunioesIniciais={reunioes} pessoas={pessoas} />
      </div>
    </>
  );
}
