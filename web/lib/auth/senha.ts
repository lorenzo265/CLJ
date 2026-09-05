import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/*
  Senha com scrypt do próprio Node — sem dependência nova para uma coisa dessas.
  Formato guardado: scrypt$N$r$p$salt$derivada (base64url), para que trocar os parâmetros
  no futuro não invalide os hashes já gravados.
*/

const N = 16384;
const R = 8;
const P = 1;
const TAMANHO = 64;
const MAXMEM = 64 * 1024 * 1024;

function derivar(senha: string, salt: Buffer, n: number, r: number, p: number): Buffer {
  return scryptSync(senha.normalize("NFKC"), salt, TAMANHO, { N: n, r, p, maxmem: MAXMEM });
}

export function hashSenha(senha: string): string {
  const salt = randomBytes(16);
  const derivada = derivar(senha, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${derivada.toString("base64url")}`;
}

/** Comparação em tempo constante. Hash ausente ou malformado nunca autentica. */
export function conferirSenha(senha: string, hash: string | null | undefined): boolean {
  if (!hash) return false;

  const partes = hash.split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, nTxt, rTxt, pTxt, saltTxt, esperadoTxt] = partes;
  const n = Number(nTxt);
  const r = Number(rTxt);
  const p = Number(pTxt);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  try {
    const esperado = Buffer.from(esperadoTxt, "base64url");
    const obtido = derivar(senha, Buffer.from(saltTxt, "base64url"), n, r, p);
    return esperado.length === obtido.length && timingSafeEqual(esperado, obtido);
  } catch {
    return false;
  }
}

/** Regra mínima: 8 caracteres. Sem exigência de símbolo — isso só gera senha em post-it. */
export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return "A senha precisa de pelo menos 8 caracteres.";
  if (senha.length > 200) return "Senha longa demais.";
  return null;
}
