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

/** Cria (ou atualiza) a estrutura. Idempotente — é seguro rodar a cada boot. */
export function migrar(db: DB): void {
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
