import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import {
  ParticipantesManager,
  type PessoaNaGestao,
} from "@/components/gestao/participantes-manager";
import { exigirCoordenador } from "@/lib/auth/sessao";
import { getFuncoes } from "@/lib/data/funcoes";
import { getConvitesPendentes } from "@/lib/data/convites";
import { getFuncoesPorPessoaDoDepartamento, getPessoas } from "@/lib/data/pessoas";

export const metadata: Metadata = { title: "Participantes · CLJ NSR" };

/**
 * Quem faz parte do departamento. Duas perguntas em uma tela: quem já está dentro (e o que
 * cada um assume) e quem foi chamado e ainda não entrou — o convite é um link copiável,
 * porque o app não manda e-mail (sdd-implementacao.md §6).
 */
export default async function GestaoParticipantesPage() {
  const eu = await exigirCoordenador();

  const [pessoas, funcoes, funcoesPorPessoa, convites] = await Promise.all([
    getPessoas(eu.departamentoId),
    getFuncoes(eu.departamentoId),
    getFuncoesPorPessoaDoDepartamento(eu.departamentoId),
    getConvitesPendentes(eu.departamentoId),
  ]);

  const nomeDaFuncao = new Map(funcoes.map((f) => [f.id, f.nome]));

  const itens: PessoaNaGestao[] = pessoas
    .map((p) => ({
      ...p,
      // O id da função morre aqui: da tela para baixo só circula o nome que o departamento usa.
      funcoes: (funcoesPorPessoa[p.id] ?? [])
        .map((id) => ({ id, nome: nomeDaFuncao.get(id) }))
        .filter((f): f is { id: string; nome: string } => f.nome !== undefined),
    }))
    // Quem está em atividade primeiro; o repositório já entrega em ordem de nome dentro
    // de cada grupo. Inativo não some da lista, só para de disputar a leitura.
    .sort((a, b) => Number(a.status === "inativo") - Number(b.status === "inativo"));

  return (
    <>
      <PageHeader
        title="Participantes"
        subtitle="Quem está no departamento e o que cada um assume"
      />

      <div className="mx-auto w-full max-w-5xl px-5 pb-10 lg:px-8 lg:pt-6">
        <ParticipantesManager
          pessoas={itens}
          catalogo={funcoes}
          convites={convites}
          euId={eu.id}
        />
      </div>
    </>
  );
}
