# SDD — Ciclo Mínimo

**Software Design Document do ciclo mínimo do CLJ NSR.** Define o que o app faz, quadro a quadro, com precisão suficiente para implementar. Pressupõe [`00-intuito.md`](00-intuito.md), [`decisoes-produto.md`](decisoes-produto.md) e [`decisoes-tecnicas.md`](decisoes-tecnicas.md). Criado em **2026-09-04**.

**Mockups:** https://claude.ai/code/artifact/3177926d-6655-43ca-b515-635248309102 · fontes em [`../design/ciclo-minimo/`](../design/ciclo-minimo/)

## 1. A regra de acoplamento

**Mockup e SDD são um par. Toda alteração física em um artboard muda a seção correspondente deste documento, no mesmo commit — e o contrário também vale.** Um mockup que mostra um botão que este documento não define é um bug; uma regra aqui que nenhum quadro mostra é uma regra que ainda não foi desenhada.

| Artboard | Página | Seção |
|---|---|---|
| `Main.dc.html` — Montar o mês, computador | Fase A | §4.1 |
| `EscalaCelular.dc.html` — Montar o mês, celular | Fase A | §4.1 |
| `ProducaoLote.dc.html` — Produzir em lote | Fase A | §4.5 |
| `Biblioteca.dc.html` — Biblioteca de mídia | Fase A | §4.6 |
| `CoordenadorHoje.dc.html` — O dia, computador | Fase A | §4.3 |
| `CoordenadorCelular.dc.html` — O dia, celular | Fase A | §4.3 |
| `Disparo.dc.html` — Sai com um toque | Fase A | §4.4 |
| `Mensagens.dc.html` — A voz do app | Fase A | §5 |
| `ParticipanteHoje.dc.html` — Participante vê o que é dele | Fase B | §4.2 |
| `Troca.dc.html` — Trocar dia | Fase B | §4.7 |

## 2. Escopo — e as duas fases

O ciclo mínimo é o menor laço fechado que entrega o produto: **monta → sabe → cobra → sai.** Ele acontece em duas fases, e a divisão é o que torna a v1 entregável ([`00-intuito.md`](00-intuito.md) §5).

### Fase A — um usuário

O app serve **só o coordenador**. Ele monta a escala, produz o conteúdo em lote, e todo dia recebe do app a lista do que sai e de quem está devendo — com cada mensagem já escrita, a um toque.

Consequência que corta o caminho crítico pela metade: **sem convite, sem login de terceiros, sem permissões, sem push.** O app é útil no primeiro dia, com uma pessoa, sem depender de ninguém adotar nada.

Funciona **no celular e no computador**, porque a montagem é sessão longa (computador) e o disparo do dia é de qualquer lugar (celular).

### Fase B — o departamento

Participantes entram por convite, veem só o que é deles, passam a receber os lembretes direto (em vez de passar pelas mãos do coordenador) e trocam de dia entre si.

**A diferença entre as fases é o destinatário, não o mecanismo.** As mesmas regras de §6 valem nas duas — na Fase A elas terminam num toque do coordenador; na Fase B, numa entrega direta.

### Fora do ciclo

Calendário, reuniões, gestão de funções, cadastro completo. E, na fase 2, o corte de vídeo assistido por IA ([`decisoes-tecnicas.md`](decisoes-tecnicas.md) §8.1) — que alimenta a biblioteca de §4.6.

## 3. Atores

| Ator | No ciclo |
|---|---|
| **Coordenador** | monta a escala, publica, acompanha o dia, pode disparar por qualquer um |
| **Responsável** | a pessoa escalada para uma atividade num dia — recebe os avisos, confirma, dispara |
| **Suplente** | assume quando o responsável não pode; só entra no ciclo de avisos ao assumir |
| **O app** | lembra, cobra e prepara. Nunca publica sozinho em lugar nenhum |

