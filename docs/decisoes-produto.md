# Decisões de Produto — CLJ NSR

Registro vivo do que o app é, para quem, e quais telas existem. Pressupõe [`00-intuito.md`](00-intuito.md). Atualizado em **2026-09-04**.

## 1. O problema (a régua de todo design)

- **Coordenador:** monta a escala na planilha, cola no grupo, e vira a memória viva do departamento — lembra cada pessoa, cada post, cada aniversário, na mão. Toda troca é conversa privada que ninguém vê, e a planilha nunca reflete a realidade.
- **Participante:** descobre que o post de amanhã é dele só se rolar a planilha no grupo entre dezenas de mensagens. Não rola, o post não sai, e a cobrança vem em público.

A plataforma existe para que **a escala se defenda sozinha** — e para que a cobrança venha do sistema, não da boca do coordenador.

## 2. A virada de 2026-09-04

Até aqui o produto era uma **plataforma de leitura de escala** com o participante como audiência #1. Passa a ser a **mesa de comando do coordenador**, que alimenta o WhatsApp em vez de ignorá-lo.

Duas premissas anteriores foram revogadas nesta data — estão registradas para que ninguém as reabra por engano:

| Premissa antiga | Agora |
|---|---|
| "Em conflito de design, o participante ganha" | **O coordenador ganha.** A tela dele é a que justifica o app existir; a do participante continua obrigatória e impecável, mas vem depois na ordem de construção. |
| "Não substitui o WhatsApp — substitui a planilha" | **Continua não substituindo a conversa, mas passa a alimentá-la.** O app prepara o conteúdo e entrega no grupo com um toque. |

## 3. As três capacidades

| Capacidade | O que faz | Estado |
|---|---|---|
| **Organizar** | quem faz o quê e quando — escala, funções, participantes, reuniões | desenhado e mockado |
| **Produzir** | montar os posts em lote: da ideia ao agendado, com texto e mídia | parcial — `Atividade` já tem status e `linkMidia`, falta o texto |
| **Disparar e cobrar** | aniversários automáticos, "seu post é amanhã", "o post de hoje não saiu", conteúdo do dia pronto para o grupo | **não existe — é o coração da v1** |

"Disparar e cobrar" é o que transforma o app de planilha bonita em ferramenta. É por onde a fatia vertical passa.

## 4. Audiências, em ordem

1. **Coordenador** — **as duas telas, e o celular é primeira classe.** Computador para as sessões longas (montar o mês, produzir em lote, biblioteca); celular para o dia (o que sai, quem está devendo, o disparo) e para fechar lacunas da escala. Nada do dia a dia pode exigir estar sentado.
2. **Participante no celular** — jovem, entra por 10 segundos. Se a tela dele falhar, o app não cumpre o propósito.
3. **Nunca:** "usuário avançado de software". Nenhuma tela pode exigir treinamento.

O coordenador vê **tudo que o participante vê, mais** as telas de gestão.

## 5. Telas

Marcadas por fase ([`00-intuito.md`](00-intuito.md) §5): **A** = só você · **B** = o departamento entra.

| Tela | Fase | Papel | Estado |
|---|---|---|---|
| Montar o mês — computador | A | coordenador | **desenhada** (ciclo mínimo) |
| Montar o mês — celular | A | coordenador | **desenhada** |
| Produzir em lote | A | coordenador | **desenhada** |
| Biblioteca de mídia | A | coordenador | **desenhada** |
| O dia — computador | A | coordenador | **desenhada** |
| O dia — celular | A | coordenador | **desenhada** |
| Sai com um toque | A | responsável | **desenhada** |
| A voz do app (texto das mensagens) | A | — | **desenhada** |
| Login por convite | B | entrada | desenhada em agosto, sem quadro no ciclo |
| Participante — Hoje / Escala | B | participante | **desenhada** |
| Trocar dia | B | participante | **desenhada** |
| Painel do coordenador | — | coordenador | desenhada em agosto — rever contra "O dia" |
| Gestão de Funções · Participantes · Reuniões | — | coordenador | desenhadas em agosto, fora do ciclo |
| Calendário · Reuniões (leitura) · Cadastro | — | participante | desenhadas em agosto, fora do ciclo |

Os quadros do ciclo mínimo estão em [`../design/ciclo-minimo/`](../design/ciclo-minimo/) e especificados em [`sdd-ciclo-minimo.md`](sdd-ciclo-minimo.md). As telas de agosto seguem no canvas antigo e **serão reavaliadas depois** — várias foram desenhadas quando o participante era a audiência #1.

## 6. Domínio

- **Funções** (catálogo atual): Terço Diário, Post da tarde, Cinecultural, Curiosidade da fé, Aniversários.
- **Tipos de atividade:** Post, Tarefa, Evento, Reunião.
- **Papéis numa atividade:** responsável e suplente.
- **Status de atividade:** Ideia → Rascunho → Agendado → Publicado. Reuniões: Agendada → Realizada.
- **Escala mensal** com rodízio; troca de responsável fica registrada na plataforma, nunca em conversa privada.
- Nunca mostrar ao participante estrutura interna (linha da planilha, IDs) — sempre "Você publica o Terço amanhã".

## 7. A fatia vertical (o que atravessa tudo primeiro)

**Fase A inteira, para um usuário: montar → produzir → o dia → um toque.**

Sem convite, sem login de terceiros, sem permissões — essas coisas são a Fase B. Dados reais no Supabase e no ar, celular e computador. Todo o resto continua em mock até essa atravessar. Critério de pronto e data de go/no-go em [`00-intuito.md`](00-intuito.md) §5 e §6.

## 8. Decisões ainda abertas

| # | Decisão | O que trava |
|---|---|---|
| 1 | **Identidade** — sai das telas depois que elas fecharem (`decisoes-design.md` §9). Nada de marca antes disso | favicon, sidebar, login, avatar do WhatsApp |
| 2 | **As telas de agosto** — quais sobrevivem à virada para a mesa do coordenador | o canvas antigo inteiro |
| 3 | Como o participante confirma que publicou | o fechamento do ciclo de cobrança |
| 4 | Tom das mensagens automáticas (aniversário e cobrança) | a voz do produto fora da tela |

Fora do caminho crítico, registrados para não inflarem a sensação de escopo: push nativo, widget, dark mode, multi-departamento.
