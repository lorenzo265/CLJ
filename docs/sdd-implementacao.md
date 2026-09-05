# SDD — Implementação

**Como sair do estado atual e chegar na Fase A no ar.** Este documento é o caminho: ordem, decisões técnicas resolvidas, código de referência e critério de pronto por etapa. Escrito em **2026-09-05**.

Pressupõe, e não repete: [`00-intuito.md`](00-intuito.md) (por que o projeto existe, as duas fases), [`decisoes-produto.md`](decisoes-produto.md) (telas e domínio), [`decisoes-design.md`](decisoes-design.md) (a gramática e o tempo litúrgico), [`decisoes-tecnicas.md`](decisoes-tecnicas.md) (stack e integrações) e [`sdd-ciclo-minimo.md`](sdd-ciclo-minimo.md) (o que cada tela faz).

> **Regra de ouro deste documento:** se algo aqui contradiz um dos outros, os outros vencem — e a contradição é um bug a corrigir no mesmo commit.

---

## 0. Como usar

Trabalhe por **etapa**, na ordem. Cada etapa é entregável sozinha, tem critério de pronto verificável, e não depende da seguinte. Não comece a próxima com a anterior vermelha.

Ao terminar uma etapa: rode `npm test` e `npm run lint`, atualize o documento correspondente **no mesmo commit** (regra do `CLAUDE.md`), e marque a etapa aqui.

---

## 1. O que já existe — verificado em 05/09/2026

```
web/
  app/
    (app)/layout.tsx          escala/ calendario/ cadastro/ reunioes/
    (app)/coordenador/        page.tsx escala/ funcoes/ participantes/ reunioes/
    login/page.tsx
    globals.css               ← identidade ANTIGA (papel quente, dourado como primary)
  components/
    shell/ escala/ calendario/ cadastro/ gestao/
    ui/                       ← 20 componentes shadcn no look default
  lib/
    types.ts data/ mock/ escala/agenda.ts(+teste) calendario/mes.ts format.ts utils.ts
```

**O que está bom e não se toca:** a camada `lib/data/` já é `async` desde o primeiro dia e nenhuma página importa `lib/mock/` direto — é exatamente o encaixe para o Supabase. As rotas são Server Components que fazem `await` no dado e passam para componentes puros. Mantenha esse formato.

**O que está errado hoje:**

| Onde | O quê |
|---|---|
| `app/globals.css` | tokens da identidade de agosto: `--background: #faf7f2`, `--primary: #a9812f`. A identidade mudou duas vezes desde então |
| `components/ui/` | shadcn no look default — a gramática proíbe |
| `components/escala/agenda-row.tsx` | usa `Badge` para status; a gramática diz **palavra colorida, nunca pílula** |
| `package.json` | `gsap` e `@gsap/react` instalados; a gramática atual não pede motion de biblioteca |
| `lib/types.ts` | faltam **10 campos/entidades** (§6) |
| — | não existe `lib/liturgia/` |

---

## 2. O destino

```
web/
  app/
    manifest.ts                     PWA
    (app)/                          as telas da Fase A
  components/
    <domínio>/                      componentes de tela
    base/                           só o que carrega COMPORTAMENTO (diálogo, popover, select…)
  lib/
    liturgia/                       ← novo: o calendário e as cores
    data/                           mesma API pública, agora falando com Supabase
    disparo/                        ← novo: as regras de quando cobrar
    supabase/                       cliente e tipos gerados
  supabase/
    migrations/                     schema versionado
    functions/rotina-diaria/        a Edge Function do cron
  public/
    sw.js  icon-192.png  icon-512.png
```

---

## 3. As leis do código

Não negociáveis. Um PR que as viola está errado mesmo que funcione.

1. **Nenhuma página importa `lib/mock/`.** Sempre `lib/data/`. A troca para Supabase não pode tocar em nenhum chamador.
2. **Nenhum hex solto em componente.** Só `var(--token)` ou a classe Tailwind que aponta para ele.
3. **Regra de negócio nasce em `lib/`, com teste, e recebe `hoje: Date` como parâmetro** — nunca chama `new Date()` por dentro. Sem isso não há teste determinístico.
4. **Server Component busca; componente puro desenha.** Nada de `useEffect` para carregar dado.
5. **Nenhuma caixa.** Sem borda, sem card com contorno, sem alerta colorido. Hierarquia por espaço, peso e tamanho (`decisoes-design.md` §9b).
6. **Status é palavra colorida, não pílula.** Ação principal é **texto azul**; pílula preenchida só para o compromisso final (o disparo).
7. **Fonte do sistema.** `-apple-system` na interface, `ui-serif` na capitular e nas rubricas. **Nenhuma fonte importada, nunca.**
8. **Toda cor semântica passa por palavra.** Nunca só cor.
9. **Alvo de toque mínimo 44px.**
10. **Português no código de domínio.** Os tipos, funções e campos já estão em português — mantenha. Consistência vale mais que preferência.

