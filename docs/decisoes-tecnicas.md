# Decisões Técnicas — CLJ NSR

Stack, dados, integrações e infra. Pressupõe [`00-intuito.md`](00-intuito.md) e [`decisoes-produto.md`](decisoes-produto.md). Atualizado em **2026-09-04**.

## 1. Stack do app (`web/`)

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **GSAP** (`gsap` + `@gsap/react`) para motion — assinatura "passar a conta". Substituiu framer-motion em 2026-08-27.
- **shadcn** como base de componentes, **sempre** re-estilizado com nossos tokens — nunca o look default.
- **lucide-react** (ícones), **sonner** (toasts), **react-day-picker** + **date-fns** (calendário), **next-themes** (dark mode futuro).
- Testes com **vitest**. Hoje só `lib/escala/agenda.test.ts` — a lógica de cobrança e aniversário nasce com teste.
- Tokens de design entram como CSS custom properties + `theme` do Tailwind. Componentes referenciam token por nome, **nunca hex solto**.

## 1b. Estado atual do código

Todas as rotas existem: `app/(app)/` (escala, calendário, cadastro, reuniões) e `app/(app)/coordenador/` (painel, escala, funções, participantes, reuniões), com `app/login/` fora do shell. Componentes por domínio em `components/` (shell, escala, calendario, cadastro, gestao) sobre a base `components/ui/` (shadcn). Tudo lê de `lib/mock/` através de `lib/data/`.

Nada disso tem backend, autenticação, ou a identidade "O Fio" aplicada — o app está no look default do shadcn.

## 2. Camada de dados

`lib/data/` expõe funções `async` sobre `lib/mock/`. A assinatura assíncrona foi escolhida desde o dia 1 para que a troca por backend real não toque em nenhum chamador. **Essa aposta se paga agora** — é o caminho da fatia vertical.

Regra: nenhuma página ou componente importa de `lib/mock/` diretamente. Sempre via `lib/data/`.

### Lacunas do modelo (`lib/types.ts`)

Confrontado com os mockups do ciclo mínimo, o modelo atual não sustenta o produto: faltam sete coisas, de `Pessoa.dataNascimento` (sem ela não existe mensagem de aniversário) a `Atividade.horario` (hoje só existe `data`, e todo o disparo depende de hora).

**A lista completa e autoritativa está em [`sdd-ciclo-minimo.md`](sdd-ciclo-minimo.md) §7** — não duplicada aqui, para não divergir. Os campos entram junto com a fatia vertical, não antes.

## 3. Backend: Supabase

**Decidido em 2026-09-04.** Postgres gerenciado + Auth + Storage + `pg_cron` num serviço só, com tier gratuito e sem servidor para manter.

Por que, contra as alternativas consideradas:

| | Supabase | Neon + Auth.js + Drizzle | Convex |
|---|---|---|---|
| Postgres | sim | sim | não (modelo próprio) |
| Auth com fluxo de convite | nativo | montado à mão | nativo |
| Agendador (cron) | `pg_cron` + Edge Functions | Vercel Cron (limitado no free) ou GitHub Actions | nativo |
| Curva | RLS | maior — monta-se tudo | menor, mais lock-in |

As duas exigências do escopo novo — **convite** e **cron** — vêm prontas, e é isso que decide para quem trabalha sozinho ([`00-intuito.md`](00-intuito.md) §2). O custo aceito é aprender **Row Level Security** direito; isso é ofício, não desvio.

**Pendente:** hospedagem do app (Vercel é o caminho óbvio para Next.js, ainda não decidido) e ambiente de staging.

## 4. WhatsApp: entrega com um toque

**Decidido em 2026-09-04.** O app monta a mensagem pronta e abre o WhatsApp com o texto já preenchido (`wa.me` / Web Share API); o coordenador escolhe o grupo e envia.

Custo zero, dentro dos termos de uso, sem app review, funciona hoje. Na prática entrega o que se queria — *"eu monto e o app manda para mim nos grupos"* — com um toque em vez de nenhum.

**Por que não o app mandando sozinho no grupo:**

- A **Groups API** oficial da Cloud API existe em 2026, mas as fontes convergem em dois bloqueios: exige **Official Business Account** e tem teto de **8 participantes por grupo** — um grupo de departamento paroquial estoura isso no primeiro dia.
  ⚠️ *Não foi possível confirmar na documentação da Meta (acesso a `developers.facebook.com` bloqueado pela política de rede da sessão em que isto foi decidido). **Confirmar o limite de 8 antes de apostar contra ele.***
- Os provedores **não-oficiais** (Whapi, Blueticks, Unipile) automatizam o WhatsApp Web por fora: funcionam, cobram mensalidade, violam os termos, e o número banido seria **o da paróquia**. Rejeitado por risco, não por preço.

**Cobranças e aniversários** são internos e não passam por API nenhuma da Meta: são cron + notificação (§6).

