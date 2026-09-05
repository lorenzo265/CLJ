# Plano de Implementação (SDD) — CLJ NSR

Spec e plano de execução do aplicativo `web/`. Escrito em **2026-09-05**.
É o contrato entre as sessões de trabalho: cada fase tem escopo fechado, arquivos donos e
critério de aceite verificável. Fonte das regras: [decisoes-design.md](decisoes-design.md)
(identidade) e [decisoes-estrutura.md](decisoes-estrutura.md) (produto).

---

## 0. Onde estamos e o que "criar o aplicativo" significa aqui

O repositório já tem **design fechado** (21 artboards em `design/`) e um **esqueleto Next.js**
com todas as rotas navegáveis sobre `lib/mock/`. O que falta é justamente o que faz disso um
aplicativo em vez de um protótipo:

| Falta | Fase |
|---|---|
| A identidade "O Fio" na UI (hoje é o look default do shadcn, com ouro no lugar do azul) | 1 |
| Dados que sobrevivem a um reload (hoje: arrays em memória, `useState` que some) | 2 |
| Saber quem está logado (hoje: uma constante `PESSOA_ATUAL_ID`) | 3 |
| A tela **Hoje** e a navegação mobile — as telas que o participante realmente usa | 4 |
| Escrita de verdade nas telas (hoje nenhum formulário persiste) | 5 e 6 |
| Rede de segurança: testes, lint, build limpo | 7 |

**Apetite:** um app que a coordenação consegue usar de verdade num mês real do
Departamento Cultural, rodando em duas máquinas com `npm run dev`. Não é um SaaS
multi-paróquia; não tem push nem widget nesta rodada (§9, Fora de escopo).

---

## 1. Decisões que estavam pendentes (resolvidas aqui)

As três pendências de `decisoes-design.md` §10 bloqueavam o código. Resolvidas com o menor
compromisso possível — cada uma isolada em um arquivo, para o time reverter sem refatoração.

### 1.1 Direção da tela Escala → **Opção A (agenda por prazo)**

Hoje · Esta semana · Depois, janela rolante de 7 dias.

**Por quê:** é a única das três que já está desenhada também no mobile
(`design/MobileEscala.dc.html` usa exatamente os group labels da Opção A), e é a que obedece o
princípio 1 ("a manchete é a sua próxima conta") sem competir com a tela **Hoje** — a Opção B
duplicaria a manchete em duas telas, e a Opção C (linha do tempo) pede rolagem para responder
"tenho algo?".
**Já implementada** em `lib/escala/agenda.ts` (`agruparPorPrazo`); B e C continuam no arquivo,
testadas, para uma troca barata.

### 1.2 Direção da marca → **A, Auréola**

Nove contas fechando a dezena em círculo + a cruz.

**Por quê:** a identidade já adotou o *anel-auréola* como o estado ativo de toda conta
(`decisoes-design.md` §3b) — escolher a marca A faz a marca e o menor componente do sistema
dizerem a mesma coisa. É também a única das três que vira sistema (as contas acendem com o
progresso da semana).
**Isolada em** `components/marca/marca-aureola.tsx` (variantes `completa`, `favicon`).
Trocar por B ou C é reescrever esse arquivo.

### 1.3 Persistência → **SQLite local (`better-sqlite3`) atrás de `lib/data/`**

**Por quê:** `lib/data/` já foi escrito com assinaturas `async` justamente para trocar o motor
sem tocar nos chamadores — essa fase cobra a promessa. SQLite é um arquivo: roda igual nas duas
máquinas, sem serviço externo, sem conta em nuvem, sem `.env` para dar errado numa paróquia.
Migrar depois para Postgres/Supabase é reescrever `lib/db/` e os repositórios, com as páginas
intactas.

> **Ficam pendentes do time (não bloqueiam o código):** validar a aplicação do terço com a
> coordenação e o pároco; plataforma do widget (nativo vs PWA) e estratégia de push.

---

## 2. Arquitetura alvo

