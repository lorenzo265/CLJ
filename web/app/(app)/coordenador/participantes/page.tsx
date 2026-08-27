import { PageHeader } from "@/components/shell/page-header";
import { ParticipantesManager } from "@/components/gestao/participantes-manager";
import { getFuncoesPorPessoaDoDepartamento, getPessoas } from "@/lib/data/pessoas";
import { getFuncoes } from "@/lib/data/funcoes";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function GestaoParticipantesPage() {
  const [pessoas, funcoes, funcoesPorPessoa] = await Promise.all([
    getPessoas(DEPARTAMENTO_CULTURAL),
    getFuncoes(DEPARTAMENTO_CULTURAL),
    getFuncoesPorPessoaDoDepartamento(DEPARTAMENTO_CULTURAL),
  ]);

  return (
    <>
      <PageHeader title="Participantes" subtitle="Departamento Cultural" />
      <div className="p-4 sm:p-6">
        <ParticipantesManager
          pessoasIniciais={pessoas}
          funcoes={funcoes}
          funcoesPorPessoa={funcoesPorPessoa}
        />
      </div>
    </>
  );
}
