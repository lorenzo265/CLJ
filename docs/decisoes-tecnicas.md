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

### Lacunas do modelo (`lib/types.ts`) para o escopo novo

| Falta | Onde | Para quê |
|---|---|---|
| `dataNascimento` | `Pessoa` | mensagens de aniversário — hoje não existe o campo |
| `texto` / legenda | `Atividade` | o conteúdo que vai para o grupo com um toque (hoje só há `linkMidia`) |
| registro de cobrança | novo | saber o que já foi cobrado, para não cobrar duas vezes |
| confirmação de publicação | `Atividade` | fechar o ciclo: quem confirmou que publicou, e quando |

Essas quatro entram junto com a fatia vertical, não antes.

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