O coordenador é frequentemente também responsável. As telas não mudam por causa disso — o que muda é o que ele vê a mais.

## 4. O ciclo

### 4.1 O coordenador monta o mês

**Tela:** desktop. Lista do mês inteiro, agrupada por semana, uma linha por atividade: data · atividade · responsável · suplente · status.

- Atribuir é o gesto principal: uma atividade sem responsável mostra **+ Definir** em destaque e status **Sem dono**.
- Suplente é opcional e a ausência é explícita (`— sem suplente`), nunca um espaço vazio.
- **Quanto cada um pegou**: contagem por pessoa no mês, sempre visível. Existe porque rodízio justo só funciona se for verificável — é a recomendação central da pesquisa de gestão de voluntários.
- **Publicar escala** é o gatilho de todo o resto: antes de publicar, ninguém recebe nada e nenhum participante vê o mês.
- **Regra:** a escala não pode ser publicada com atividade sem responsável. O aviso no topo diz quantas faltam.
- **Repetir de agosto** copia a estrutura do mês anterior (atividades e funções, não as pessoas).

**No celular** (`EscalaCelular.dc.html`) a mesma tela vira lista de um toque: um filtro **Só o que falta** já ativo por padrão — porque no celular a tarefa é fechar as lacunas, não revisar o mês inteiro —, a pessoa como chip tocável, e **Publicar escala** fixo no rodapé. A contagem por pessoa não cabe como tabela: vira uma linha de texto ("você pegou 7 e a Beatriz pegou 1").

### 4.2 O participante vê o que é dele

**Tela:** celular. Três camadas, na ordem de [`decisoes-design.md`](decisoes-design.md) §6.

- **Manchete** — uma coisa só: o que é seu hoje, a que horas, e se o conteúdo já está pronto. Ação primária **Abrir e enviar**; ação secundária **Não vou conseguir** (aciona §6.4).
- **Depois de hoje** — no máximo 3 itens, com a distinção visual entre ser responsável (disco cheio) e ser suplente (anel).
- **Fecho sereno** — quando não há nada atrasado, a tela diz isso em uma linha. Nunca um contador vazio, nunca punição.
- Sem manchete (nada hoje), a tela abre em "Depois de hoje" e o fecho vira a manchete.

### 4.3 O app cobra

**Tela:** desktop, o que o coordenador abre todo dia.

- **Precisa sair hoje** — uma linha por atividade do dia com horário, responsável e se confirmou. Quem confirmou aparece com a hora da confirmação; quem não confirmou mostra **quando o app vai lembrar**, e um botão para cobrar antes disso.
- **Não saiu ontem** — separado e em destaque de alerta. Ações: **Passar para o suplente** e **Já publiquei**. Nunca "cobrar de novo" como ação principal: se o app já lembrou duas vezes, o problema não se resolve com uma terceira.
- **O que sai hoje pelas suas mãos** (Fase A) — a agenda do que precisa ser mandado, com horário, destinatário e a mensagem já escrita. Cada linha tem um **Enviar**. O app decide o quê, quando e para quem; o coordenador só toca.
- **Na Fase B** essa coluna vira acompanhamento: as mesmas mensagens passam a sair sozinhas, para os participantes, e o coordenador só vê que saíram.
- O coordenador nunca precisa **lembrar** de nada para o ciclo funcionar — nem na Fase A, onde ele ainda aperta o botão. Se ele precisar lembrar, o ciclo falhou.

**No celular** (`CoordenadorCelular.dc.html`) a tela abre pelo número: *"3 mensagens para você mandar"*. É a tarefa do dia em uma linha. Abaixo, as três com botão de enviar, e o alerta do que não saiu ontem. Nada mais — o resto se faz no computador.

### 4.4 Sai com um toque

**Tela:** celular, do responsável do dia (o coordenador chega nela pelo **Ver conteúdo** de §4.3).

