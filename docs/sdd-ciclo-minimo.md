# SDD — Ciclo Mínimo

**Software Design Document do ciclo mínimo do CLJ NSR.** Define o que o app faz, quadro a quadro, com precisão suficiente para implementar. Pressupõe [`00-intuito.md`](00-intuito.md), [`decisoes-produto.md`](decisoes-produto.md) e [`decisoes-tecnicas.md`](decisoes-tecnicas.md). Criado em **2026-09-04**.

**Mockups:** https://claude.ai/code/artifact/3177926d-6655-43ca-b515-635248309102 · fontes em [`../design/ciclo-minimo/`](../design/ciclo-minimo/)

## 1. A regra de acoplamento

**Mockup e SDD são um par. Toda alteração física em um artboard muda a seção correspondente deste documento, no mesmo commit — e o contrário também vale.** Um mockup que mostra um botão que este documento não define é um bug; uma regra aqui que nenhum quadro mostra é uma regra que ainda não foi desenhada.

| Artboard | Seção |
|---|---|
| `Main.dc.html` — Coordenador monta o mês | §4.1 |
| `ParticipanteHoje.dc.html` — Participante vê o que é dele | §4.2 |
| `CoordenadorHoje.dc.html` — O app cobra | §4.3 |
| `Disparo.dc.html` — Sai com um toque | §4.4 |
| `Mensagens.dc.html` — A voz do app | §5 |

## 2. Escopo

O ciclo mínimo é o menor laço fechado que entrega o produto: **o coordenador monta → o participante sabe → o app cobra → o conteúdo sai.** É a fatia vertical de [`decisoes-produto.md`](decisoes-produto.md) §7 e o critério de pronto de [`00-intuito.md`](00-intuito.md) §5.

Fora deste ciclo (existem no app, mas não fazem parte da fatia): calendário, reuniões, gestão de funções, gestão de participantes, cadastro completo.

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
- **O app manda hoje, sozinho** — a agenda do que vai sair, com horário e destinatário. É informativa: existe para o coordenador **saber**, não para executar. Essa frase está na tela de propósito.
- O coordenador nunca precisa lembrar ninguém manualmente para o ciclo funcionar. Se precisar, o ciclo falhou.

### 4.4 Sai com um toque

**Tela:** celular, do responsável do dia (o coordenador chega nela pelo **Ver conteúdo** de §4.3).

- **Texto pronto** — o conteúdo exato que vai para o grupo, visível por inteiro antes de enviar.
- **Imagem do dia** — o arquivo anexado, com quem enviou e quando. Opcional: uma atividade pode ser só texto.
- **Enviar no WhatsApp** — abre o WhatsApp com o texto já escrito (`wa.me` / Web Share, [`decisoes-tecnicas.md`](decisoes-tecnicas.md) §4). Sob o botão, uma linha explica que a pessoa escolhe o grupo. O app **não** escolhe o grupo e **não** envia sozinho.
- **Copiar texto** e **Editar** como secundárias; **Já publiquei** fecha o ciclo.
- **Regra:** tocar em Enviar não marca como publicado. Só **Já publiquei** marca — porque o app não tem como saber se a mensagem foi mesmo enviada.

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

Invariantes:

- **Idempotência:** o app nunca manda a mesma mensagem duas vezes para a mesma pessoa no mesmo dia. Todo disparo fica registrado.
- **Quem confirmou não recebe.** A confirmação encerra o ciclo de avisos daquela atividade.
- **Sem escala publicada, nada dispara.**
- **A suplência substitui o destinatário**, não acumula: ao assumir, o suplente entra em 6.1–6.3 e o responsável original sai.
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

## 8. O que os mockups ainda não mostram

Registrado para não passar por decidido:

- Estados de carregamento e de erro.
- O mês vazio (primeira vez que o coordenador abre).
- O participante sem nenhuma atividade no mês.
- O fluxo de convite e a definição de senha (é a porta do ciclo, mas ainda não tem quadro).
- Como o coordenador anexa a imagem e escreve o texto de uma atividade — §4.4 mostra o resultado, não a produção.

## 9. Fora do ciclo mínimo

Instagram (o Business Suite publica), push nativo, widget, dark mode, multi-departamento. Ver [`00-intuito.md`](00-intuito.md) §7.
