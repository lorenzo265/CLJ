import type { Atividade, Pessoa } from "@/lib/types";

/*
  Quanto cada pessoa carrega no mês visível. É o dado que a grade sozinha nunca deu: dá para
  ver que o mês está cheio sem ver que ele está cheio PARA UMA PESSOA SÓ.
  Domínio puro (docs/sdd-implementacao.md §2, regra 4) — a tela só desenha.
*/

export interface CargaDaPessoa {
  pessoaId: string;
  nome: string;
  total: number;
}

export interface CargaDoMes {
  /** Do mais carregado ao menos, e quem tem zero não entra: coluna vazia não é informação. */
  porPessoa: CargaDaPessoa[];
  /** Atividades sem responsável no mês — o que precisa de decisão. */
  furos: number;
  total: number;
}

/**
 * `mes` é "yyyy-MM". Quem saiu do departamento continua contando enquanto tiver conta na
 * mão: esconder isso esconderia trabalho que ninguém vai cobrar.
 */
export function cargaDoMes(atividades: Atividade[], pessoas: Pessoa[], mes: string): CargaDoMes {
  const noMes = atividades.filter((a) => a.data.startsWith(mes));
  const nomePorId = new Map(pessoas.map((p) => [p.id, p.nome]));

  const contagem = new Map<string, number>();
  let furos = 0;

  for (const a of noMes) {
    if (!a.responsavelId) furos += 1;
    else contagem.set(a.responsavelId, (contagem.get(a.responsavelId) ?? 0) + 1);
  }

  const porPessoa = [...contagem.entries()]
    .map(([pessoaId, total]) => ({
      pessoaId,
      nome: nomePorId.get(pessoaId) ?? "Fora do departamento",
      total,
    }))
    // Empate resolve pelo nome, para a lista não dançar entre dois carregamentos.
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));

  return { porPessoa, furos, total: noMes.length };
}
