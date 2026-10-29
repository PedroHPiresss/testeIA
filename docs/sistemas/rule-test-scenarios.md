# Cenários de validação das regras — v1.0 documental

**Uso:** casos de referência para revisão humana e futura implementação. São validações lógicas planejadas; nenhum cenário abaixo foi executado no protótipo nesta missão.

## Combate

### SCN-COMBAT-001 — Foco no defensor frontal
- **Objetivo/tipo:** validar proteção pela frente; normal.
- **Pré-condições:** combate-base sem efeitos.
- **Estado inicial:** coluna 2 do Jogador B tem Escudo na fileira 0 (Defesa 3) e Tropa na fileira 1; A tem Tropas nas fileiras 0 e 2 (Ataque 2 cada).
- **Ações:** iniciar resolução.
- **Esperado:** ambos os ataques selecionam o Escudo; Escudo é eliminado; Tropa traseira e Líder não recebem dano. Sem transbordamento.
- **Regras:** RULE-004, RULE-005.
- **Pendências:** depende da aprovação de foco simultâneo.

### SCN-COMBAT-002 — Ataque simultâneo de unidade eliminada
- **Objetivo/tipo:** confirmar fotografia inicial; conflito.
- **Estado inicial:** A tem Tropa Ataque 2/Defesa 1 na coluna 1; B tem Tropa Ataque 1/Defesa 2 na mesma coluna.
- **Ações:** resolver combate.
- **Esperado:** ambas atacam; ambas chegam a Defesa 0 e são removidas após aplicação simultânea.
- **Regras:** RULE-005.
- **Pendências:** depende de aprovação da simultaneidade.

### SCN-COMBAT-003 — Coluna aberta e coluna adjacente protegida
- **Objetivo/tipo:** validar independência de colunas; normal.
- **Estado inicial:** A tem Tropa na coluna 1; B não tem defensor na coluna 1, mas tem Escudo na coluna 2.
- **Ações:** resolver combate.
- **Esperado:** ataque de A atinge Líder B; Escudo adjacente não intercepta.
- **Regras:** RULE-002, RULE-004, RULE-006.
- **Pendências:** valor oficial de vida do Líder.

### SCN-COMBAT-004 — Bloqueador eliminado não abre passagem imediata
- **Objetivo/tipo:** distinguir foco de avanço; limite.
- **Estado inicial:** B tem defensor frontal com Defesa 1 e outro defensor atrás; A tem atacante com Ataque 3 na mesma coluna.
- **Ações:** resolver combate.
- **Esperado:** frontal recebe 3 e é removido; dano excedente não afeta retaguarda nem Líder nesta resolução.
- **Regras:** RULE-004, RULE-005.
- **Pendências:** escolha entre regra de fotografia e redirecionamento.

### SCN-COMBAT-005 — Derrota simultânea dos Líderes
- **Objetivo/tipo:** resultado terminal; excepcional.
- **Estado inicial:** ambos os Líderes têm 2 de vida; A e B têm cada um atacante em coluna sem defensor, Ataque 2.
- **Ações:** resolver combate.
- **Esperado:** ambos chegam a zero; resultado empate e nenhum ataque é cancelado por ordem.
- **Regras:** RULE-005, RULE-006.
- **Pendências:** vida final e prioridade de efeitos terminais, se efeitos forem introduzidos.

## Turno e economia

### SCN-ECON-001 — Planejamento sequencial com combate único
- **Objetivo/tipo:** validar ordem da rodada; conflito.
- **Estado inicial:** ambos podem posicionar e têm ações disponíveis; A é primeiro.
- **Ações:** A posiciona; encerra; B observa estado público e posiciona; encerra; resolver combate.
- **Esperado:** um único combate após ambos os planejamentos; iniciativa alterna na rodada seguinte.
- **Regras:** RULE-001, RULE-013.
- **Pendências:** validar visibilidade versus planejamento simultâneo.

### SCN-ECON-002 — Compra e identidade única de carta
- **Objetivo/tipo:** integridade de zonas; limite.
- **Estado inicial:** oferta X, recursos suficientes, carta Y em mão.
- **Ações:** comprar X; tentar posicionar Y em casa ocupada.
- **Esperado:** X passa para mão e sai da oferta; tentativa inválida de Y não altera saldo, mão ou campo; uma instância não ocupa duas zonas.
- **Regras:** cap. 3 e 6 da especificação.
- **Pendências:** custo de compra/posicionamento e comportamento de oferta após compra.

### SCN-ECON-003 — Venda e eliminação não criam duplicatas
- **Objetivo/tipo:** conferir ciclo de cartas; excepcional.
- **Estado inicial:** carta C em campo sofreu dano e envelheceu; há regras de venda/destino ainda não aprovadas.
- **Ações:** vender C; num caso paralelo, eliminar C em combate.
- **Esperado:** ambas as transições removem C do campo; destino e valor precisam seguir a regra que vier a ser escolhida; C não pode simultaneamente retornar a uma zona e permanecer em campo.
- **Regras:** RULE-014, RULE-015.
- **Pendências:** bloqueado até fórmula, marco e destino serem decididos.

### SCN-ECON-004 — Oferta disputada e reserva esgotada
- **Objetivo/tipo:** definir propriedade e atomicidade de oferta; conflito.
- **Estado inicial:** existe uma única cópia de X na reserva; a oferta é visível aos dois jogadores.
- **Ações:** ambos tentam comprar X antes de qualquer atualização da loja.
- **Esperado:** não há resultado normativo até decidir se a loja é compartilhada ou pessoal, quem resolve primeiro, se a oferta some imediatamente e quando repõe. O cenário deve ser completado depois dessa decisão.
- **Regras:** Q-12, RULE-011.
- **Pendências:** reserva, loja e ordem de compra em aberto.

### SCN-ECON-005 — Marco de depreciação
- **Objetivo/tipo:** definir desgaste econômico; limite.
- **Estado inicial:** carta de custo 5 é posicionada, sofre 2 de dano e sobrevive à resolução; jogador tenta vendê-la no planejamento seguinte.
- **Ações:** comparar venda antes do primeiro combate e após um combate/avanço de rodada.
- **Esperado:** não há valor numérico esperado até fórmula, marco, arredondamento, piso e destino serem escolhidos.
- **Regras:** Q-14, RULE-014.
- **Pendências:** fórmula econômica bloqueia conclusão inequívoca.

### SCN-STATE-001 — Sem ação legal
- **Objetivo/tipo:** evitar travamento do fluxo; excepcional.
- **Estado inicial:** jogador sem recurso para posicionar/comprar e sem casa vazia; ofertas/mão podem existir.
- **Ações:** encerrar planejamento ou tentar ação ilegal.
- **Esperado:** ação ilegal não altera estado; existe forma explícita de encerrar planejamento e avançar.
- **Regras:** proposta de ciclo de rodada.
- **Pendências:** número/limite de ações e regra formal de passe.

### SCN-STATE-002 — Efeito aponta para alvo removido
- **Objetivo/tipo:** prioridade e referência inválida; excepcional.
- **Estado inicial:** efeito futuro seleciona unidade que é eliminada antes da resolução do efeito.
- **Ações:** tentar resolver efeito.
- **Esperado:** não é possível concluir com as regras atuais; habilidade deverá dizer se falha, escolhe novo alvo ou resolve parcialmente.
- **Regras:** RULE-010, cap. 9.
- **Pendências:** sistema de efeitos não definido; cenário deliberadamente não possui resultado normativo.
