// Modelo de dados aprovado do CLJ NSR (ver plano de implementação e docs/abertura-clj-nsr.html).
// departamentoId é um campo simples em cada entidade — não vira tabela própria enquanto
// só existir o Departamento Cultural.

export type PapelSistema = "coordenador" | "participante";
export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type Periodo = "manha" | "tarde" | "noite";
export type TipoAtividade = "post" | "tarefa" | "evento" | "reuniao";
export type StatusAtividade =
  | "ideia"
  | "rascunho"
  | "agendado"
  | "publicado"
  | "concluido";

export interface Pessoa {
  id: string;
  nome: string;
  contato: string;
  departamentoId: string;
  papelSistema: PapelSistema;
  disponibilidade: { dias: DiaSemana[]; periodos: Periodo[] };
  cadastroCompleto: boolean;
  status: "ativo" | "inativo";
}

export interface Funcao {
  id: string;
  departamentoId: string;
  nome: string;
  descricao: string;
}

export interface PessoaFuncao {
  pessoaId: string;
  funcaoId: string;
}

export interface Atividade {
  id: string;
  departamentoId: string;
  tipo: TipoAtividade;
  titulo: string;
  funcaoId: string;
  data: string; // ISO yyyy-mm-dd
  responsavelId: string;
  suplenteId?: string;
  status: StatusAtividade;
  linkMidia?: string;
}

export interface Reuniao {
  atividadeId: string; // extensão 1:1 de uma Atividade do tipo "reuniao"
  pauta: string[];
  decisoes: string[];
  followUp: { acao: string; responsavelId: string; prazo: string }[];
}

export interface ReuniaoPresente {
  atividadeId: string;
  pessoaId: string;
}
