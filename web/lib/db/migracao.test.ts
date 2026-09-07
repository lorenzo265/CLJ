import { describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { migrar } from "@/lib/db";

/*
  O caminho que só bancos ANTIGOS percorrem. `CREATE TABLE IF NOT EXISTS` não acrescenta
  coluna a uma tabela que já existe: sem o ALTER, quem já rodava o app antes da Fase 8
  ficaria com um banco sem `serie_id` e o app quebraria no primeiro SELECT.
*/

/** Um banco como era antes da Fase 8: atividades sem `serie_id`, nenhuma tabela `series`. */
function bancoAntigo(): Database.Database {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE atividades (
      id TEXT PRIMARY KEY, departamento_id TEXT NOT NULL, tipo TEXT NOT NULL,
      titulo TEXT NOT NULL, funcao_id TEXT, data TEXT NOT NULL, hora TEXT,
      responsavel_id TEXT, suplente_id TEXT, status TEXT NOT NULL, link_midia TEXT
    );
    INSERT INTO atividades (id, departamento_id, tipo, titulo, data, status)
    VALUES ('velha', 'cultural', 'post', 'Post de antes', '2026-01-01', 'publicado');
  `);
  return db;
}

const colunas = (db: Database.Database, tabela: string) =>
  (db.prepare(`PRAGMA table_info(${tabela})`).all() as { name: string }[]).map((c) => c.name);

describe("migração de um banco que já existia", () => {
  it("acrescenta serie_id sem tocar no que já estava gravado", () => {
    const db = bancoAntigo();
    expect(colunas(db, "atividades")).not.toContain("serie_id");

    migrar(db);

    expect(colunas(db, "atividades")).toContain("serie_id");
    expect(db.prepare("SELECT * FROM atividades WHERE id = 'velha'").get()).toMatchObject({
      titulo: "Post de antes",
      status: "publicado",
      serie_id: null,
    });
  });

  it("roda duas vezes sem reclamar de coluna repetida", () => {
    const db = bancoAntigo();
    migrar(db);
    expect(() => migrar(db)).not.toThrow();
    expect(colunas(db, "atividades").filter((c) => c === "serie_id")).toHaveLength(1);
  });
});
