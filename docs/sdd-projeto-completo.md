# SDD do Projeto Completo — CLJ NSR

**Software Design Document** da plataforma do Departamento Cultural da Paróquia Nossa Senhora
do Rosário. Escrito em **2026-09-07**, sobre o estado verificado do repositório nesse dia.

Este documento consolida os três registros anteriores — [decisoes-design.md](decisoes-design.md)
(identidade), [decisoes-estrutura.md](decisoes-estrutura.md) (produto) e
[sdd-implementacao.md](sdd-implementacao.md) (o plano das sete fases de construção) — num só
relatório de ponta a ponta, e acrescenta o que ainda não estava escrito em lugar nenhum:
**o caminho daqui até o fim do mandato (dezembro de 2026)**, fase a fase, com entrega, dono,
critério de aceite e decisão de arquitetura para cada uma.

Quando este documento e os anteriores discordarem, vale o mais recente: este. Toda decisão nova
entra aqui (§11) no mesmo commit que a implementa.

**Versão de leitura** (renderizada com a identidade "O Fio"): https://claude.ai/code/artifact/21ee0664-b983-4d4a-a017-a316415aceb2

---

## Sumário

1. [Visão e problema](#1-visão-e-problema)
2. [Estado atual, verificado](#2-estado-atual-verificado)
3. [Arquitetura geral](#3-arquitetura-geral)
4. [Frontend](#4-frontend)
5. [Backend](#5-backend)
6. [Estrutura de design](#6-estrutura-de-design)
7. [As fases — o caminho do projeto](#7-as-fases--o-caminho-do-projeto)
8. [Qualidade e rede de segurança](#8-qualidade-e-rede-de-segurança)
9. [Riscos e mitigações](#9-riscos-e-mitigações)
10. [Operação e sucessão](#10-operação-e-sucessão)
11. [Registro de decisões](#11-registro-de-decisões)
12. [Glossário](#12-glossário)
13. [Apêndices](#13-apêndices)

---

## 1. Visão e problema

### 1.1 O problema

- **Participante:** descobre que o post de amanhã é dele só se rolar a planilha no grupo de
  WhatsApp entre dezenas de mensagens. Não rola, o post não sai, e a cobrança vem em público.
- **Coordenador:** monta a escala na planilha, cola no grupo e vira a memória viva do
  departamento. Toda troca é conversa privada que ninguém vê, e a planilha nunca reflete a
  realidade.

### 1.2 A tese

> **A escala se defende sozinha.** Cada participante vê a própria responsabilidade sem esforço,
> e o coordenador para de ser o lembrete ambulante do departamento.

A plataforma substitui a **planilha**, não o WhatsApp. Ela carrega o peso; a pessoa não.

### 1.3 O que a pesquisa disse e como o projeto respondeu

Dois relatórios de pesquisa antecederam o design (os arquivos `compass_artifact_*.md` na raiz).
As conclusões que moldaram o escopo, e a resposta do projeto a cada uma:

| O que a pesquisa concluiu | Como o projeto respondeu |
|---|---|
| Servir dois públicos (equipe interna + paroquianos) no mesmo produto dilui o foco e gera sinais fracos. | **Só o público interno.** O app é do departamento: participante e coordenador. Nada de terço guiado, feed ou conteúdo devocional — isso o Instagram, o WhatsApp e apps prontos (Pocket Terço, Hallow) já fazem. |
| O MVP deve resolver **um** problema central. | **A escala.** Cadastro, calendário e reuniões existem porque a escala precisa deles, não como módulos independentes. |
| Para uma equipe pequena, **PWA** vence app nativo (um código, sem loja, atualização instantânea). | Web primeiro; PWA como próxima etapa (Fase 12). App nativo e widget de tela inicial ficam fora do mandato. |
| Escala em **rodízio com dupla cobertura** (responsável + suplente), trocas sem culpa e registradas, reuniões com pauta em perguntas e follow-up escrito. | São exatamente as entidades do domínio: `responsavel_id` + `suplente_id`, tabela `trocas` append-only, `reunioes.pauta` como lista ordenada de perguntas, `reuniao_followup` com responsável e prazo. |
| Reconhecimento frequente é a alavanca de maior retorno; a dezena não pode punir. | "Dezena da semana" com **perdão**: incompleta nunca cobra; completa celebra com dourado, a única cor reservada à celebração. |
| Construir software solo, com mandato até dezembro de 2026, é o maior risco de sobrecarga; exige **um segundo voluntário técnico** e plano de sucessão. | O app já existe (§2), então o risco muda de "construir" para "manter". A resposta é a Fase 13 (§7.13): runbook, segundo mantenedor e transferência de coordenação como recurso do produto (`mudarPapel`). |
| Cadência diária de conteúdo só é sustentável com produção em lote e agendamento. | Fora do app: a plataforma mostra **quem** publica e **quando**; o agendamento continua no Meta Business Suite. O campo `link_midia` liga a atividade ao material já pronto. |

### 1.4 Apetite e no-gos

**Dentro:** cadastro, escala, calendário, reuniões — leitura impecável no celular, gestão
completa no desktop, aviso certo na hora certa com a informação completa.

**Fora, de propósito:** rede social (feed, curtidas); substituir o WhatsApp para conversa;
ferramenta genérica de projetos; SaaS multi-paróquia; conteúdo devocional dentro do app.

### 1.5 Audiências, em ordem de prioridade

1. **Participante no celular.** Jovem, entra por 10 segundos. Se a tela dele falhar, nada mais
   importa.
2. **Coordenador no desktop.** Sessões longas, densidade bem-vinda, poder de edição.
3. **Nunca:** "usuário avançado de software". Nenhuma tela pode exigir treinamento.

Em conflito de design, o participante ganha.

### 1.6 Métricas de sucesso do piloto

O piloto (Fase 11) é medido por quatro números, colhidos no fim do mês:

| Métrica | Hoje (planilha) | Meta do piloto |
|---|---|---|
| Furos (atividade sem responsável no dia) | não medido; "acontece" | ≤ 1 no mês |
| Posts que não saíram por esquecimento | não medido | 0 |
| Trocas de responsável registradas na plataforma | 0 (todas em privado) | 100% das trocas |
| Tempo para o participante responder "tenho algo esta semana?" | rolar o grupo (minutos) | < 10 segundos, na tela Hoje |

---

## 2. Estado atual, verificado

Verificado em **2026-09-07** rodando o projeto do zero (`npm ci`, `npm run lint`, `npm test`,
`npm run build`):

| Item | Estado |
|---|---|
| Lint (`eslint`) | limpo |
| Testes (`vitest`) | **101 testes em 8 arquivos**, todos verdes |
| Build de produção (`next build`) | **16 rotas**, sem erro de tipo |
| Design | 21 artboards em `design/` (11 telas desktop, 4 mobile, 3 opções de Escala, 3 direções de marca) + canvas publicado |
| Documentação | 3 registros de decisão + documento de abertura + este SDD |

### 2.1 Telas e rotas

| Tela | Rota | Papel | Lê de | Escreve por |
|---|---|---|---|---|
| Login | `/login` | público | — | `entrar` |
| Convite → definir senha | `/convite/[token]` | público | `getConviteValido` | `aceitarConvite` |
| Raiz | `/` | — | — | redireciona para `/hoje` ou `/login` |
| **Hoje** (manchete + dezena) | `/hoje` | participante | atividades, pessoas | — |
| Escala (Meus/Todos, agenda por prazo) | `/escala` | participante | atividades, pessoas, funções | — |
| Calendário (mês, Meus/Departamento) | `/calendario` | participante | atividades, pessoas | — |
| Reuniões (pauta, decisões, follow-up) | `/reunioes` | participante | reuniões, pessoas | `alternarPresenca` |
| Você (dados, funções, disponibilidade) | `/voce` (`/cadastro` redireciona) | participante | pessoa, funções | `salvarMeuCadastro` |
| Painel | `/coordenador` | coordenador | `getResumoPainel` | — |
| Gestão de Funções | `/coordenador/funcoes` | coordenador | funções, contagem, uso | `salvarFuncao`, `excluirFuncao` |
| Gestão de Escala | `/coordenador/escala` | coordenador | atividades, trocas, pessoas, funções | `salvarAtividade`, `trocarResponsavel`, `mudarStatus`, `excluirAtividade` |
| Gestão de Reuniões | `/coordenador/reunioes` | coordenador | reuniões, pessoas | `salvarReuniao`, `alternarPresenca` |
| Participantes | `/coordenador/participantes` | coordenador | pessoas, convites, funções por pessoa | `convidarParticipante`, `cancelarConvite`, `alternarStatusPessoa`, `salvarFuncoesDaPessoa`, `mudarPapel` |

Todas as telas rodam sobre **dados reais e persistentes**. `lib/mock/` não existe mais.

### 2.2 O que está sabido e não feito

Herdado de `sdd-implementacao.md` §6 e reavaliado aqui. Cada item tem uma fase dona em §7.

| Pendência | Efeito | Fase |
|---|---|---|
| Validar a aplicação do terço com coordenação e pároco | **a única que bloqueia lançar** | 8 |
| Dark mode não foi olhado tela a tela | tokens prontos, varredura visual não feita | 10 |
| Artboards do canvas ainda mostram os hex antigos (pré-correção AA) | design e app divergem em 5 tokens | 10 |
| `getUsoDaFuncao` é uma consulta por função | não pesa com 5 funções; o certo é `GROUP BY` | 10 |
| Formulário aberto não reflete mudança feita por outra pessoa até recarregar | raro no uso real (uma coordenação) | 10 (documentar), backlog (resolver) |
| "Convite pendente" é estado inalcançável na tela de Participantes | `aceitarConvite` cria pessoa e senha na mesma transação | 10 (remover o estado da UI) |
| Sem push, sem PWA, sem widget | o participante ainda precisa abrir o app | 12 |
| Sem hospedagem, sem backup, sem CI | o app só roda em `npm run dev` nas duas máquinas | 9 |

---

## 3. Arquitetura geral

### 3.1 Em uma figura

```
┌──────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR                                                            │
│  celular (participante)              desktop (coordenador)            │
│  bottom nav · 4 destinos             sidebar-terço · 10 destinos      │
└──────────────┬───────────────────────────────────┬───────────────────┘
               │ HTML (Server Components)          │ POST (Server Actions)
┌──────────────▼───────────────────────────────────▼───────────────────┐
│  NEXT.JS 16 (App Router) — um processo Node                          │
│                                                                       │
│  app/            rotas e layouts; guardas de sessão e de papel        │
│  components/     fio/ (identidade) · shell/ · telas · ui/ (shadcn)    │
│                                                                       │
│  lib/data/  ── porta de LEITURA (async) ──┐                           │
│  lib/actions/ ─ porta de ESCRITA (valida, autoriza, revalida) ─┐      │
│                                           │                     │      │
│  lib/auth/      sessão em cookie httpOnly, scrypt, guardas      │      │
│  lib/escala/ lib/calendario/ lib/format.ts  domínio puro, testado     │
│                                           │                     │      │
│  lib/repos/  ── SQL cru, síncrono, um arquivo por agregado ◄────┘     │
│  lib/db/        conexão única · schema.sql idempotente · seed          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ better-sqlite3 (WAL, FK ON)
                        ┌──────▼──────┐
                        │  clj.db     │  um arquivo; CLJ_DB_PATH em produção
                        └─────────────┘
```

Não há API HTTP separada, nem cliente que fale com o banco: **a página é o servidor**. Tudo o
que o navegador recebe é HTML pronto; tudo o que envia é um formulário para uma Server Action.

### 3.2 As cinco regras de camada

São as regras que a revisão cobra em todo commit:

1. Página/componente **nunca** importa `lib/repos/` ou `lib/db/` — só `lib/data/` e
   `lib/actions/`.
2. Toda escrita é uma **Server Action** em `lib/actions/`, que valida entrada, checa sessão e
   papel, escreve e chama `revalidatePath`.
3. Toda action de coordenação começa por `exigirCoordenadorEmAction()`. Autorização é
   verificada no servidor, nunca só escondendo o botão.
4. Domínio puro (`lib/escala/`, `lib/calendario/`, `lib/format.ts`) não conhece banco nem React
   — é onde ficam os testes.
5. Componente nunca usa hex solto: cor sai de token (`bg-accent`, `text-primary`, …).

### 3.3 Por que assim

| Escolha | Alternativa descartada | Motivo |
|---|---|---|
| Next.js com Server Components + Server Actions | SPA React + API REST | Metade do código, nenhum estado duplicado entre cliente e servidor, e autorização num lugar só. A tela do participante é leitura: HTML pronto é mais rápido no celular do que um bundle que busca dados. |
| SQLite em arquivo | Postgres/Supabase | Zero serviço externo, zero conta em nuvem, zero `.env` para dar errado numa paróquia. Um departamento de ~12 pessoas nunca vai saturar um arquivo. Migrar é reescrever `lib/db/` e `lib/repos/` com as páginas intactas. |
| Autenticação própria (scrypt + sessão em tabela) | NextAuth/Clerk | Não existe autocadastro: a entrada é por convite. Uma tabela de sessões e 80 linhas de código fazem logout revogar de verdade e inativação valer no próximo pedido. Sem dependência com ciclo de vida próprio. |
| Convite por link copiável | E-mail transacional | O coordenador já tem o canal (WhatsApp). Um provedor de e-mail é conta, chave e custo a mais para uma mensagem por pessoa por ano. |
| GSAP para motion | framer-motion | Uma timeline com `stagger` e `from: índice` é a assinatura "passar a conta"; framer não expressa isso sem contorcer. Decidido em 2026-08-27. |

---

## 4. Frontend

### 4.1 Stack

| Peça | Versão | Papel |
|---|---|---|
| Next.js (App Router) | 16.3 | rotas, Server Components, Server Actions, build |
| React | 19.2 | UI; `cache()` para uma leitura de sessão por requisição |
| TypeScript | 5 | tipos do domínio em `lib/types.ts`, espelho do schema |
| Tailwind CSS | 4 | utilitários sobre os tokens declarados em `@theme` |
| shadcn sobre `@base-ui/react` | 4.19 / 1.7 | base de componentes acessíveis, **sempre re-estilizada com os tokens** |
| GSAP + `@gsap/react` | 3.15 / 2.1 | motion: "passar a conta", entrada em stagger |
| lucide-react | 1.34 | ícones |
| sonner | 2 | toasts ("Salvo", "Convite copiado") |
| date-fns | 4 | datas; `lib/format.ts` embrulha tudo em português |
| next-themes | 0.4 | dark mode por classe `.dark` |
| react-day-picker | 10 | base do calendário do shadcn |

### 4.2 Organização

```
web/app/
  layout.tsx                 fontes self-host, ThemeProvider, Toaster
  page.tsx                   "/" → /hoje ou /login
  login/  convite/[token]/   públicas
  (app)/
    layout.tsx               exigirPessoa(); sidebar (lg+) e bottom nav (< lg)
    hoje/ escala/ calendario/ reunioes/ voce/ cadastro/
    coordenador/
      layout.tsx             exigirCoordenador()
      page.tsx  funcoes/ escala/ reunioes/ participantes/

web/components/
  marca/      marca-aureola.tsx — direção A; variantes completa e favicon
  fio/        conta.tsx (Conta, AveMarias, Dezena, estadoDaConta)
              status-pill.tsx (StatusPill, StatusReuniao, rotuloStatus)
              tipografia.tsx (Kicker, TituloSecao, Manchete, SemanaEmDia, Vazio)
  shell/      app-sidebar.tsx · mobile-nav.tsx · page-header.tsx · conta-usuario.tsx
              filtro-meus-todos.tsx · navegacao.ts (os destinos, num lugar só)
  auth/       login-form · convite-form
  cadastro/   cadastro-form
  escala/     agenda-list · linha-atividade
  calendario/ month-grid
  reunioes/   detalhe-reuniao · botao-presenca
  gestao/     atividades-manager · funcoes-manager · reunioes-manager · participantes-manager
  ui/         shadcn: button, input, card, badge, table, dialog, sheet, select, …
```

### 4.3 Padrões de construção

- **Server Component por padrão.** Uma página lê de `lib/data/`, monta o modelo da tela e
  renderiza. Só vira `"use client"` o que precisa de interação: formulários, filtros, motion,
  diálogos. Nunca chamar função de módulo `"use client"` a partir de Server Component — foi um
  dos três defeitos que só apareceram com o app no ar.
- **Formulário = `<form action={serverAction}>`.** Estado de envio com `useActionState`; erro
  volta como texto para a tela, sucesso vira toast e `revalidatePath` refaz a página.
- **Estado de navegação na URL.** Filtro Meus/Todos, mês do calendário, filtros da gestão de
  escala: querystring, nunca `useState` que some no reload e não compartilha por link.
- **Uma leitura de sessão por requisição.** `getSessao()` é `cache()`; layout, página e
  componentes perguntam à vontade.
- **Nada interno vaza.** Nenhuma tela mostra id, nome de tabela, "registro" ou linha de
  planilha. Data e hora entram na frase ("sai amanhã às 7h · você é o responsável").
- **Datas locais.** "Hoje" é a data do relógio de quem lê, não UTC — perto da meia-noite os
  dois divergem.

### 4.4 O shell: duas densidades da mesma identidade

| | Celular (participante) | Desktop (coordenador) |
|---|---|---|
| Navegação | bottom nav, **4 destinos** (Hoje · Escala · Calendário · Você), alvos ≥ 44px, safe-area | sidebar-terço: o fio sobe da marca e atravessa os destinos; três Ave-Marias separam "Meu espaço" de "Coordenação" |
| Breakpoint | `< lg` (1024px) | `lg+` |
| Reuniões | via Escala/Calendário (não cabe na bottom nav) | destino próprio |
| Coordenação | acessível pela URL; navegação de gestão pensada para o desktop | 5 destinos |

A sidebar e a bottom nav leem os destinos do mesmo arquivo (`navegacao.ts`); `estaAtivo()`
decide o destaque, com `/coordenador` ativo só na rota exata.

### 4.5 Os primitivos da identidade (`components/fio/`)

| Primitivo | O que é | Estados |
|---|---|---|
| `Conta` | a unidade do sistema: círculo de 12px no fio | `inativa` · **`sua`** (disco azul + anel-auréola de 3px) · `suplente` (anel 2px, sem preenchimento) · `festa` (dourado — só a dezena completa) |
| `AveMarias` | separador: 3 pontos de 5px a 60% | — |
| `Dezena` | progresso da semana como fileira de contas | `passadas/total`; completa acende o dourado |
| `StatusPill` | status de atividade | **sempre cor + palavra**: ideia · rascunho · agendado · publicado · concluído |
| `StatusReuniao` | idem para reunião | agendada · realizada |
| `Kicker` | micro-rótulo mono uppercase | — |
| `Manchete` | kicker + título serifado + frase + ação | a primeira coisa lida em 390px |
| `SemanaEmDia` | estado sereno de "nada seu" | "Semana em dia ✓" |
| `TituloSecao`, `Vazio` | título de seção com ação à direita; estado vazio com frase | — |

### 4.6 Motion

Tokens: `--dur-micro: 140ms · --dur-base: 240ms · --dur-entrance: 420ms`; easing da casa
`cubic-bezier(0.16,1,0.3,1)` (≈ `power3.out`).

Só dois momentos de fanfarra, e são os únicos:

1. **Navegar = passar as contas.** Timeline GSAP na sidebar: cada conta desliza 4px e volta,
   `stagger: { each: 0.035, from: <índice clicado> }`; a de destino assenta preenchendo
   (escala 1.4 → 1.0, 320ms). `navigator.vibrate(8)` no celular.
2. **Concluir = a conta se preenche** (240ms) + carimbo dourado "Publicado".

Tudo dentro de `gsap.matchMedia()`: em `prefers-reduced-motion: reduce` sobra só o cross-fade
de cor. Entrada da `AgendaList` em stagger de 35–40ms.

### 4.7 Acessibilidade

Foco visível em todo controle (`focus-visible:ring-2`); alvo ≥ 44px no mobile; contraste AA
em todos os pares texto/fundo (medidos e corrigidos em 2026-09-05, §6.2); status nunca só por
cor; formulários navegáveis por teclado; `prefers-reduced-motion` respeitado; título de
página por rota (`metadata.title`).

### 4.8 As telas, uma a uma

**Hoje.** Três camadas: manchete (sua próxima conta — título, frase com data, hora e papel,
botão "Ver a escala") → "Sua semana" (a dezena, sem repetir a manchete) → "Departamento"
(o que não é seu, recolhido). Sem nada seu: `SemanaEmDia`. Domínio: `getProximaAtividade`,
`dezenaDaSemana`, `doDepartamento`, `fraseDaAtividade`.

**Escala.** Opção A: Hoje · Esta semana · Depois, janela rolante de 7 dias
(`agruparPorPrazo`). Filtro Meus/Todos por querystring. Data em `tabular-nums`. As opções B
(manchete + resto) e C (linha do tempo) continuam em `lib/escala/agenda.ts`, testadas, para
uma troca barata.

**Calendário.** Grade do mês (`getGradeDoMes`): dia com compromisso seu = conta preenchida;
do departamento = conta neutra. Coluna "Próximos" com a sua vez destacada. Mês por
querystring (`?mes=2026-10`).

**Reuniões.** Lista + detalhe: pauta (perguntas ordenadas), decisões, follow-up com
responsável e prazo, presentes. O participante confirma a própria presença
(`alternarPresenca`).

**Você.** Nome, contato, funções (chips), disponibilidade (dias × períodos). Salva por
`salvarMeuCadastro`; marca `cadastro_completo`.

**Painel.** Quatro números (participantes ativos, sem responsável, próxima reunião, furos da
semana) + alerta de furo com link que abre a gestão de escala já filtrada no mês certo.

**Gestão de Funções.** CRUD; excluir bloqueado se alguma atividade usa a função; mostra
quantas pessoas têm cada função.

**Gestão de Escala.** Tabela com filtros (mês, função, status); criar/editar atividade
(tipo, título, função, data, hora, responsável, suplente, status, link de mídia); trocar
responsável/suplente **gravando em `trocas`** com motivo; histórico de trocas exibido na
própria atividade; mudar status; excluir com confirmação.

**Gestão de Reuniões.** Cria a atividade do tipo reunião e a extensão: pauta editável,
decisões, follow-up, presença.

**Participantes.** Convidar por e-mail (gera link copiável com validade), cancelar convite,
ativar/inativar (inativar derruba a sessão no próximo pedido), editar funções, promover ou
rebaixar papel (`mudarPapel` — o mecanismo de sucessão).

---

## 5. Backend

### 5.1 Onde o backend mora

Não há serviço separado. O "backend" é o conjunto `lib/data/` + `lib/actions/` + `lib/auth/` +
`lib/repos/` + `lib/db/`, todo marcado com `import "server-only"` — o compilador recusa
importá-lo de código de cliente. Um processo Node serve tudo.

### 5.2 Persistência

- **Motor:** `better-sqlite3` 13.0.3, com binário pré-compilado por plataforma (sem
  `node-gyp`). `journal_mode = WAL`, `foreign_keys = ON`.
- **Conexão:** única e preguiçosa (`getDb()`): nada de banco no build, só no primeiro pedido.
- **Migração:** `schema.sql` é idempotente (`CREATE TABLE IF NOT EXISTS`) e roda inteiro a cada
  boot. **Alterar o schema é a migração.** Mudança destrutiva (renomear coluna, mudar CHECK)
  exige um passo de migração explícito — ver §7.10 para o padrão a adotar.
- **Caminho:** `./data/clj.db` por padrão; `CLJ_DB_PATH` em produção. `data/` está no
  `.gitignore`.
- **Seed:** só em banco vazio. Fora de produção, o departamento de demonstração; em produção,
  o catálogo de funções e a coordenação vinda de `CLJ_COORDENADOR_*` — sem elas, nenhuma
  conta é criada e o app avisa no log.
- **Teste:** `bancoEmMemoria()` entrega `:memory:` já migrado.

### 5.3 Modelo de dados

```
pessoas ──< pessoa_funcoes >── funcoes
   │                              │
   │ responsavel_id / suplente_id │ funcao_id
   ▼                              ▼
atividades ──1:1── reunioes ──< reuniao_followup
   │                   └──────< reuniao_presentes >── pessoas
   └──< trocas (append-only)
pessoas ──< sessoes            convites (token, expira_em, usado_em)
```

| Tabela | Chave | Notas |
|---|---|---|
| `pessoas` | `id` | `UNIQUE(lower(email))`; `senha_hash` NULL até aceitar convite; `dias`/`periodos` em CSV (conjuntos pequenos e fechados); `status` ativo/inativo |
| `funcoes` | `id` | catálogo: Terço Diário, Post da tarde, Cinecultural, Curiosidade da fé, Aniversários |
| `pessoa_funcoes` | (`pessoa_id`, `funcao_id`) | `ON DELETE CASCADE` dos dois lados |
| `atividades` | `id` | `tipo` ∈ post/tarefa/evento/reuniao; `status` ∈ ideia/rascunho/agendado/publicado/concluido; `responsavel_id NULL` = **furo**; índice `(departamento_id, data)` |
| `reunioes` | `atividade_id` | extensão 1:1; `pauta` e `decisoes` como JSON (listas sempre lidas e escritas inteiras) |
| `reuniao_presentes` | (`atividade_id`, `pessoa_id`) | |
| `reuniao_followup` | `id` | `acao`, `responsavel_id`, `prazo`, `ordem` |
| `trocas` | `id` | **append-only**; `papel`, `de`, `para`, `motivo`, `feita_por`, `criado_em`; índice `(atividade_id, criado_em)` |
| `convites` | `token` | 32 bytes aleatórios em base64url; `expira_em`; `usado_em` |
| `sessoes` | `token` | em tabela para ser revogável; `expira_em` 30 dias |

`departamento_id` é campo simples em cada entidade — não vira tabela enquanto só existir o
Departamento Cultural. Toda leitura e escrita filtra por ele.

### 5.4 Repositórios (`lib/repos/`)

SQL cru, **síncrono** (better-sqlite3 é síncrono e é mais rápido assim), um arquivo por
agregado: `pessoas`, `funcoes`, `atividades`, `reunioes`, `auth` (sessões e convites),
`comum` (ids, datas, transações). Mapeiam linha → tipo de `lib/types.ts` e nunca expõem
`senha_hash` (o tipo `Pessoa` tem só `temSenha: boolean`).

### 5.5 A porta de leitura (`lib/data/`)

Assinaturas `async` de propósito: trocar o motor por um remoto não toca nos chamadores.

| Arquivo | Funções |
|---|---|
| `atividades` | `getAtividades`, `getAtividade`, `getTrocas`, `getTrocasDoDepartamento` |
| `pessoas` | `getPessoas`, `getPessoasAtivas`, `getPessoa`, `getPessoaPorEmail`, `getFuncoesDaPessoa`, `getIdsDeFuncoesDaPessoa`, `getFuncoesPorPessoaDoDepartamento` |
| `funcoes` | `getFuncoes`, `getFuncao`, `getPessoasDaFuncao`, `getContagemPessoasPorFuncao`, `getUsoDaFuncao` |
| `reunioes` | `getReunioes`, `getReuniao` |
| `convites` | `getConvite`, `getConviteValido`, `getConvitesPendentes` |
| `dashboard` | `getResumoPainel` (participantes ativos, sem responsável, próxima reunião, furos em 7 dias) |

### 5.6 A porta de escrita (`lib/actions/`)

Toda action segue o mesmo esqueleto:

```
1. exigirPessoaEmAction() ou exigirCoordenadorEmAction()   ← quem é, e pode?
2. ler FormData pelas funções de lib/actions/comum.ts     ← vocabulário fechado
3. conferir que o alvo pertence ao departamento da pessoa ← nunca confiar no id vindo do form
4. escrever (transação quando toca mais de uma tabela)
5. revalidatePath(...) e devolver { ok } ou { erro }
```

| Arquivo | Actions | Quem pode |
|---|---|---|
| `auth` | `entrar`, `sair` | qualquer um / logado |
| `convite` | `aceitarConvite` | portador de token válido |
| `cadastro` | `salvarMeuCadastro` | a própria pessoa |
| `reunioes` | `alternarPresenca` | a própria pessoa (ou coordenação por outrem) |
| `reunioes` | `salvarReuniao` | coordenador |
| `escala` | `salvarAtividade`, `trocarResponsavel`, `mudarStatus`, `excluirAtividade` | coordenador |
| `funcoes` | `salvarFuncao`, `excluirFuncao` | coordenador |
| `participantes` | `convidarParticipante`, `cancelarConvite`, `alternarStatusPessoa`, `salvarFuncoesDaPessoa`, `mudarPapel` | coordenador |

**Validação de entrada** (`comum.ts`): texto com limite de tamanho; enums só aceitam valores
do vocabulário (`umDe`); data só `yyyy-mm-dd`; hora só `HH:MM`; link de mídia só `http(s)`
(nunca `javascript:`); e-mail por regex + 254 caracteres.

### 5.7 Autenticação e autorização

| Aspecto | Implementação |
|---|---|
| Senha | `scrypt` de `node:crypto`, salt por pessoa, comparação em tempo constante (`timingSafeEqual`) |
| Sessão | token aleatório em cookie `clj_sessao`: `httpOnly`, `sameSite=lax`, `secure` em produção, 30 dias; linha em `sessoes` |
| Logout | apaga a linha **e** o cookie — revoga de verdade |
| Inativação | `getSessao()` recusa pessoa com `status != ativo` no pedido seguinte |
| Login | rate limit por e-mail na memória do processo (janela de minutos); a mensagem de erro **não** revela se o e-mail existe |
| Convite | token de 32 bytes, validade, uso único; `aceitarConvite` cria a pessoa **e** a senha na mesma transação |
| Guardas de página | `exigirPessoa()` → `/login`; `exigirCoordenador()` → `/hoje` |
| Guardas de action | `exigirPessoaEmAction()` / `exigirCoordenadorEmAction()` lançam erro |
| Escopo | toda action confere `departamento_id` do alvo contra o da sessão (achado da revisão adversarial em `cancelarConvite`, corrigido) |

**Matriz de permissões:**

| Ação | Participante | Coordenador |
|---|---|---|
| Ver Hoje, Escala, Calendário, Reuniões, Você | ✓ (do próprio departamento) | ✓ |
| Editar o próprio cadastro e presença | ✓ | ✓ |
| Painel, gestão de funções/escala/reuniões | — (página redireciona **e** action recusa) | ✓ |
| Convidar, inativar, mudar funções e papel de outros | — | ✓ |
| Ver ou receber `senha_hash` | nunca | nunca |

**Ameaças e defesas:** XSS — React escapa por padrão e `link_midia` só aceita `http(s)`;
CSRF — Server Actions do Next verificam `Origin`/`Host` e o cookie é `sameSite=lax`; injeção
de SQL — só consultas preparadas; enumeração de e-mail — erro genérico + rate limit; roubo de
sessão — cookie `httpOnly` + `secure` + revogação por tabela; escalada de papel — guarda no
servidor em toda action.

### 5.8 Domínio puro

Sem React, sem banco, 100% testado:

- `lib/escala/agenda.ts` — `comPapel`, `agruparPorPrazo`, `getProximaAtividade`,
  `dezenaDaSemana`, `doDepartamento`, `filtrarMeus`, `ordenarCronologico`, `getSemanaAtual`.
- `lib/escala/frase.ts` — `fraseDaAtividade` (situação → o que é seu → próximo passo),
  `contextoDaAtividade`, `rotuloTipo`.
- `lib/calendario/mes.ts` — `getGradeDoMes`, `mesAnterior/Seguinte`, `parseReferenciaMes`.
- `lib/format.ts` — datas, horas e nomes em português (`formatarQuando`, `nomeCurto`,
  `iniciaisDe`, …).
- `lib/auth/senha.ts` — hash e verificação.

### 5.9 Configuração

| Variável | Obrigatória | Papel |
|---|---|---|
| `NODE_ENV` | — | `production` liga `secure` no cookie e desliga o seed de demonstração |
| `CLJ_DB_PATH` | não | caminho do arquivo do banco (padrão `./data/clj.db`) |
| `CLJ_COORDENADOR_EMAIL` / `_SENHA` / `_NOME` | em produção, no primeiro boot | cria a conta da coordenação num banco vazio |

Não há `.env` no repositório; variáveis vão pelo ambiente do host.

---

## 6. Estrutura de design

### 6.1 O conceito: "O Fio"

> A plataforma é o **terço** do Departamento Cultural: cada responsabilidade é uma conta no
> fio, no azul de Nossa Senhora sobre papel e tinta bem tipografados — você passa as contas da
> sua semana, e a sua próxima conta é sempre a manchete.

O símbolo não foi inventado: NSR **é** Nossa Senhora do Rosário, o post mais recorrente é o
Terço Diário, e um terço é estruturalmente o que uma escala é. **Regra de reverência:** a
metáfora vive na estrutura (fio, contas, sequência), com sobriedade — nunca gamificação do
sagrado, nunca imagem devocional como textura. Se um elemento usa o terço só para enfeitar,
sai; se usa para organizar, fica.

Personalidade em três adjetivos: **caloroso · caprichado · confiável**. Editorial, não techy;
comunidade, não ferramenta fria.

### 6.2 Tokens de cor

Fonte única: `web/app/globals.css`. Valores do app (após a correção AA de 2026-09-05):

| Token | Light | Papel |
|---|---|---|
| `--bg` | `#FAF7F2` | papel — fundo de página |
| `--panel` | `#FFFFFF` | superfícies |
| `--border` / `--border-soft` | `#E4DDD0` / `#EFEAE1` | hairlines |
| `--text` | `#262320` | tinta |
| `--text-muted` / `--text-faint` | `#5A544E` / `#756C64` | secundário / terciário (7.0 e 4.8:1 sobre o papel) |
| `--accent` | **`#253990`** | azul oficial da paróquia — a única cor de ação |
| `--accent-ink` / `--accent-soft` / `--accent-hi` | `#1A2A6C` / `#E4E7F7` / `#6C7CC9` | texto azul / wash / brilho |
| `--gold` / `--gold-ink` / `--gold-soft` | `#A9812F` / `#7A5D22` / `#F3E9D2` | **só celebração** (carimbo "Publicado", dezena completa) |
| `--ok` / `--warn` / `--info` / `--crit` | `#4D6A44` / `#8D4E1A` / `#4A6885` / `#A6473C` | semânticas, sempre com wash e com palavra |

Ponte com o shadcn: `primary` = o azul; `accent` = o wash azul (item selecionado nasce
azul-claro em todo componente); `gold` **não entra** em nenhum papel do shadcn, de propósito.

**Dark mode** é re-derivado por papel de cor, nunca invertido: papel `#1E1B17`, tinta
`#F1EBE0`, azul sobe de luminosidade para continuar legível. Os tokens estão prontos; a
varredura tela a tela é a Fase 10.

Regras: **um destaque por tela**; azul é marca-texto, não tinta de parede; contraste AA
mínimo; status é cor + palavra.

### 6.3 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Manchetes, títulos | **Source Serif 4** 600/700 | títulos 19px+, manchete de Hoje, números do Painel |
| Corpo / UI | **Public Sans** 400–800 | tudo o mais; base 13.5–16px |
| Kickers, datas, códigos | **IBM Plex Mono** 500/600 | micro-rótulos uppercase (tracking 0.07–0.09em), datas em `tabular-nums` |

Self-host no app (`next/font`). Nunca `system-ui`, Inter ou Roboto como identidade.

### 6.4 Contas — o tratamento visual (v2, flat)

Skeuomorfismo é proibido. A conta lê pela geometria no fio: inativa = círculo 12px com
contorno 1.5px `--text-faint`; **sua** = disco `--accent` + anel-auréola 3px `--accent-soft`;
suplência = anel 2px `--accent`; Ave-Marias = pontos 5px `--text-faint` a 60%. O anel-auréola
é a referência mariana embutida no estado ativo — e é por isso que a marca é a direção A.

### 6.5 Marca — direção A, Auréola

Nove contas fechando a dezena em círculo + a cruz. Lê como auréola/coroa de Nossa Senhora e
vira sistema (as contas da marca acendem com o progresso). Vive em
`components/marca/marca-aureola.tsx` (variantes `completa` e `favicon`); trocar por B (Rosa)
ou C (Monograma) é reescrever esse arquivo. Reversível pela coordenação ao custo de uma tela.

### 6.6 Hierarquia, voz e microcopy

Toda tela de participante em três camadas: **manchete** → **sinal** (2–4 itens) → **detalhe**
(recolhido). Segunda pessoa, ordem fixa: **situação → o que é seu → um próximo passo**.
"Seu post do Terço sai amanhã às 7h · você é o responsável". Aviso é serviço, não cobrança.

### 6.7 Fonte da verdade e fluxo de design

| Onde | O quê |
|---|---|
| Canvas publicado | onde se edita visualmente; Save publica para todos |
| `design/*.dc.html` + `canvas.json` | cópia versionada do canvas (21 artboards) |
| `docs/decisoes-design.md` | tokens, princípios, decisões |
| `web/app/globals.css` | os tokens como código — **a fonte única para o app** |

Fluxo: editar no canvas → sincronizar `design/` no repositório → refletir em `globals.css`
e nos primitivos → registrar a decisão em `docs/`. Pendência: os artboards ainda mostram os
5 hex antigos da correção AA (Fase 10).

### 6.8 Os cinco princípios que decidem brigas

1. **A manchete é a sua próxima conta** — rejeita abrir no calendário do mês.
2. **A plataforma carrega o peso, não a pessoa** — rejeita tabela crua.
3. **Celular do participante, desktop do coordenador** — mesma identidade, duas densidades.
4. **Aviso é serviço, não cobrança** — rejeita notificação-isca.
5. **Um destaque por tela** — dourado só na celebração.

---

## 7. As fases — o caminho do projeto

O projeto tem duas metades. A primeira (Fases 0–7) **está feita e verificada**: levou o
repositório de pesquisa a um app que a coordenação consegue usar num mês real. A segunda
(Fases 8–13) leva o app do `npm run dev` até um piloto em produção, com notificação e
sucessão garantida antes do fim do mandato.

```
2026 ─ ago ──────── set ──────────── out ──────────── nov ──────────── dez ─┐
      F0–F7 feitas  F8 validação      F11 PILOTO         F12 PWA + push       F13 sucessão
                    F9 produção       (mês do Rosário)                       e encerramento
                    F10 dívidas                                              do mandato
```

Toda fase termina com `npm run lint && npm test && npm run build` limpos, um commit próprio e a
decisão registrada em §11.

### Fase 0 — Pesquisa e abertura ✅

**Entrega:** os dois relatórios de pesquisa, o documento de abertura
(`docs/abertura-clj-nsr.html`), o briefing de design e o canvas com 21 artboards.

**Decisões que saíram daqui:** público interno só; a escala como o único problema; PWA em vez
de nativo; o conceito "O Fio"; três direções de marca e três opções de Escala desenhadas para
decidir depois com o código na mão.

### Fase 1 — A identidade "O Fio" no app ✅

**Entrega:** o app deixou de ser shadcn dourado e passou a ser o que está no canvas.
`globals.css` com os tokens como fonte única; dark mode derivado por papel; tokens de motion;
`marca-aureola.tsx`; primitivos `fio/`; `ui/` re-estilizado.

**Aceite (cumprido):** nenhum hex fora de `globals.css`; `#a9812f` não é mais cor de ação;
contraste AA nos pares usados; as quatro contas batem com o artboard `Sidebar`.

### Fase 2 — Persistência ✅

**Entrega:** o que foi salvo continua lá depois do reload. `schema.sql` idempotente, conexão
única com WAL e FK, seed só em banco vazio, `lib/repos/` por agregado, `lib/data/` reescrito
sobre os repos com as mesmas assinaturas. `lib/mock/` deixou de existir.

**Aceite (cumprido):** as páginas não mudaram de import; `npm run db:reset` + boot reconstrói
a demonstração; testes de repositório contra `:memory:`.

### Fase 3 — Autenticação por convite ✅

**Entrega:** cada pessoa entra como ela mesma; `PESSOA_ATUAL_ID` morreu. scrypt, sessão em
tabela + cookie, `/login`, `/convite/[token]`, logout, guardas de página e de action, rate
limit, erro que não revela e-mail.

**Aceite (cumprido):** rota de coordenação chamada por participante redireciona **e** a
action recusa; sessão sobrevive a restart; nenhuma senha nem hash chega ao cliente.

### Fase 4 — Shell e a tela Hoje ✅

**Entrega:** a tela que responde "tenho algo?" em menos de 10 segundos. Sidebar como o fio,
assinatura "passar a conta" em GSAP, `MobileNav` com 4 destinos, `/hoje` como rota inicial.

**Aceite (cumprido):** a manchete é a primeira coisa lida em 390px; nenhum alvo < 44px;
com `prefers-reduced-motion` nenhuma translação roda.

**O que o app no ar revelou:** o fio pendurava no vazio (o cordão morava no `<nav>`, que
estica até o rodapé) e a manchete lia "Post — Post — Terço Diário" (tipo no título do seed
*e* prefixado na tela). Nenhum dos dois passou por `tsc`, lint, teste ou build.

### Fase 5 — Telas do participante, com escrita ✅

**Entrega:** Escala (Opção A), Calendário, Reuniões com presença, Você salvando de verdade.
`/cadastro` virou `/voce`; "Hoje" virou rota do desktop também.

**Aceite (cumprido):** cada formulário persiste e sobrevive ao reload; nenhuma tela mostra
id ou tabela; as frases seguem situação → o que é seu → próximo passo.

**Defeito revelado no ar:** `/voce` respondia 500 — função de módulo `"use client"` chamada
por Server Component. O tipo casa, o runtime não.

### Fase 6 — Coordenação, com CRUD ✅

**Entrega:** Painel, Funções, Gestão de Escala (com trocas registradas), Gestão de Reuniões,
Participantes (convite por link, ativar/inativar, funções, papel).

**Aceite (cumprido):** toda mutação é Server Action com guarda de coordenação; excluir
confirma; a troca aparece no histórico da atividade.

### Fase 7 — Rede de segurança ✅

**Entrega:** 101 testes (domínio, repositórios, autorização, convite, senha, formatação);
lint e build limpos; percurso no navegador nos dois papéis (16 checagens); **revisão
adversarial multiagente** (nove agentes, um por tela).

**O que a revisão achou e foi corrigido:** `cancelarConvite` sem checagem de departamento;
seis tokens reprovando AA nas combinações reais; alerta de furo abrindo a escala num mês sem
furo; registro de trocas gravado mas nunca exibido.

---

### Fase 8 — Validação com a coordenação e o pároco ⏳

**Por quê:** é a única pendência que **bloqueia lançar**. O terço é objeto de oração; a
aplicação dele como estrutura de um software precisa do "sim" de quem responde pela paróquia,
antes de qualquer participante ver.

**Entrega:** uma sessão de 30 minutos com a coordenação e o pároco, com o app rodando no
celular (tela Hoje, Escala, a sidebar no desktop) e o canvas ao lado. Três perguntas, nessa
ordem:

1. O fio, as contas e o anel-auréola como estrutura de navegação são **reverentes** ou
   **decorativos**? (Se decorativos: o que sai?)
2. "Dezena da semana" e "Semana em dia ✓" como progresso — cabe, ou parece gamificar?
3. A marca A (Auréola) representa o departamento? (B e C ficam na mesa.)

**Decisões possíveis e o custo de cada uma:**

| Resposta | Custo |
|---|---|
| Aprovado como está | zero; registra em §11 e segue para a Fase 9 |
| Trocar a marca (B ou C) | uma tela: reescrever `marca-aureola.tsx` |
| Tirar a metáfora de um lugar (ex.: a dezena) | um componente; o resto da identidade fica |
| Tirar a metáfora inteira | sidebar vira lista, contas viram pontos; tokens, tipografia e voz ficam. ~2 dias |

**Aceite:** decisão escrita em §11 com data e nome de quem decidiu. Sem isso, a Fase 11 não
começa.

**Dono:** coordenação. **Quando:** primeira quinzena de setembro.

### Fase 9 — Produção: hospedagem, backup, CI ⏳

**Por quê:** hoje o app só existe em `npm run dev` nas duas máquinas. Piloto exige uma URL
que o participante abre do celular.

**Decisão de arquitetura — onde hospedar.** O banco é um arquivo; isso descarta serverless
(Vercel, Netlify): nenhum deles tem disco persistente nem garante uma instância só. O host
precisa de **um processo Node de longa duração com um volume persistente**.

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| **Fly.io** com volume de 1 GB | deploy por CLI, HTTPS automático, volume persistente, custo perto de zero nesse tamanho, região `gru` (São Paulo) | precisa cartão; volume é de uma região | **recomendado** |
| VPS pequeno (Hetzner, Oracle free tier) + Docker + Caddy | controle total, Caddy dá HTTPS sozinho | alguém mantém o sistema operacional; mais superfície para o segundo mantenedor | alternativa se o Fly não servir |
| Railway/Render com volume | parecido com Fly | planos gratuitos hibernam; volume só nos pagos | não |

**Entregas:**

1. `web/Dockerfile` (multi-stage: `npm ci` → `next build` → imagem `node:22-slim` com
   `next start`; `CLJ_DB_PATH=/data/clj.db`; `output: "standalone"` no `next.config.ts`).
2. `fly.toml` com o volume montado em `/data`, `min_machines_running = 1` (o banco não
   tolera duas instâncias), health check em `/login`, região `gru`.
3. Segredos pelo host (`CLJ_COORDENADOR_*`), nunca no repositório.
4. **Backup:** o arquivo SQLite é copiado uma vez por dia para armazenamento de objetos via
   **Litestream** (replicação contínua do WAL, sidecar no mesmo contêiner) — ou, se for
   simples demais para justificar, um `cron` diário com `sqlite3 .backup` para um bucket.
   Decisão: Litestream, porque restaurar é um comando e o segundo mantenedor não precisa
   lembrar de nada.
5. **CI:** `.github/workflows/ci.yml` rodando `npm ci`, `lint`, `test`, `build` em todo push
   e PR. Deploy continua manual (`fly deploy`) neste mandato — um comando, executado por
   quem fez o commit, com o log guardado.
6. Domínio: subdomínio da paróquia se existir (`cultural.<paroquia>.org.br`); caso contrário
   o `*.fly.dev` serve para o piloto.
7. `web/.env.example` documentando as variáveis; `docs/runbook.md` com: como fazer deploy,
   como restaurar backup, como criar a primeira coordenação, como resetar a senha de alguém
   (novo convite), o que fazer se o disco encher.

**Aceite:** URL pública com HTTPS; login da coordenação funciona; um restart não perde dados;
restaurar o backup num banco vazio recompõe o estado; CI verde no `main`; runbook testado
pela segunda máquina sem ajuda de quem escreveu.

**Dono:** desenvolvimento. **Quando:** segunda quinzena de setembro. **Custo estimado:**
R$ 0–15/mês.

### Fase 10 — Dívidas conhecidas e migração de schema ⏳

**Por quê:** os itens de §2.2 são pequenos, mas o piloto vai expô-los, e um deles (migração
de schema) vira problema real no primeiro `ALTER TABLE` em produção.

**Entregas:**

1. **Migração de schema com versão.** Hoje `schema.sql` roda inteiro a cada boot — ótimo para
   criar, inútil para alterar. Adotar: tabela `schema_versao (versao INTEGER)`; pasta
   `lib/db/migracoes/NNN-descricao.sql`, aplicadas em ordem dentro de uma transação, uma
   única vez. `schema.sql` continua sendo o retrato do estado final (para `:memory:` nos
   testes) e ganha um teste que garante que "aplicar todas as migrações" == "rodar
   `schema.sql`". Isso precisa existir **antes** da Fase 12, que adiciona tabelas.
2. `getUsoDaFuncao` → uma consulta com `GROUP BY funcao_id` (`getUsoPorFuncao`).
3. **Dark mode tela a tela:** percorrer as 12 telas nos dois papéis com `.dark`, corrigir os
   pares que reprovarem AA, registrar em `decisoes-design.md`.
4. Sincronizar os 5 hex corrigidos nos artboards do canvas e em `design/`.
5. Remover o estado "convite pendente" da tela de Participantes (é inalcançável) — convites
   pendentes já têm a própria lista.
6. Documentar no runbook o comportamento "formulário aberto não vê mudança de outra pessoa";
   resolver de verdade (revalidação ao focar a janela) só se o piloto reclamar.
7. **Smoke test end-to-end com Playwright** (`web/e2e/`): os três defeitos que escaparam de
   toda a suíte de Fase 7 têm a mesma característica — só aparecem com o app no ar. Um teste
   que sobe o app com banco em memória, entra como participante e como coordenação e abre
   **cada rota** checando status 200 e a ausência do texto "Application error" fecha
   exatamente esse buraco. Roda no CI.

**Aceite:** suíte verde incluindo o e2e; `npm run build` limpo; dark mode sem par reprovado;
canvas e `globals.css` com os mesmos hex.

**Dono:** desenvolvimento. **Quando:** em paralelo com a Fase 9, fechando até o fim de
setembro.

### Fase 11 — Piloto: um mês real do departamento ⏳

**Por quê:** é o momento em que a tese ("a escala se defende sozinha") deixa de ser aposta.
**Outubro é o mês do Rosário** — o Terço Diário está no auge, a escala é a mais cheia do ano,
e o departamento vai olhar para a plataforma todo dia. Não há mês melhor para o piloto, nem
pior para falhar: por isso as Fases 8–10 fecham antes.

**Preparação (última semana de setembro):**

1. Coordenação cria a primeira conta em produção (variáveis `CLJ_COORDENADOR_*`), cadastra
   as 5 funções (o seed de produção já as traz) e convida cada participante pelo link, no
   WhatsApp — com uma frase pronta: "Entra aqui, define sua senha e a tela Hoje te diz o que
   é seu esta semana".
2. **Escala de outubro montada na plataforma, não na planilha.** A Gestão de Escala cria as
   atividades; a planilha do mês vira leitura só. Se a coordenação preferir importar, um
   script de uma vez (`scripts/importar-escala.ts`, CSV → `salvarAtividade`) é aceitável;
   um importador na UI não é — seria construir para um caso que acontece uma vez.
3. Cada participante abre `/voce` e preenche funções e disponibilidade (meta: 100% com
   `cadastro_completo` antes do dia 1º).

**Durante o mês:** a coordenação usa **só** a plataforma para trocas (`trocarResponsavel`,
com motivo) e para reuniões (pauta em perguntas, follow-up com responsável e prazo). O grupo
de WhatsApp continua para conversa — e para o lembrete manual "olha a tela Hoje", porque o
push só chega na Fase 12.

**Colheita (primeira semana de novembro):** as quatro métricas de §1.6, mais uma conversa de
10 minutos com três participantes (o que abriu mais, o que não entendeu, o que faltou).

**Critérios de decisão:**

| Resultado | Decisão |
|---|---|
| Furos ≤ 1, 100% das trocas registradas, participantes respondem "tenho algo?" pela tela Hoje | tese confirmada → Fase 12 |
| Furos caíram mas participantes não abrem o app sem lembrete | tese confirmada, hábito não → Fase 12 é **obrigatória** (push) antes de novembro terminar |
| Coordenação voltou para a planilha no meio do mês | tese refutada no formato atual → parar, entrevistar, e decidir entre simplificar a gestão de escala ou encerrar o projeto com honra (§10.3) |

**Aceite:** relatório de uma página em `docs/piloto-outubro-2026.md` com os números, as
falas e a decisão.

**Dono:** coordenação (uso) + desenvolvimento (suporte). **Quando:** outubro.

### Fase 12 — PWA e notificação ⏳

**Por quê:** a pesquisa e o princípio 4 pedem "aviso na janela em que a pessoa costuma
responder, com a informação completa". Sem isso, o app depende de a pessoa lembrar de abrir
— que é o problema que ele existe para resolver.

**Decisão de arquitetura — PWA com Web Push, sem app nativo.** Um código, sem loja, sem
conta de desenvolvedor, instalável pelo navegador. O **widget de tela inicial fica fora do
mandato**: exige app nativo (iOS não expõe widget a PWA) e não se justifica para ~12 pessoas.
A tela Hoje instalada na tela inicial do celular cumpre 80% do papel do widget.

**Entregas:**

1. **Instalável:** `app/manifest.ts` (nome, ícones da Auréola em 192/512, `display:
   standalone`, `theme_color` = azul, `background_color` = papel); service worker mínimo com
   **Serwist** (sucessor mantido do next-pwa): cache dos assets estáticos e página offline
   dizendo "sem conexão — sua última escala carregada foi X" (nunca dado desatualizado sem
   avisar). Sem cache de dados do app: a escala muda e a página desatualizada é pior que
   nenhuma.
2. **Web Push com VAPID** (pacote `web-push`): tabela `push_inscricoes (pessoa_id, endpoint,
   p256dh, auth, criado_em, ultimo_erro)` via migração (Fase 10.1); action `inscreverPush`
   chamada de um botão em `/voce` ("Me avisar do que é meu"), nunca pedido na primeira
   visita. Chaves VAPID pelo ambiente do host.
3. **Quando avisar** — três gatilhos, todos com a informação completa e nunca-cobrança:
   - **Véspera:** "Amanhã às 7h sai o seu Terço Diário · você é o responsável", enviado na
     janela preferida da pessoa (campo `hora_aviso` em `/voce`, padrão 20h) — não em horário
     fixo para todos.
   - **Troca:** quem entra e quem sai de uma atividade recebem na hora.
   - **Reunião:** véspera, com a pauta em uma linha.
   - Nunca: "você não fez X", ranking, ou aviso da semana inteira num só push.
4. **Agendador:** um `setInterval` de 1 minuto dentro do processo Node
   (`instrumentation.ts` do Next) que consulta "atividades de amanhã cujo responsável tem
   `hora_aviso` == agora" e envia. Uma instância só (Fase 9), então não há duplicata. Sem
   fila, sem cron externo, sem serviço a mais. Registro em `push_envios` para não enviar
   duas vezes e para o runbook ver o que saiu.
5. iOS: push em PWA funciona a partir do iOS 16.4 **só com o app instalado na tela inicial**.
   A tela `/voce` explica isso em uma frase com o passo ("Compartilhar → Adicionar à Tela de
   Início").

**Aceite:** app instalável em Android e iOS; push da véspera chega no horário escolhido com a
frase completa; pessoa que desativa para de receber no próximo ciclo; `prefers-reduced-motion`
e offline não quebram nada; testes do seletor "quem recebe o quê agora" no domínio puro.

**Dono:** desenvolvimento. **Quando:** novembro.

### Fase 13 — Sucessão e encerramento do mandato ⏳

**Por quê:** o mandato da coordenação termina em dezembro de 2026. A pesquisa foi explícita:
software desenhado em torno de uma pessoa vira órfão técnico. A Fase 13 garante que o
departamento fica com a plataforma, não com uma dependência.

**Entregas:**

1. **Segundo mantenedor** identificado e com acesso: ao repositório, ao host, ao bucket de
   backup e às chaves (VAPID, `CLJ_COORDENADOR_*`), guardadas num cofre compartilhado da
   coordenação (não no WhatsApp). Ele executa o runbook inteiro uma vez, sozinho, em novembro.
2. **Transferência de coordenação como recurso:** a coordenação que sai promove a que entra
   (`mudarPapel`) e depois rebaixa a si mesma — ou é inativada. Isso já existe; a Fase 13
   escreve o passo a passo no runbook e testa em produção com uma conta de ensaio.
3. `docs/runbook.md` fechado: deploy, backup/restauração, primeira coordenação, rotação de
   chaves, o que fazer quando o e-mail de alguém muda, custo mensal e onde pagar.
4. **Retrospectiva** de uma página em `docs/`: o que a plataforma mudou nos números (§1.6),
   o que fica para a próxima coordenação decidir (o backlog de §7.14), e a recomendação
   explícita de continuar, simplificar ou encerrar.
5. Congelamento: última semana de dezembro sem deploy, para a nova coordenação começar
   janeiro com um sistema estável.

**Aceite:** o segundo mantenedor faz um deploy e uma restauração de backup sem ajuda; a nova
coordenação entra com o próprio papel; a retrospectiva está commitada.

**Dono:** coordenação + desenvolvimento. **Quando:** novembro–dezembro.

### 7.14 Backlog além do mandato

Fora de escopo de propósito, registrado para a próxima coordenação não redescobrir:

| Item | Por que não agora | Quando faria sentido |
|---|---|---|
| Widget de tela inicial | exige app nativo | se o departamento crescer e houver orçamento de loja |
| Multi-departamento | só existe o Cultural; `departamento_id` já está em toda tabela | quando um segundo departamento pedir — o modelo já aguenta |
| Integração com WhatsApp (bot, envio de convite) | API paga, conta Business, verificação da Meta | nunca para ~12 pessoas; talvez para a paróquia inteira |
| E-mail transacional | o link copiável resolve | se a coordenação deixar de ter contato direto com cada participante |
| Upload de foto de perfil | não muda a escala | baixo valor; iniciais bastam |
| Revalidação de formulário aberto | uma coordenação só | se houver dois coordenadores editando ao mesmo tempo |
| Postgres | um arquivo aguenta o departamento por anos | se o host deixar de ter volume persistente |

---

## 8. Qualidade e rede de segurança

### 8.1 A pirâmide hoje e a de destino

| Nível | Hoje | Destino (Fase 10) |
|---|---|---|
| Domínio puro (agenda, frase, mês, formatação, senha) | 52 testes | mantém; toda regra nova nasce com teste |
| Repositórios contra `:memory:` | 22 testes | + teste "migrações == schema.sql" |
| Autorização e convite (actions) | 27 testes | + seletor de push (Fase 12) |
| End-to-end (app no ar) | percurso manual, 16 checagens | **Playwright smoke** em todas as rotas, nos dois papéis, no CI |
| Revisão adversarial | uma rodada, nove agentes | uma rodada por fase que toca autorização ou tela nova |

### 8.2 Definição de pronto (vale para toda fase)

- `npm run lint && npm test && npm run build` limpos.
- Regras de camada (§3.2) respeitadas — grep por `lib/repos` e `lib/db` fora de `lib/` deve
  voltar vazio.
- Nenhum hex fora de `globals.css`.
- Toda action nova começa com guarda e confere `departamento_id`.
- Percorrido no navegador, em 390px e em 1280px, nos dois papéis.
- Decisão registrada em §11 no mesmo commit.

### 8.3 A régua de qualidade

- **Participante ganha.** Em conflito de layout, o celular decide.
- **Um destaque por tela.** Dourado só na celebração.
- **Status é cor + palavra.**
- **Aviso é serviço.** Toda frase carrega a informação completa.
- **Nada de estrutura interna vazando.**
- **Reverência.** O terço organiza, não enfeita.
- **Acessibilidade:** foco visível, alvo ≥ 44px, AA, reduced-motion, teclado.

---

## 9. Riscos e mitigações

| # | Risco | Prob. | Impacto | Mitigação | Dono |
|---|---|---|---|---|---|
| 1 | Pároco ou coordenação vetam a metáfora do terço | média | alto (identidade) | Fase 8 antes de qualquer participante ver; custo de cada resposta já dimensionado | coordenação |
| 2 | Participantes não abrem o app sem lembrete | alta | alto (tese) | Fase 12 (push na janela da pessoa); no piloto, lembrete manual no grupo | dev |
| 3 | Coordenação volta para a planilha no meio do piloto | média | crítico | escala de outubro nasce na plataforma; gestão de escala revisada com a coordenação na semana 1; critério de parada honesto (§7.11) | coordenação |
| 4 | Ponto único de falha técnico (mandato acaba em dezembro) | alta | crítico | Fase 13: segundo mantenedor executa o runbook sozinho em novembro | dev |
| 5 | Perda do arquivo do banco | baixa | crítico | Litestream + restauração testada na Fase 9 | dev |
| 6 | Duas instâncias do app abrindo o mesmo SQLite | baixa | alto | `min_machines_running = 1`, sem autoscale; documentado no runbook | dev |
| 7 | Push não chega no iOS | média | médio | instrução na tela; o app continua útil sem push | dev |
| 8 | `ALTER TABLE` em produção sem migração versionada | alta se ignorado | alto | Fase 10.1 antes da Fase 12 | dev |
| 9 | Defeito que só aparece com o app no ar (padrão já visto 3×) | alta | médio | e2e smoke no CI (Fase 10.7) | dev |
| 10 | Módulo nativo `better-sqlite3` quebra em uma máquina | baixa | baixo | binário pré-compilado; `npm ci` do lockfile; receita no README | dev |
| 11 | Escopo cresce ("já que tem app, coloca X") | alta | médio | §1.4 e §7.14 são a resposta escrita; toda adição passa por "muda a escala?" | coordenação |

---

## 10. Operação e sucessão

### 10.1 Papéis

| Papel | Quem | Responsabilidade |
|---|---|---|
| Coordenação (produto) | coordenador do departamento | decide identidade, escopo e piloto; usa a gestão; convida e inativa pessoas |
| Desenvolvimento | quem mantém `web/` nas duas máquinas | fases 9–13; deploy; runbook; suporte no piloto |
| Segundo mantenedor | a definir na Fase 13 (até novembro) | executa o runbook; herda acessos |
| Pároco | — | valida a aplicação do terço (Fase 8) |

### 10.2 Rotinas

| Rotina | Frequência | Como |
|---|---|---|
| Deploy | a cada fase fechada | `fly deploy` de quem commitou; CI verde antes |
| Backup | contínuo (Litestream) + verificação mensal de restauração | runbook |
| Checagem de furos | semanal, pela coordenação | Painel → alerta de furo |
| Reunião do departamento | quinzenal, 30–45 min | pauta em perguntas na Gestão de Reuniões; follow-up com responsável e prazo, enviado no grupo logo depois |
| Revisão de carga por pessoa | trimestral | Participantes + Escala filtrada por pessoa; sinal de sobrecarga: > 3–4 tarefas recorrentes por semana |

### 10.3 Encerrar com honra

Se o piloto refutar a tese, o projeto não "falha": ele termina com um relatório que diz o que
foi tentado, o que os números mostraram e o que a próxima coordenação deveria fazer diferente.
O repositório fica público para o departamento, o host é desligado, o backup final é
guardado no cofre, e a planilha volta com o que a plataforma ensinou (responsável + suplente,
trocas escritas, pauta em perguntas). Isso é resultado, não derrota.

---

## 11. Registro de decisões

Ordem cronológica. "Reversível" diz o custo de voltar atrás.

| Data | Decisão | Motivo | Reversível |
|---|---|---|---|
| 2026-08 | Público interno só; a escala como o único problema | pesquisa: público misto dilui o MVP; conteúdo devocional já existe pronto | sim, mas contraria a pesquisa |
| 2026-08 | Conceito "O Fio" (terço como estrutura) | NSR é Nossa Senhora do Rosário; escala é estruturalmente um terço | Fase 8 decide; custo dimensionado em §7.8 |
| 2026-08-27 | Contas em flat com anel-auréola (v2); skeuomorfismo proibido | v1 lia "site anos 2000" | sim, um componente |
| 2026-08-27 | GSAP como motor de motion; framer-motion removido | a assinatura "passar a conta" é uma timeline com stagger a partir de um índice | sim, dois componentes |
| 2026-09-05 | Escala: Opção A, agenda por prazo | única desenhada também no mobile; não compete com Hoje | sim, B e C continuam testadas no código |
| 2026-09-05 | Marca: direção A, Auréola | marca e menor componente dizem a mesma coisa | sim, um arquivo |
| 2026-09-05 | SQLite em arquivo atrás de `lib/data/` | zero serviço externo; `lib/data/` já era async | sim, reescrever `lib/db/` e `lib/repos/` |
| 2026-09-05 | Autenticação própria, entrada só por convite | não há autocadastro; sessão em tabela revoga de verdade | sim, mas sem ganho |
| 2026-09-05 | Convite por link copiável, sem e-mail | o coordenador já tem o canal | sim, uma action |
| 2026-09-05 | "Hoje" também no desktop; "Cadastro" vira "Você" | princípio 1 vale nos dois lugares; vocabulário único | — |
| 2026-09-05 | Cinco tokens corrigidos para AA (app diverge do canvas até a Fase 10) | seis pares reprovavam nas combinações reais | não: AA é a régua |
| 2026-09-07 | Hospedagem: um processo Node com volume persistente (Fly.io, região `gru`); serverless descartado | SQLite exige disco e instância única | sim, Docker roda em qualquer VPS |
| 2026-09-07 | Backup por Litestream | restaurar é um comando; não depende de memória humana | sim, cron + `.backup` |
| 2026-09-07 | Migração de schema versionada antes de qualquer nova tabela | `schema.sql` idempotente não altera | não |
| 2026-09-07 | e2e smoke com Playwright no CI | três defeitos escaparam de toda a suíte estática | — |
| 2026-09-07 | Piloto em outubro (mês do Rosário), com Fases 8–10 fechadas antes | mês de maior uso da escala | — |
| 2026-09-07 | PWA + Web Push; widget e app nativo fora do mandato | um código, sem loja; ~12 pessoas | sim, se houver orçamento |
| 2026-09-07 | Agendador de push dentro do processo (`instrumentation.ts`), sem fila externa | instância única; nenhum serviço a mais | sim, trocar por cron externo |
| 2026-09-07 | Sucessão como Fase própria; `mudarPapel` é o mecanismo de transferência | mandato termina em dezembro; órfão técnico é o risco nº 1 da pesquisa | — |

---

## 12. Glossário

| Termo | Significado |
|---|---|
| **Conta** | a unidade visual do sistema: uma responsabilidade no fio. Estados: inativa, sua, suplente, festa |
| **Fio** | o cordão que liga as contas — a sidebar do desktop |
| **Ave-Marias** | os três pontos que separam "Meu espaço" de "Coordenação" |
| **Dezena** | a semana como fileira de contas; "passar a conta" = concluir |
| **Manchete** | a primeira coisa da tela Hoje: sua próxima conta, com data, hora e papel |
| **Furo** | atividade sem responsável (`responsavel_id NULL`) |
| **Troca** | mudança de responsável ou suplente, sempre registrada em `trocas` |
| **Função** | o que a pessoa sabe fazer (Terço Diário, Post da tarde, …) |
| **Atividade** | post, tarefa, evento ou reunião com data, responsável e status |
| **Papel de sistema** | participante ou coordenador |
| **Papel na atividade** | responsável ou suplente |
| **Convite** | link de uso único que cria a pessoa e a senha |
| **Piloto** | o mês de outubro de 2026 com a escala na plataforma |
| **Runbook** | o documento de operação que o segundo mantenedor executa sozinho |

---

## 13. Apêndices

### 13.1 Comandos

```bash
cd web
npm ci               # instala exatamente o lockfile (não `npm install`)
npm run dev          # http://localhost:3000 — banco nasce e é semeado no primeiro boot
npm test             # vitest — 101 testes
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run build        # build de produção — 16 rotas
npm run db:reset     # apaga o banco local; recriado no próximo boot
```

Contas de demonstração: coordenação `maria@clj-nsr.local`, participante `ana@clj-nsr.local`,
senha `terco2026` para todas.

### 13.2 Variáveis de ambiente

| Variável | Fase | Papel |
|---|---|---|
| `CLJ_DB_PATH` | 9 | caminho do banco em produção (`/data/clj.db`) |
| `CLJ_COORDENADOR_EMAIL`, `_SENHA`, `_NOME` | 9 | primeira conta num banco vazio |
| `LITESTREAM_*` / credenciais do bucket | 9 | replicação do banco |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | 12 | Web Push |

### 13.3 Mapa do repositório

| Caminho | Conteúdo |
|---|---|
| `design/` | 21 artboards `.dc.html` + `canvas.json` + canvas montado |
| `docs/decisoes-design.md` | identidade, tokens, princípios |
| `docs/decisoes-estrutura.md` | produto, papéis, telas, stack |
| `docs/sdd-implementacao.md` | o plano das Fases 1–7 (histórico) |
| `docs/sdd-projeto-completo.md` | **este documento** — o SDD de ponta a ponta e o caminho até dezembro |
| `docs/abertura-clj-nsr.html` | documento de abertura |
| `compass_artifact_*.md` | os dois relatórios de pesquisa |
| `web/` | o app |
| `.claude/launch.json` | como a IDE sobe o app |

### 13.4 Arquivos que cada fase futura cria ou toca

| Fase | Cria | Toca |
|---|---|---|
| 8 | `docs/` (decisão em §11) | `components/marca/` se a marca mudar |
| 9 | `web/Dockerfile`, `fly.toml`, `.github/workflows/ci.yml`, `web/.env.example`, `docs/runbook.md` | `next.config.ts` (`output: "standalone"`) |
| 10 | `lib/db/migracoes/`, `web/e2e/`, `playwright.config.ts` | `lib/db/index.ts`, `lib/data/funcoes.ts`, `design/*.dc.html`, `globals.css` (dark) |
| 11 | `docs/piloto-outubro-2026.md`, opcionalmente `scripts/importar-escala.ts` | — |
| 12 | `app/manifest.ts`, service worker, `lib/push/`, `lib/actions/push.ts`, migração `push_inscricoes` e `push_envios`, `instrumentation.ts` | `app/(app)/voce/`, `lib/escala/` (seletor de avisos) |
| 13 | `docs/retrospectiva-2026.md` | `docs/runbook.md` |