```
web/
  app/
    login/                     → entrar (público)
    convite/[token]/           → definir senha (público, consome convite)
    (app)/                     → shell autenticado: sidebar desktop + bottom nav mobile
      hoje/                    → NOVA. manchete + dezena da semana. rota inicial.
      escala/  calendario/  reunioes/  voce/
      coordenador/             → guarda de papel: só coordenador
        (painel) funcoes/ escala/ reunioes/ participantes/
  components/
    marca/                     → Auréola (marca, favicon, ícone)
    fio/                       → primitivos da identidade: Conta, Fio, Kicker, StatusPill, Manchete
    shell/                     → AppSidebar (o fio), MobileNav, PageHeader
    escala/ calendario/ reunioes/ cadastro/ gestao/
    ui/                        → shadcn re-estilizado com os tokens
  lib/
    db/                        → conexão, schema.sql, migrate, seed
    repos/                     → SQL cru, síncrono, por agregado
    data/                      → API de leitura async consumida pelas páginas (fachada dos repos)
    actions/                   → Server Actions (toda escrita)
    auth/                      → sessão, senha, convites, guardas
    escala/ calendario/ format  → domínio puro, testável sem DB
```

**Regras de camada** (o que a revisão vai cobrar):

1. Página/componente **nunca** importa `lib/repos/` ou `lib/db/` — só `lib/data/` e `lib/actions/`.
2. Toda escrita é uma **Server Action** em `lib/actions/`, que valida entrada, checa sessão e
   papel, escreve e chama `revalidatePath`.
3. Toda action de coordenação começa por `exigirCoordenador()`. Autorização é verificada no
   servidor, nunca só escondendo o botão.
4. Domínio puro (`lib/escala/`, `lib/calendario/`, `lib/format.ts`) não conhece DB nem React —
   é onde ficam os testes.
5. Componente nunca usa hex solto: cor sai de token (`bg-accent-soft`, `text-accent-ink`, …).

---

## 3. Modelo de dados

Espelha `lib/types.ts` (já aprovado), mais o que a autenticação e o registro de troca exigem.
`departamentoId` continua campo simples — não vira tabela enquanto só existir o Cultural.

| Tabela | Campos | Notas |
|---|---|---|
| `pessoas` | id, nome, contato, email, departamento_id, papel_sistema, senha_hash, dias, periodos, cadastro_completo, status | `dias`/`periodos` como CSV — conjuntos pequenos e fechados, não valem tabela |
| `funcoes` | id, departamento_id, nome, descricao | |
| `pessoa_funcoes` | pessoa_id, funcao_id | PK composta, `ON DELETE CASCADE` |
| `atividades` | id, departamento_id, tipo, titulo, funcao_id, data, hora, responsavel_id, suplente_id, status, link_midia | `data` ISO `yyyy-mm-dd`; responsável nulo = furo |
| `reunioes` | atividade_id (PK/FK 1:1), pauta, decisoes | listas em JSON — sempre lidas e escritas inteiras |
| `reuniao_presentes` | atividade_id, pessoa_id | |
| `reuniao_followup` | id, atividade_id, acao, responsavel_id, prazo | |
| `convites` | token, email, papel_sistema, departamento_id, criado_por, criado_em, expira_em, usado_em | token = 32 bytes aleatórios em base64url |
| `sessoes` | token, pessoa_id, criado_em, expira_em | sessão em tabela para ser revogável |
| `trocas` | id, atividade_id, de_pessoa_id, para_pessoa_id, papel, motivo, feita_por, criado_em | **"toda troca fica registrada na plataforma"** (`decisoes-estrutura.md` §5) |

Invariantes garantidas em SQL: FKs ligadas (`PRAGMA foreign_keys=ON`), status restritos por
`CHECK`, `UNIQUE(email)` em pessoas, índice em `atividades(departamento_id, data)`.

---

## 4. Fases

Cada fase termina com `npm run lint && npm test && npm run build` limpos e um commit próprio.

### Fase 1 — A identidade "O Fio" (tokens + primitivos)

