import { redirect } from "next/navigation";

// A tela virou /voce, o nome que a bottom nav usa; /cadastro fica de pé para os links
// antigos (convites já enviados, favoritos) não morrerem em 404.
export default function CadastroPage() {
  redirect("/voce");
}