- **Texto pronto** — o conteúdo exato que vai para o grupo, visível por inteiro antes de enviar.
- **Imagem do dia** — o arquivo anexado, com quem enviou e quando. Opcional: uma atividade pode ser só texto.
- **Enviar no WhatsApp** — abre o WhatsApp com o texto já escrito (`wa.me` / Web Share, [`decisoes-tecnicas.md`](decisoes-tecnicas.md) §4). Sob o botão, uma linha explica que a pessoa escolhe o grupo. O app **não** escolhe o grupo e **não** envia sozinho.
- **Copiar texto** e **Editar** como secundárias; **Já publiquei** fecha o ciclo.
- **Regra:** tocar em Enviar não marca como publicado. Só **Já publiquei** marca — porque o app não tem como saber se a mensagem foi mesmo enviada.

### 4.5 Produzir em lote

**Tela:** desktop. A sessão mensal que sustenta a constância — batching, a maior alavanca da pesquisa de gestão de voluntários.

- **Cabeçalho conta o progresso**: "12 de 20 com conteúdo pronto". A tela existe para esse número chegar a 20.
- **Lista à esquerda**: só o que falta, em ordem de data; o que já está pronto aparece esmaecido com um visto. A selecionada é destacada.
- **Composição à direita**: texto que vai para o grupo e a mídia, escolhida da biblioteca (§4.6).
- **A ação principal é `Salvar e ir para a próxima`**, não "Salvar". A diferença é o produto inteiro: o gesto é encadeado, e o coordenador atravessa o mês sem voltar à lista.
- **Pular** existe e não pune — uma atividade sem conteúdo continua na lista.

### 4.6 Biblioteca de mídia

**Tela:** desktop. Onde imagem e vídeo moram, separados da atividade que os usa.

- Grade com miniatura, nome, tamanho, data e **onde foi usada** — ou o rótulo `não usada`.
- Filtros: tudo · imagens · vídeos · **não usadas**. O último é o que importa: material enviado e esquecido é desperdício.
- Um arquivo pode ser usado em mais de uma atividade; apagar um arquivo em uso é bloqueado.
- **É o ponto de entrada da fase 2**: os cortes prontos do pipeline de vídeo caem aqui, e §4.5 os encontra sem passo extra ([`decisoes-tecnicas.md`](decisoes-tecnicas.md) §8.1).

### 4.7 Trocar dia — Fase B

**Tela:** celular, do participante.

- Mostra a atividade que a pessoa quer passar, e **quem tem disponibilidade** — com quantas atividades cada um já tem no mês, para a troca não recair sempre no mesmo.
- Quem já tem compromisso naquele dia aparece como **ocupado**, sem botão.
- **Oferecer para o departamento** é a saída quando ninguém específico serve.
- **Regra que decide o desenho: a troca vale quando a outra pessoa aceita. O coordenador é avisado e não aprova.** Exigir aprovação transformaria troca em pedido de permissão — que é exatamente o atrito que a pesquisa aponta como causa de desistência.
- A troca fica registrada e substitui o responsável para efeito de §6.

## 5. A voz do app

O texto exato de cada mensagem automática está no artboard `Mensagens.dc.html`. Regras que valem para todas:

- Segunda pessoa, ordem fixa: **situação → o que é seu → um próximo passo**.
- **Aviso é serviço, não cobrança** ([`decisoes-design.md`](decisoes-design.md) §7.4). Toda mensagem de atraso oferece uma saída sem culpa.
- **Nunca no grupo.** Lembrete e cobrança vão no privado. O que vai ao grupo é conteúdo e celebração — nunca a falha de alguém. Essa é a razão de o app existir.
- O dourado só aparece na mensagem de aniversário — o único uso de celebração ([`decisoes-design.md`](decisoes-design.md) §3).

## 6. Regras de disparo

