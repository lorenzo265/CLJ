import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { CadastroForm } from "@/components/cadastro/cadastro-form";
import { getFuncoes } from "@/lib/data/funcoes";
import { getIdsDeFuncoesDaPessoa } from "@/lib/data/pessoas";
import { exigirPessoa } from "@/lib/auth/sessao";
import { iniciaisDe } from "@/lib/format";

export const metadata: Metadata = { title: "Você · CLJ NSR" };

/**
 * O cadastro da própria pessoa — o quarto destino da bottom nav.
 * A tela só entrega o que o formulário precisa: a action escreve sempre em quem está
 * na sessão, então nada de id ou e-mail atravessa para o cliente.
 */
export default async function VocePage() {
  const eu = await exigirPessoa();

  const [funcoes, minhasFuncoes] = await Promise.all([
    getFuncoes(eu.departamentoId),
    getIdsDeFuncoesDaPessoa(eu.id),
  ]);

  return (
    <>
      <PageHeader title="Você" subtitle="Seu cadastro no Departamento Cultural" />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 pb-10 lg:px-8 lg:pt-6">
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent-ink"
            aria-hidden
          >
            {iniciaisDe(eu.nome)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-bold">{eu.nome}</p>
            <p className="text-[13px] text-muted-foreground">
              {eu.papelSistema === "coordenador" ? "Coordenação" : "Participante"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Isso ajuda a coordenação a te encaixar nas funções e nos dias em que você realmente
          pode.
        </p>

        <CadastroForm
          nome={eu.nome}
          contato={eu.contato}
          funcoes={funcoes}
          funcoesMarcadas={minhasFuncoes}
          dias={eu.disponibilidade.dias}
          periodos={eu.disponibilidade.periodos}
        />
      </div>
    </>
  );
}