---

## 4. Etapa 1 — A pele

### 4.1 Tokens

Substitua o bloco `:root` de `app/globals.css`. Estes são os valores fechados:

```css
:root {
  /* superfícies e tinta — a gramática Apple/Notion */
  --papel:        #FFFFFF;
  --superficie:   #F5F5F7;
  --tinta:        #1D1D1F;
  --tinta-2:      #86868B;
  --tinta-3:      #AEAEB2;
  --separador:    #EDEDED;

  /* a ação — NUNCA muda com o tempo litúrgico */
  --acao:         #253990;

  /* semânticas */
  --ok:           #5C7A52;
  --atencao:      #B4682A;
  --erro:         #A6473C;

  /* o tempo litúrgico — preenchido em runtime (§5.4) */
  --tempo:        #24694E;
  --tempo-fundo:  #24694E;
  --tempo-hair:   color-mix(in srgb, var(--tempo) 14%, transparent);
}
```

Cores do tempo, como constantes em `lib/liturgia/cores.ts`:

| Tempo | Token | Hex |
|---|---|---|
| Comum | `verde` | `#24694E` |
| Advento · Quaresma | `roxo` | `#4C3A7A` |
| Natal · Páscoa · festas | `ouro` | `#A9812F` |
| Pentecostes · mártires · Ramos | `vermelho` | `#9E2B25` |
| Gaudete · Laetare | `rosa` | `#B8697F` |
| fundo do post nas festas | `tinta-festa` | `#1C1A16` |

### 4.2 Tipografia

```css
--fonte-ui:    -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
--fonte-serif: ui-serif, "New York", "Iowan Old Style", Palatino, Georgia, serif;
```

Escala de corpo (a do iOS, e é o que os desenhos usam):

| Papel | px | peso | tracking |
|---|---|---|---|
| Título grande | 32–34 | 600 | −0.8 |
| Título 2 | 22 | 600 | −0.4 |
| Corpo | 17 | 400/500 | −0.17 |
| Secundário | 15 | 400 | −0.1 |
| Legenda | 13 | 400 | 0 |
| Rubrica (serif) | 13 | 500 | +0.7 |
| Capitular (serif) | 82–84 | 400 | −0.03em |

### 4.3 Limpeza

```bash
npm uninstall gsap @gsap/react
```

**Decisão registrar em `decisoes-tecnicas.md`:** motion é **CSS puro** — `transition` e Web Animations, sempre atrás de `prefers-reduced-motion`. A gramática pede contenção; uma biblioteca de motion é peso morto para um desenvolvedor sozinho. GSAP sai.

De `components/ui/`, **apague o que só carrega aparência** e mantenha o que carrega comportamento:

| Manter (comportamento) | Apagar (aparência) |
|---|---|
| `dialog` `popover` `select` `sheet` `tooltip` `dropdown-menu` `calendar` `input` `textarea` `switch` `label` | `badge` `card` `alert` `separator` `skeleton` `toggle` `toggle-group` `avatar` `table` `button` |

Renomeie a pasta para `components/base/`. O que ficar deve ser **re-estilizado com os tokens acima** — nada do look default.

### 4.4 Pronto quando

`npm run dev`, abra `/escala`, e ela usa papel branco, tipografia do sistema, nenhuma borda e nenhuma pílula. Compare com `design/telas/` lado a lado.

---

## 5. Etapa 2 — O calendário litúrgico

O módulo mais delicado do projeto e o que ninguém mais tem. **Escreva-o antes de qualquer tela**, com testes, sem UI.

### 5.1 A API

`lib/liturgia/calendario.ts`:

