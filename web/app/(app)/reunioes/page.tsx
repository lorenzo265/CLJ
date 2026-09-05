import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { StatusReuniao } from "@/components/fio/status-pill";
import { Vazio } from "@/components/fio/tipografia";
import { DetalheReuniao } from "@/components/reunioes/detalhe-reuniao";
import { PageHeader } from "@/components/shell/page-header";
import { exigirPessoa } from "@/lib/auth/sessao";
import { getPessoas } from "@/lib/data/pessoas";
import { getReunioes, reuniaoRealizada, type ReuniaoCompleta } from "@/lib/data/reunioes";
import { formatarDataKicker } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reuniões · CLJ NSR" };

/**
 * Mestre-detalhe: a lista das reuniões e, ao lado, a que está aberta.
 *
 * A reunião aberta mora na querystring (`?r=`) — voltar, recarregar e mandar o link pra
 * alguém continuam funcionando, e a tela segue Server Component (nenhum "use client"
 * atravessa pra cima por causa de uma seleção).
 */
export default async function ReunioesPage({ searchParams }: PageProps<"/reunioes">) {
  const eu = await exigirPessoa();
  const { r } = await searchParams;

  // Data local, não UTC: perto da meia-noite o "hoje" de Greenwich não é o de quem lê.
  const hojeISO = format(new Date(), "yyyy-MM-dd");

  const [reunioes, pessoas] = await Promise.all([
    getReunioes(eu.departamentoId),
    getPessoas(eu.departamentoId),
  ]);

  const selecionada = selecionar(reunioes, typeof r === "string" ? r : undefined, hojeISO);

  return (
    <>
      <PageHeader title="Reuniões" subtitle="Pauta, decisões e follow-up" />

      <div className="mx-auto w-full max-w-5xl px-5 pb-10 lg:px-8 lg:pt-6">
        {!selecionada ? (
          <Vazio>Nenhuma reunião marcada por enquanto.</Vazio>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-5">
            {/*
              Em 390px a lista vira uma faixa rolável horizontal em vez de um seletor:
              o detalhe começa na primeira dobra (é o que a pessoa veio ler) e as outras
              datas continuam visíveis e a um toque, sem esconder nada atrás de um menu.
            */}
            <nav
              aria-label="Reuniões do departamento"
              className={cn(
                "-mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1",
                "lg:mx-0 lg:w-[270px] lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0",
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

            <DetalheReuniao
              reuniao={selecionada}
              pessoas={pessoas}
              euId={eu.id}
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
      href={`/reunioes?r=${atividade.id}`}
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

/**
 * Sem `?r=`, a tela abre onde a pessoa precisa agir: a próxima reunião marcada — é lá que
 * ela confirma presença e lê a pauta. Não havendo nenhuma pela frente, abre a última que
 * aconteceu, que é o que se procura fora de uma convocação (o que ficou decidido).
 *
 * `getReunioes` devolve da mais recente para a mais antiga, e as duas escolhas caem
 * naturalmente dessa ordem.
 */
function selecionar(
  reunioes: ReuniaoCompleta[],
  pedida: string | undefined,
  hojeISO: string,
): ReuniaoCompleta | undefined {
  const escolhida = pedida ? reunioes.find((x) => x.atividadeId === pedida) : undefined;
  if (escolhida) return escolhida;

  const agendadas = reunioes.filter((x) => !reuniaoRealizada(x.atividade));
  const futuras = agendadas.filter((x) => x.atividade.data >= hojeISO);

  // Na ordem decrescente, a última das futuras é a mais próxima de hoje.
  return futuras.at(-1) ?? agendadas[0] ?? reunioes[0];
}
