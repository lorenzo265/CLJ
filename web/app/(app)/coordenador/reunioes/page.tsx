import type { Metadata } from "next";
import Link from "next/link";
import { StatusReuniao } from "@/components/fio/status-pill";
import { Vazio } from "@/components/fio/tipografia";
import { EditorReuniao, NovaReuniaoBotao } from "@/components/gestao/reunioes-manager";
import { PageHeader } from "@/components/shell/page-header";
import { exigirCoordenador } from "@/lib/auth/sessao";
import { getPessoas } from "@/lib/data/pessoas";
import { getReunioes, reuniaoRealizada, type ReuniaoCompleta } from "@/lib/data/reunioes";
import { formatarDataKicker } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Gestão de Reuniões · CLJ NSR" };

/**
 * Mestre-detalhe: as reuniões do departamento à esquerda, a que está aberta à direita.
 *
 * A reunião aberta mora na querystring (`?r=`), como na tela do participante — voltar,
 * recarregar e mandar o link continuam funcionando, e a lista segue sendo só links, sem
 * arrastar a seleção para o cliente.
 */
export default async function GestaoReunioesPage({
  searchParams,
}: PageProps<"/coordenador/reunioes">) {
  const eu = await exigirCoordenador();
  const { r } = await searchParams;

  const [reunioes, pessoas] = await Promise.all([
    getReunioes(eu.departamentoId),
    getPessoas(eu.departamentoId),
  ]);

  const pedida = typeof r === "string" ? r : undefined;
  // getReunioes devolve da mais recente para a mais antiga: a primeira é a que a
  // coordenação está preparando ou acabou de fazer.
  const selecionada =
    (pedida ? reunioes.find((x) => x.atividadeId === pedida) : undefined) ?? reunioes[0];

  return (
    <>
      <PageHeader title="Gestão de Reuniões" subtitle="Pauta, decisões, follow-up e presença">
        {reunioes.length > 0 && <NovaReuniaoBotao />}
      </PageHeader>

      <div className="mx-auto w-full max-w-5xl px-5 pb-10 lg:px-8 lg:pt-6">
        {!selecionada ? (
          <div className="rounded-2xl border border-border bg-panel px-5 pb-10 text-center">
            <Vazio>Nenhuma reunião marcada ainda — a primeira começa aqui.</Vazio>
            <div className="flex justify-center">
              <NovaReuniaoBotao />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            {/*
              Em 390px a lista vira faixa rolável, e não um <Select>: é a mesma escolha da
              tela Reuniões do participante (as datas continuam à vista, sem esconder nada
              atrás de um menu) e o editor — o motivo de a tela existir — começa na
              primeira dobra.
            */}
            <nav
              aria-label="Reuniões do departamento"
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1",
                "lg:mx-0 lg:w-[240px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0",
              )}
            >
              {reunioes.map((reuniao) => (
                <CartaoReuniao
                  key={reuniao.atividadeId}
                  reuniao={reuniao}
                  aberta={reuniao.atividadeId === selecionada.atividadeId}
                />
              ))}
            </nav>

            <EditorReuniao
              // Trocar de reunião remonta o editor: as listas em edição pertencem a uma
              // reunião só, e nenhuma linha atravessa para a seguinte.
              key={selecionada.atividadeId}
              reuniao={selecionada}
              pessoas={pessoas}
              realizada={reuniaoRealizada(selecionada.atividade)}
              className="flex-1"
            />
          </div>
        )}
      </div>
    </>
  );
}

function CartaoReuniao({ reuniao, aberta }: { reuniao: ReuniaoCompleta; aberta: boolean }) {
  const { atividade } = reuniao;

  return (
    <Link
      href={`/coordenador/reunioes?r=${atividade.id}`}
      aria-current={aberta ? "page" : undefined}
      className={cn(
        "block w-[220px] shrink-0 snap-start rounded-xl border px-3.5 py-3 lg:w-auto",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        aberta
          ? "border-accent-soft bg-accent-soft text-accent-ink"
          : "border-border bg-panel hover:border-accent-hi",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-mono text-[11px] font-semibold",
            aberta ? "text-accent-ink" : "text-muted-foreground",
          )}
        >
          {formatarDataKicker(atividade.data)}
        </span>
        <StatusReuniao realizada={reuniaoRealizada(atividade)} />
      </div>
      <p className={cn("mt-1 text-[13.5px] leading-snug", aberta ? "font-bold" : "font-semibold")}>
        {atividade.titulo}
      </p>
    </Link>
  );
}
