import { addDays, format, parseISO } from "date-fns";
import type { DiaSemana } from "@/lib/types";

/*
  Domínio puro da série — a recorrência e o rodízio. Sem banco, sem React: é o mesmo
  módulo que o servidor usa para gravar e que o diálogo usa para mostrar a prévia antes
  de salvar. É de propósito: a coordenação vê exatamente a divisão que vai ser gravada.

  Ver docs/sdd-implementacao.md §8. A regra que existe aqui é uma só — "estes dias da
  semana, deste dia até aquele" — porque é a que o departamento usa: "todo dia às 7h",
  "de segunda a sexta", "todo sábado". Recorrência por posição no mês ("toda 2ª terça")
  não está aqui, e a ausência é escolha, não esquecimento.
*/

/** Índice de `Date.getDay()` (0 = domingo) para o vocabulário do app. */
const DIA_DO_INDICE: DiaSemana[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export const diaSemanaDe = (iso: string): DiaSemana => DIA_DO_INDICE[parseISO(iso).getDay()];

export interface RegraSerie {
  /** Dias da semana em que a série cai. Vazio = nenhuma data — a tela cobra ao menos um. */
  dias: DiaSemana[];
  inicio: string; // ISO yyyy-mm-dd
  fim: string; // ISO yyyy-mm-dd, inclusive
}

/**
 * Teto de datas por série. Um ano de atividade diária cabe; um erro de digitação no ano
 * ("2206") para aqui em vez de escrever oitenta mil linhas no banco.
 */
export const MAX_DATAS_DA_SERIE = 400;

/** As datas que a regra gera, em ordem. Intervalo invertido ou vazio devolve lista vazia. */
export function datasDaSerie(regra: RegraSerie): string[] {
  if (regra.dias.length === 0 || !regra.inicio || !regra.fim) return [];
  if (regra.fim < regra.inicio) return [];

  const querido = new Set(regra.dias);
  const datas: string[] = [];
  let dia = parseISO(regra.inicio);

  while (format(dia, "yyyy-MM-dd") <= regra.fim && datas.length < MAX_DATAS_DA_SERIE) {
    const iso = format(dia, "yyyy-MM-dd");
    if (querido.has(DIA_DO_INDICE[dia.getDay()])) datas.push(iso);
    dia = addDays(dia, 1);
  }
  return datas;
}

/** Quem entra no rodízio. `dias` vazio = pessoa sem disponibilidade declarada: serve todo dia. */
export interface CandidatoRodizio {
  id: string;
  dias: DiaSemana[];
}

export interface AlocacaoDia {
  data: string;
  /** null = furo. Acontece quando ninguém do grupo atende àquele dia da semana. */
  pessoaId: string | null;
}

/**
 * Divide as datas entre as pessoas: para cada data, entre quem está disponível naquele
 * dia da semana, entrega a quem tem menos até agora. Empate resolve pela ordem do grupo,
 * então a mesma entrada sempre produz a mesma escala — a prévia não mente.
 *
 * Não é rodízio circular cego: circular ignora disponibilidade e coloca a Ana numa terça
 * que ela não pode. Este equilibra e respeita, e prefere deixar furo a escalar quem não
 * pode — o furo o app sabe cobrar, o "não pode" ele não sabe.
 *
 * `cargaInicial` permite continuar uma divisão já existente (redistribuir sem zerar
 * a conta de quem já vinha carregando).
 */
export function distribuirRodizio(
  datas: string[],
  grupo: CandidatoRodizio[],
  cargaInicial: Record<string, number> = {},
): AlocacaoDia[] {
  const carga = new Map(grupo.map((p) => [p.id, cargaInicial[p.id] ?? 0]));

  return datas.map((data) => {
    const dia = diaSemanaDe(data);
    const disponiveis = grupo.filter((p) => p.dias.length === 0 || p.dias.includes(dia));
    if (disponiveis.length === 0) return { data, pessoaId: null };

    // `reduce` sem sort: o primeiro de menor carga vence, e ele vem na ordem do grupo.
    const escolhido = disponiveis.reduce((melhor, p) =>
      carga.get(p.id)! < carga.get(melhor.id)! ? p : melhor,
    );
    carga.set(escolhido.id, carga.get(escolhido.id)! + 1);
    return { data, pessoaId: escolhido.id };
  });
}

/** Quantas contas cada pessoa levou, mais os furos — o resumo que a prévia mostra. */
export function resumoDaDivisao(alocacoes: AlocacaoDia[]): {
  porPessoa: { pessoaId: string; total: number }[];
  furos: number;
} {
  const total = new Map<string, number>();
  let furos = 0;

  for (const { pessoaId } of alocacoes) {
    if (pessoaId === null) furos += 1;
    else total.set(pessoaId, (total.get(pessoaId) ?? 0) + 1);
  }

  return {
    porPessoa: [...total.entries()]
      .map(([pessoaId, t]) => ({ pessoaId, total: t }))
      .sort((a, b) => b.total - a.total),
    furos,
  };
}