Fontes: [Unipile — WhatsApp Group API 2026](https://www.unipile.com/whatsapp-group-api/) · [Meta for Developers — Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups) · [Whapi.Cloud](https://whapi.cloud/whatsapp-groups-api)

## 5. Instagram: o app não publica

**Decidido em 2026-09-04.** O app organiza, produz e agenda **internamente**; o disparo sai pelo **Meta Business Suite**.

Por quê:

- Publicar pela API exige conta Business + Página do Facebook vinculada + permissão `instagram_business_content_publish`, com **app review de 2 a 4 semanas** — de uma janela de 17.
- **Stories não têm agendamento pela API** (não existe `scheduled_publish_time`). O Business Suite agenda Stories; a API não. O Terço Diário é justamente o conteúdo mais recorrente.
- Teto de 25 publicações/24h e 200 chamadas/hora por token.

Ou seja: gastaríamos semanas de janela para reconstruir pior o que o Business Suite já faz de graça. Fica registrado como **fase 2**, fora do caminho crítico.

Fontes: [Postproxy — Post to Instagram via API (2026)](https://postproxy.dev/blog/post-to-instagram-via-api/) · [Postproxy — Schedule Instagram Stories](https://postproxy.dev/how-to/schedule-instagram-stories/) · [Netrows — Instagram Graph API 2026](https://www.netrows.com/blog/instagram-graph-api-guide-2026)

## 6. Cobranças, aniversários e notificações

A parte de maior valor e menor custo do escopo novo, porque **não depende de terceiros**:

- **Agendador:** `pg_cron` no Supabase dispara a rotina diária.
- **O que a rotina faz:** varre aniversários do dia, atividades de amanhã sem confirmação, e atividades de hoje que passaram do horário sem publicação.
- **Como chega:** o painel do coordenador mostra o que precisa sair; a entrega ao grupo é o toque do §4. Notificação para o participante fica pendente até a decisão de push/PWA.
- **Teste:** toda regra de "quando cobrar" nasce com teste unitário em `lib/`, isolada de data real — a mesma disciplina de `lib/escala/agenda.test.ts`.

## 7. Pendências nomeadas

Registradas para **não** inflarem a sensação de escopo. Nenhuma está no caminho crítico da v1:

- Hospedagem e staging.
- Push para o participante: PWA vs. nativo.
- Dark mode (tokens já derivados por papel de cor, nunca invertidos).
- Publicação automática no Instagram (fase 2, §5).
- CI (lint + testes no push).

## 8. Automação de conteúdo (avaliada em 2026-09-04)

Ideia levantada: um pipeline que recebe vídeo bruto, aprende o formato dos Stories que já são publicados, corta e devolve pronto — e um agente que publica **controlando a máquina** do coordenador.

São duas ideias, e recebem vereditos opostos.

### 8.1 Corte de vídeo assistido por IA — **sim, fase 2**

Esta metade resolve trabalho real que ninguém resolve hoje: transformar material bruto em Story pronto, no formato que o Departamento já usa. Não toca em conta de rede social, não viola termo nenhum, e roda offline.

A peça já existe em código aberto e auto-hospedável — [OpenShorts](https://www.openshorts.app/) (MIT, o vídeo nunca sai da máquina, reenquadramento 9:16 com rastreio de rosto) e o [opensource-clipping](https://github.com/NaufalRizqullah/opensource-clipping) (Whisper para transcrição, MediaPipe para rosto). A base técnica é Whisper + ffmpeg + MediaPipe; o "aprender o meu formato" é um template extraído de exemplos, não um modelo treinado.

**Onde encaixa:** a saída do pipeline entra no Meta Business Suite (agendamento nativo) ou na entrega com um toque (§4). O pipeline **prepara**; publicar continua sendo do §5.

**Fica em fase 2**, fora do caminho crítico da v1 — é um segundo produto e não pode competir com o ciclo mínimo pelas 17 semanas do mandato ([`00-intuito.md`](00-intuito.md) §3).

### 8.2 Agente que publica controlando a máquina — **não**

Dois motivos, e o primeiro é numérico.

**Risco.** Dados de 2026: contas que automatizam pela API oficial da Meta têm taxa de suspensão **abaixo de 0,5% ao ano**; contas que automatizam por **browser automation** ficam entre **15% e 30% ao ano** — de 30 a 60 vezes mais risco. Ferramentas que fazem login com usuário e senha e dirigem a interface disparam o *device fingerprinting* da Meta. A conta em risco seria a da paróquia, com todo o histórico do Departamento Cultural dentro.

**Redundância.** O agente substituiria algo que já funciona, é grátis e é oficial: o Meta Business Suite agenda e **auto-publica** Stories sozinho (de 20 minutos a 29 dias de antecedência) — está documentado na própria pesquisa do projeto, em [`pesquisa/stories-diarios-e-escopo-do-app.md`](pesquisa/stories-diarios-e-escopo-do-app.md). Trocar isso por um robô que depende da máquina ligada, logada, sem pop-up e sem mudança de layout é trocar o confiável pelo frágil.

Se um dia a necessidade for real e o Business Suite não der conta, o caminho legítimo é a **API oficial** (§5), com seu app review — não a automação de navegador.

Fontes: [PostEngage — Instagram Automation Ban Risk](https://postengage.ai/blog/instagram-automation-ban-risk-truth) · [Mixpost — Automate Instagram Posts Safely](https://mixpost.app/blog/automate-instagram-posts-safely) · [CreatorFlow — Is Instagram Automation Safe in 2026](https://creatorflow.so/blog/is-instagram-automation-safe-2026/)