| # | Quando | Para quem | O quê |
|---|---|---|---|
| 6.1 | 18:00 do dia anterior | responsável | Véspera: o que é seu amanhã, e como passar adiante |
| 6.2 | 4h antes do horário | responsável **que não confirmou** | Lembrete do dia |
| 6.3 | 2h depois do horário, sem confirmação | responsável (coordenador vê no painel) | Não saiu |
| 6.4 | quando o responsável toca em "Não vou conseguir" | suplente, e o coordenador | Assunção da suplência |
| 6.5 | 07:00 do dia | coordenador | Aniversário: texto pronto para o grupo, a um toque |
| 6.6 | quando a outra pessoa aceita a troca (§4.7, Fase B) | quem pediu, quem aceitou, e o coordenador | Troca confirmada |

**As regras são as mesmas nas duas fases; muda só o último passo.** Na Fase A todo disparo termina numa lista de "mandar agora" com um toque do coordenador; na Fase B ele sai direto para o destinatário. A lógica de *quando* e *para quem* é idêntica — e é por isso que a Fase B não é reescrita, é religação.

Invariantes:

- **Idempotência:** o app nunca manda a mesma mensagem duas vezes para a mesma pessoa no mesmo dia. Todo disparo fica registrado.
- **Quem confirmou não recebe.** A confirmação encerra o ciclo de avisos daquela atividade.
- **Sem escala publicada, nada dispara.**
- **A suplência substitui o destinatário**, não acumula: ao assumir, o suplente entra em 6.1–6.3 e o responsável original sai. Uma troca aceita (§4.7) faz o mesmo.
- Toda regra de horário nasce em `web/lib/` com teste, isolada de data real ([`decisoes-tecnicas.md`](decisoes-tecnicas.md) §6).

## 7. O que o modelo de dados precisa ganhar

Confrontado com estes quadros, o `lib/types.ts` atual não sustenta o ciclo. Falta:

| Campo / entidade | Onde | Por causa de |
|---|---|---|
| `dataNascimento` | `Pessoa` | §6.5 |
| `horario` | `Atividade` | §4.1, §4.3, §6.1–6.3 — hoje só existe `data` |
| `texto` | `Atividade` | §4.4 — o conteúdo que vai ao grupo |
| `confirmadoEm` | `Atividade` | §4.4, §6.2, §6.3 |
| `assumidaPeloSuplenteEm` | `Atividade` | §6.4 |
| `Disparo` (entidade nova) | — | invariante de idempotência de §6 |
| `EscalaMes` com `publicadaEm` | — | §4.1, "sem escala publicada nada dispara" |
| `Midia` (entidade nova: nome, tipo, tamanho, enviadaEm) | — | §4.6 — hoje só existe `Atividade.linkMidia`, uma string solta |
| `Atividade.midiaId` substituindo `linkMidia` | `Atividade` | §4.5, §4.6 — mídia é entidade, não texto |
| `Troca` (entidade nova: atividade, de, para, pedidaEm, aceitaEm) | — | §4.7, §6.6 |

Na **Fase A** nada disso precisa de RLS nem de papéis: há um usuário. As permissões entram com a Fase B, e é bom que entrem depois — é a parte mais fácil de errar.

## 8. O que os mockups ainda não mostram

Registrado para não passar por decidido:

- Estados de carregamento e de erro.
- O mês vazio (primeira vez que o coordenador abre).
- O participante sem nenhuma atividade no mês.
- O fluxo de convite e a definição de senha (é a porta do ciclo, mas ainda não tem quadro).
- O upload em si (arrastar arquivo, progresso, erro de formato) — §4.6 mostra a biblioteca cheia, não o envio.
- O mês vazio na produção em lote: 20 de 20 faltando.
- A tela de aceite da troca, do lado de quem recebe o pedido (§4.7 mostra só quem pede).

## 9. Fora do ciclo mínimo

Instagram (o Business Suite publica), push nativo, widget, dark mode, multi-departamento. Ver [`00-intuito.md`](00-intuito.md) §7.
