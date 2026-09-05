import { describe, expect, it } from "vitest";
import { conferirSenha, hashSenha, validarSenha } from "@/lib/auth/senha";

describe("hashSenha / conferirSenha", () => {
  it("a senha certa confere e a errada não", () => {
    const hash = hashSenha("terco2026");
    expect(conferirSenha("terco2026", hash)).toBe(true);
    expect(conferirSenha("terco2027", hash)).toBe(false);
  });

  it("o mesmo texto gera hashes diferentes — cada pessoa tem seu salt", () => {
    expect(hashSenha("terco2026")).not.toBe(hashSenha("terco2026"));
  });

  it("guarda os parâmetros junto do hash, para poder trocá-los sem invalidar ninguém", () => {
    expect(hashSenha("x").split("$").slice(0, 4)).toEqual(["scrypt", "16384", "8", "1"]);
  });

  it("acentos normalizados: a mesma senha digitada de dois jeitos entra igual", () => {
    const hash = hashSenha("coração".normalize("NFD"));
    expect(conferirSenha("coração".normalize("NFC"), hash)).toBe(true);
  });

  it("hash ausente ou corrompido nunca autentica", () => {
    expect(conferirSenha("qualquer", null)).toBe(false);
    expect(conferirSenha("qualquer", "")).toBe(false);
    expect(conferirSenha("qualquer", "não é um hash")).toBe(false);
    expect(conferirSenha("qualquer", "scrypt$a$b$c$d$e")).toBe(false);
    expect(conferirSenha("qualquer", "bcrypt$16384$8$1$aaaa$bbbb")).toBe(false);
  });

  it("senha vazia não vira chave-mestra", () => {
    expect(conferirSenha("", hashSenha("terco2026"))).toBe(false);
  });
});

describe("validarSenha", () => {
  it("aceita a partir de oito caracteres", () => {
    expect(validarSenha("12345678")).toBeNull();
  });

  it("recusa a curta demais e a absurda", () => {
    expect(validarSenha("1234567")).toMatch(/8 caracteres/);
    expect(validarSenha("x".repeat(201))).toMatch(/longa/);
  });
});
