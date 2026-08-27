import type { Reuniao, ReuniaoPresente } from "@/lib/types";

export const reunioes: Reuniao[] = [
  {
    atividadeId: "a3",
    pauta: [
      "Como está a produção do lote deste mês do Terço Diário?",
      "Quem assume a curadoria de filme do Cinecultural?",
      "Alguém está sobrecarregado essa quinzena?",
    ],
    decisoes: [],
    followUp: [],
  },
  {
    atividadeId: "a8",
    pauta: [
      "Revisão do calendário editorial do mês.",
      "Alinhamento sobre o Cinecultural.",
    ],
    decisoes: [
      "Lote do próximo mês será produzido numa sessão só, no fim de semana.",
      "Pedro assume a curadoria do Cinecultural com apoio da Ana.",
    ],
    followUp: [
      { acao: "Reservar sala para o Cinecultural", responsavelId: "p4", prazo: "" },
      { acao: "Enviar convite dos filmes candidatos", responsavelId: "p3", prazo: "" },
    ],
  },
];

export const reuniaoPresentes: ReuniaoPresente[] = [
  { atividadeId: "a8", pessoaId: "p1" },
  { atividadeId: "a8", pessoaId: "p3" },
  { atividadeId: "a8", pessoaId: "p4" },
];
