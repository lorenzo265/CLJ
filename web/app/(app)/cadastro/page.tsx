import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { CadastroForm } from "@/components/cadastro/cadastro-form";
import { getPessoa, getFuncoesDaPessoa } from "@/lib/data/pessoas";
import { getFuncoes } from "@/lib/data/funcoes";
import { PESSOA_ATUAL_ID } from "@/lib/mock/current-user";
import { DEPARTAMENTO_CULTURAL } from "@/lib/mock/pessoas";

export default async function CadastroPage() {
  const pessoa = await getPessoa(PESSOA_ATUAL_ID);
  if (!pessoa) redirect("/login");

  const [funcoesDisponiveis, minhasFuncoes] = await Promise.all([
    getFuncoes(DEPARTAMENTO_CULTURAL),
    getFuncoesDaPessoa(pessoa.id),
  ]);

  return (
    <>
      <PageHeader
        title="Cadastro"
        subtitle={pessoa.cadastroCompleto ? "Seu perfil" : "Complete seu cadastro"}
      />
      <div className="p-4 sm:p-6">
        <CadastroForm
          pessoa={pessoa}
          funcoesDisponiveis={funcoesDisponiveis}
          funcoesIniciais={minhasFuncoes.map((f) => f.id)}
        />
      </div>
    </>
  );
}
