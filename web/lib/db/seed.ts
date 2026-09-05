import { addDays, format, subDays } from "date-fns";
import { hashSenha } from "@/lib/auth/senha";
import { DEPARTAMENTO_CULTURAL } from "@/lib/departamento";
import type { DB } from "@/lib/db";

/*
  Semeadura. Roda quando o banco está vazio — nunca sobrescreve dado existente.

  - Em desenvolvimento: o departamento de demonstração inteiro, com senha conhecida.
  - Em produção: só o catálogo de funções e a coordenação criada a partir de
    CLJ_COORDENADOR_EMAIL / CLJ_COORDENADOR_SENHA / CLJ_COORDENADOR_NOME. Sem essas
    variáveis, nada é criado (e o app avisa no log em vez de inventar uma conta).
*/

/** Senha de todas as pessoas do banco de demonstração. Documentada no web/README.md. */
export const SENHA_DEMO = "terco2026";

const FUNCOES = [
  {
    id: "f1",
    nome: "Terço Diário",
    descricao: "Produzir e revisar o Story diário do terço a partir do template mensal.",
  },
  {
    id: "f2",
    nome: "Post da tarde",
    descricao: "Publicação fixa da tarde no feed, conteúdo de valor não-promocional.",
  },
  {
    id: "f3",
    nome: "Cinecultural",
    descricao: "Organização do evento: curadoria, local, equipamento e divulgação.",
  },
  {
    id: "f4",
    nome: "Curiosidade da fé",
    descricao: "Post semanal com uma curiosidade católica, tom leve e educativo.",
  },
  {
    id: "f5",
    nome: "Aniversários",
    descricao: "Card de aniversário dos membros do departamento, publicado no dia.",
  },
];

const PESSOAS = [
  {
    id: "p1",
    nome: "Maria Aparecida",
    email: "maria@clj-nsr.local",
    contato: "(11) 9xxxx-1010",
    papel: "coordenador",
    dias: "seg,ter,qua,qui,sex",
    periodos: "tarde",
    completo: 1,
    status: "ativo",
    funcoes: ["f1", "f2"],
  },
  {
    id: "p2",
    nome: "João Marcelo",
    email: "joao@clj-nsr.local",
    contato: "(11) 9xxxx-2020",
    papel: "participante",
    dias: "ter,qui",
    periodos: "noite",
    completo: 1,
    status: "ativo",
    funcoes: ["f1"],
  },
  {
    id: "p3",
    nome: "Ana Paula",
    email: "ana@clj-nsr.local",
    contato: "(11) 9xxxx-3030",
    papel: "participante",
    dias: "seg,qua,sex",
    periodos: "tarde,noite",
    completo: 1,
    status: "ativo",
    funcoes: ["f1", "f3"],
  },
  {
    id: "p4",
    nome: "Pedro Lucas",
    email: "pedro@clj-nsr.local",
    contato: "(11) 9xxxx-4040",
    papel: "participante",
    dias: "sab,dom",
    periodos: "manha",
    completo: 1,
    status: "ativo",
    funcoes: ["f3"],
  },
  {
    id: "p5",
    nome: "Carla Souza",
    email: "carla@clj-nsr.local",
    contato: "(11) 9xxxx-5050",
    papel: "participante",
    dias: "qui,sex",
    periodos: "tarde",
    completo: 0,
    status: "ativo",
    funcoes: ["f4"],
  },
  {
    id: "p6",
    nome: "Rafael Nunes",
    email: "rafael@clj-nsr.local",
    contato: "(11) 9xxxx-6060",
    papel: "participante",
    dias: "",
    periodos: "",
    completo: 1,
    status: "inativo",
    funcoes: ["f5"],
  },
];

/** Datas relativas a hoje: o banco de demonstração nunca "envelhece". */
function d(offsetDias: number): string {
  const base = new Date();
  return format(offsetDias >= 0 ? addDays(base, offsetDias) : subDays(base, -offsetDias), "yyyy-MM-dd");
}

function atividades() {
  return [
    // id, tipo, titulo, funcao, data, hora, responsavel, suplente, status, midia
    ["a1", "post", "Post — Terço Diário", "f1", d(-2), "07:00", "p4", null, "publicado", "https://canva.com/design/terco-anteontem"],
    ["a2", "post", "Post — Terço Diário", "f1", d(0), "07:00", "p1", "p2", "agendado", "https://canva.com/design/terco-hoje"],
    ["a3", "reuniao", "Reunião de equipe", null, d(1), "19:30", "p1", null, "agendado", null],
    ["a4", "post", "Post — Terço Diário", "f1", d(3), "07:00", "p3", "p1", "agendado", null],
    ["a5", "tarefa", "Reservar sala e projetor", "f3", d(6), null, "p4", "p3", "rascunho", null],
    ["a6", "evento", "Evento — Cinecultural", "f3", d(10), "19:00", "p4", null, "rascunho", null],
    ["a7", "post", "Curiosidade da fé", "f4", d(20), "17:00", "p5", null, "ideia", null],
    ["a8", "reuniao", "Reunião quinzenal", null, d(-14), "19:30", "p1", null, "concluido", null],
    // Os dois furos que o painel do coordenador precisa mostrar.
    ["a9", "post", "Post da tarde", "f2", d(4), "17:00", null, null, "ideia", null],
    ["a10", "post", "Post — Terço Diário", "f1", d(5), "07:00", null, null, "ideia", null],
  ] as const;
}

