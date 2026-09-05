import { formatarHora, formatarQuando, nomeCurto } from "@/lib/format";
import type { PapelNaAtividade } from "@/lib/escala/agenda";
import type { Atividade, Pessoa } from "@/lib/types";

/*
  A voz do app (docs/decisoes-design.md §6): 2ª pessoa, ordem fixa
  situação → o que é seu → um próximo passo. Aviso é serviço, nunca cobrança —
  a frase carrega a informação completa para que ninguém precise abrir outra tela.

  Toda frase de atividade nasce aqui. Se duas telas divergirem no jeito de dizer,
  é porque alguma delas não passou por esta função.
*/

export interface Elenco {
  responsavel?: Pessoa;
  suplente?: Pessoa;
}

function quandoComHora(atividade: Atividade, hoje: Date): string {
  const quando = formatarQuando(atividade.data, hoje);
  const hora = formatarHora(atividade.hora);
  return hora ? `${quando} às ${hora}` : quando;
}

/** A frase completa da manchete: "Sai amanhã às 7h · você é o responsável". */
export function fraseDaAtividade(
  atividade: Atividade,
  papel: PapelNaAtividade,
  elenco: Elenco,
  hoje: Date = new Date(),
): string {
  const verbo =
    atividade.tipo === "post"
      ? "Sai"
      : atividade.tipo === "reuniao"
        ? "Acontece"
        : atividade.tipo === "evento"
          ? "Acontece"
          : "Vence";

  const situacao = `${verbo} ${quandoComHora(atividade, hoje)}`;

  if (papel === "responsavel") {
    const apoio = elenco.suplente ? ` · ${nomeCurto(elenco.suplente.nome)} é sua suplência` : "";
    return `${situacao} · você é o responsável${apoio}`;
  }

  if (papel === "suplente") {
    const titular = elenco.responsavel
      ? ` de ${nomeCurto(elenco.responsavel.nome)}`
      : "";
    return `${situacao} · você é suplente${titular}`;
  }

  return elenco.responsavel
    ? `${situacao} · ${nomeCurto(elenco.responsavel.nome)} é o responsável`
    : `${situacao} · ainda sem responsável`;
}

/** A versão curta, para a linha da lista, onde a data já aparece à direita. */
export function contextoDaAtividade(papel: PapelNaAtividade, elenco: Elenco): string {
  if (papel === "responsavel") {
    return elenco.suplente
      ? `Você é responsável · ${nomeCurto(elenco.suplente.nome)} é suplente`
      : "Você é responsável";
  }
  if (papel === "suplente") {
    return elenco.responsavel
      ? `Você é suplente · ${nomeCurto(elenco.responsavel.nome)} é responsável`
      : "Você é suplente";
  }
  return elenco.responsavel
    ? `${nomeCurto(elenco.responsavel.nome)} é responsável`
    : "Ainda sem responsável";
}

const TIPO_KICKER: Record<Atividade["tipo"], string> = {
  post: "Post",
  tarefa: "Tarefa",
  evento: "Evento",
  reuniao: "Reunião",
};

export function rotuloTipo(tipo: Atividade["tipo"]): string {
  return TIPO_KICKER[tipo];
}
