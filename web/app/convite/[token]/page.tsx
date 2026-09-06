import type { Metadata } from "next";
import Link from "next/link";
import { MarcaAureola } from "@/components/marca/marca-aureola";
import { ConviteForm } from "@/components/auth/convite-form";
import { getConviteValido } from "@/lib/data/convites";

export const metadata: Metadata = { title: "Seu convite · CLJ NSR" };

/** O convite do coordenador é a única porta de entrada — não há autocadastro. */
export default async function ConvitePage({ params }: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const convite = await getConviteValido(token);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full max-w-[380px] flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <MarcaAureola className="size-14" />
          <h1 className="mt-3 font-serif text-2xl font-bold">CLJ NSR</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Departamento Cultural</p>
        </div>

        <div className="rounded-2xl border border-border bg-panel p-6 sm:p-7">
          {convite ? (
            <>
              <p className="mb-4 text-[13.5px] leading-relaxed text-muted-foreground">
                Você foi convidado para o Departamento Cultural como{" "}
                <strong className="text-foreground">
                  {convite.papelSistema === "coordenador" ? "coordenação" : "participante"}
                </strong>
                . Defina sua senha e entre — o cadastro completo vem depois.
              </p>
              <ConviteForm token={token} nome={convite.nome} />
            </>
          ) : (
            <div className="text-center">
              <p className="font-serif text-lg font-bold">Este convite não vale mais</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Ele já foi usado ou passou da validade. Peça um novo ao coordenador do
                departamento.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-[13.5px] font-semibold text-accent-ink underline underline-offset-4"
              >
                Ir para a tela de entrada
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
