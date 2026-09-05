import { exigirCoordenador } from "@/lib/auth/sessao";

/**
 * A guarda de papel. Vale como primeira barreira, não como a única: cada action de
 * coordenação confere o papel de novo no servidor (docs/sdd-implementacao.md §2, regra 3).
 */
export default async function CoordenadorLayout({ children }: LayoutProps<"/coordenador">) {
  await exigirCoordenador();
  return <>{children}</>;
}
