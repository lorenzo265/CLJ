import "server-only";
import {
  STATUS_ATIVIDADE,
  TIPOS_ATIVIDADE,
  DIAS_SEMANA,
  PERIODOS,
  type DiaSemana,
  type Periodo,
  type StatusAtividade,
  type TipoAtividade,
} from "@/lib/types";

/*
  Leitura de FormData. Toda action passa por aqui: o que vem do navegador é texto solto,
  e o banco só aceita valores do vocabulário.
*/

export function texto(fd: FormData, campo: string, limite = 500): string {
  return String(fd.get(campo) ?? "")
    .trim()
    .slice(0, limite);
}

/** Campo opcional: string vazia vira null, que é o que o banco entende por "não definido". */
export function textoOuNulo(fd: FormData, campo: string, limite = 500): string | null {
  const v = texto(fd, campo, limite);
  return v === "" ? null : v;
}

export function lista(fd: FormData, campo: string): string[] {
  return fd.getAll(campo).map((v) => String(v).trim()).filter(Boolean);
}

function umDe<T extends string>(valores: readonly T[], valor: string, padrao: T): T {
  return (valores as readonly string[]).includes(valor) ? (valor as T) : padrao;
}

export function tipoAtividade(fd: FormData, campo = "tipo"): TipoAtividade {
  return umDe(TIPOS_ATIVIDADE, texto(fd, campo), "post");
}

export function statusAtividade(fd: FormData, campo = "status"): StatusAtividade {
  return umDe(STATUS_ATIVIDADE, texto(fd, campo), "ideia");
}

export function dias(fd: FormData, campo = "dias"): DiaSemana[] {
  const escolhidos = new Set(lista(fd, campo));
  return DIAS_SEMANA.filter((d) => escolhidos.has(d));
}

export function periodos(fd: FormData, campo = "periodos"): Periodo[] {
  const escolhidos = new Set(lista(fd, campo));
  return PERIODOS.filter((p) => escolhidos.has(p));
}

/** yyyy-mm-dd ou "" — o `<input type="date">` já entrega nesse formato. */
export function dataISO(fd: FormData, campo: string): string {
  const v = texto(fd, campo, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
}

/** "HH:MM" ou null. */
export function hora(fd: FormData, campo = "hora"): string | null {
  const v = texto(fd, campo, 5);
  return /^\d{2}:\d{2}$/.test(v) ? v : null;
}

/** Link de mídia: só http(s), para que o campo não vire vetor de `javascript:`. */
export function urlOuNulo(fd: FormData, campo: string): string | null {
  const v = texto(fd, campo, 1000);
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(valor: string): boolean {
  return EMAIL.test(valor) && valor.length <= 254;
}
