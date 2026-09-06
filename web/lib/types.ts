// Modelo de dados do CLJ NSR — espelha o schema em lib/db/schema.sql.
// Ver docs/sdd-implementacao.md §3. departamentoId é um campo simples em cada entidade —
// não vira tabela própria enquanto só existir o Departamento Cultural.

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

export const DIAS_SEMANA: DiaSemana[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
export const PERIODOS: Periodo[] = ["manha", "tarde", "noite"];
export const TIPOS_ATIVIDADE: TipoAtividade[] = ["post", "tarefa", "evento", "reuniao"];
export const STATUS_ATIVIDADE: StatusAtividade[] = [
  "ideia",
  "rascunho",
  "agendado",
  "publicado",
  "concluido",
];

export interface Pessoa {
  id: string;
  nome: string;
  contato: string;
  email: string;
  departamentoId: string;
  papelSistema: PapelSistema;
  disponibilidade: { dias: DiaSemana[]; periodos: Periodo[] };
  cadastroCompleto: boolean;
  status: "ativo" | "inativo";
  /** false enquanto a pessoa não definiu senha pelo convite. Nunca expõe o hash. */
  temSenha: boolean;
}

export interface Funcao {
  id: string;
  departamentoId: string;
  nome: string;
  descricao: string;
}

export interface Atividade {
  id: string;
  departamentoId: string;
  tipo: TipoAtividade;
  titulo: string;
  /** null = atividade sem função definida ainda. */
  funcaoId: string | null;
  data: string; // ISO yyyy-mm-dd
  /** "07:00" | null — a hora entra na frase ("sai amanhã às 7h") quando existe. */
  hora: string | null;
  /** null = furo: atividade sem responsável. O painel do coordenador conta esses. */
  responsavelId: string | null;
  suplenteId: string | null;
  status: StatusAtividade;
  linkMidia: string | null;
}

export interface ItemFollowUp {
  id: string;
  acao: string;
  responsavelId: string | null;
  prazo: string; // ISO yyyy-mm-dd, "" quando sem prazo
}

export interface Reuniao {
  atividadeId: string; // extensão 1:1 de uma Atividade do tipo "reuniao"
  pauta: string[];
  decisoes: string[];
  followUp: ItemFollowUp[];
}

/** Toda troca de responsável fica registrada — decisoes-estrutura.md §5. */
export interface Troca {
  id: string;
  atividadeId: string;
  papel: "responsavel" | "suplente";
  dePessoaId: string | null;
  paraPessoaId: string | null;
  motivo: string;
  feitaPor: string;
  criadoEm: string; // ISO 8601
}

export interface Convite {
  token: string;
  email: string;
  nome: string;
  papelSistema: PapelSistema;
  departamentoId: string;
  criadoPor: string;
  criadoEm: string;
  expiraEm: string;
  usadoEm: string | null;
}
