# Identidade que se lembra — pesquisa para a v2 da identidade do CLJ NSR

Relatório de pesquisa. Escrito em **2026-09-07**, sobre o app fotografado nesse dia e sobre a
literatura científica e a prática dos estúdios que constroem identidades únicas e memoráveis.

**Para que serve:** é a entrega 1 de três. Ela **mapeia** como se cria uma identidade boa e única
(o que a ciência mediu, como os grandes trabalham, que perguntas fazem, de onde extraem estilo e
o que entregam). A entrega 2 é o **briefing refinado** com o que descobrimos aqui; a entrega 3 é a
**identidade v2 montada no Figma** e aplicada ao app. Este documento não decide a identidade —
ele decide *como* vamos decidir.

Registros que ele lê: [decisoes-design.md](decisoes-design.md) (a identidade v1 "O Fio"),
[sdd-projeto-completo.md](sdd-projeto-completo.md) (o app e as fases). O método de extração
usado na §5 é a skill `frontend-design-architect` da casa (as "Leis de Extração").

**Versão de leitura:** https://claude.ai/code/artifact/b5a9460f-9d6f-4e44-8206-019329565f4a

---

## Sumário

0. [Resumo executivo](#0-resumo-executivo)
1. [Diagnóstico: por que "bonito, mas genérico"](#1-diagnóstico-por-que-bonito-mas-genérico)
2. [O que a ciência diz sobre identidades memoráveis](#2-o-que-a-ciência-diz-sobre-identidades-memoráveis)
3. [Como os grandes estúdios pensam e trabalham](#3-como-os-grandes-estúdios-pensam-e-trabalham)
4. [O briefing: as perguntas que decidem](#4-o-briefing-as-perguntas-que-decidem)
5. [Mapeamento de estilo: de onde extrair, e como](#5-mapeamento-de-estilo-de-onde-extrair-e-como)
6. [Entregáveis de uma identidade completa](#6-entregáveis-de-uma-identidade-completa)
7. [Territórios para explorar no Figma (hipóteses, não decisões)](#7-territórios-para-explorar-no-figma-hipóteses-não-decisões)
8. [O plano daqui até a identidade v2](#8-o-plano-daqui-até-a-identidade-v2)
9. [Referências](#9-referências)
- [Apêndice A — Auditoria do app atual (checklist de teardown)](#apêndice-a--auditoria-do-app-atual-checklist-de-teardown)
- [Apêndice B — O briefing v2, pronto para preencher](#apêndice-b--o-briefing-v2-pronto-para-preencher)

---

## 0. Resumo executivo

**O diagnóstico em uma frase:** o app tem *estética clássica* alta (ordem, limpeza, capricho) e
*estética expressiva* quase nula (originalidade, quebra de convenção) — e a pesquisa mostra que
essas são duas dimensões independentes da beleza percebida (Lavie & Tractinsky, 2004; Moshagen &
Thielsch, 2010). "Bonito, mas genérico" é exatamente o nome desse quadrante.

**Onde a identidade v1 está:** a metáfora do terço, que é a ideia certa, ocupa uma fração
mínima dos pixels (contas de 12px, um anel de 3px, três pontinhos de separador). Tudo o que
ocupa área — tipografia, cards arredondados, pílulas, ícones de linha, sidebar + conteúdo,
formulário centralizado — vem do repertório padrão de produto (shadcn, Linear, Notion) e do
cluster "papel creme + serifa + um acento" que hoje qualquer ferramenta produz. A marca
"Auréola" (pontos em círculo) lê, em tamanho pequeno, como um indicador de carregamento.

**O que a ciência diz que muda isso, em ordem de retorno:**

1. **Ativos distintivos** que evoquem a marca na ausência do nome (Romaniuk, 2018): hoje só a
   voz ("Sua próxima conta", "Semana em dia ✓") e o azul da paróquia são candidatos; o resto é
   trocável por qualquer app.
2. **Tipografia carrega a personalidade** e afeta escolha: marcas em fonte "apropriada" foram
   escolhidas o dobro das vezes (Doyle & Bottomley, 2004). O trio atual (Source Serif 4 +
   Public Sans + IBM Plex Mono) é correto e neutro — não é *nosso*.
3. **Novidade sem perder tipicidade** (Hekkert et al., 2003, o "MAYA" de Loewy comprovado): a
   estrutura das telas (bottom nav, lista, manchete) deve continuar prototípica; a novidade
   entra na tipografia, no material e em um elemento-assinatura.
4. **Unidade na variedade** (Post et al., 2016): a variedade só agrada quando há uma lógica
   única sustentando — o "fio" precisa virar essa lógica em todas as telas, não só na sidebar.
5. **Um logotipo mais descritivo** é mais fácil de processar e lê como autêntico para marcas
   desconhecidas (Luffarelli et al., 2019) — e a nossa é desconhecida: a marca precisa *dizer*
   terço.

**O que fazemos com isso:** um briefing v2 (Apêndice B) respondido pela coordenação, três
territórios explorados no Figma em *stylescapes* (§7), testados com participantes em 5 segundos
e pelo "teste da troca" (cobre a marca: ainda é o CLJ?), e só então o sistema completo (§6).
Prazo estimado: três semanas, cabendo antes da Fase 8 do SDD (validação com o pároco) e sem
mover o piloto de outubro — desde que a decisão de território aconteça na primeira semana.

---

## 1. Diagnóstico: por que "bonito, mas genérico"

### 1.1 O que as telas mostram

Fotografadas em 2026-09-07 (participante a 390px, coordenação a 1280px; as imagens estão em
`docs/identidade/atual/`). A auditoria completa, no formato do checklist de teardown da casa,
está no Apêndice A. O resumo:

| Camada | O que existe | Leitura |
|---|---|---|
| **Tipografia** | Source Serif 4 (títulos), Public Sans (UI), IBM Plex Mono (kickers, datas) | trio competente e comum: é o "editorial default" de 2024–2026. Nenhuma das três tem sotaque; nenhuma é ligada ao assunto |
| **Cor** | papel `#FAF7F2`, tinta `#262320`, azul `#253990`, wash azul, dourado reservado | o azul é o único ativo herdado (é da paróquia); o papel creme é o fundo mais comum do cluster; os washes semânticos (verde/laranja/azul-claro) são os do shadcn |
| **Estrutura** | sidebar + conteúdo; cards de 16px de raio; pílulas; tabela; formulário centralizado num card | o esqueleto padrão de produto SaaS; em nada diz "paróquia", "terço" ou "departamento cultural" |
| **Ícones** | Lucide, traço fino | os mesmos de todo app; a bottom nav (lista, calendário, pessoa) não tem nada nosso |
| **A metáfora** | conta de 12px com anel de 3px; três pontinhos; kicker "Sua próxima conta"; a "dezena" como três circulinhos | presente, correta e **tímida**: ocupa talvez 3% da tela. Em 390px a dezena é ilegível como dezena |
| **Marca** | círculo de pontos + cruz | em 40px lê como *spinner*; em 20px, como um relógio. Não *diz* terço |
| **Motion** | "passar a conta" no sidebar (desktop) | invisível no celular, que é onde o participante está |
| **Voz** | "Sai na quinta às 7h · você é o responsável", "Semana em dia ✓" | **o ativo mais distintivo do app hoje** — e é texto |

O que está *certo* e não pode ser perdido: a decisão de reverência (a metáfora organiza, não
enfeita), a hierarquia manchete → sinal → detalhe, a voz em segunda pessoa, o azul da paróquia
como única cor de ação, e o dourado reservado à celebração. A v2 não recomeça do zero: ela dá
corpo ao que a v1 decidiu e não executou.

### 1.2 Leitura pelos frameworks

**Ativos distintivos (Romaniuk / Ehrenberg-Bass).** Um ativo distintivo é qualquer elemento que
evoque a marca *sem o nome* — cor, forma, tipo, som, frase, personagem. Mede-se em dois eixos:
**fama** (quantas pessoas ligam o elemento à marca) e **unicidade** (quão exclusivo ele é). A
grade de decisão: famoso e único → *use e proteja*; único mas não famoso → *invista*; famoso mas
não único → *evite apoiar-se nele*; nenhum dos dois → *teste ou ignore* (Romaniuk, 2018).
Aplicado ao app:

| Elemento | Unicidade | Fama (no departamento) | Decisão |
|---|---|---|---|
| Azul `#253990` | baixa fora da paróquia, **alta dentro** se a paróquia o usa consistentemente (pergunta do briefing) | potencialmente alta | investir: nomear e usar sem diluição |
| Conta + anel-auréola | alta | nula (ninguém viu ainda) | investir — mas em tamanho que se veja |
| Marca "Auréola" | média (colide com spinner) | nula | testar; provavelmente redesenhar para *dizer* terço |
| Voz ("Sua próxima conta") | alta | nula | investir: é o ativo mais barato de tornar famoso |
| Papel creme + serifa | nula (é o cluster) | — | não apoiar a identidade nisso |
| Motion "passar a conta" | alta | nula, invisível no celular | levar ao celular ou não contar com ele |

**Estética clássica × expressiva (Lavie & Tractinsky, 2004).** Usuários avaliam beleza em duas
dimensões independentes: a *clássica* (ordenado, claro, limpo, simétrico) e a *expressiva*
(original, fascinante, usa efeitos especiais, quebra convenções). O VisAWI (Moshagen & Thielsch,
2010) refina em quatro facetas: **simplicidade**, **diversidade**, **colorido**, **capricho**. O
app pontua alto em simplicidade e capricho, baixo em diversidade e colorido. É a assinatura
numérica do "bonito, mas genérico". A v2 tem de subir diversidade (variedade com unidade) sem
descer simplicidade.

**Tipicidade × novidade (Hekkert, Snelders & van Wieringen, 2003).** Em três estudos, tipicidade
e novidade explicam igualmente a preferência estética, mas *suprimem uma à outra*: as pessoas
preferem o novo desde que continue típico, e o típico desde que não custe novidade. É a prova
empírica do MAYA de Raymond Loewy ("most advanced, yet acceptable"). Tradução para nós:
**a estrutura de uso continua típica** (bottom nav com 4 destinos, lista, calendário-grade,
tabela na gestão) e **a novidade entra onde não custa usabilidade** — tipografia, material,
marca, o elemento-assinatura, a voz.

**Códigos residuais, dominantes e emergentes (semiótica aplicada; Lawes; Valentine).** Toda
categoria tem códigos visuais do passado (residuais), do presente (dominantes) e do que está
surgindo (emergentes). Mapear os três diz onde uma marca *não* deve ficar. Para "apps e
comunicação de paróquia":

| Código | Exemplos | Onde o app está |
|---|---|---|
| Residual | pomba de clip-art, degradê dourado, foto de mãos em oração, Trajan/Papyrus, azul-céu com nuvens | longe (bom) |
| Dominante | (a) "app católico premium": fundo escuro, calma, serifa, ouro discreto (Hallow); (b) "ferramenta genérica": dashboard branco, cards, ícones de linha | **aqui, no (b)** |
| Emergente | editorial devocional (revistas e missais recentes com tipografia contemporânea), craft/impresso (papel, carimbo, rubrica), identidades tipográficas com sotaque local, motion como estrutura | é para onde a v2 deve ir |

**Primeira impressão em 50 ms.** Julgamentos de apelo visual se formam em 50 ms (Lindgaard et
al., 2006) e são afetados por complexidade visual e prototipicidade já nos primeiros 50 ms (Tuch
et al., 2012); modelos de colorido e complexidade explicam metade da variância do apelo em 500 ms
(Reinecke et al., 2013). Consequência: a identidade precisa ser reconhecível **na tela parada, em
390px, em meio segundo** — não pode depender de motion nem de leitura.

### 1.3 Os cinco problemas, nomeados

1. **A metáfora é anã.** O terço está nos 12px da conta e nos 5px das Ave-Marias. Nada que ocupe
   área pertence à ideia. → *A v2 precisa dar ao fio um papel estrutural em toda tela.*
2. **A marca não diz o que é.** Pontos em círculo = spinner. Logotipos descritivos são
   processados mais facilmente e lidos como autênticos, com efeito maior justamente em marcas
   desconhecidas (Luffarelli, Mukesh & Mahmood, 2019). → *Redesenhar para que se leia "terço" em
   16px.*
3. **A tipografia é neutra.** Serifas são lidas como tradicionais e sans como casuais (Shaikh,
   Chaparro & Fox, 2006); a apropriação fonte–produto dobra a escolha (Doyle & Bottomley, 2004);
   seis dimensões de forma (elaborado, harmonia, natural, floreio, peso, comprimido) governam a
   impressão (Henderson, Giese & Cote, 2004). O trio atual é "harmonia alta, natural médio,
   elaborado zero": correto, sem voz. → *Escolher ao menos uma face com sotaque.*
4. **Estrutura de catálogo.** Cards arredondados com sombra suave, pílulas, ícones de linha e
   formulário centralizado num card são os "tells" que a própria skill da casa lista como
   AI-slop. → *Trocar card por plano, pílula por tipo, ícone genérico por ícone nosso.*
5. **Sem mundo material.** O papel é creme, mas não é papel; a rubrica, o missal, a folhinha, o
   azulejo, a conta de madeira ou madrepérola, o cordão — nada do universo real do assunto está
   presente. → *Escolher um mundo (§7) e deixá-lo decidir textura, cor, rótulo e ritmo.*

---

## 2. O que a ciência diz sobre identidades memoráveis

Esta seção resume o que foi *medido*, com a fonte. Onde a evidência é fraca ou comercial, está
dito.

### 2.1 Memória: por que uma identidade "gruda"

- **Exposição repetida gera preferência** (Zajonc, 1968, o *mere exposure effect*): a fama de
  um ativo vem de repetição consistente. Trocar de logotipo, cor ou tipo a cada redesign zera o
  contador. Corolário: escolher poucos ativos e repeti-los em todo ponto de contato.
- **Fluência de processamento** (Reber, Schwarz & Winkielman, 2004): o que é mais fácil de
  perceber e processar é julgado mais belo e mais verdadeiro. Explica por que simplicidade e
  alto contraste ajudam — e por que uma fonte difícil de ler faz uma tarefa parecer mais
  difícil (Song & Schwarz, 2008). Distintivo, sim; ilegível, nunca.
- **Isolamento** (von Restorff, 1933): o item que difere dos vizinhos é lembrado. Uma
  identidade se torna memorável *na comparação com a categoria*, não em abstrato. Daí o
  mapeamento de códigos (§1.2): saber o que todos fazem para fazer diferente no que importa.
- **Superioridade da imagem sobre a palavra** na memória de longo prazo: um símbolo que *diz* o
  conceito (o terço) é lembrado mais que um nome. Reforça o problema 2 de §1.3.

### 2.2 Beleza e usabilidade não competem — mas se confundem

- "O que é belo é usável" (Tractinsky, Katz & Ikar, 2000; antes, Kurosu & Kashimura, 1995): a
  estética percebida contamina a usabilidade percebida, inclusive depois do uso. Uma identidade
  forte compra tolerância a pequenos atritos — e uma fraca faz atritos parecerem maiores.
- Emoção em três níveis (Norman, 2004): visceral (o primeiro olhar), comportamental (o uso),
  reflexivo (o que a pessoa diz de si ao usar). A v1 cobre o comportamental. A v2 mira o
  visceral (50 ms) e o reflexivo ("eu sou do Cultural").
- Modelo hedônico/pragmático (Hassenzahl, 2003): produtos são julgados pelo que *fazem* e pelo
  que *dizem sobre quem usa*. Para voluntários jovens, o segundo é o que faz abrir o app sem
  lembrete.

### 2.3 Cor

- Matizes mapeiam em personalidade de marca: vermelho excita, azul comunica competência;
  saturação e valor amplificam traços (Labrecque & Milne, 2012). O azul da paróquia é
  "competente/confiável" — bom para a coordenação; a v2 precisa de um segundo registro para
  o "caloroso" prometido na personalidade.
- Associações cor–emoção são amplamente universais (similaridade média r = .88 entre 30 nações),
  moduladas por proximidade linguística e geográfica (Jonauskaite et al., 2020). Podemos confiar
  no azul como serenidade e no vermelho como energia sem pesquisa própria.
- Preferência por cor é ecológica: gostamos das cores dos objetos de que gostamos (Palmer &
  Schloss, 2010). Uma cor que *vem de um objeto do nosso mundo* (o lápis-lazúli do manto, o
  vermelho da rubrica, o azul do azulejo) carrega a afeição pelo objeto.
- Dado cultural, não psicológico: o **azul mariano** vem do ultramar de lápis-lazúli, pigmento
  mais caro que ouro, reservado ao manto da Virgem como ato de devoção (Wikipedia, *Marian
  blue*; TheCollector). O azul `#253990` da paróquia tem uma história para contar — e hoje o
  app não conta.

### 2.4 Tipografia

- Fontes têm personalidade percebida por família (Shaikh, Chaparro & Fox, 2006) e seis
  dimensões de forma que governam impressões de "agradável, envolvente, tranquilizador,
  proeminente" (Henderson, Giese & Cote, 2004).
- Apropriação fonte–produto dobra a escolha da marca; a apropriação depende da congruência de
  *potência* e *atividade* entre fonte e produto (Doyle & Bottomley, 2004; Bottomley & Doyle,
  2006, o mesmo para cor).
- Dificuldade de leitura é lida como dificuldade da tarefa (Song & Schwarz, 2008). Uma face
  com caráter para títulos; uma face sem atrito para corpo.
- O que nenhum estudo diz: "qual fonte". O método é escolher pela congruência com a
  personalidade decidida no briefing (§4) e testar em 5 segundos (§5.4).

### 2.5 Forma e logotipo

- Logotipos circulares ativam "suavidade/conforto"; angulares, "dureza/durabilidade" — e isso
  contamina o julgamento dos atributos do produto (Jiang, Gorn, Galli & Chattopadhyay, 2016).
  Contas são círculos: a forma já diz "acolhimento".
- Logotipos assimétricos sobem a percepção de "excitante" e beneficiam marcas com essa
  personalidade; prejudicam marcas de personalidade "sincera/serena" (Luffarelli,
  Stamatogiannakis & Yang, 2019). Para nós: simetria.
- Logotipos descritivos: mais fáceis de processar, mais autênticos, efeito forte em marcas
  desconhecidas, revertido em categorias de associação negativa (Luffarelli, Mukesh & Mahmood,
  2019). Para nós: descritivo (que se leia terço, cruz, dezena).
- Guias empíricos de logotipo: naturalidade, harmonia e elaboração moderada produzem afeto e
  reconhecimento (Henderson & Cote, 1998).

### 2.6 Personalidade e voz

- Cinco dimensões de personalidade de marca — sinceridade, excitação, competência, sofisticação,
  robustez (Aaker, 1997). Nossa v1 escolheu "caloroso · caprichado · confiável" = sinceridade +
  competência. O design holístico deve casar: marcas sinceras pedem design *natural*;
  competentes, *delicado* (Orth & Malkewitz, 2008 — em embalagens, mas o mapa transfere).
- Tom de voz tem quatro dimensões medíveis — humor, formalidade, respeito, entusiasmo — e afeta
  a percepção de amigável, confiável e desejável; tons conversacionais e entusiasmados
  performaram melhor (Moran / NN/g, 2016). A voz da v1 já está aqui: casual, respeitosa,
  serena, sem humor. A v2 deve *escrever* isso como guia com exemplos.
- Arquétipos de marca (Mark & Pearson, 2001) são populares em agências, mas a base empírica é
  fraca; usar como vocabulário de conversa, não como método.

### 2.7 Metáfora e significado

- Metáforas estruturam o pensamento, não só a linguagem (Lakoff & Johnson, 1980). "A escala é um
  terço" é uma metáfora estrutural: contas em sequência, uma por dia, com uma oração por conta.
  Ela dá *regras* (ordem, ritmo, completar a dezena), não só imagens. É por isso que serve de
  espinha para um sistema — e por que decorá-la a enfraquece.
- Inovação guiada por significado (Verganti, 2009): produtos memoráveis mudam o *sentido* do
  uso ("não é uma planilha, é o seu terço da semana") antes de mudar a função.
- Semântica de produto (Krippendorff, 2006; Vignelli, 2010: *semantics, syntactics,
  pragmatics*): a forma deve nascer do significado, ser sintaticamente disciplinada e
  pragmaticamente útil. É a régua para julgar cada elemento da v2: *o que isto significa? é
  consistente com o sistema? serve a quem usa?*

### 2.8 Movimento

- Animação ajuda a construir mapas mentais quando comunica *relações* (Bederson & Boltman,
  1999) e, vinda dos princípios do desenho animado, torna interfaces mais compreensíveis quando
  respeita *solidez, exagero controlado e reforço* (Chang & Ungar, 1993, sobre os 12 princípios
  de Thomas & Johnston). A assinatura "passar a conta" é exatamente isso — mas precisa existir
  onde o participante está (celular).
- O que a literatura de HCI reforça: motion tem de ser opcional (`prefers-reduced-motion`) e
  nunca ser a única portadora de informação. A identidade parada tem de bastar.

### 2.9 Unidade e variedade

- Unidade e variedade contribuem separadamente para o prazer estético e, combinadas,
  maximizam-no; a variedade só é apreciada quando há unidade (Post, Blijlevens & Hekkert, 2016;
  replicado para sites em 2017). É a licença científica para a v2 ser *mais variada* (texturas,
  tamanhos, ritmo) desde que uma lógica única — o fio — atravesse tudo.

### 2.10 Onde ter cautela

- O **teste de 5 segundos** é valioso para primeira impressão de apelo visual, mas não para
  julgar qualidade de informação nem usabilidade (Gronier, 2016). Usar para escolher território,
  não para validar telas.
- Dados de marketing (Buffer, agências) e livros de prática (Neumeier, Wheeler) são
  *prescrições*, não experimentos. Estão em §3 como método, não como evidência.

---

## 3. Como os grandes estúdios pensam e trabalham

### 3.1 O modo de pensar (o que se repete em todos)

| Princípio | Quem o formulou | Como se aplica aqui |
|---|---|---|
| **Uma ideia, não um estilo.** A identidade nasce de uma ideia central que se pode dizer em uma frase; o estilo é consequência. | Paul Rand ("são necessidades, não desejos; ideias, não estilos de tipo, que determinam a forma"); Wolff Olins ("central idea"); Bierut | Nossa ideia já existe: *a escala é um terço*. O problema da v1 é execução, não ideia. |
| **Apresentar uma solução, com o raciocínio.** Rand entregou a Steve Jobs um único logotipo para a NeXT, num livreto de ~100 páginas que constrói o argumento até a revelação; Jobs aceitou sem revisão. | Rand, 1986 | O Figma da v2 conta a história do território escolhido antes de mostrar a tela. Exploramos três (§7); apresentamos uma. |
| **Semântica → sintaxe → pragmática.** Entender o objeto, disciplinar a gramática visual, servir ao uso. | Vignelli, *The Vignelli Canon* (2010) | Cada elemento da v2 responde: o que significa, como se encaixa, para que serve. |
| **Imersão no mundo do cliente.** A equipe do DesignStudio viajou e se hospedou em casas de anfitriões antes de desenhar o Bélo da Airbnb sob a ideia "belong anywhere". | DesignStudio, 2014 | Antes do Figma: uma reunião do departamento, um batch de posts, o Instagram da paróquia, a folhinha na parede de alguém. |
| **A ideia vira sistema, não logotipo.** A identidade da Amsterdam Sinfonietta (Studio Dumbar) é um código que transforma música em padrões; o logotipo é o menor pedaço. | Studio Dumbar | O fio e a conta têm de virar regras de layout, ritmo e motion — não um ícone na sidebar. |
| **Tipo feito para a ideia.** A Tátil levou o logotipo do Rio 2016 a mais de 50 versões e chamou um tipógrafo porque nenhuma fonte pronta tinha o DNA do símbolo. | Tátil / Fred Gelli, 2009–2012 | Não vamos desenhar uma fonte; mas a escolha da face é uma decisão de identidade, não de conveniência. |
| **"Quando todos vão para um lado, vá para o outro."** Diferença radical, dita em uma frase de "onliness": *nossa marca é a única ___ que ___*. | Neumeier, *Zag* (2006), *The Brand Gap* (2003) | "O CLJ NSR é a única plataforma de escala que é um terço." Se a frase não se vê na tela, falhou. |
| **A marca não é o que você diz; é o que eles dizem.** | Neumeier | Teste com participantes, não com a coordenação. |
| **Beleza é função.** | Sagmeister & Walsh, *Beauty* (2018) | Não pedir desculpas por capricho: o capricho é o que faz o jovem abrir. |
| **Restrição como identidade.** Poucas fontes, poucas cores, muita disciplina. | Vignelli; Rand; Cauduro (modernismo brasileiro) | A v2 pode ser mais expressiva sem ser mais *cheia*. |

### 3.2 Os processos formais

**Wheeler — cinco fases** (*Designing Brand Identity*): 1) pesquisa e análise; 2) estratégia de
marca e identidade; 3) design da identidade; 4) aplicações (pontos de contato); 5) gestão dos
ativos. Guiado por quatro perguntas: *Quem é você? Quem precisa saber? Por que deveriam se
importar? Como vão descobrir?* Estamos entre a fase 1 (este relatório) e a 2 (briefing v2).

**GV Brand Sprint** (Knapp, 2017) — três horas, seis exercícios, em ordem: mapa de 20 anos;
o quê / como / por quê; três valores principais; três audiências principais; réguas de
personalidade (sliders); paisagem competitiva numa matriz 2×2. Saída: seis quadros
fotografados = o guia de marca. É o formato do nosso workshop (§8), adaptado: "20 anos" vira
"o departamento em 2030".

**Mood boards** funcionam por cinco papéis (Lucero, 2012): *enquadrar* o problema, *alinhar* a
equipe, *paradoxar* (juntar ideias conflitantes de propósito), *abstrair* (juntar o concreto e
o abstrato) e *dirigir* o resto do processo. Um mood board bom tem paradoxo dentro: "reverente
e jovem", "impresso e vivo".

**Style tiles** (Warren, 2012): um artefato entre mood board e tela — tipografia, cor,
texturas, um botão, um título, uma frase da voz — para conversar sobre "cara" sem discutir
layout. **Stylescapes** (Chris Do / The Futur): a mesma ideia estendida numa faixa horizontal
que mostra o território aplicado a três ou quatro pontos de contato. É o que vamos produzir
por território (§7) no Figma.

**Auditoria de ativos distintivos** (Romaniuk, 2018): listar todo elemento candidato, medir
fama e unicidade com o público real, decidir por quadrante. A versão de bolso para ~12
pessoas: mostrar elementos isolados (a conta, o azul, a marca, uma frase) e perguntar "de que
isto é?".

**Princípios de design** que decidem brigas: um princípio bom é *reversível* (dá para afirmar
o oposto e ainda ser uma escolha válida) e *específico* (Spool; Bowles). Os cinco da v1 passam
no teste ("a manchete é a sua próxima conta" — o oposto, "abrir no mês", é uma escolha válida
que rejeitamos). A v2 herda os cinco e acrescenta os que o território exigir.

### 3.3 Como eles apresentam

- **O livreto de Rand**: contexto → problema → a ideia → a forma, passo a passo → aplicações →
  a revelação. Uma solução. O leitor chega ao logotipo já convencido.
- **O estudo de caso de Pentagram/Bierut**: a ideia em uma frase, os esboços e as rejeições
  ("os clientes não gostaram disto, e por quê"), a aplicação em todos os pontos de contato.
- **O manual de marca**: ideia central → ativos (marca, cor, tipo, forma, motion, voz) → regras
  (espaço, tamanho mínimo, o que nunca fazer) → aplicações → como pedir mais.
- **Para o nosso caso**: um único arquivo Figma organizado como o livreto (Capa → A ideia →
  Territórios explorados → O território escolhido → Sistema → Telas → Aplicações) e um
  `docs/identidade-v2.md` que é o manual.

---

## 4. O briefing: as perguntas que decidem

### 4.1 O cânone (de onde as perguntas vêm)

| Fonte | Perguntas centrais |
|---|---|
| Wheeler | Quem é você? Quem precisa saber? Por que deveriam se importar? Como vão descobrir? |
| Neumeier | Quem é você? O que faz? Por que importa? + a frase de *onliness* |
| GV Sprint | Onde a organização está em 5/10/20 anos? Por quê / como / o quê? Três valores. Três audiências. Réguas de personalidade. Quem são os "concorrentes" e onde estamos no mapa? |
| Rand | Qual é o *problema*? (não: "o que você quer que pareça") |
| Sinek | Por quê, antes de como e o quê |
| Millman / Bierut | Se a marca entrasse na sala, quem seria? O que ela nunca faria? |
| Holt (*cultural branding*) | Que tensão cultural a marca resolve? |
| Semiótica | Quais são os códigos residuais, dominantes e emergentes da categoria? |
| A casa (skill) | Qual é o conceito nomeado? Que mundo material? Qual é a assinatura? Que "tells" genéricos vamos recusar? |

### 4.2 As perguntas que a v1 nunca fez (e a v2 tem de fazer)

Perguntas para a **coordenação** (30 min):

1. Se o departamento fosse uma pessoa na missa de domingo, quem seria — idade, roupa, jeito
   de falar, o que carrega na mão?
2. O que o CLJ NSR **nunca** pode parecer? (Três coisas. Exemplos para provocar: "app de
   banco", "Instagram", "material de catequese infantil", "software de empresa".)
3. Que **objeto físico** do departamento ou da paróquia vocês gostariam de ver na tela — a
   folhinha na parede, o terço de dedo, o azulejo da igreja, o boletim, o Canva dos posts?
4. O azul `#253990`: de onde vem, onde a paróquia o usa (fachada, Instagram, boletim, camisa)?
   É *da* paróquia ou *de um* material?
5. Quando um participante abre o app na fila do ônibus, o que ele deve **sentir** em meio
   segundo (uma palavra)? E o que a coordenação deve sentir ao abrir a gestão?
6. Qual foi a última coisa *bonita* que o departamento fez — um post, um cartaz, um evento? O
   que a tornou bonita?
7. Que outras marcas/apps/materiais católicos vocês acham *bonitos* e quais acham *feios*?
   (Isto mapeia os códigos.) E fora do universo católico?
8. O departamento em 2030: o que existe que hoje não existe?
9. Réguas (0–10): reverente ↔ leve; impresso ↔ digital; sereno ↔ energético; comunidade ↔
   ferramenta; tradição ↔ contemporâneo. *Onde a v1 está* e *onde deveria estar*.
10. Frase de *onliness*, preenchida por vocês: "O CLJ NSR é a única ___ que ___."

Perguntas para o **pároco** (10 min, depois de ver o app):

11. A metáfora do terço na estrutura (fio, contas, dezena) é reverente ou decorativa?
12. Há algum uso que seria inadequado — a dezena como progresso, o "carimbo", a cruz na
    marca em tamanho pequeno?
13. Que cor, imagem ou palavra a paróquia considera *sua*?

Perguntas para **três participantes** (5 min cada, sem a coordenação presente):

14. (Mostrando a tela Hoje por 5 s) O que é isto? De quem é? Como se sente?
15. (Mostrando a conta com anel, a marca e o azul, isolados) De que é isto?
16. Qual app você abre sem pensar todo dia? O que ele tem que este não tem?

### 4.3 O que o briefing precisa *concluir* (o contrato para o Figma)

- O **conceito nomeado** confirmado ou revisto ("O Fio" ou outro nome com a mesma ideia).
- A **personalidade em três adjetivos** com as réguas marcadas.
- A **frase de onliness**.
- O **mundo material** escolhido (§7) — ou os dois finalistas para o Figma testar.
- A **lista "isso não"** (códigos a recusar).
- Os **ativos a proteger** (o que da v1 fica).
- **Quem decide** e **até quando**.

O formulário pronto está no Apêndice B.

---

## 5. Mapeamento de estilo: de onde extrair, e como

### 5.1 Primeiro, o mundo do próprio assunto

A regra de ouro dos estúdios que fazem identidades únicas é que a distinção vem do *assunto*,
não do repertório de design. Tudo que qualquer designer pode achar no Dribbble, qualquer
designer vai achar. O que só nós temos é o universo real do Departamento Cultural de uma
paróquia de Nossa Senhora do Rosário. Inventário de fontes de estilo **desse** mundo, com o que
cada uma pode dar:

| Fonte | O que ela tem | O que pode virar |
|---|---|---|
| **O terço como objeto** | contas de madeira, vidro, madrepérola, açaí; o cordão; o nó; a medalha central; o tamanho da mão | material (fosco, não brilhante), o cordão como linha estrutural, a "medalha" como lugar da manchete |
| **O terço de dedo / a dezena** | um anel com dez saliências e uma cruz; cabe no dedo; é *portátil* | a metáfora exata da semana no celular: a dezena que se passa com o polegar |
| **Os mistérios por dia da semana** | seg. Gozosos · ter. Dolorosos · qua. Gloriosos · qui. Luminosos · sex. Dolorosos · sáb. Gozosos · dom. Gloriosos (*Rosarium Virginis Mariae*, 2002) | um ritmo semanal real que o calendário pode carregar com sobriedade (um rótulo, uma cor terciária) — a validar com o pároco |
| **O azul mariano** | ultramar de lápis-lazúli, pigmento mais caro que ouro, reservado ao manto de Maria; o azul `#253990` da paróquia | nomear a cor ("Azul do Rosário"), contar a história no manual, usá-la como o único acento — sem diluir em washes |
| **A rubrica** | nos missais, instruções em vermelho e texto em preto — um sistema de dois registros com mil anos | um segundo registro tipográfico e cromático legítimo: *o que se faz* (rubrica) vs *o que se lê* (texto). Status, ações e avisos podem ser "rubricados" |
| **A Folhinha do Sagrado Coração** | calendário devocional de parede, Editora Vozes, desde 1940, em mais de um milhão de casas; um dia por folha, o santo do dia, a frase, a leitura | a referência editorial brasileira mais reconhecível para "um dia = uma folha"; a tela Hoje é uma folhinha |
| **O boletim paroquial / o santinho** | tipografia de impressão barata, uma cor + preto, papel fino, marca d'água | materialidade impressa honesta; o "carimbo Publicado" é dessa família |
| **Azulejo português e o barroco sacro brasileiro** | azul-e-branco geométrico, padrões que se repetem, talha dourada | um sistema de padrão (fundo, vazios, capas) — risco alto de decoração; só se o briefing pedir |
| **A fachada, o vitral, a imagem de N. Sra. do Rosário da paróquia** | as cores reais, as proporções, a tipografia da placa | a paleta terciária e a prova de que a cor é *da* paróquia |
| **O Instagram do departamento** | os posts que já existem, os templates do Canva, os Stories do Terço Diário | consistência entre o que o participante faz e o que o app mostra; o app deve parecer do mesmo lugar que o post |
| **A fala do departamento** | como o grupo de WhatsApp escreve, as gírias, o "amém", o "bora" | a voz — o ativo mais distintivo que já temos, para ser escrito como guia |

### 5.2 Depois, os repositórios — para aprender gramática, não para copiar

| Para quê | Onde |
|---|---|
| Identidades e redesigns comentados | Brand New (UnderConsideration); It's Nice That; Design Week; Mindsparkle; Behance (curadoria, não busca) |
| Tipografia em uso, por contexto | Fonts In Use (tem filtro por "religion"); Typewolf; Type-Atlas |
| Fundições com sotaque | **Brasil:** Plau (Rio), Blackletra (SP), Fabio Haag Type (Porto Alegre), Naipe Foundry; **América Latina em código aberto (Google Fonts):** Huerta Tipográfica (Alegreya, Alegreya Sans, Piazzolla, Bitter), Omnibus-Type (Faustina, Asap); **catálogos:** Future Fonts, Fontstand (aluguel), Velvetyne (livre) |
| Padrões de UI reais em apps | Mobbin; Refero; Page Flows; Screenlane |
| Sites com ponto de vista | Siteinspire; Godly; Minimal Gallery; httpster; Land-book |
| Coleções visuais e "cosmos" pessoais | Are.na; Cosmos; Savee |
| Acervos abertos de arte sacra, manuscritos e impressos | Rijksmuseum (acesso aberto); The Met Open Access; Biblioteca Nacional Digital (Brasil); Internet Archive (missais, folhinhas antigas); Public Domain Review; Letterform Archive |
| Cor | Adobe Color; Realtime Colors (teste em interface); o próprio *ecological valence*: fotografar o objeto |
| Motion | os *reels* de estúdios (Studio Dumbar, DIA, Porto Rocha, ManvsMachine); Material Motion e HIG só como piso |

Regra de triangulação: **nunca uma referência só, nunca só referências de design**. Três mundos
no mínimo (ex.: um objeto sacro, um impresso brasileiro, uma identidade tipográfica
contemporânea) fundidos num só sistema.

### 5.3 Como extrair (as Leis da casa, resumidas)

As dez leis de extração da skill `frontend-design-architect` — *tokens, não pixels; escala de
tipo primeiro; cor por papel; ritmo espacial; geometria; assinatura de motion; a jogada única
reinterpretada; hierarquia; quarentena de IP; sintetizar, não colar* — são o método. Para
cada referência, preencher o checklist de teardown (Apêndice A mostra o formato aplicado ao
nosso próprio app). Depois, a síntese: uma frase de direção, um rascunho de tokens, os
princípios, a lista de quarentena.

Duas adições para *este* projeto:

- **Lei 11 — O assunto desempata.** Quando duas referências de design conflitam, vence a que o
  mundo do assunto (§5.1) sustenta. Uma textura de papel só entra se a folhinha ou o boletim
  a justificarem; um degradê só entra se o vitral o justificar.
- **Lei 12 — Reverência antes de novidade.** Qualquer extração que use o terço para *enfeitar*
  (contas como confete, cruz como ícone de "sucesso") é descartada antes de ir ao Figma.

### 5.4 Os testes que dizem se ficou único

| Teste | Como | O que responde |
|---|---|---|
| **5 segundos** (Gronier, 2016; usar só para apelo) | mostrar a tela Hoje de cada território por 5 s a 5 participantes; perguntar "o que era? de quem? como se sente?" | primeira impressão e reconhecimento |
| **Troca de marca** (Bierut) | cobrir a marca e o nome; perguntar "de que app é?" | se a identidade vive fora do logotipo |
| **Ativo isolado** (Romaniuk) | mostrar a conta, o azul, uma frase, a marca — sozinhos | quais elementos já apontam para nós |
| **Squint / miniatura** | reduzir a 25% e desfocar | se a hierarquia e a assinatura sobrevivem a 50 ms |
| **Réguas antes/depois** | as réguas de §4.2 marcadas para v1 e para cada território | se movemos na direção certa |
| **Reverência** | o pároco vê a tela por 2 minutos | se pode existir |
| **AA + reduced-motion + 44px** | ferramentas | se pode ser usado |

---

## 6. Entregáveis de uma identidade completa

O que os grandes entregam, na ordem em que entregam, e o que cada peça significa para nós.

### 6.1 Estratégia (sai do briefing)

1. **Plataforma de marca**: propósito, ideia central, três valores, personalidade, réguas,
   frase de onliness, audiências em ordem, lista "isso não".
2. **Princípios de design** (cinco da v1 + os novos), cada um com o que rejeita.
3. **Mapa de códigos** da categoria (residual / dominante / emergente) com a posição da v2.

### 6.2 Identidade (sai do Figma)

4. **Conceito nomeado** e a história que o manual conta (o terço, o azul, a rubrica…).
5. **Marca**: símbolo (que *diz* terço), logotipo, lockups (horizontal, empilhado), versão
   mínima 16px (favicon, avatar de WhatsApp), versão monocromática, área de respiro, tamanho
   mínimo, usos proibidos.
6. **Cor**: paleta nomeada por papel (papel, tinta, o azul, a rubrica, a celebração, semânticas)
   com a história de cada cor, pares aprovados em AA, dark mode derivado por papel.
7. **Tipografia**: as faces (com licença resolvida), a escala modular, pesos, regras de caixa e
   tracking, o que cada face *faz* (título, corpo, rubrica/data), exemplos de manchete.
8. **Forma e material**: geometria (raio, linhas, planos), o cordão como elemento estrutural, a
   conta em todos os tamanhos e estados, texturas permitidas.
9. **Iconografia**: um conjunto próprio para os 4 destinos da bottom nav e os 5 tipos de
   atividade, desenhado na gramática da conta — não Lucide.
10. **Motion**: princípios, tokens de duração/easing, a assinatura ("passar a conta") no
    celular e no desktop, os dois momentos de fanfarra, o comportamento em reduced-motion.
11. **Voz e tom**: a régua de quatro dimensões marcada, dez frases-modelo por situação
    (manchete, vazio, erro, convite, troca, celebração), palavras que usamos / não usamos.
12. **Aplicações**: as 12 telas do app nas duas densidades; avatar e capa do grupo de
    WhatsApp; template de Story do Terço Diário coerente com o app; o link de convite (a
    primeira coisa que o participante vê); a tela de login como cartão de visita.

### 6.3 Sistema (sai do Figma para o código)

13. **Tokens** como variáveis do Figma e como `globals.css` (`@theme`), uma fonte só.
14. **Componentes** re-estilizados com estados (default, hover, foco, ativo, desabilitado,
    vazio, erro), no Figma e em `components/`.
15. **Manual** (`docs/identidade-v2.md`): a versão em texto do arquivo Figma, com o que nunca
    fazer.
16. **Kit de ativos**: SVGs da marca, ícones, fontes, paleta em ASE/JSON.

### 6.4 Governança

17. **Auditoria de ativos** repetida a cada seis meses (fama e unicidade com o departamento).
18. **Critérios de aceite** de qualquer tela nova: os testes de §5.4.

### 6.5 Estrutura do arquivo Figma

```
CLJ NSR — Identidade v2
├─ 00 Capa e índice
├─ 01 A ideia (briefing v2 resumido, onliness, réguas, "isso não")
├─ 02 Mundo (mood boards por território — objetos, impressos, cor, tipo; paradoxos marcados)
├─ 03 Territórios (um stylescape por território: tipo, cor, material, marca, tela Hoje 390px, Story)
├─ 04 Testes (5 s, troca de marca, ativo isolado — resultados e decisão)
├─ 05 Marca (símbolo, lockups, mínimos, proibições)
├─ 06 Cor (papéis, história, pares AA, dark)
├─ 07 Tipografia (faces, escala, regras, exemplos)
├─ 08 Forma, material e ícones
├─ 09 Motion (storyboards da assinatura; link do protótipo)
├─ 10 Voz (régua e frases-modelo)
├─ 11 Componentes (variantes e estados; variáveis = tokens)
├─ 12 Telas (12 telas × 2 densidades)
└─ 13 Aplicações (WhatsApp, Story, convite, login)
```

---

## 7. Territórios para explorar no Figma (hipóteses, não decisões)

A pesquisa não decide; ela recomenda explorar **três** territórios que já passam pela Lei 11
(o assunto sustenta) e pela Lei 12 (reverência). Cada um é uma tese de uma linha, um mundo
material, uma fonte de estilo do §5.1, uma assinatura possível e um risco nomeado. O briefing
pode matar um, e o teste de 5 segundos escolhe entre os que sobrarem.

### T1 — "A Folhinha"

- **Tese:** o app é a folhinha devocional do departamento — um dia por folha, o que é seu
  escrito grande, o resto miúdo embaixo.
- **Mundo:** impresso brasileiro de parede; papel fino; uma cor + preto; a rubrica em vermelho
  para *o que se faz*; o azul da paróquia para *o que é seu*.
- **De onde extrai:** Folhinha do Sagrado Coração (Vozes, desde 1940); missal (rubrica);
  boletim; tipografia de impressão.
- **Tipografia provável:** uma serifa com sotaque latino-americano para a manchete (família
  Alegreya/Piazzolla como candidatas abertas; Blackletra ou Plau se houver orçamento) e um sans
  humanista sem atrito no corpo.
- **Assinatura:** a folha do dia "vira" ao passar (motion) e a data ocupa a área que hoje é um
  kicker de 11px.
- **Força:** é o território mais *brasileiro* e mais *editorial*; resolve o problema 5 (mundo
  material) e o 3 (tipografia) de uma vez; a tela Hoje já é uma folhinha em espírito.
- **Risco:** virar "vintage"; a rubrica vermelha competir com o azul (regra: rubrica só em
  texto pequeno de ação, nunca em área).

### T2 — "Contas"

- **Tese:** a conta é o sistema inteiro — grande, tátil, com peso; o cordão é a espinha de toda
  tela; a semana é uma dezena que se passa com o polegar.
- **Mundo:** o terço de dedo; madeira fosca, madrepérola; o nó; a medalha.
- **De onde extrai:** o objeto real (fotografar o terço da paróquia); a geometria da dezena; a
  identidade v1 (é a continuação dela, com corpo).
- **Tipografia provável:** um sans com caráter e formas redondas (para rimar com a conta) em
  todos os papéis, mais uma serifa só na manchete.
- **Assinatura:** "passar a conta" no celular — arrastar a conta da semana preenche-a; a bottom
  nav são quatro contas no cordão; a marca é uma dezena que se completa com a semana.
- **Força:** é a execução plena da ideia que já foi decidida; motion-first como Studio Dumbar;
  o mais único no teste de troca de marca.
- **Risco:** gamificação do sagrado (a Lei 12 vigia); contas grandes gastam área em 390px;
  depende de motion para brilhar — a versão parada precisa passar sozinha nos 50 ms.

### T3 — "Azul do Rosário"

- **Tese:** uma cor, uma história: o azul do manto como a única voz visual; papel quase
  branco, tinta quase preta, e o azul usado como *marca-texto* e como *plano* nos momentos que
  importam; geometria de azulejo nos vazios.
- **Mundo:** lápis-lazúli; azulejo português; vitral; a fachada da paróquia.
- **De onde extrai:** história do azul mariano; padrões de azulejo (só como estrutura de grade,
  nunca como estampa cheia); a placa e o Instagram da paróquia.
- **Tipografia provável:** uma serifa clássica de alto contraste para a manchete (tipo
  Cormorant/Spectral como abertas) e um grotesk contemporâneo no corpo — tensão tradição ×
  contemporâneo.
- **Assinatura:** o azul "entra" na tela como um plano que desliza (a manchete nasce azul
  sobre papel); os dias com compromisso no calendário são azulejos preenchidos.
- **Força:** o mais fácil de tornar famoso (uma cor só, repetida); o mais "paróquia"; funciona
  parado.
- **Risco:** o azul é a cor mais comum do mundo das marcas — a unicidade vem da *história e do
  uso*, não da cor; a geometria de azulejo vira decoração com facilidade.

**O que os três têm em comum** (e portanto já está decidido pela pesquisa): o azul da paróquia
como único acento; a voz da v1; reverência; estrutura de uso típica; uma face com sotaque; a
marca redesenhada para *dizer* terço; ícones próprios; a assinatura levada ao celular.

---

## 8. O plano daqui até a identidade v2

| Semana | Etapa | Entrega | Quem |
|---|---|---|---|
| 1 | **Briefing v2** — workshop de 3 h no formato GV (adaptado) com a coordenação; 10 min com o pároco; 3 conversas de 5 min com participantes | Apêndice B preenchido; réguas; onliness; lista "isso não"; mundo material escolhido ou os finalistas | coordenação + design |
| 1 | **Imersão** — uma reunião do departamento, o Instagram, a folhinha, o terço da paróquia fotografado, a fachada | mood boards por território (Figma, página 02) | design |
| 2 | **Territórios** — um stylescape por território sobrevivente: tipo, cor, material, marca, tela Hoje em 390px, um Story | Figma, página 03 | design |
| 2 | **Testes** — 5 s com 5 participantes; troca de marca; ativo isolado; réguas antes/depois; olhar do pároco | Figma, página 04, com a decisão | design + participantes + pároco |
| 3 | **Sistema** — marca, cor, tipo, forma, ícones, motion, voz, componentes, tokens | Figma, páginas 05–11; `docs/identidade-v2.md` | design |
| 3 | **Telas e aplicações** — as 12 telas em duas densidades; WhatsApp, Story, convite, login | Figma, páginas 12–13 | design |
| 4 | **Código** — tokens em `globals.css`, componentes `fio/` e `ui/` re-estilizados, ícones, motion no celular; regressão de AA e testes | app | dev |

**Como isso se encaixa no SDD:** a identidade v2 entra **antes** da Fase 8 (validação com o
pároco) — o pároco deve ver a v2, não a v1 — e antes da Fase 9 (produção). A semana 4 se
sobrepõe à Fase 10. O piloto de outubro continua de pé se a decisão de território acontecer
até o fim da semana 2; se atrasar, a decisão honesta é adiar o piloto, não lançar com a v1.
Registrar a decisão no §11 do SDD.

**O que a coordenação precisa fazer agora:** marcar o workshop de 3 h e responder as perguntas
1–10 do Apêndice B (podem ser respondidas por escrito antes, para o workshop discutir e não
começar do zero).

---

## 9. Referências

Artigos e livros citados, com os links usados na verificação. Ordem alfabética.

- Aaker, J. L. (1997). *Dimensions of brand personality.* Journal of Marketing Research, 34(3), 347–356.
- Bederson, B. B., & Boltman, A. (1999). *Does animation help users build mental maps of spatial information?* IEEE InfoVis.
- Bottomley, P. A., & Doyle, J. R. (2006). *The interactive effects of colors and products on perceptions of brand logo appropriateness.* Marketing Theory, 6(1). https://journals.sagepub.com/doi/10.1177/1470593106061263
- Chang, B.-W., & Ungar, D. (1993). *Animation: From cartoons to the user interface.* UIST '93.
- Doyle, J. R., & Bottomley, P. A. (2004). *Font appropriateness and brand choice.* Journal of Business Research, 57(8), 873–880. https://www.sciencedirect.com/science/article/abs/pii/S0148296302004873
- Gronier, G. (2016). *Measuring the first impression: Testing the validity of the 5 second test.* Journal of Usability Studies, 12(1). https://www.guillaumegronier.com/resources/2016_JUS_Gronier.pdf
- Hassenzahl, M. (2003). *The thing and I: Understanding the relationship between user and product.* In Funology. Kluwer.
- Hekkert, P., Snelders, D., & van Wieringen, P. C. W. (2003). *'Most advanced, yet acceptable': Typicality and novelty as joint predictors of aesthetic preference in industrial design.* British Journal of Psychology, 94(1), 111–124. https://bpspsychub.onlinelibrary.wiley.com/doi/abs/10.1348/000712603762842147
- Henderson, P. W., & Cote, J. A. (1998). *Guidelines for selecting or modifying logos.* Journal of Marketing, 62(2), 14–30.
- Henderson, P. W., Giese, J. L., & Cote, J. A. (2004). *Impression management using typeface design.* Journal of Marketing, 68(4), 60–72. https://journals.sagepub.com/doi/10.1509/jmkg.68.4.60.42736
- Jiang, Y., Gorn, G. J., Galli, M., & Chattopadhyay, A. (2016). *Does your company have the right logo? How and why circular- and angular-logo shapes influence brand attribute judgments.* Journal of Consumer Research, 42(5), 709–726. https://academic.oup.com/jcr/article-abstract/42/5/709/1855577
- Jonauskaite, D., et al. (2020). *Universal patterns in color-emotion associations are further shaped by linguistic and geographic proximity.* Psychological Science, 31(10). https://journals.sagepub.com/doi/10.1177/0956797620948810
- Knapp, J. (2017). *The three-hour brand sprint.* GV Library. https://medium.com/gv-library/the-three-hour-brand-sprint-3ccabf4b768a
- Krippendorff, K. (2006). *The semantic turn: A new foundation for design.* CRC Press.
- Kurosu, M., & Kashimura, K. (1995). *Apparent usability vs. inherent usability.* CHI '95.
- Labrecque, L. I., & Milne, G. R. (2012). *Exciting red and competent blue: The importance of color in marketing.* Journal of the Academy of Marketing Science, 40, 711–727. https://link.springer.com/article/10.1007/s11747-010-0245-y
- Lakoff, G., & Johnson, M. (1980). *Metaphors we live by.* University of Chicago Press.
- Lavie, T., & Tractinsky, N. (2004). *Assessing dimensions of perceived visual aesthetics of web sites.* International Journal of Human-Computer Studies, 60(3), 269–298. https://www.semanticscholar.org/paper/512309493ea08f4d923b7ffc4ca7e2cd363a0ea2
- Lawes, R. *De-mystifying semiotics: Some key questions answered.* https://lawes-consulting.co.uk/wp-content/uploads/2018/06/280009435-lawes-demystifying-semiotics-final-edited.pdf
- Lindgaard, G., Fernandes, G., Dudek, C., & Brown, J. (2006). *Attention web designers: You have 50 milliseconds to make a good first impression!* Behaviour & Information Technology, 25(2), 115–126. https://www.tandfonline.com/doi/abs/10.1080/01449290500330448
- Lucero, A. (2012). *Framing, aligning, paradoxing, abstracting, and directing: How design mood boards work.* DIS '12. https://users.aalto.fi/~luceroa1/publications/2012/lucero12_moodboards.pdf
- Luffarelli, J., Mukesh, M., & Mahmood, A. (2019). *Let the logo do the talking: The influence of logo descriptiveness on brand equity.* Journal of Marketing Research, 56(5). https://journals.sagepub.com/doi/abs/10.1177/0022243719845000
- Luffarelli, J., Stamatogiannakis, A., & Yang, H. (2019). *The visual asymmetry effect: An interplay of logo design and brand personality on brand equity.* Journal of Marketing Research, 56(1). https://journals.sagepub.com/doi/abs/10.1177/0022243718820548
- Mark, M., & Pearson, C. S. (2001). *The hero and the outlaw.* McGraw-Hill. (base empírica fraca; vocabulário apenas)
- Moran, K. (2016). *The impact of tone of voice on users' brand perception.* Nielsen Norman Group. https://www.nngroup.com/articles/tone-voice-users/ ; *The four dimensions of tone of voice.* https://www.nngroup.com/articles/tone-of-voice-dimensions/
- Moshagen, M., & Thielsch, M. T. (2010). *Facets of visual aesthetics.* International Journal of Human-Computer Studies, 68(10), 689–709. http://www.thielsch.org/download/paper/moshagen_2010.pdf
- Neumeier, M. (2003). *The brand gap.* New Riders. — (2006). *Zag.* New Riders. https://en.wikipedia.org/wiki/Marty_Neumeier
- Norman, D. A. (2004). *Emotional design.* Basic Books.
- Orth, U. R., & Malkewitz, K. (2008). *Holistic package design and consumer brand impressions.* Journal of Marketing, 72(3), 64–81. https://journals.sagepub.com/doi/10.1509/JMKG.72.3.064
- Palmer, S. E., & Schloss, K. B. (2010). *An ecological valence theory of human color preference.* PNAS, 107(19), 8877–8882.
- Post, R. A. G., Blijlevens, J., & Hekkert, P. (2016). *'To preserve unity while almost allowing for chaos': Testing the aesthetic principle of unity-in-variety in product design.* Acta Psychologica, 163, 142–152. https://www.sciencedirect.com/science/article/abs/pii/S0001691815300858
- Rand, P. (1986). *The sign of the next generation of computers for education* (livreto de apresentação a Steve Jobs). https://www.logodesignlove.com/next-logo-paul-rand
- Reber, R., Schwarz, N., & Winkielman, P. (2004). *Processing fluency and aesthetic pleasure.* Personality and Social Psychology Review, 8(4), 364–382.
- Reinecke, K., et al. (2013). *Predicting users' first impressions of website aesthetics with a quantification of perceived visual complexity and colorfulness.* CHI '13. https://dl.acm.org/doi/10.1145/2470654.2481281
- Romaniuk, J. (2018). *Building distinctive brand assets.* Oxford University Press. https://global.oup.com/academic/product/building-distinctive-brand-assets-9780190311506
- Sagmeister, S., & Walsh, J. (2018). *Beauty.* Phaidon.
- Shaikh, A. D., Chaparro, B. S., & Fox, D. (2006). *Perception of fonts: Perceived personality traits and uses.* Usability News, 8(1). https://soma.sbcc.edu/users/russotti/113/personality_Shaikh.pdf
- Song, H., & Schwarz, N. (2008). *If it's hard to read, it's hard to do.* Psychological Science, 19(10), 986–988.
- Tractinsky, N., Katz, A. S., & Ikar, D. (2000). *What is beautiful is usable.* Interacting with Computers, 13(2), 127–145.
- Tuch, A. N., Presslaber, E. E., Stöcklin, M., Opwis, K., & Bargas-Avila, J. A. (2012). *The role of visual complexity and prototypicality regarding first impression of websites.* International Journal of Human-Computer Studies, 70(11), 794–811. https://www.sciencedirect.com/science/article/abs/pii/S1071581912001127
- Verganti, R. (2009). *Design-driven innovation.* Harvard Business Press.
- Vignelli, M. (2010). *The Vignelli Canon.* https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf
- von Restorff, H. (1933). *Über die Wirkung von Bereichsbildungen im Spurenfeld.* Psychologische Forschung, 18, 299–342.
- Warren, S. (2012). *Style tiles and how they work.* A List Apart. https://alistapart.com/article/style-tiles-and-how-they-work/
- Wheeler, A. (2017). *Designing brand identity* (5ª ed.). Wiley. https://logogeek.uk/podcast/design-a-brand-identity-with-alina-wheeler/
- Zajonc, R. B. (1968). *Attitudinal effects of mere exposure.* Journal of Personality and Social Psychology, 9(2, Pt. 2), 1–27.

Estúdios e casos: Tátil / Rio 2016 (https://www.designweek.co.uk/issues/may-2012/designing-the-rio-2016-olympics/ ; https://site.tatil.com.br/cases/rio2016); DesignStudio / Airbnb (https://www.dezeen.com/2014/07/16/airbnb-rebrand-designstudio-logo-belo/); Studio Dumbar / Amsterdam Sinfonietta (https://studiodumbar.com/work/amsterdam-sinfonietta); Bierut, M. (2015). *How to use graphic design to sell things…* Harper Design; Plau (https://typenetwork.com/type-foundries/plau); Blackletra (https://blackletra.com/about); Fabio Haag Type (https://fabiohaagtype.com/en/who-we-are/).

Mundo do assunto: Marian blue (https://en.wikipedia.org/wiki/Marian_blue ; https://www.thecollector.com/artists-used-the-rarest-pigment-for-mary/); rubricação (https://en.wikipedia.org/wiki/Rubrication); Folhinha do Sagrado Coração de Jesus, Editora Vozes, desde 1940 (https://franciscanos.org.br/noticias/folhinha-do-sagrado-celebra-80-anos-em-2019.html); *Rosarium Virginis Mariae* (João Paulo II, 2002), §§19 e 38, distribuição dos mistérios pelos dias da semana.

---

## Apêndice A — Auditoria do app atual (checklist de teardown)

Formato da skill da casa, aplicado ao nosso próprio app em 2026-09-07.

```
REFERENCE: CLJ NSR v1 — app em web/, telas em docs/identidade/atual/
First impression (3 words):     limpo, sereno, previsível
TYPE
  Display family + feel:        Source Serif 4 600/700 — editorial, correta, sem sotaque
  Body family + feel:           Public Sans 400–800 — neutra (é a fonte do governo dos EUA)
  Utility:                      IBM Plex Mono 500/600 uppercase, tracking 0.07–0.09em — "kicker de
                                dashboard", o mesmo dispositivo que todo app editorial de 2024–26
  Weights in use:               400 / 500 / 600 / 700
  Modular ratio (measured):     ~1.2 (13.5 → 16 → 19 → 23 → 28)
  Case/tracking rules:          kickers uppercase mono; datas em tabular-nums
COLOR (by role)
  background:                   #FAF7F2 (papel creme — o fundo mais comum do cluster)
  surface:                      #FFFFFF cards
  ink 1/2/3:                    #262320 / #5A544E / #756C64
  accent:                       #253990 (azul da paróquia) + wash #E4E7F7 — único ativo herdado
  reserved:                     dourado (celebração) — decisão certa, quase nunca visível
  semantic:                     verde/laranja/azul-claro em washes — os do shadcn
  Saturation strategy:          neutros mornos + um acento saturado; contraste AA
SPACE
  Base unit: 4px   Scale: 4/8/12/16/24/32   Density: generosa
GEOMETRY
  Radius:                       16px em cards, 8px em botões, pílulas em filtros/status
  Borders:                      hairline 1px #E4DDD0
  Elevation:                    quase plana; sombra sutil nos cards — "shadcn suave"
MOTION
  What animates:                sidebar "passar a conta" (desktop); AgendaList em stagger
  Distance/duration/easing:     4px / 240–420ms / power3.out; stagger 35ms
  What stays still:             tudo no celular (a assinatura não existe lá)
HIERARCHY
  Manchete (card wash azul) → sua semana (lista) → departamento (lista). Correta e forte.
SIGNATURE MOVE
  A conta com anel-auréola no item ativo; "Sua próxima conta" como kicker. Existe, é boa, é
  pequena demais para ser vista.
IP TO QUARANTINE
  — (é nosso)
WHAT WE KEEP → WHAT WE LEAVE
  Keep: ideia "O Fio"; hierarquia; voz; azul único; dourado reservado; reverência; bottom nav 4.
  Leave: trio tipográfico neutro; card arredondado como unidade; pílulas; ícones Lucide; marca
         que lê como spinner; metáfora em 12px; ausência de mundo material; assinatura só no
         desktop.
```

Elementos por quadrante de ativos distintivos (fama medida em 0 até o teste com participantes):

| Quadrante | Elementos |
|---|---|
| Investir (único, sem fama) | conta + anel; voz; "passar a conta"; azul nomeado |
| Testar | marca Auréola (unicidade duvidosa: spinner) |
| Não apoiar | papel creme; serifa+sans+mono; cards; pílulas; ícones Lucide |

---

## Apêndice B — O briefing v2, pronto para preencher

Responda por escrito antes do workshop; o workshop discute, não começa do zero.

**Bloco 1 — Quem somos (coordenação)**

1. O departamento em 2030: o que existe que hoje não existe? _____
2. Por que o departamento existe (uma frase, sem "para")? _____
3. Como fazemos isso de um jeito que ninguém mais faz? _____
4. Três valores, em ordem: _____ / _____ / _____
5. Três audiências, em ordem (a v1 diz: participante no celular, coordenador no desktop,
   nunca "usuário avançado"): confirmar ou mudar. _____

**Bloco 2 — Personalidade**

6. Se o departamento fosse uma pessoa na missa de domingo, quem seria? _____
7. Réguas (marque 0–10, para *hoje* e para *como deveria ser*):
   - reverente 0 ———— 10 leve: hoje __ / deveria __
   - impresso 0 ———— 10 digital: hoje __ / deveria __
   - sereno 0 ———— 10 energético: hoje __ / deveria __
   - comunidade 0 ———— 10 ferramenta: hoje __ / deveria __
   - tradição 0 ———— 10 contemporâneo: hoje __ / deveria __
   - sério 0 ———— 10 bem-humorado: hoje __ / deveria __
8. O que o CLJ NSR **nunca** pode parecer (três): _____ / _____ / _____
9. O que o participante deve sentir em meio segundo (uma palavra): _____
   O que a coordenação deve sentir ao abrir a gestão (uma palavra): _____

**Bloco 3 — Mundo**

10. Objetos físicos do departamento/paróquia que gostariam de ver na tela: _____
11. O azul `#253990`: de onde vem e onde a paróquia o usa? _____
12. A última coisa bonita que o departamento fez, e por que era bonita: _____
13. Marcas/apps/materiais católicos que acham bonitos: _____ ; feios: _____
    Fora do universo católico, bonitos: _____
14. Como o grupo escreve (três expressões típicas): _____

**Bloco 4 — Posição**

15. Frase de onliness: "O CLJ NSR é a única _____ que _____."
16. Mapa 2×2 (eixos sugeridos: reverente ↔ leve; ferramenta ↔ comunidade): onde estão a
    planilha, o WhatsApp, Hallow, um app de tarefas, e onde queremos estar. _____

**Bloco 5 — Reverência (pároco)**

17. A metáfora do terço na estrutura é reverente ou decorativa? _____
18. Algum uso inadequado (dezena como progresso, carimbo, cruz pequena)? _____
19. Cor, imagem ou palavra que a paróquia considera sua: _____

**Bloco 6 — Participantes (três pessoas, sem a coordenação)**

20. (Tela Hoje, 5 s) O que é? De quem é? Como se sente? _____
21. (Conta, azul, marca, frase — isolados) De que é isto? _____
22. Que app você abre sem pensar todo dia, e o que ele tem que este não tem? _____

**Bloco 7 — Decisão**

23. Quem decide o território: _____ Até quando: _____
24. Ativos da v1 que ficam, custe o que custar: _____
25. Orçamento para tipografia (R$ 0 / até R$ 500 / mais): _____