```ts
export type Tempo = "advento" | "natal" | "quaresma" | "triduo" | "pascoa" | "comum";
export type Cor   = "verde" | "roxo" | "ouro" | "vermelho" | "rosa";

export interface DiaLiturgico {
  data: string;          // ISO yyyy-mm-dd
  tempo: Tempo;
  cor: Cor;
  semana: number | null; // semana do tempo; null onde não se numera
  rubrica: string;       // "TEMPO COMUM · 23ª SEMANA"
  celebracao?: string;   // "Nossa Senhora do Rosário"
  solene: boolean;
}

export function pascoa(ano: number): Date;
export function primeiroDomingoDoAdvento(ano: number): Date;
export function getDiaLiturgico(data: Date): DiaLiturgico;
export function misteriosDoDia(data: Date): "Gozosos" | "Dolorosos" | "Gloriosos" | "Luminosos";
```

### 5.2 A Páscoa (algoritmo gregoriano anônimo)

Toda divisão é **inteira**. Deste ponto sai quase todo o resto do ano.

```ts
export function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);   // 3 = março, 4 = abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}
```

### 5.3 As fronteiras dos tempos

Derivadas da Páscoa e do Natal:

| Tempo | De | Até |
|---|---|---|
| **Advento** | 1º domingo do Advento — o domingo entre 27/11 e 03/12 | 24/12 |
| **Natal** | 25/12 | Batismo do Senhor — domingo seguinte a 06/01 |
| **Comum I** | dia seguinte ao Batismo | terça anterior à Quarta-feira de Cinzas |
| **Quaresma** | Quarta-feira de Cinzas — **Páscoa − 46 dias** | Quinta-feira Santa |
| **Tríduo** | Quinta-feira Santa | Domingo de Páscoa |
| **Páscoa** | Domingo de Páscoa | Pentecostes — **Páscoa + 49 dias** |
| **Comum II** | dia seguinte a Pentecostes | sábado anterior ao 1º domingo do Advento |

**A armadilha da numeração.** O Tempo Comum tem 34 semanas partidas em dois trechos. O primeiro conta para a frente a partir do Batismo; o segundo **não continua de onde parou** — ele é ajustado para que a última semana antes do Advento seja sempre a **34ª**. Implemente o segundo trecho **contando para trás a partir do Advento**, nunca para a frente. Uma implementação ingênua erra aqui e ninguém percebe até novembro.

### 5.4 As cores

```
rosa      → 3º domingo do Advento (Gaudete) e 4º domingo da Quaresma (Laetare)
roxo      → Advento e Quaresma
ouro      → Natal, Páscoa, solenidades e festas do Senhor e de Nossa Senhora
vermelho  → Domingo de Ramos, Sexta-feira Santa, Pentecostes, mártires
verde     → Tempo Comum
```

Regra de precedência: **rosa > solenidade/festa > tempo**.

### 5.5 O calendário próprio do Brasil

Datas fixas que o app precisa conhecer (`lib/liturgia/celebracoes.ts`):

| Data | Celebração | Peso |
|---|---|---|
| 01/01 | Santa Maria, Mãe de Deus | solenidade |
| 24/06 | São João Batista | solenidade |
| 29/06 | São Pedro e São Paulo | solenidade |
| 15/08 | Assunção de Nossa Senhora | solenidade |
| **07/10** | **Nossa Senhora do Rosário** | **padroeira da casa** |
| 12/10 | Nossa Senhora Aparecida | solenidade, padroeira do Brasil |
| 01/11 | Todos os Santos | solenidade |
| 02/11 | Finados | — |
| 08/12 | Imaculada Conceição | solenidade |
| 25/12 | Natal | solenidade |

> **Verificar esta tabela contra uma fonte litúrgica antes de fixar** — datas móveis e transferências existem, e o app não pode errar a festa da própria casa.

### 5.6 Os mistérios do Rosário

```
segunda e sábado → Gozosos
terça e sexta    → Dolorosos
quarta e domingo → Gloriosos
quinta           → Luminosos
```

É o que faz o Terço Diário vir preenchido sem ninguém digitar.

### 5.7 Onde a cor entra na página

No `layout.tsx` do grupo `(app)`, o Server Component calcula o dia litúrgico e injeta as variáveis:

```tsx
const dia = getDiaLiturgico(new Date());
<div style={{ "--tempo": CORES[dia.cor], "--tempo-fundo": FUNDO[dia.cor] } as CSSProperties}>
```

E o `<meta name="theme-color">` acompanha — a barra do Safari veste o tempo junto com o app.

### 5.8 Os testes golden — valores já verificados

O algoritmo de §5.2 foi rodado contra sete Páscoas conhecidas e bateu em todas. **Use estes valores direto no teste:**

