import type { ReactNode } from "react";
import { StatusReuniao } from "@/components/fio/status-pill";
import { BotaoPresenca } from "@/components/reunioes/botao-presenca";
import { reuniaoRealizada, type ReuniaoCompleta } from "@/lib/data/reunioes";
import { formatarDataCurta, formatarDataLonga, formatarHora, nomeCurto } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Pessoa } from "@/lib/types";

/**
 * A reunião aberta: o que vai ser conversado, o que ficou decidido e o que sobrou pra fazer.
 * Só leitura, com uma exceção — a presença, que é da própria pessoa e por isso fica aqui,
 * ao lado do que ela está lendo, e não numa tela de coordenação.
 */
export function DetalheReuniao({
  reuniao,
  pessoas,
  euId,
  hojeISO,
  className,
}: {
  reuniao: ReuniaoCompleta;
  pessoas: Pessoa[];
  euId: string;
  /** Hoje pelo relógio de quem lê — decide o que ainda é promessa e o que já é registro. */
  hojeISO: string;
  className?: string;
}) {
  const { atividade, pauta, decisoes, followUp, presentes } = reuniao;
  const realizada = reuniaoRealizada(atividade);
  const pessoaPorId = new Map(pessoas.map((p) => [p.id, p]));

  // A data manda tanto quanto o status: uma reunião de ontem que ninguém marcou como
  // realizada já passou, e convidar a confirmar presença nela seria pedir o impossível.
  const jaPassou = realizada || atividade.data < hojeISO;

  // Quem "podia estar lá" é quem está ativo — mais quem já confirmou e foi inativado depois,
  // senão o numerador passa o denominador ("6 de 5 presentes").
  const confirmados = new Set(presentes);
  const convocados = pessoas.filter(
    (p) => p.status === "ativo" || confirmados.has(p.id),
  ).length;
  const confirmei = confirmados.has(euId);

  const contexto = [
    formatarDataLonga(atividade.data),
    formatarHora(atividade.hora),
    fraseDePresenca(presentes.length, convocados, jaPassou),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-panel p-5 sm:p-6",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg leading-tight font-bold">{atividade.titulo}</h2>
          <p className="mt-1 text-[12.5px] text-muted-foreground">{contexto}</p>
        </div>
        <StatusReuniao realizada={realizada} />
      </header>

      {/* Confirmar presença só faz sentido antes: depois da reunião o registro é histórico. */}
      {!jaPassou && (
        <div className="mt-4 border-t border-border-soft pt-4">
          <BotaoPresenca atividadeId={atividade.id} pessoaId={euId} confirmado={confirmei} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        <Bloco titulo="Pauta">
          {pauta.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {pauta.map((pergunta, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug">
                  <span className="font-bold text-accent-ink tabular-nums">{i + 1}.</span>
                  <span className="min-w-0">{pergunta}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Sereno>A pauta ainda está sendo montada.</Sereno>
          )}
        </Bloco>

        <Bloco titulo="Decisões">
          {decisoes.length > 0 ? (
            <ul className="flex flex-col gap-1.5 text-[13.5px] leading-snug">
              {decisoes.map((decisao, i) => (
                <li key={i}>— {decisao}</li>
              ))}
            </ul>
          ) : (
            <Sereno>
              {jaPassou
                ? "Nada foi registrado desta reunião ainda."
                : "As decisões aparecem aqui depois da reunião."}
            </Sereno>
          )}
        </Bloco>

        <Bloco titulo="Follow-up">
          {followUp.length > 0 ? (
            <>
              {/* No celular a tabela de três colunas vira cartão: espremer não é responsivo. */}
              <ul className="flex flex-col gap-2 sm:hidden">
                {followUp.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border-soft bg-background px-3 py-2.5"
                  >
                    <p className="text-[13.5px] leading-snug font-semibold">{item.acao}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {quemFaz(item.responsavelId, pessoaPorId)} · {quandoVence(item.prazo)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <ColunaTitulo>Ação</ColunaTitulo>
                      <ColunaTitulo>Responsável</ColunaTitulo>
                      <ColunaTitulo>Prazo</ColunaTitulo>
                    </tr>
                  </thead>
                  <tbody>
                    {followUp.map((item) => (
                      <tr key={item.id} className="border-b border-border-soft last:border-b-0">
                        <td className="py-2.5 pr-4">{item.acao}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                          {quemFaz(item.responsavelId, pessoaPorId)}
                        </td>
                        <td className="py-2.5 font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                          {quandoVence(item.prazo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <Sereno>
              {jaPassou
                ? "Nenhum encaminhamento saiu desta reunião."
                : "Os encaminhamentos aparecem aqui depois da reunião."}
            </Sereno>
          )}
        </Bloco>
      </div>
    </article>
  );
}

/**
 * Cada bloco é uma seção com nome: o rótulo é um <h3> com a aparência de kicker, e não um
 * <span> solto — assim o leitor de tela navega "Pauta / Decisões / Follow-up" por cabeçalho.
 */
function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="kicker mb-2.5">{titulo}</h3>
      {children}
    </section>
  );
}

/** O vazio de um bloco: uma linha, sem tabela fantasma e sem cobrança. */
function Sereno({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-muted-foreground">{children}</p>;
}

function ColunaTitulo({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-border pb-2 pr-4 text-left font-mono text-[10px] font-semibold tracking-[0.08em] text-faint uppercase last:pr-0">
      {children}
    </th>
  );
}

/** Antes da reunião a presença é promessa; depois, é registro. A frase muda junto. */
function fraseDePresenca(presentes: number, convocados: number, realizada: boolean): string {
  if (convocados === 0) return "";
  if (realizada) return `${presentes} de ${convocados} presentes`;
  if (presentes === 0) return "ninguém confirmou presença ainda";
  return `${presentes} de ${convocados} confirmaram presença`;
}

function quemFaz(responsavelId: string | null, pessoas: Map<string, Pessoa>): string {
  const pessoa = responsavelId ? pessoas.get(responsavelId) : undefined;
  return pessoa ? nomeCurto(pessoa.nome) : "a combinar";
}

function quandoVence(prazo: string): string {
  return prazo ? formatarDataCurta(prazo) : "sem prazo";
}
