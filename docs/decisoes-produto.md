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

1. **Coordenador** — desktop para sessões longas de montagem; celular para o disparo do dia. Densidade bem-vinda, poder de edição.
2. **Participante no celular** — jovem, entra por 10 segundos. Se a tela dele falhar, o app não cumpre o propósito.
3. **Nunca:** "usuário avançado de software". Nenhuma tela pode exigir treinamento.

O coordenador vê **tudo que o participante vê, mais** as telas de gestão.

## 5. Telas

| Tela | Papel | Estado |
|---|---|---|
| Login (convite do coordenador → definir senha) | entrada | desenhada · **na fatia vertical** |
| Painel do coordenador (stats + alertas + atalhos) | coordenador | desenhada |
| Gestão de Escala (atividades, responsável/suplente, mídia, status) | coordenador | desenhada · **na fatia vertical** |
| Gestão de Funções (catálogo de papéis) | coordenador | desenhada |
| Gestão de Participantes (convites, cadastros) | coordenador | desenhada |
| Gestão de Reuniões (pauta, decisões, follow-up) | coordenador | desenhada |
| **Produção de conteúdo** (texto do post + mídia, em lote) | coordenador | **a desenhar** |
| **Disparo do dia** (conteúdo pronto → um toque para o grupo) | coordenador | **a desenhar** |
| **Cobranças e aniversários** (o que o app vai mandar, e quando) | coordenador | **a desenhar** |
| Cadastro (dados, funções, disponibilidade, **data de nascimento**) | participante | desenhada · precisa do campo de aniversário |
| Escala (leitura, "Meus/Todos") | participante | 3 opções em avaliação (A: agenda por prazo · B: faixa de dias + destaque · C: linha do tempo) — **decisão pendente** |
| Calendário (mês, "Meus/Departamento") | participante | desenhada |
| Reuniões (leitura) | participante | desenhada |
| Mobile: Hoje / Escala / Calendário + bottom nav | participante | desenhadas |

Componentes compartilhados: **Sidebar** (o fio/terço, desktop) e **MobileNav** (bottom nav, mobile).

## 6. Domínio

- **Funções** (catálogo atual): Terço Diário, Post da tarde, Cinecultural, Curiosidade da fé, Aniversários.
- **Tipos de atividade:** Post, Tarefa, Evento, Reunião.
- **Papéis numa atividade:** responsável e suplente.
- **Status de atividade:** Ideia → Rascunho → Agendado → Publicado. Reuniões: Agendada → Realizada.
- **Escala mensal** com rodízio; troca de responsável fica registrada na plataforma, nunca em conversa privada.
- Nunca mostrar ao participante estrutura interna (linha da planilha, IDs) — sempre "Você publica o Terço amanhã".

## 7. A fatia vertical (o que atravessa tudo primeiro)

**Convite → escala real → cobrança automática → um toque para o grupo.**

Uma fatia só, do login ao WhatsApp, com dados reais no Supabase e no ar. Todo o resto continua em mock até essa atravessar. Critério de pronto e data de go/no-go em [`00-intuito.md`](00-intuito.md) §5 e §6.

## 8. Decisões ainda abertas

| # | Decisão | O que trava |
|---|---|---|
| 1 | **Escala do participante** — decidir por mockup simples, não pelas opções A/B/C de agosto | a tela principal do participante |
| 2 | **Marca** — as três direções foram rejeitadas por genéricas (`decisoes-design.md` §9); identidade em estudo | favicon, sidebar, login, avatar do WhatsApp |
| 3 | Como o participante confirma que publicou | o fechamento do ciclo de cobrança |
| 4 | Tom das mensagens automáticas (aniversário e cobrança) | a voz do produto fora da tela |

Fora do caminho crítico, registrados para não inflarem a sensação de escopo: push nativo, widget, dark mode, multi-departamento.