```ts
const PASCOA = {
  2024: "2024-03-31", 2025: "2025-04-20", 2026: "2026-04-05", 2027: "2027-03-28",
  2028: "2028-04-16", 2030: "2030-04-21", 2032: "2032-03-28",
};
```

Datas derivadas de 2026, conferidas — e repare que cada uma cai no dia da semana que tem de cair, que é o teste que pega erro de deslocamento:

| Data | 2026 | Dia |
|---|---|---|
| Páscoa | `2026-04-05` | domingo |
| Quarta-feira de Cinzas (Páscoa − 46) | `2026-02-18` | **quarta** |
| Domingo de Ramos (Páscoa − 7) | `2026-03-29` | domingo |
| Pentecostes (Páscoa + 49) | `2026-05-24` | domingo |
| 1º domingo do Advento | `2026-11-29` | domingo |

### 5.9 Pronto quando

`npm test` passa com:

- As sete Páscoas da tabela acima.
- As cinco datas derivadas de 2026, **incluindo a asserção do dia da semana**.
- 07/10/2026 devolve `celebracao: "Nossa Senhora do Rosário"` e `cor: "ouro"`.
- Uma data em cada um dos 7 tempos devolve tempo e cor certos.
- A última semana antes do Advento é a **34ª**.
- `misteriosDoDia` para os 7 dias da semana.

---

## 6. Etapa 3 — O modelo de dados final

As dez lacunas de `sdd-ciclo-minimo.md` §7, resolvidas. Atualize `lib/types.ts` **e** os mocks juntos.

```ts
export interface Pessoa {
  id: string; nome: string; contato: string;
  whatsapp: string;                    // E.164, ex "+5511999999999"
  dataNascimento: string;              // NOVO — ISO, para os aniversários
  departamentoId: string;
  papelSistema: "coordenador" | "participante";
  disponibilidade: { dias: DiaSemana[]; periodos: Periodo[] };
  cadastroCompleto: boolean; status: "ativo" | "inativo";
}

export interface Atividade {
  id: string; departamentoId: string;
  tipo: TipoAtividade; titulo: string; funcaoId: string;
  data: string;                        // ISO yyyy-mm-dd
  horario: string;                     // NOVO — "07:00". TODO disparo depende disto
  responsavelId: string; suplenteId?: string;
  status: StatusAtividade;
  texto?: string;                      // NOVO — o que vai para o grupo
  midiaId?: string;                    // NOVO — substitui linkMidia
  confirmadoEm?: string;               // NOVO — ISO datetime
  confirmadoPorId?: string;            // NOVO
  assumidaPeloSuplenteEm?: string;     // NOVO
}

export interface Midia {                            // NOVO
  id: string; departamentoId: string; nome: string;
  tipo: "imagem" | "video"; tamanhoBytes: number;
  url: string; enviadaEm: string;
}

export interface EscalaMes {                        // NOVO
  id: string; departamentoId: string;
  mes: string;                          // "2026-09"
  publicadaEm?: string;                 // sem isto, NADA dispara
}

export interface Disparo {                          // NOVO — a idempotência mora aqui
  id: string;
  tipo: "vespera" | "lembrete" | "atraso" | "aniversario" | "troca";
  pessoaId: string; atividadeId?: string;
  data: string;                         // ISO yyyy-mm-dd do disparo
  enviadoEm: string;
}

export interface Troca {                            // NOVO
  id: string; atividadeId: string;
  deId: string; paraId: string;
  pedidaEm: string; aceitaEm?: string;
}
```

**`linkMidia` sai.** Mídia é entidade, não string.

---

## 7. Etapa 4 — A tela Hoje e o disparo com um toque

### 7.1 WhatsApp — a implementação inteira

```ts
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
```

`wa.me/?text=` **sem número** abre o WhatsApp na lista de conversas com o texto pronto — a pessoa escolhe o grupo. É exatamente a decisão de `decisoes-tecnicas.md` §4.

No cliente, prefira o compartilhamento nativo quando existir:

```ts
if (navigator.share) await navigator.share({ text });
else window.open(linkWhatsApp(text), "_blank");
```

**Invariante:** tocar em Enviar **não** marca como publicado. Só a ação explícita "Já publiquei" grava `confirmadoEm` — o app não tem como saber se a mensagem saiu.

### 7.2 Pronto quando

A tela Hoje mostra a rubrica, a capitular, o post no tempo do dia e a lista sem caixas; e um toque abre o WhatsApp com o texto escrito.

---

## 8. Etapa 5 — Supabase

### 8.1 Schema

