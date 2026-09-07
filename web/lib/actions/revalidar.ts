import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Toda escrita que mexe em atividade invalida as mesmas telas. Mora fora dos arquivos
 * `"use server"` porque lá todo export precisa ser função assíncrona exportada como action.
 */
export function revalidarEscala(): void {
  revalidatePath("/coordenador/escala");
  revalidatePath("/coordenador");
  revalidatePath("/escala");
  revalidatePath("/calendario");
  revalidatePath("/hoje");
  revalidatePath("/reunioes");
}
