# Decisões de Estrutura — CLJ NSR

Registro vivo das decisões de produto e arquitetura de páginas. Atualizado em **2026-08-26**.

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

| Tela | Papel | Estado |
|---|---|---|
| Login (convite do coordenador → definir senha) | entrada | desenhada |
| Cadastro (dados, funções, disponibilidade) | participante | desenhada |
| Escala (leitura, "Meus/Todos") | participante | 3 opções em avaliação (A: agenda por prazo · B: faixa de dias + destaque · C: linha do tempo) — **decisão pendente** |
| Calendário (mês, "Meus/Departamento") | participante | desenhada |
| Reuniões (pauta, decisões, follow-up — leitura) | participante | desenhada |
| Painel do coordenador (stats + alertas + atalhos) | coordenador | desenhada |
| Gestão de Funções (catálogo de papéis) | coordenador | desenhada |
| Gestão de Escala (atividades, responsável/suplente, mídia, status) | coordenador | desenhada |
| Gestão de Reuniões (pauta editável, decisões, follow-up) | coordenador | desenhada |
| Gestão de Participantes (convites, cadastros) | coordenador | desenhada |
| Mobile: Hoje / Escala / Calendário + bottom nav | participante | desenhadas |

Componentes compartilhados: **Sidebar** (o fio/terço, desktop) e **MobileNav** (bottom nav, mobile).

## 5. Domínio

- **Funções** (catálogo atual): Terço Diário, Post da tarde, Cinecultural, Curiosidade da fé, Aniversários.
- **Tipos de atividade:** Post, Tarefa, Evento, Reunião.
- **Papéis numa atividade:** responsável e suplente.
- **Status de atividade:** Ideia → Rascunho → Agendado → Publicado. Reuniões: Agendada → Realizada.
- **Escala mensal** com rodízio; troca de responsável deve ficar registrada na plataforma (não em conversa privada).
- Nunca mostrar ao participante estrutura interna (linha da planilha, IDs) — sempre "Você publica o Terço amanhã".

## 6. Stack do app (`web/`)

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **framer-motion** para o motion (assinatura "passar a conta"), **lucide-react** para ícones, **shadcn** como base de componentes (sempre re-estilizados com nossos tokens — nunca o look default), **sonner** para toasts, **react-day-picker**/`date-fns` para calendário, **next-themes** para o futuro dark mode.
- Testes com **vitest** (`lib/escala/agenda.test.ts`).
- Tokens de design entram como CSS custom properties + `theme` do Tailwind — componentes referenciam tokens por nome, nunca hex solto.

**Estado atual do app:** todas as rotas existem — `app/(app)/` (escala, calendário, cadastro, reuniões) e `app/(app)/coordenador/` (painel, escala, funções, participantes, reuniões), com `app/login/` fora do shell. Componentes por domínio em `components/` (shell, escala, calendario, cadastro, gestao) sobre a base `components/ui/` (shadcn). Dados vêm de `lib/mock/` através da camada `lib/data/` — trocar essa camada por backend real é o caminho de evolução.

Pendentes: aplicar a identidade "O Fio" na UI do app (hoje está no look default do shadcn — ver decisoes-design.md), banco/backend, autenticação (fluxo por convite), plataforma do widget (nativo vs PWA), estratégia de push.

## 7. Fluxo de trabalho em duas máquinas

- `design/` é a cópia versionada do canvas; o canvas publicado é onde se edita visualmente (Save publica para todos). Após edições no canvas, sincronizar `design/` no repo.
- Decisões novas entram **neste arquivo** ou em `decisoes-design.md` no mesmo commit que as implementa.
- `web/` roda com `npm install && npm run dev` em qualquer máquina; nada de `node_modules` ou `.env` no Git.
