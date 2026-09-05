# Decisões de Design — CLJ NSR

Registro vivo das decisões de identidade visual e UX. Atualizado em **2026-08-26**.

Pressupõe [`00-intuito.md`](00-intuito.md) — o propósito, o prazo e a régua do projeto.
Fonte expandida: [Briefing de Design](https://claude.ai/code/artifact/00c156b4-8382-460b-96d4-1ac2a8df0f96) · Telas: [Canvas](https://claude.ai/code/artifact/14a752be-4f96-4078-9f34-928991f4f24a)

## 1. O conceito nomeado: "O Fio"

> A plataforma é o **terço** do Departamento Cultural: cada responsabilidade é uma conta no fio, no azul de Nossa Senhora sobre papel e tinta bem tipografados — você passa as contas da sua semana, e a sua próxima conta é sempre a manchete.

O símbolo não foi inventado: NSR **é** Nossa Senhora do Rosário, o post mais recorrente é o Terço Diário, e um terço é estruturalmente o que uma escala é — contas em sequência com um compromisso por dia.

**Aplicações do terço (estrutura, nunca enfeite):**
- **Menu lateral = o fio.** O cordão sobe da cruz (a marca) e atravessa a navegação; cada item é uma conta do Pai-Nosso — esférica, com volume — que se enche de azul quando ativa. As três Ave-Marias separam "Meu espaço" de "Coordenação".
- **Semana = dezena.** As tarefas da semana são contas; concluir = "passar a conta" (ela se preenche). "Você está em dia ✓" = dezena completa.
- **Calendário:** dias com compromisso seu = conta azul preenchida; do departamento = conta neutra.
- **Cruz/medalha** ancora a marca — funciona minúscula (favicon, avatar de WhatsApp) e em uma cor só.

**Regra de reverência:** o terço é objeto de oração. A metáfora vive na estrutura (fio, contas, sequência), com sobriedade — nunca gamificação do sagrado nem imagem devocional como textura. Se um elemento usa o terço só para enfeitar, sai; se usa para organizar, fica. **Validar a aplicação com a coordenação e o pároco antes de lançar.**

## 2. Personalidade

Três adjetivos: **caloroso · caprichado · confiável**. Tendências (sliders): caloroso (não corporativo), sereno (não brincalhão), editorial (não techy), arejado (não denso), comunidade (não ferramenta fria).

## 3. Tokens de cor

Light (padrão). Dark mode existe derivado no doc de abertura — re-derivar por papel de cor, nunca inverter.

| Token | Hex | Papel |
|---|---|---|
| `--bg` | `#FAF7F2` | Papel — fundo de página, quente |
| `--panel` | `#FFFFFF` | Superfícies/cards |
| `--border` / `--border-soft` | `#E4DDD0` / `#EFEAE1` | Hairlines |
| `--text` | `#262320` | Tinta — texto principal |
| `--text-muted` / `--text-faint` | `#6E6862` / `#A9A199` | Secundário / terciário |
| `--accent` | **`#253990`** | **Azul oficial da paróquia** — única cor de destaque |
| `--accent-ink` | `#1A2A6C` | Azul para texto/hover |
| `--accent-soft` | `#E4E7F7` | Wash azul (fundos destacados) |
| `--accent-hi` | `#6C7CC9` | Brilho de gradiente (contas, cruz) |
| `--gold` / `--gold-ink` / `--gold-soft` | `#A9812F` / `#7A5D22` / `#F3E9D2` | **Reservado à celebração** (carimbo "Publicado", dezena completa, festas) — nunca como acento corriqueiro |
| `--ok` / `--warn` / `--info` / `--crit` | `#5C7A52` / `#B4682A` / `#5B7A96` / `#A6473C` | Semânticas (com washes) — status sempre com **cor + palavra**, nunca cor sozinha |

Regras: um destaque por tela; azul é marca-texto, não tinta de parede; contraste AA mínimo.

## 3b. Contas — tratamento visual (v2, flat)

Redesenhadas em 2026-08-27: a primeira versão (esferas com gradiente radial, brilho e sombra interna) lia "site anos 2000" — **skeuomorfismo é proibido** na identidade. A conta agora lê pela **geometria no fio**, não pela renderização 3D:

| Estado | Tratamento |
|---|---|
| Inativa | círculo 12px, fundo `--panel`, contorno 1.5px `--text-faint` |
| Ativa / sua | disco chapado `--accent` + **anel-auréola** de 3px em `--accent-soft` (`box-shadow: 0 0 0 3px`) |
| Suplência | anel 2px `--accent`, sem preenchimento |
| Ave-Marias (separador) | pontos 5px `--text-faint` a 60% |

O anel-auréola é a referência mariana embutida no estado ativo. Fio: hairline sólida `--border` (sem gradiente). Cruz interina do cabeçalho: sólida `--accent` — será substituída pela marca escolhida.

## 4. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Manchetes / títulos de página | **Source Serif 4** (600/700) | Títulos 19px+, manchete da tela Hoje, números grandes do Painel |
| Corpo / UI | **Public Sans** (400–800) | Tudo o mais; base 13.5–16px |
| Kickers, datas, códigos | **IBM Plex Mono** (500/600) | Micro-rótulos uppercase (letter-spacing 0.07–0.09em), datas com `tabular-nums` |

Nunca `system-ui`/Inter/Roboto como identidade. Carregadas via Google Fonts em cada artboard; no app, self-host.

## 5. Motion — GSAP, assinatura "passar a conta"

**Biblioteca oficial: GSAP** (`gsap` + `@gsap/react` com o hook `useGSAP`) — decidido em 2026-08-27; substituiu framer-motion (removido). Primeiro uso: entrada em stagger da `AgendaList`. A pílula ativa do sidebar atual está estática de propósito — a transição definitiva usa **GSAP Flip** e entra junto com o redesign sidebar-terço.

Tokens: `--dur-micro:140ms · --dur-base:240ms · --dur-entrance:420ms · stagger: 35–40ms`. Easing da casa `cubic-bezier(0.16,1,0.3,1)` ≈ `power3.out` no GSAP (ou `CustomEase` com a curva exata).

Dois momentos de fanfarra (os únicos):
1. **Navegar = passar as contas.** Timeline GSAP: cada conta desliza 4px e volta, com `stagger: { each: 0.035, from: <índice da conta clicada> }`; a conta de destino assenta preenchendo-se de azul (escala 1.4→1.0, 320ms, `power3.out`). Vibração leve no celular (`navigator.vibrate(8)`).
2. **Concluir = conta se preenche** (240ms) + carimbo dourado "Publicado".

Sempre checar `prefers-reduced-motion` (via `gsap.matchMedia()` ou guarda manual): reduzido = apenas cross-fade de cor. Protótipo clicável na seção 04 do briefing.

## 6. Hierarquia e voz

Toda tela de participante em três camadas: **manchete** (uma coisa: o que é seu e quando) → **sinal** (a semana, 2–4 itens) → **detalhe** (recolhido, sob demanda).

Microcopy em 2ª pessoa, ordem fixa: situação → o que é seu → um próximo passo. Ex.: "Seu post do Terço sai amanhã às 7h · você é o responsável". Notificação sempre carrega a informação completa — aviso é serviço, não cobrança.

## 7. Princípios que decidem brigas

1. **A manchete é a sua próxima conta** — rejeita abrir no calendário do mês.
2. **A plataforma carrega o peso, não a pessoa** — rejeita mostrar tabela crua.
3. **Celular do participante, desktop do coordenador** — mesma identidade, duas densidades; rejeita layout único que serve mal aos dois. Em conflito, o participante ganha.
4. **Aviso é serviço, não cobrança** — rejeita notificação-isca.
5. **Um destaque por tela** — dourado só na celebração; rejeita destacar tudo.

## 8. Mobile e hábito

- Tela **Hoje** responde uma pergunta ("tenho algo?") em <10s: manchete se sim, "Semana em dia ✓" sereno se não.
- **Bottom nav** com 4 destinos (Hoje · Escala · Calendário · Você), alvos ≥44px, zona do polegar.
- **Dezena da semana** como progresso — streak na versão que nos pertence, **sempre com perdão** (dezena incompleta não pune).
- **Widget de tela inicial** (dois estados: manchete / "Semana em dia ✓") = check de custo zero. Depende da plataforma técnica (nativo ou PWA) — decidir na etapa mobile do app.
- Push na janela em que a pessoa costuma responder, não em horário fixo.

## 9. Identidade (redefinida em 2026-09-04)

**A identidade é do app, não da paróquia.**

As três direções de agosto foram rejeitadas por genéricas — construções geométricas montadas a partir de primitivas e derivadas do *conceito* "Nossa Senhora do Rosário". A primeira reação foi buscar procedência no prédio: rosácea, fachada, azulejo, a imagem do altar. **Essa direção também está descartada.** O app pertence à paróquia, mas não é a paróquia; uma marca desenhada a partir do prédio faria dele mais um material institucional, e o que se quer é um produto com identidade própria.

O que vem da paróquia é a **cor**: azul e branco são as cores dela. O azul `#253990` continua sendo o único acento, sobre papel claro (§3).

### O que a identidade tem que fazer

Quatro exigências, fixadas em 2026-09-04 (o briefing está desenhado no artboard `Main` de `design/identidade/`):

1. **A emoção-alvo é alívio, não eficiência.** Quem abre o app está carregando algo; a tela devolve calma, não produtividade.
2. **Legível a 16px e às 6h da manhã.** Tela pequena, luz baixa, um olho aberto.
3. **Pertence à igreja sem ser devocional.** O contexto aparece na estrutura e no tom, nunca como imagem santa de textura.
4. **Outra paróquia não pode usar.** Foi exatamente o erro das três marcas de agosto.

O que está sendo substituído: a identidade atual — papel quente, tinta, azul tímido, serifa discreta — é **competente e anônima**. É a estética segura que todo produto bem-intencionado usa: não erra, e não marca ninguém.

### A ordem: telas primeiro, identidade depois

Decisão de método, e é a que muda o resultado: **primeiro acertar as telas; a identidade sai delas.**

Uma marca desenhada antes da interface é um símbolo procurando onde morar — foi exatamente assim que nasceram as três de agosto, e é por isso que qualquer paróquia poderia usá-las. Uma marca desenhada depois herda o ritmo, a geometria e a densidade que já provaram funcionar na tela, e não tem como sair genérica: ela vem de algo que só existe aqui.

1. Acertar as telas (ciclo mínimo e o que mais entrar). **Feito** — 10 quadros em `design/ciclo-minimo/`.
2. **Escolher a direção visual** entre as quatro em [`../design/identidade/`](../design/identidade/): A Missal · B Vigília · C Vitral · D Quadro de avisos. As quatro mostram a mesma tela com o mesmo conteúdo. ← **estamos aqui**
3. Aplicar a direção escolhida nos quadros do ciclo mínimo.
4. Extrair da interface o vocabulário formal que se repete e desenhar a marca a partir dele.

**O conceito "O Fio" (§1) segue de pé, mas deixa de ser premissa.** Se a interface que emergir do passo 1 não pedir o fio, o conceito cai junto — a identidade sai das telas, não o contrário.

Continua valendo de §2 a §8: sobriedade, régua de reverência, azul como marca-texto e não tinta de parede, e a proibição de skeuomorfismo.

## 9b. A gramática (V2 — 05 set 2026)

As quatro direções de 04/09 foram todas rejeitadas: *"cheiram a IA"*. O diagnóstico é preciso e vale como regra permanente — **eram quatro pinturas sobre o mesmo esqueleto**: card com número grande no topo, lista de linhas com pílula à direita, caixa de alerta colorida no rodapé. Variou-se superfície (cor, fonte, raio) e não **estrutura**.

### Referências declaradas

**Apple** (apple.com, Apple Music, Apple Maps) e **Notion**. Elas têm uma coisa em comum que as quatro rejeitadas violavam: **quase nunca desenham uma caixa.** A hierarquia vem de espaço, peso e tamanho de texto, não de bordas e contornos.

### As seis regras

1. **Nenhuma caixa.** Zero borda, zero card com contorno, zero alerta colorido. Separação por espaço e por hairline fina quando a lista realmente pedir.
2. **Fonte do sistema, não do Google.** `-apple-system, BlinkMacSystemFont, "SF Pro Text"` — em Mac e iPhone isso é SF Pro de verdade. A escala de corpo é a do iOS: 34 / 22 / 17 / 15 / 13, com tracking negativo nos títulos.
3. **A mídia é protagonista.** O post aparece como ele vai sair, não como um ícone de anexo. O app é sobre conteúdo visual e nenhuma das quatro rejeitadas mostrava uma única imagem — por isso pareciam painel de banco.
4. **Ação principal é texto azul**, não pílula preenchida. Pílula fica reservada ao disparo, que é o compromisso final.
5. **Cinza domina.** O azul só aparece no que é tocável ou no que é seu.
6. **Aviso é frase, não caixa amarela.** "3 ainda sem responsável · ver só essas".

### A lista do que denuncia UI gerada

Registrada para nunca mais: hero card com número gigante · lista de linhas idênticas com pílula à direita · caixa de alerta com borda esquerda grossa · raio de canto uniforme em tudo · acento aplicado como tint suave da mesma matiz · Google Font segura mais uma serifa "editorial" · label em maiúscula com letter-spacing como única hierarquia · espaçamento uniforme sem densidade · ícones stroke 2px todos do mesmo peso · nenhuma assimetria e nenhuma decisão arriscada.

Telas em [`../design/identidade/`](../design/identidade/), página **V2**; as rejeitadas ficam guardadas na página **Rejeitadas**.

## 9c. O tempo litúrgico (V3 — 05 set 2026)

A V2 tinha disciplina e não tinha alma. Falta**va** a matéria — e ela estava numa distinção que eu tinha fechado cedo demais:

- **Esta paróquia** (o prédio, a rosácea, a imagem do altar) continua fora. Dali vem só a cor.
- **A Igreja** — dois mil anos de cultura visual — está dentro, e é o repertório mais rico disponível.

### A decisão central: o app veste o tempo litúrgico

**Papel neutro constante; o tempo aparece nos detalhes** — decidido em 2026-09-05.

| Detalhe | Como |
|---|---|
| **Rubrica do topo** | o tempo nomeado, em serifa, na cor do tempo ("TEMPO COMUM · 23ª SEMANA") |
| **Régua sob a rubrica** | 1,5px na cor do tempo |
| **Capitular do dia** | o numeral em serifa a 82px, na cor do tempo — a inicial iluminada do livro de horas |
| **Hairlines das listas** | a cor do tempo a 16% |
| **Fundo do post** | a cor do tempo |

**O azul da paróquia (`#253990`) nunca muda: é a cor da ação.** A regra que organiza tudo: **o tempo é da Igreja, a ação é sua.**

### As cores

| Tempo | Cor | Token |
|---|---|---|
| Tempo Comum | verde | `#24694E` |
| Advento · Quaresma | roxo | `#4C3A7A` |
| Natal · Páscoa · festas | ouro sobre tinta | `#A9812F` |
| Pentecostes · mártires · Ramos | vermelho | `#9E2B25` |
| Gaudete · Laetare | rosa | `#B8697F` |

Calendário: **Romano geral + próprio do Brasil** (inclui Nossa Senhora Aparecida em 12/10). A Páscoa é calculável e define quase todo o resto.

### Tipografia nativa

SF Pro (`-apple-system`) para a interface e **New York** (`ui-serif` — a serifa que a Apple já embarca) para a capitular e as rubricas. **Nenhuma fonte importada.** Em iOS isso não imita a Apple: é o material real, e a serifa do sistema dá o registro litúrgico de graça.

### Por que isto resolve o que as versões anteriores não resolviam

1. **Riqueza e personalidade** — a identidade muda cinco vezes por ano em vez de ser uma paleta fixa.
2. **Pertence à igreja sem uma única imagem devocional** — a exigência nº 3 do briefing, resolvida pela cor em vez do clip-art.
3. **Não cheira a gerado** — é conhecimento de domínio, não padrão de UI.
4. **Manutenção zero** — o calendário é calculado, não curado.
5. **É fosso de produto e identidade na mesma decisão.** Nenhuma ferramenta genérica sabe que começou o Advento.

### A consequência que apareceu ao desenhar

Se o tempo veste o app, **ele veste também o post**. O conteúdo publicado no Instagram passa a respirar o ano junto com a ferramenta — o mesmo verde, o mesmo roxo, o mesmo ouro na festa da padroeira.

Telas em [`../design/identidade/`](../design/identidade/), página **V3**.

## 9d. O arquivo do Figma (05 set 2026)

**[CLJ NSR — Sistema](https://www.figma.com/design/CaCmCwkjD34BoLjEfoRxLP)** — onde as peças de interface passam a ser trabalhadas. Três páginas: *Fundações* (variáveis e a legenda), *Barras* (navegação) e *Selecionáveis*.

### Armadilha registrada

**A tipografia do arquivo não é a do produto.** SF Pro aparece na lista de fontes do Figma mas devolve largura zero — não renderiza neste ambiente; New York não existe. No arquivo elas estão substituídas por **Inter** e **Newsreader**. No código continua valendo a fonte do sistema (§9b). A legenda está escrita na página *Fundações* para quem abrir o arquivo.

### Limites do plano Starter

- **3 páginas** no máximo.
- **1 modo por coleção de variáveis.** No Professional, os cinco tempos litúrgicos virariam modos e o ano inteiro trocaria num clique — é o encaixe natural de §9c. Por ora cada tempo é uma variável nomeada.

### A navegação: uma peça, duas apresentações

| | Celular | Computador |
|---|---|---|
| **Navegação** | cápsula flutuante em vidro, destacada das bordas | sidebar de 264px sobre `superficie` |
| **Selecionado** | glifo preenchido + rótulo, ambos no azul da ação | linha em chip branco elevado, glifo tingido, texto em `tinta` |
| **Contagem** | selo azul sobre o glifo de Hoje | selo azul à direita da linha |
| **Barra do dia** | mini-player de vidro logo acima da barra de abas | acoplada ao rodapé da sidebar |

A **barra do dia** é o padrão do mini-player do Apple Music aplicado ao produto: persistente, mostra a próxima coisa a sair, e o envio está a um toque sem sair da tela. No Mac o mini-player mora no rodapé da sidebar — e é exatamente onde ela ficou.

O selo de contagem usa o **azul da ação**, não o vermelho de sistema: vermelho é cor litúrgica (mártires e Pentecostes) e não pode virar cor de alerta de interface.

Os glifos do arquivo são provisórios. No app são **SF Symbols** de verdade — o Expo SDK 57 traz native tabs com SF Symbols e Liquid Glass, com a variante preenchida no estado selecionado ([`decisoes-tecnicas.md`](decisoes-tecnicas.md) §1).

## 10. Status do design (2026-08-27)

- ✅ Identidade aplicada nos 21 artboards do canvas (desktop + mobile + componentes + marcas)
- ✅ Sidebar-terço e MobileNav como componentes reutilizados
- ✅ Contas em flat com anel-auréola (v2 — §3b)
- ✅ GSAP adotado como biblioteca de motion (§5); framer-motion removido do app
- 🔄 Identidade: reordenada (§9) — as telas vêm primeiro e a marca é extraída delas; nada de marca antes disso
- 🔄 Escala do participante: as opções A/B/C ficam como referência; a direção sai de uma rodada nova de **mockups simples**, decidida por facilidade de uso, não por estilo
- ⏳ Validar aplicação do terço com coordenação/pároco
- ⏳ Aplicar "O Fio" na UI do app web (tokens + sidebar-terço com GSAP)
- ⏳ Dark mode das telas (derivado, não invertido)
