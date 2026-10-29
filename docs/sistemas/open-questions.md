# Questões abertas do jogo

As hipóteses H-01 a H-13 estão em uso provisório e não equivalem a decisões finais. A autoridade para aprová-las definitivamente continua sendo do Diretor Humano. A especificação v1.0 e `rule-decisions.md` consolidam propostas para avaliação, não decisões oficiais.

| ID | Pergunta | Estado atual e consequência | Fase necessária |
|---|---|---|---|
| Q-01 | Qual é a orientação definitiva das fileiras e o mapeamento para a mesa visual? | H-01 usa fileira 0 como frente local. Uma decisão diferente altera apenas a função semântica de profundidade e seus testes. | Integração UI/tabuleiro. |
| Q-02 | Ataque causa dano igual ao Ataque? Como funcionam múltiplos atacantes e redirecionamento? | H-02/H-03/H-06 aplicam foco simultâneo sem redirecionar. Mudança afeta seleção e resolução. | Revisão de regras antes de combate definitivo. |
| Q-03 | Qual é a vida oficial do Líder e como se calcula empate? | H-07 usa 20 configurável e empate se ambos chegam a zero. Não é balanceamento oficial. | Loop jogável/balanceamento. |
| Q-04 | Como funcionam as regras de Flanco, Efeito e Elite? | Não participam do combate; entradas com essas classes são rejeitadas. | Definição das classes antes da implementação. |
| Q-05 | Quando a Defesa é recuperada e como funcionam cura/reparo? | H-08 mantém dano sem recuperação automática. | Regras de rodada. |
| Q-06 | Como a arena jogável e a partida antiga de pontuação evoluem ou convivem? | A arena usa `DuelState`; a partida antiga permanece separada por escopo. Não há migração entre elas. | Decisão de produto/arquitetura futura. |
| Q-07 | Os documentos fonte DOCX e relatório TXT citados no pedido contêm regras adicionais? | Não foram encontrados no workspace nem anexados com o texto colado; a cópia Markdown local foi usada. Comparar quando as fontes forem disponibilizadas. | Antes de consolidar regras definitivas. |
| Q-08 | Quando se paga o custo: ao comprar da loja, posicionar, ou em ambos? | H-10 cobra ao posicionar. A arena ainda não implementa ofertas de loja. Alterar isso afeta operações e interface de aquisição. | Antes de implementar a loja. |
| Q-09 | Quais são a renda, limite de recursos e ações por rodada definitivos? | H-10/H-11 usam recursos iniciais 3, +1/rodada até 8 e uma carta ou passe por participante. | Revisão de regras/balanceamento. |
| Q-10 | Como funcionam reserva, loja, oferta, limite de mão e destino de cartas eliminadas? | H-09 usa 12 instâncias pessoais e compra 1 por rodada; H-13 remove eliminadas. Loja, venda e descarte não estão implementados. | Fase de economia. |
| Q-11 | Qual sequência de iniciativa e definição de rodada é definitiva? | H-11 alterna iniciativa a cada resolução, com preparação em turnos sequenciais e combate único após ambas as partes. | Revisão de regras antes do loop final. |

## Atualização documental — 28/10/2026

Os IDs e perguntas originais Q-01..Q-11 foram preservados acima. A coluna abaixo registra o resultado da análise e mantém histórico: “parcial” significa que há proposta escrita, mas falta validação do Diretor ou informação de design. Nenhuma questão foi marcada como definitivamente aprovada/resolvida.

