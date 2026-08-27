import { redirect } from "next/navigation";
import { getPessoa } from "@/lib/data/pessoas";
import { PESSOA_ATUAL_ID } from "@/lib/mock/current-user";

// Guarda simples baseada no mock de usuário atual — vira guarda de verdade
// (sessão real) quando o backend existir.
export default async function CoordenadorLayout({ children }: LayoutProps<"/coordenador">) {
  const pessoa = await getPessoa(PESSOA_ATUAL_ID);
  if (pessoa?.papelSistema !== "coordenador") redirect("/escala");

  return children;
}
