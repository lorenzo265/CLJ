import { redirect } from "next/navigation";
import { getSessao } from "@/lib/auth/sessao";

/** A porta: quem está logado cai na manchete do dia; quem não está, no login. */
export default async function RootPage() {
  const pessoa = await getSessao();
  redirect(pessoa ? "/hoje" : "/login");
}