| ID original | Estado após análise | Referência / justificativa | Responsável e prioridade | Dependências |
|---|---|---|---|---|
| Q-01 | Parcial — proposta fileira 0 como frente relativa. | RULE-002; v0.1 não fixa orientação visual. | Diretor valida semântica; P1. | Campo e UI futura. |
| Q-02 | Parcial — alvo frontal, foco, dano=Ataque, simultaneidade e sem transbordamento propostos. | RULE-004/005; H-02/H-03/H-06 eram hipóteses, não aprovação. | Diretor valida alternativa de combate; P0. | Alvo, classes elegíveis, Líder. |
| Q-03 | Parcial — dano simultâneo ao Líder e empate por derrota simultânea propostos; vida 20 permanece provisória. | RULE-006; H-07 não constitui valor balanceado. | Diretor valida; P0/P2 para vida. | Combate e partidas de avaliação. |
| Q-04 | Aberta — Flanco, Efeito e Elite não possuem regras completas. | RULE-008..010; rejeição técnica H-04 não define design. | Diretor define Flanco; designer especifica efeitos; P1. | Atributos e prioridades. |
| Q-05 | Parcial — recomenda-se dano persistente sem cura automática. | RULE-007; H-08 é hipótese. | Diretor valida; P1. | Combate, duração e revenda. |
| Q-06 | Aberta — arena e jogo de pontuação seguem separados; integração não é decisão de design. | `docs/auditoria-tecnica.md`, `docs/sistemas/roadmap.md`. | Diretor/Produtor; P2. | Identidade e produto. |
| Q-07 | Aberta — fontes DOCX/TXT referidas no histórico não estavam disponíveis no workspace consultado. | A análise usou a cópia Markdown local; não se pode inferir ausência de conteúdo nelas. | Responsável deve disponibilizar se houver; P1. | Comparação final de fontes. |
| Q-08 | Aberta — instante de cobrança continua sem escolha. | RULE-012; H-10 cobra ao posicionar, mas loja conceitual não está implementada. | Diretor; P0 econômico. | Loja, ações e recursos. |
| Q-09 | Aberta — renda, teto e limite de ações não definidos; valores H-10/H-11 são parâmetros experimentais. | RULE-012/013. | Diretor, depois de ciclo econômico; P0. | Custos, ritmo e compra. |
| Q-10 | Parcial — fluxo original reserva→loja→mão preservado; detalhes e destinos abertos. | RULE-011/014/015; H-09/H-13 simplificam o protótipo. | Diretor/Produtor; P0 econômico. | Oferta, renda, venda e revenda. |
| Q-11 | Parcial — planejamento sequencial seguido de combate único é alternativa recomendada, não aprovada. | RULE-001/013; cria vantagem informacional para o segundo jogador. | Diretor; P0. | Renda, ações e iniciativa. |

## Questões adicionadas na consolidação

| ID | Pergunta | Estado / referência | Responsável e prioridade | Dependências |
|---|---|---|---|---|
| Q-12 | Quantas ofertas existem, são compartilhadas ou pessoais, como renovam e o que ocorre quando a reserva esgota? | Aberta; H-09 não usa loja. SCN-ECON-004. | Diretor/Produtor; P0 econômico. | Composição da reserva, aquisição. |
| Q-13 | Qual o limite da mão e destino das cartas vendidas/eliminadas? | Aberta; H-13 remove eliminadas apenas no protótipo. RULE-014/015. | Diretor; P0 econômico. | Loja, revenda e ações. |
| Q-14 | Como se calcula revenda: marco inicial, depreciação por rodada, dano, piso e arredondamento? | Aberta; somente a intenção de depreciar é preservada. SCN-ECON-005. | Diretor; P1. | Turno, combate, destino e economia. |
| Q-15 | É permitido mover cartas, quais casas podem ser ocupadas e há restrição de fileira? | Proposta de casa única/sem movimento; pendente. RULE-003. | Diretor; P1. | Campo e ações. |
| Q-16 | Como Flanco sobrevive se “nada de Defesa” significar zero? | Aberta; recomendação Defesa baixa positiva ou separar Vida/Armadura. RULE-009. | Diretor; P1 criativo. | Modelo de atributos. |
| Q-17 | Como efeitos definem timing, alvo, duração, acúmulo, cancelamento e alvos removidos? | Aberta e adiada até especificação por habilidade. RULE-010; SCN-STATE-002. | Diretor/designer; P1 para classe Efeito. | Combate, estados e prioridades. |
| Q-18 | Qual regra cobre impasse, limite de rodadas, abandono e desconexão? | Aberta e adiada; nenhum modo final confirmado. Especificação cap. 8. | Diretor; P2, desconexão depende de modo online. | Modo de produto. |
| Q-19 | O segundo jogador pode observar o primeiro durante o planejamento? | Aberta; sequencial recomendado tem informação assimétrica. RULE-013; SCN-ECON-001. | Diretor; P0. | Estrutura da rodada. |

### Correção de rastreabilidade

A introdução antiga deste arquivo mencionava apenas H-01..H-08, embora `game-rules.md` contenha H-01..H-13. A atualização corrige o intervalo sem alterar o histórico das hipóteses. Os H-09..H-13 cobrem economia simplificada, fluxo, bot e destino de eliminadas; alguns são detalhes técnicos do protótipo e não regras centrais de design.
