# Questões abertas do jogo

As hipóteses de combate H-01 a H-08 estão em uso provisório e não equivalem a decisões finais. A autoridade para aprová-las definitivamente continua sendo do Diretor Humano.

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
