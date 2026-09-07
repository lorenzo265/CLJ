import "server-only";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { semearSeVazio } from "@/lib/db/seed";

/*
  A conexão. Um arquivo SQLite é o banco: roda igual nas duas máquinas, sem serviço externo.
  Ver docs/sdd-implementacao.md §1.3 — trocar por Postgres é reescrever lib/db/ e lib/repos/,
  com as páginas intactas.
*/

export type DB = Database.Database;

let instancia: DB | null = null;

function caminhoDoBanco(): string {
  return process.env.CLJ_DB_PATH ?? join(process.cwd(), "data", "clj.db");
}

function lerSchema(): string {
  const caminho = join(process.cwd(), "lib", "db", "schema.sql");
  if (!existsSync(caminho)) {
    throw new Error(
      `schema.sql não encontrado em ${caminho}. Rode o app a partir da raiz de web/.`,
    );
  }
  return readFileSync(caminho, "utf8");
}

/**
 * `schema.sql` é o alvo, mas `CREATE TABLE IF NOT EXISTS` não mexe numa tabela que já
 * existe: um banco criado antes de uma coluna nunca a ganharia. Esta lista alcança esses
 * bancos, e roda ANTES do schema — o schema cria índices sobre essas colunas, e um índice
 * sobre coluna que ainda não existe é erro.
 *
 * Coluna nova vai nos dois lugares: aqui (bancos que já existem) e no `CREATE TABLE`
 * (bancos novos). Os dois caminhos têm de chegar na mesma estrutura.
 */
const COLUNAS_ACRESCENTADAS: { tabela: string; coluna: string; definicao: string }[] = [
  // Fase 8: a atividade passou a saber de que série veio.
  {
    tabela: "atividades",
    coluna: "serie_id",
    definicao: "TEXT REFERENCES series (id) ON DELETE SET NULL",
  },
];

function acrescentarColunas(db: DB): void {
  for (const { tabela, coluna, definicao } of COLUNAS_ACRESCENTADAS) {
    // Tabela ausente = banco novo: quem cria é o schema, com a coluna já dentro.
    const colunas = db.prepare(`PRAGMA table_info(${tabela})`).all() as { name: string }[];
    if (colunas.length === 0) continue;
    if (colunas.some((c) => c.name === coluna)) continue;

    db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
  }
}

/** Cria (ou atualiza) a estrutura. Idempotente — é seguro rodar a cada boot. */
export function migrar(db: DB): void {
  acrescentarColunas(db);
  db.exec(lerSchema());
}

export function conectar(caminho: string): DB {
  if (caminho !== ":memory:") mkdirSync(dirname(caminho), { recursive: true });

  const db = new Database(caminho);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrar(db);
  return db;
}

/**
 * A conexão do app. Preguiçosa de propósito: nada de banco durante o build, só no
 * primeiro pedido que realmente lê dados.
 */
export function getDb(): DB {
  if (instancia) return instancia;

  instancia = conectar(caminhoDoBanco());
  semearSeVazio(instancia);
  return instancia;
}

/** Só para teste: uma conexão isolada em memória, já migrada. */
export function bancoEmMemoria(): DB {
  return conectar(":memory:");
}
