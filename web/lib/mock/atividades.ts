import { addDays, format, subDays } from "date-fns";
import type { Atividade } from "@/lib/types";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

function d(offsetDias: number): string {
  const base = new Date();
  return format(offsetDias >= 0 ? addDays(base, offsetDias) : subDays(base, -offsetDias), "yyyy-MM-dd");
}

export const atividades: Atividade[] = [
  {
    id: "a1",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "post",
    titulo: "Post — Terço Diário",
    funcaoId: "f1",
    data: d(-2),
    responsavelId: "p4",
    status: "publicado",
    linkMidia: "https://canva.com/design/terco-23-08",
  },
  {
    id: "a2",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "post",
    titulo: "Post — Terço Diário",
    funcaoId: "f1",
    data: d(0),
    responsavelId: "p1",
    suplenteId: "p2",
    status: "agendado",
    linkMidia: "https://canva.com/design/terco-hoje",
  },
  {
    id: "a3",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "reuniao",
    titulo: "Reunião de equipe",
    funcaoId: "f1",
    data: d(1),
    responsavelId: "p1",
    status: "agendado",
  },
  {
    id: "a4",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "post",
    titulo: "Post — Terço Diário",
    funcaoId: "f1",
    data: d(3),
    responsavelId: "p3",
    suplenteId: "p1",
    status: "agendado",
  },
  {
    id: "a5",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "tarefa",
    titulo: "Reservar sala e projetor",
    funcaoId: "f3",
    data: d(6),
    responsavelId: "p4",
    suplenteId: "p3",
    status: "rascunho",
  },
  {
    id: "a6",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "evento",
    titulo: "Evento — Cinecultural",
    funcaoId: "f3",
    data: d(10),
    responsavelId: "p4",
    status: "rascunho",
  },
  {
    id: "a7",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "post",
    titulo: "Curiosidade da fé",
    funcaoId: "f4",
    data: d(20),
    responsavelId: "p5",
    status: "ideia",
  },
  {
    id: "a8",
    departamentoId: DEPARTAMENTO_CULTURAL,
    tipo: "reuniao",
    titulo: "Reunião quinzenal",
    funcaoId: "f1",
    data: d(-14),
    responsavelId: "p1",
    status: "concluido",
  },
];