**Entrega:** o app deixa de ser shadcn dourado e passa a ser o que está no canvas.

- `app/globals.css`: os tokens da tabela §3 de `decisoes-design.md` como fonte única —
  `--accent: #253990` vira o `primary`; `--gold` sai do caminho corriqueiro e fica reservado à
  celebração. Dark mode **re-derivado por papel de cor**, nunca invertido.
- Tokens de motion (`--dur-micro/base/entrance`, easing da casa) como custom properties.
- `components/marca/marca-aureola.tsx` — a marca (§1.2), e o favicon gerado dela.
- `components/fio/`: `Conta` (4 estados da §3b: inativa, sua, suplência, ave-maria), `Fio`,
  `Kicker`, `StatusPill` (**sempre cor + palavra**), `Manchete`, `Dezena`.
- `components/ui/` re-estilizado: botão, input, card, badge, table herdando os tokens.

**Aceite:** nenhum hex fora de `globals.css`; `#a9812f` não aparece mais como cor de ação;
contraste AA nos pares texto/fundo usados; as quatro contas batem com o artboard `Sidebar`.

### Fase 2 — Persistência

**Entrega:** o que foi salvo continua lá depois do reload.

- `lib/db/schema.sql` + `lib/db/index.ts` (conexão única com `foreign_keys=ON` e WAL,
  migração idempotente no boot) + `lib/db/seed.ts`, que semeia **só banco vazio**: em
  desenvolvimento, o departamento de demonstração (os dados que estavam em `lib/mock/`, que
  deixa de existir); em produção, o catálogo de funções e a coordenação vinda das variáveis
  `CLJ_COORDENADOR_*` — sem elas, nenhuma conta é criada e o app avisa no log.
- `lib/repos/*.ts` — SQL cru, síncrono, um arquivo por agregado.
- `lib/data/*.ts` reescrito sobre os repos, **mesmas assinaturas**.
- `data/clj.db` no `.gitignore`.

**Aceite:** as páginas não mudam de import; `npm run db:reset` seguido de um boot reconstrói
o estado de demonstração; teste de repositório roda contra um banco `:memory:`.

### Fase 3 — Autenticação por convite

**Entrega:** cada pessoa entra como ela mesma; `PESSOA_ATUAL_ID` morre.

- Senha com `scrypt` (`node:crypto` — sem dependência nova), salt por pessoa,
  comparação em tempo constante.
- Sessão: token aleatório em cookie `httpOnly`, `sameSite=lax`, `secure` em produção,
  30 dias, linha em `sessoes` (logout revoga de verdade).
- `/login`, `/convite/[token]` (definir senha → ativa a pessoa), logout.
- `lib/auth/guarda.ts`: `getSessao()`, `exigirPessoa()`, `exigirCoordenador()`.
  `app/(app)/layout.tsx` exige pessoa; `coordenador/layout.tsx` exige papel.
- Rate limit simples por e-mail no login; mensagem de erro **não** revela se o e-mail existe.

**Aceite:** rota de coordenação chamada por participante redireciona **e** a action recusa;
sessão sobrevive a restart do servidor; nenhuma senha nem hash chega ao cliente.

### Fase 4 — Shell e a tela Hoje

**Entrega:** a tela que responde "tenho algo?" em menos de 10 segundos.

- `AppSidebar` redesenhada como **o fio**: cordão hairline, item = conta, três Ave-Marias
  separando "Meu espaço" de "Coordenação", marca no topo, pessoa no rodapé.
- Motion assinatura em GSAP: ao navegar, as contas deslizam 4px e voltam com
  `stagger { each: 0.035, from: <índice clicado> }`; a conta de destino assenta preenchendo
  (1.4→1.0, 320ms, `power3.out`); `navigator.vibrate(8)` no celular.
  Tudo dentro de `gsap.matchMedia()` — em `prefers-reduced-motion` sobra só o cross-fade.
