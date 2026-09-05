import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/components/shell/page-header";
import { LinhaAtividade } from "@/components/escala/linha-atividade";
import { Dezena } from "@/components/fio/conta";
import { Kicker, Manchete, SemanaEmDia, TituloSecao } from "@/components/fio/tipografia";
import { comPapel, dezenaDaSemana, doDepartamento, getProximaAtividade } from "@/lib/escala/agenda";
import { fraseDaAtividade, rotuloTipo } from "@/lib/escala/frase";
import { getAtividades } from "@/lib/data/atividades";
import { getPessoas } from "@/lib/data/pessoas";
import { exigirPessoa } from "@/lib/auth/sessao";
import { formatarDataKicker } from "@/lib/format";

export const metadata: Metadata = { title: "Hoje · CLJ NSR" };

/**
 * A tela que responde "tenho algo?" em menos de 10 segundos (decisoes-design.md §8).
 * Três camadas: manchete → sua semana → o que é do departamento.
 */
export default async function HojePage() {
  const eu = await exigirPessoa();
  const agora = new Date();
  // Data local, não UTC: perto da meia-noite o "hoje" de Greenwich não é o de quem lê.
  const hojeISO = format(agora, "yyyy-MM-dd");

  const [atividades, pessoas] = await Promise.all([
    getAtividades(eu.departamentoId),
    getPessoas(eu.departamentoId),
  ]);

  const itens = comPapel(atividades, eu.id);
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  const proxima = getProximaAtividade(itens, agora);
  const dezena = dezenaDaSemana(itens, agora);
  const departamento = doDepartamento(itens, agora);

  // A manchete já é a primeira conta da semana — a lista abaixo não a repete.
  const restoDaSemana = dezena.itens.filter((i) => i.atividade.id !== proxima?.atividade.id);

  const elencoDaProxima = proxima
    ? {
        responsavel: proxima.atividade.responsavelId
          ? pessoaPorId.get(proxima.atividade.responsavelId)
          : undefined,
        suplente: proxima.atividade.suplenteId
          ? pessoaPorId.get(proxima.atividade.suplenteId)
          : undefined,
      }
    : {};

  return (
    <>
      <PageHeader title="Hoje">
        <span className="font-mono text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {formatarDataKicker(hojeISO)}
        </span>
      </PageHeader>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pb-10 lg:px-8 lg:pt-6">
        {proxima ? (
          <Manchete
            // O tipo é rótulo, não prefixo do título: colado, ele duplicaria em qualquer
            // atividade que já se chame "Post da tarde".
            kicker={`Sua próxima conta · ${rotuloTipo(proxima.atividade.tipo)}`}
            titulo={proxima.atividade.titulo}
            frase={fraseDaAtividade(proxima.atividade, proxima.papel, elencoDaProxima, agora)}
            acao={
              <Link
                href="/escala"
                // bg-primary e não bg-accent-ink: no escuro o azul sobe de luminosidade e o par
                // primary/primary-foreground é o único que continua legível nos dois temas.
                className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-[13.5px] font-bold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Ver a escala
              </Link>
            }
          />
        ) : (
          <SemanaEmDia />
        )}

        {restoDaSemana.length > 0 && (
          <section>
            <TituloSecao acao={<Dezena total={dezena.total} passadas={dezena.passadas} />}>
              Sua semana
            </TituloSecao>
            <div className="rounded-2xl border border-border bg-panel px-4">
              {restoDaSemana.map((it) => (
                <LinhaAtividade
                  key={it.atividade.id}
                  item={it}
                  responsavel={
                    it.atividade.responsavelId
                      ? pessoaPorId.get(it.atividade.responsavelId)
                      : undefined
                  }
                  suplente={
                    it.atividade.suplenteId ? pessoaPorId.get(it.atividade.suplenteId) : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}

        {departamento.length > 0 && (
          <section>
            <Kicker className="mb-2.5">Departamento</Kicker>
            <div className="rounded-2xl border border-border bg-panel px-4">
              {departamento.map((it) => (
                <LinhaAtividade
                  key={it.atividade.id}
                  item={it}
                  responsavel={
                    it.atividade.responsavelId
                      ? pessoaPorId.get(it.atividade.responsavelId)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
