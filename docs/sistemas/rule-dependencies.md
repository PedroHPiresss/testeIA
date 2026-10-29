# Dependências entre regras — Versão 1.0

Este mapa orienta a ordem de decisão documental e uma futura preparação de implementação. Não autoriza implementação.

| Sistemas | Dependência / predecessor | Consequência de mudança | Bloqueio atual | Ordem recomendada |
|---|---|---|---|---|
| Identidade do produto → todos | Confirmar que o duelo 1v1 é o recorte aprovado e como se relaciona às propostas originais. | Pode invalidar a especificação inteira, modos e arte. | Decisão do Diretor pendente. | 0 |
| Campo → alvo/combate | Definir orientação relativa, ocupação, profundidade e movimento antes de formalizar alvos. | Altera interface, proteção e seleção de alvos. | Convenções propostas RULE-002/003 pendentes. | 1 |
| Rodada/iniciativa → ações/economia | Definir planejamento sequencial/simultâneo, quando há renda, compra, venda, colocação e combate. | Muda vantagem informacional, ritmo e exposição. | RULE-001/RULE-013 precisam validação. | 2 |
| Elegibilidade de classe → alvo → Líder | Definir quais cartas bloqueiam e atacam antes de dizer se a coluna está aberta. | Pode abrir ataque direto ao Líder e alterar defesa. | Flanco, Efeito e Elite não fechados. | 3 |
| Dano/alvo → vida do Líder/condição final | Resolver simultaneidade, foco, redirecionamento e dano antes de vida oficial e empate. | Muda letalidade e duração. | RULE-004..006 pendentes; vida 20 é provisória. | 4 |
| Combate → desgaste/cura → valor de carta | Definir persistência do dano e recuperação antes de custos e revenda. | Muda sobrevivência, Escudo e valor econômico. | RULE-007 e fórmula pendentes. | 5 |
| Reserva/loja → custo/renda → mão | Definir ofertas, atualização, aquisição, cobrança, limites e esgotamento como conjunto. | Muda agência, frequência de carta e inflação/escassez. | H-09/H-10 diferem do conceito original. | 6 |
| Destino de carta → revenda → loja | Escolher retorno à reserva, descarte ou pilha antes da fórmula de revenda. | Retorno pode criar ciclos; descarte esgota conteúdo. | RULE-014/015 em aberto. | 7 |
| Limites de ação → venda/compra/posicionamento | Determinar quantas operações são possíveis e se podem ocorrer no mesmo turno. | Evita compra-venda e posicionamento instantâneo abusivos. | Nenhum limite aprovado; H-11 não basta. | 8 |
| Timing de efeitos → combate e estados terminais | Definir prioridade, alvo, duração, acúmulo e interrupção antes de Efeito/Elite. | Pode mudar fotografia, ataques e vitória simultânea. | Sistema de habilidades ausente. | 9 |
| Economia + combate + catálogo → balanceamento | Custos, atributos, vida do Líder e classes só são comparáveis com frequência de compra e duração conhecidas. | Valores iniciais podem induzir meta dominante. | Não existem dados de partidas documentados. | 10 |
| Regras validadas → cenários → implementação futura | Cada fluxo normativo precisa de exemplo e resultado inequívoco antes de codificação. | Evita escolhas silenciosas pelo implementador. | Cenários parciais enquanto pendências persistirem. | 11 |

## Bloqueios prioritários

1. **P0 criativo:** validar o duelo como direção do produto e o modelo de planejamento.
2. **P0 de combate:** aprovar alvo por coluna, simultaneidade, transbordamento, ataque ao Líder e empate.
3. **P0 econômico:** fechar compra/custo/renda, limite de ações, loja e destino das cartas antes de revenda.
4. **P1 de conteúdo:** definir Flanco, Efeito e Elite antes de incluí-los no conjunto jogável.
5. **P2 de balanceamento:** após regras e dados de partidas, calibrar vida, atributos, custos e revenda.

## Consequências de mudanças de alto impacto

- Mudar foco simultâneo para redirecionamento sequencial afeta alvos, letalidade, colunas abertas, vida do Líder e cenários.
- Mudar cobrança de posicionamento para compra altera valor da mão, necessidade de limite de mão e frequência de compra.
- Retornar cartas vendidas à loja/reserva modifica a aleatoriedade e pode incentivar rotação de cartas.
- Mudar planejamento sequencial para simultâneo/oculto altera informação disponível e iniciativa.
- Separar vida e armadura para resolver Flanco propaga atributos, dano, efeitos, venda e leitura de carta.
