# Decisões de Estrutura — CLJ NSR

Registro vivo das decisões de produto e arquitetura de páginas. Atualizado em **2026-09-05**.

## 1. O problema (a régua de todo design)

- **Participante:** descobre que o post de amanhã é dele só se rolar a planilha no grupo de WhatsApp entre dezenas de mensagens. Não rola, o post não sai, e a cobrança vem em público.
- **Coordenador:** monta a escala na planilha, cola no grupo, e vira a memória viva do departamento — toda troca é conversa privada que ninguém vê, e a planilha nunca reflete a realidade.

A plataforma existe para que **a escala se defenda sozinha**.

## 2. Apetite e no-gos

**Dentro:** cadastro, escala, calendário, reuniões — leitura impecável no celular; gestão completa no desktop; aviso certo na hora certa com a informação completa.

**Fora (de propósito):** não é rede social (sem feed/curtidas); não substitui o WhatsApp para conversa — substitui a **planilha**; não é ferramenta genérica de projetos.

## 3. Audiências, em ordem de prioridade

1. **Participante no celular** — jovem, entra por 10 segundos. Se a tela dele falhar, nada mais importa.
2. **Coordenador no desktop** — sessões longas, densidade bem-vinda, poder de edição.
3. **Nunca:** "usuário avançado de software". Nenhuma tela pode exigir treinamento.

Em conflito de design, o participante ganha.

## 4. Papéis e telas

O coordenador vê **tudo que o participante vê, mais** as telas de gestão.

| Tela | Rota | Papel | Estado |
|---|---|---|---|
| Login | `/login` | entrada | construída |
| Convite → definir senha | `/convite/[token]` | entrada | construída |
| **Hoje** (manchete + dezena da semana) | `/hoje` | participante | construída |
| Escala (leitura, "Meus/Todos") | `/escala` | participante | construída — **Opção A**, agenda por prazo |
| Calendário (mês, "Meus/Departamento") | `/calendario` | participante | construída |
| Reuniões (pauta, decisões, follow-up) | `/reunioes` | participante | construída |
| Você (dados, funções, disponibilidade) | `/voce` | participante | construída |
| Painel do coordenador | `/coordenador` | coordenador | construída |
| Gestão de Funções | `/coordenador/funcoes` | coordenador | construída |
| Gestão de Escala | `/coordenador/escala` | coordenador | construída |
| Gestão de Reuniões | `/coordenador/reunioes` | coordenador | construída |
| Gestão de Participantes | `/coordenador/participantes` | coordenador | construída |

Componentes compartilhados: **AppSidebar** (o fio/terço, desktop) e **MobileNav** (bottom nav, mobile).

**Duas mudanças em relação ao canvas** (feitas ao construir, 2026-09-05):
- **"Hoje" virou rota do desktop também**, não só do celular. O princípio 1 ("a manchete é a
  sua próxima conta") vale nos dois lugares, e sem `/hoje` no desktop o sidebar não teria onde
  pousar quem entra.
- **"Cadastro" virou "Você"** (`/voce`), o nome que a bottom nav já usava. Duas palavras para a
  mesma tela era um vazamento de vocabulário interno. `/cadastro` redireciona.

## 5. Domínio

- **Funções** (catálogo atual): Terço Diário, Post da tarde, Cinecultural, Curiosidade da fé, Aniversários.
- **Tipos de atividade:** Post, Tarefa, Evento, Reunião.
- **Papéis numa atividade:** responsável e suplente.
- **Status de atividade:** Ideia → Rascunho → Agendado → Publicado. Reuniões: Agendada → Realizada.
- **Escala mensal** com rodízio; troca de responsável deve ficar registrada na plataforma (não em conversa privada).
- Nunca mostrar ao participante estrutura interna (linha da planilha, IDs) — sempre "Você publica o Terço amanhã".

## 6. Stack do app (`web/`)

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **SQLite** via `better-sqlite3` — o banco é um arquivo (`web/data/clj.db`), sem serviço
  externo, igual nas duas máquinas. Decidido em 2026-09-05; ver `sdd-implementacao.md` §1.3.
- **Autenticação própria**: senha com `scrypt` do Node, sessão em tabela + cookie `httpOnly`.
  Entrada só por **convite do coordenador** — não existe autocadastro.
- **GSAP** (`gsap` + `@gsap/react`) para motion (assinatura "passar a conta"), **lucide-react**
  para ícones, **shadcn** sobre `@base-ui/react` como base de componentes (sempre re-estilizado
  com nossos tokens), **sonner** para toasts, **date-fns** para datas, **next-themes** para o
  dark mode.
- Testes com **vitest** — domínio puro, repositórios (contra banco em memória) e regras de
  sessão/convite.
- Tokens de design entram como CSS custom properties em `app/globals.css` + `@theme` do
  Tailwind — componentes referenciam tokens por nome, nunca hex solto.

**Arquitetura em camadas** (a regra que a revisão cobra):

```
página / componente  →  lib/data/ (leitura, async)  →  lib/repos/ (SQL)  →  lib/db/
                     →  lib/actions/ (escrita, Server Actions)
```

Página nunca importa `lib/repos/` nem `lib/db/`. Toda escrita é Server Action que confere
sessão, papel e departamento **no servidor** antes de tocar no banco — esconder o botão não é
autorização. Domínio puro (`lib/escala/`, `lib/calendario/`, `lib/format.ts`) não conhece React
nem banco, e é onde ficam os testes.

**Estado atual do app:** todas as telas da tabela acima existem sobre dados reais, com escrita
persistente. `lib/mock/` deixou de existir.

Pendentes: plataforma do widget (nativo vs PWA), estratégia de push, e-mail transacional
(hoje o convite é um link que o coordenador copia e manda pelo canal que já usa).

## 7. Fluxo de trabalho em duas máquinas

- `design/` é a cópia versionada do canvas; o canvas publicado é onde se edita visualmente (Save publica para todos). Após edições no canvas, sincronizar `design/` no repo.
- Decisões novas entram **neste arquivo** ou em `decisoes-design.md` no mesmo commit que as implementa.
- `web/` roda com `npm install && npm run dev` em qualquer máquina; nada de `node_modules`,
  `.env` ou `data/` no Git.
- O banco é **local de cada máquina**: cada uma tem o seu `data/clj.db`, semeado com o
  departamento de demonstração no primeiro boot. Ele não é meio de sincronizar trabalho —
  o que precisa atravessar máquinas é código e decisão, e esses vão pelo Git.
