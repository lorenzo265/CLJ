import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MarcaAureola } from "@/components/marca/marca-aureola";
import { LoginForm } from "@/components/auth/login-form";
import { getSessao } from "@/lib/auth/sessao";

export const metadata: Metadata = { title: "Entrar · CLJ NSR" };

export default async function LoginPage() {
  if (await getSessao()) redirect("/hoje");

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-10">
      <div className="flex w-full max-w-[380px] flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <MarcaAureola className="size-14" />
          <h1 className="mt-3 font-serif text-2xl font-bold">CLJ NSR</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Departamento Cultural
            <br />
            Paróquia Nossa Senhora do Rosário
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-panel p-6 sm:p-7">
          <LoginForm />

          <div className="my-4 flex items-center gap-2.5">
            <span className="h-px flex-1 bg-border-soft" />
            <span className="text-[11.5px] text-faint">ou</span>
            <span className="h-px flex-1 bg-border-soft" />
          </div>

          <p className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
            Recebeu um convite do coordenador? Abra o link que ele te mandou para definir
            sua senha.
          </p>
        </div>
      </div>
    </main>
  );
}