function inserirDemo(db: DB) {
  const agora = new Date().toISOString();
  const senha = hashSenha(SENHA_DEMO);

  const insFuncao = db.prepare(
    "INSERT INTO funcoes (id, departamento_id, nome, descricao) VALUES (?, ?, ?, ?)",
  );
  const insPessoa = db.prepare(`
    INSERT INTO pessoas
      (id, nome, contato, email, departamento_id, papel_sistema, senha_hash,
       dias, periodos, cadastro_completo, status, criado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insPessoaFuncao = db.prepare(
    "INSERT INTO pessoa_funcoes (pessoa_id, funcao_id) VALUES (?, ?)",
  );
  const insAtividade = db.prepare(`
    INSERT INTO atividades
      (id, departamento_id, tipo, titulo, funcao_id, data, hora,
       responsavel_id, suplente_id, status, link_midia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insReuniao = db.prepare(
    "INSERT INTO reunioes (atividade_id, pauta, decisoes) VALUES (?, ?, ?)",
  );
  const insPresente = db.prepare(
    "INSERT INTO reuniao_presentes (atividade_id, pessoa_id) VALUES (?, ?)",
  );
  const insFollowUp = db.prepare(`
    INSERT INTO reuniao_followup (id, atividade_id, acao, responsavel_id, prazo, ordem)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const f of FUNCOES) insFuncao.run(f.id, DEPARTAMENTO_CULTURAL, f.nome, f.descricao);

  for (const p of PESSOAS) {
    insPessoa.run(
      p.id,
      p.nome,
      p.contato,
      p.email,
      DEPARTAMENTO_CULTURAL,
      p.papel,
      senha,
      p.dias,
      p.periodos,
      p.completo,
      p.status,
      agora,
    );
    for (const fid of p.funcoes) insPessoaFuncao.run(p.id, fid);
  }

  for (const a of atividades()) {
    insAtividade.run(a[0], DEPARTAMENTO_CULTURAL, a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
  }

  insReuniao.run(
    "a3",
    JSON.stringify([
      "Como está a produção do lote deste mês do Terço Diário?",
      "Quem assume a curadoria de filme do Cinecultural?",
      "Alguém está sobrecarregado essa quinzena?",
    ]),
    JSON.stringify([]),
  );
  insReuniao.run(
    "a8",
    JSON.stringify([
      "Revisão do calendário editorial do mês.",
      "Alinhamento sobre o Cinecultural.",
    ]),
    JSON.stringify([
      "Lote do próximo mês será produzido numa sessão só, no fim de semana.",
      "Pedro assume a curadoria do Cinecultural com apoio da Ana.",
    ]),
  );

  for (const pessoaId of ["p1", "p3", "p4"]) insPresente.run("a8", pessoaId);

  insFollowUp.run("fu1", "a8", "Reservar sala para o Cinecultural", "p4", d(2), 0);
  insFollowUp.run("fu2", "a8", "Enviar convite dos filmes candidatos", "p3", d(3), 1);
}

function inserirProducao(db: DB): boolean {
  const email = process.env.CLJ_COORDENADOR_EMAIL?.trim();
  const senha = process.env.CLJ_COORDENADOR_SENHA;
  const nome = process.env.CLJ_COORDENADOR_NOME?.trim() || "Coordenação";
  if (!email || !senha) return false;

  const insFuncao = db.prepare(
    "INSERT INTO funcoes (id, departamento_id, nome, descricao) VALUES (?, ?, ?, ?)",
  );
  for (const f of FUNCOES) insFuncao.run(f.id, DEPARTAMENTO_CULTURAL, f.nome, f.descricao);

  db.prepare(`
    INSERT INTO pessoas
      (id, nome, contato, email, departamento_id, papel_sistema, senha_hash,
       dias, periodos, cadastro_completo, status, criado_em)
    VALUES (?, ?, '', ?, ?, 'coordenador', ?, '', '', 1, 'ativo', ?)
  `).run("p1", nome, email, DEPARTAMENTO_CULTURAL, hashSenha(senha), new Date().toISOString());

  return true;
}

/** Só semeia banco vazio. Chamada no boot pela conexão — nunca destrói nada. */
export function semearSeVazio(db: DB): void {
  const { total } = db.prepare("SELECT count(*) AS total FROM pessoas").get() as { total: number };
  if (total > 0) return;

  const producao = process.env.NODE_ENV === "production";
  const semear = db.transaction(() => (producao ? inserirProducao(db) : (inserirDemo(db), true)));

  if (!semear()) {
    console.warn(
      "[clj] Banco vazio e sem CLJ_COORDENADOR_EMAIL/CLJ_COORDENADOR_SENHA: " +
        "nenhuma conta criada. Defina as variáveis e reinicie para criar a coordenação.",
    );
  }
}
