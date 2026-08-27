import type { Funcao } from "@/lib/types";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export const funcoes: Funcao[] = [
  {
    id: "f1",
    departamentoId: DEPARTAMENTO_CULTURAL,
    nome: "Terço Diário",
    descricao: "Produzir e revisar o Story diário do terço a partir do template mensal.",
  },
  {
    id: "f2",
    departamentoId: DEPARTAMENTO_CULTURAL,
    nome: "Post da tarde",
    descricao: "Publicação fixa da tarde no feed, conteúdo de valor não-promocional.",
  },
  {
    id: "f3",
    departamentoId: DEPARTAMENTO_CULTURAL,
    nome: "Cinecultural",
    descricao: "Organização do evento: curadoria, local, equipamento e divulgação.",
  },
  {
    id: "f4",
    departamentoId: DEPARTAMENTO_CULTURAL,
    nome: "Curiosidade da fé",
    descricao: "Post semanal com uma curiosidade católica, tom leve e educativo.",
  },
  {
    id: "f5",
    departamentoId: DEPARTAMENTO_CULTURAL,
    nome: "Aniversários",
    descricao: "Card de aniversário dos membros do departamento, publicado no dia.",
  },
];

export const pessoaFuncoes: { pessoaId: string; funcaoId: string }[] = [
  { pessoaId: "p1", funcaoId: "f1" },
  { pessoaId: "p1", funcaoId: "f2" },
  { pessoaId: "p2", funcaoId: "f1" },
  { pessoaId: "p3", funcaoId: "f1" },
  { pessoaId: "p3", funcaoId: "f3" },
  { pessoaId: "p4", funcaoId: "f3" },
  { pessoaId: "p5", funcaoId: "f4" },
  { pessoaId: "p6", funcaoId: "f5" },
];