- `MobileNav`: 4 destinos (Hoje · Escala · Calendário · Você), alvos ≥44px, safe-area.
- `/hoje`: manchete (sua próxima conta, com data, hora e papel na frase) → dezena da semana
  (2–4 itens) → o que é do departamento, recolhido. Sem nada seu: **"Semana em dia ✓"**,
  sereno — a dezena incompleta nunca pune (§8, "sempre com perdão").
- `/` autenticado redireciona para `/hoje`.

**Aceite:** a manchete é a primeira coisa lida em 390px de largura; nenhum item da bottom nav
com alvo <44px; com `prefers-reduced-motion: reduce` nenhuma translação roda.

### Fase 5 — Telas do participante, com escrita

- **Escala** (Opção A): filtro Meus/Todos por querystring, contas no lugar dos dots,
  data em `tabular-nums`, entrada em stagger.
- **Calendário:** dia com compromisso seu = conta preenchida; do departamento = conta neutra;
  coluna "Próximos" com a sua vez destacada. Navegação de mês por querystring.
- **Reuniões (leitura):** lista + pauta, decisões e follow-up; presença confirmável pelo
  próprio participante.
- **Você (cadastro):** nome, contato, funções (chips), disponibilidade (dias + períodos) —
  salvando de verdade, com toast. Rota `/voce` (a bottom nav pede esse nome); `/cadastro`
  redireciona para ela.

**Aceite:** cada formulário persiste e sobrevive ao reload; nenhuma tela mostra id, linha de
planilha ou nome de tabela; as frases seguem "situação → o que é seu → um próximo passo".

### Fase 6 — Coordenação, com CRUD

- **Painel:** 4 números (participantes ativos, sem responsável, próxima reunião, furos da
  semana) + alerta de furo com link que já abre a escala filtrada.
- **Funções:** criar, editar, excluir (excluir bloqueado se houver atividade usando a função).
- **Gestão de Escala:** tabela com filtros (mês, função, status); criar/editar atividade;
  trocar responsável/suplente **gravando em `trocas`**; mudar status; link de mídia.
- **Gestão de Reuniões:** pauta editável (perguntas ordenadas), decisões, follow-up com
  responsável e prazo, presença.
- **Participantes:** convidar por e-mail (gera link de convite copiável), ativar/inativar,
  editar funções.

**Aceite:** toda mutação é Server Action com `exigirCoordenador()`; excluir sempre confirma;
a troca aparece no histórico da atividade.

### Fase 7 — Rede de segurança

- Vitest: domínio (`agenda`, `mes`, `format`), repositórios contra `:memory:`, regras de
  autorização e o fluxo de convite.
- `npm run lint`, `npm run build` limpos; `npm run db:reset` documentado.
- Revisão adversarial multiagente (correção, autorização, acessibilidade, aderência ao design)
  e correção do que ela confirmar.

**Aceite:** suíte verde; build sem erro de tipo; nenhum achado confirmado em aberto.

---

## 5. Régua de qualidade (vale para toda fase)

- **Participante ganha:** em conflito de layout, o celular decide.
- **Um destaque por tela.** Dourado só na celebração (carimbo "Publicado", dezena completa).
- **Status é cor + palavra**, nunca cor sozinha.
- **Aviso é serviço:** toda frase carrega a informação completa ("Seu post do Terço sai amanhã
  às 7h · você é o responsável"), nunca cobrança.
- **Nada de estrutura interna vazando** para o participante: sem id, sem "registro", sem tabela.
- **Reverência:** o terço organiza, não enfeita. Elemento que usa a metáfora só para decorar sai.
- **Acessibilidade:** foco visível, alvo ≥44px no mobile, contraste AA, `prefers-reduced-motion`
  respeitado, formulário navegável por teclado.

## 6. Fora de escopo desta rodada

Push e widget de tela inicial (dependem da decisão nativo vs PWA); upload de foto;
multi-departamento; app nativo; integração com WhatsApp; e-mail transacional de verdade — o
convite gera um **link copiável** que o coordenador manda pelo canal que já usa.