```sql
create table pessoa (
  id uuid primary key default gen_random_uuid(),
  departamento_id uuid not null,
  nome text not null,
  contato text not null,
  whatsapp text,
  data_nascimento date,
  papel_sistema text not null check (papel_sistema in ('coordenador','participante')),
  disponibilidade jsonb not null default '{"dias":[],"periodos":[]}',
  cadastro_completo boolean not null default false,
  status text not null default 'ativo'
);

create table midia (
  id uuid primary key default gen_random_uuid(),
  departamento_id uuid not null,
  nome text not null,
  tipo text not null check (tipo in ('imagem','video')),
  tamanho_bytes bigint not null,
  url text not null,
  enviada_em timestamptz not null default now()
);

create table atividade (
  id uuid primary key default gen_random_uuid(),
  departamento_id uuid not null,
  tipo text not null, titulo text not null, funcao_id uuid not null,
  data date not null,
  horario time not null,
  responsavel_id uuid not null references pessoa(id),
  suplente_id uuid references pessoa(id),
  status text not null default 'ideia',
  texto text,
  midia_id uuid references midia(id),
  confirmado_em timestamptz,
  confirmado_por_id uuid references pessoa(id),
  assumida_pelo_suplente_em timestamptz
);

create table escala_mes (
  id uuid primary key default gen_random_uuid(),
  departamento_id uuid not null,
  mes text not null,
  publicada_em timestamptz,
  unique (departamento_id, mes)
);

create table disparo (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  pessoa_id uuid not null references pessoa(id),
  atividade_id uuid references atividade(id),
  data date not null,
  enviado_em timestamptz not null default now(),
  -- A IDEMPOTÊNCIA DE §9 É ESTA LINHA. Não a implemente em JavaScript.
  unique (tipo, pessoa_id, atividade_id, data)
);

create table troca (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references atividade(id),
  de_id uuid not null references pessoa(id),
  para_id uuid not null references pessoa(id),
  pedida_em timestamptz not null default now(),
  aceita_em timestamptz
);
```

### 8.2 A troca sem tocar em chamador

`lib/data/*.ts` mantém **exatamente** as mesmas assinaturas. Só o corpo muda:

```ts
// antes
export async function getPessoas(departamentoId: string): Promise<Pessoa[]> {
  return pessoas.filter((p) => p.departamentoId === departamentoId);
}
// depois
export async function getPessoas(departamentoId: string): Promise<Pessoa[]> {
  const { data, error } = await supabase.from("pessoa").select("*").eq("departamento_id", departamentoId);
  if (error) throw error;
  return data.map(paraPessoa);
}
```

Escreva os mapeadores `snake_case → camelCase` em `lib/supabase/mapeadores.ts`. **Nenhuma página muda.** Se alguma precisar mudar, a camada estava vazando.

### 8.3 Auth

- **Fase A:** um usuário. Supabase Auth por link mágico no e-mail. RLS: o usuário autenticado pode tudo dentro do seu `departamento_id`.
- **Fase B:** convite por `inviteUserByEmail` a partir de uma Edge Function. RLS por `departamento_id` **e** por papel: participante lê tudo do departamento e escreve só o que é dele.

Ligue RLS em **todas** as tabelas desde a primeira migração, mesmo na Fase A com um usuário. Ligar depois é onde se esquece uma.

---

## 9. Etapa 6 — O motor de disparo

`lib/disparo/regras.ts` — funções puras, `agora: Date` sempre por parâmetro.

| # | Quando | Para quem |
|---|---|---|
| 6.1 | 18:00 do dia anterior | responsável |
| 6.2 | 4h antes do horário, **se não confirmou** | responsável |
| 6.3 | 2h depois do horário, sem confirmação | responsável (coordenador vê no painel) |
| 6.4 | ao tocar "Não vou conseguir" | suplente e coordenador |
| 6.5 | 07:00 | coordenador — aniversário pronto |
| 6.6 | ao aceitar a troca (Fase B) | os dois e o coordenador |

**Invariantes que o código deve garantir:**

1. **Idempotência** — a `unique` da tabela `disparo` (§8.1). Insira sempre com `on conflict do nothing` e trate o conflito como "já foi", não como erro.
2. **Quem confirmou não recebe** — `confirmado_em is null` em toda consulta de 6.2 e 6.3.
3. **Sem `escala_mes.publicada_em`, nada dispara.** Cheque primeiro; é a guarda mais barata.
4. **Suplência substitui, não acumula** — quando `assumida_pelo_suplente_em` existe, o destinatário é o suplente e o responsável original sai.

**Fase A vs Fase B:** a lógica de *quando* e *para quem* é a mesma. Muda só o último passo — na Fase A termina numa lista de "mandar agora" com um toque do coordenador; na Fase B sai direto. **Não escreva duas implementações.**

O agendador é `pg_cron` chamando uma Edge Function uma vez por hora. Não depende do app estar aberto.

### Pronto quando

Testes de `lib/disparo/` cobrem os quatro invariantes, e o painel do dia mostra o que vai sair.

---

## 10. Etapa 7 — PWA e no ar

`app/manifest.ts`:

```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CLJ NSR", short_name: "CLJ NSR",
    start_url: "/", display: "standalone",
    background_color: "#FFFFFF", theme_color: "#FFFFFF",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

`public/sw.js` mínimo: só `push` e `notificationclick`. Registre no cliente.

**O que o iOS exige, e não é opcional:**

- HTTPS (a Vercel já dá).
- O app precisa ter sido adicionado via **Safari → Compartilhar → Adicionar à Tela de Início** antes de qualquer push.
- A permissão só pode ser pedida **a partir de um toque** — nunca no carregamento.
- Push indisponível na União Europeia. No Brasil funciona.
- **Não existe prompt automático de instalação no iOS.** A tela precisa ensinar o gesto uma vez.

Deploy: Vercel, plano gratuito. Variáveis do Supabase como env.

### Pronto quando

O ícone está na tela de início do seu iPhone, abre sem barra de navegador, e mostra o dia certo.

---

## 11. A ordem, em uma tabela

| # | Etapa | Entrega | Bloqueia |
|---|---|---|---|
| 1 | A pele | tokens, tipografia, limpeza do shadcn | tudo o que é visual |
| 2 | Calendário litúrgico | `lib/liturgia/` com golden tests | a identidade e o conteúdo automático |
| 3 | Tela Hoje | a tela âncora sobre mock | prova a gramática |
| 4 | Modelo + Disparo | os 10 campos, a tela de envio | o ciclo |
| 5 | Supabase | schema, RLS, `lib/data` real | dados de verdade |
| 6 | Motor | `pg_cron` + invariantes | a cobrança automática |
| 7 | PWA | manifest, SW, Vercel | o app no telefone |

Depois disso, a Fase A está pronta segundo `00-intuito.md` §5. A Fase B — convite, RLS por papel, push, troca — vem em seguida e **não** é reescrita.

---

## 12. Testes obrigatórios

| Módulo | O que provar |
|---|---|
| `lib/liturgia` | Páscoa e Advento de 5 anos; a 34ª semana; 07/10; os mistérios dos 7 dias |
| `lib/escala/agenda` | já existe — mantenha verde |
| `lib/disparo` | os 4 invariantes de §9 |
| `lib/format` | pt-BR, incluindo virada de mês e ano |
| mapeadores | ida e volta `snake_case ↔ camelCase` sem perda |

Toda função que olha o relógio recebe `agora: Date`. Sem exceção.

---

## 13. Armadilhas já pagas nesta sessão

Não repita:

- **SF Pro aparece na lista de fontes do Figma e devolve largura zero.** No arquivo use Inter/Newsreader; no código, fonte do sistema.
- **Figma Starter:** 3 páginas, 1 modo por coleção, e limite de chamadas de ferramenta.
- **Mobbin exige plano pago** — a API não retorna nada sem ele.
- **WhatsApp Groups API:** exige Official Business Account e limita a 8 participantes. Inviável. *(confirmar o limite na doc da Meta antes de apostar contra)*
- **Instagram:** a API não agenda Stories, e publicar exige app review de 2–4 semanas. Quem publica é o Business Suite.
- **Automação por navegador:** 15–30% de suspensão ao ano contra menos de 0,5% da API oficial.
- **Supabase gratuito pausa após 7 dias sem uso.**

---

## 14. O que não fazer

- Não recriar caixas, pílulas de status ou alertas coloridos.
- Não importar fonte.
- Não deixar o app publicar sozinho no Instagram nem em grupo de WhatsApp.
- Não escrever regra de negócio dentro de componente.
- Não marcar como publicado sem a ação explícita da pessoa.
- Não implementar a Fase B antes da Fase A estar no ar — ela é religação, não reescrita.
- Não deixar `web/` e outra base viva ao mesmo tempo. Um app só.
