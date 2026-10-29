# Regras de combate — início da Versão 1.0

**Status:** implementação provisória; não é aprovação definitiva do Diretor Humano. As regras de contexto são da [especificação v0.1](../Especificacao_Jogo_Cartas_v0.1.md). Hipóteses adotadas nesta fase estão identificadas como H-xx.

## Regras definidas no contexto

- Duelo 1v1; cada jogador tem um Líder e um campo de 4 colunas × 3 fileiras.
- Combate básico ocorre por coluna. A posição da frente protege as cartas atrás.
- Ataque e Defesa são numéricos; Defesa representa resistência e Defesa zero elimina.
- Escudo defende, mas não ataca. Flanco, Efeito e Elite têm regras pendentes.

## Hipóteses provisórias da Versão 1.0

| ID | Regra adotada | Justificativa e consequência | Testes |
|---|---|---|---|
| H-01 | A fileira 0 é a frente local de cada campo; coordenadas são relativas ao proprietário, sem depender da orientação visual. | A fundação não define orientação e cada lado possui campo próprio. Uma futura UI pode transformar a exibição sem mudar as regras. | `combat.test.ts`: seleção em ambos os campos. |
| H-02 | Cada Tropa ataca a carta de menor índice de fileira na mesma coluna adversária; todos podem focar a mesma carta. | Converte “frente protege fundo” em alvo determinístico e mantém colunas independentes. | `combat.test.ts`: alvo frontal, fundo e coluna vizinha. |
| H-03 | Dano é igual ao Ataque da definição, reduz Defesa atual até o mínimo zero; não há modificadores. | Regra simples e reproduzível; definições permanecem intactas. | `combat.test.ts`: dano, acúmulo e eliminação. |
| H-04 | Tropa ataca; Escudo pode ser alvo e não ataca. Flanco, Efeito e qualquer Elite são rejeitados explicitamente. | Evita tratar classes sem regras como Tropas. | `combat.test.ts`: Escudo sem ataque e classe incompatível. |
| H-05 | Combate é acionado explicitamente por função pura, sem turno/economia/UI. | A fundação é independente do motor de pontuação da interface. | Suíte da fundação. |
| H-06 | A resolução usa fotografia inicial: todos os ataques válidos são calculados antes de aplicar dano; não há redirecionamento. | Torna foco, eliminações e ataques mútuos determinísticos. | `combat.test.ts`: foco múltiplo, simultaneidade e ausência de redirecionamento. |
| H-07 | Líder começa com 20 de vida por padrão provisório, configurável ao criar a instância. Coluna vazia recebe ataques; vida não fica abaixo de zero; zero encerra o duelo; derrota simultânea é empate. Líder não ataca. | O modelo aceitava atributos genéricos, mas não vida atual; foi acrescentado campo explícito e configurável sem acoplar ao motor/UI. 20 não é balanceamento oficial. | `combat.test.ts`: dano direto, empate e combate terminal. |
| H-08 | Defesa e vida perdidas persistem no estado resultante; não há cura automática. | Cura e recuperação por rodada não foram definidas. | `combat.test.ts`: estado imutável e valores persistidos. |
| H-09 | Cada lado recebe 3 cartas de uma fonte própria de 12 instâncias (6 definições provisórias, 2 cópias cada), embaralhada de forma determinística com sementes derivadas; cada um compra 1 carta do próprio baralho no início de cada rodada não terminal. | Permite mãos reais e reposição reproduzível sem criar a loja completa; mãos do bot ficam ocultas. Quando o baralho acaba, não há reposição. Ambos usam o mesmo catálogo e algoritmo de distribuição, com ordem individual. | `arena-game.test.ts`: distribuição, semente, unicidade e avanço de rodada. |
| H-10 | Cada participante começa com 3 recursos; recebe +1 no início de cada rodada seguinte, até o limite 8. O custo da carta é pago ao posicionar; saldo não gasto é mantido. | O custo existe no modelo, mas o momento de cobrança e renda não foram definidos. Escolha simples para tornar recursos relevantes. | `arena-game.test.ts`: recursos iniciais, pagamento e rejeição por saldo. |
| H-11 | Cada participante pode posicionar uma carta ou passar por rodada. O planejamento é sequencial; após ambos encerrarem, o combate ocorre uma vez. A iniciativa começa pelo humano e alterna por rodada. | Define oportunidade igual e evita ataques múltiplos de cliques repetidos; combate continua usando o resolvedor existente. | `arena-game.test.ts`: limite de ação, avanço, combate único e alternância. |
| H-12 | O bot escolhe entre jogadas legais de sua mão, considerando seu saldo e o campo público; usa a mesma operação `playArenaCard` do humano. Sem jogada legal, passa. | Mantém as restrições idênticas e evita expor mão/baralho humano à política. | `arena-game.test.ts`: jogada da própria mão, turno e passe sem jogada. |
| H-13 | Cartas eliminadas saem do jogo; não há pilha de descarte nem venda/retorno à fonte nesta etapa. | Evita criar mecânicas econômicas adicionais. | Testes do combate e do ciclo da arena. |

## Implementação e limites

O combate está em `src/game/foundation/combat.ts`, separado do motor de pontuação em `src/game/engine.ts`. A Arena jogável usa `DuelState` como estado oficial, incluindo mãos, baralhos, recursos e rodada; chama o resolvedor ao fim da preparação dos dois participantes. A partida de pontuação permanece independente. Erros não alteram o estado recebido. O resolvedor retorna eventos de dano e o resultado (`null`, jogador vencedor ou `draw`). Uma chamada após resultado terminal é rejeitada.

O Líder usa `currentHealth`, com padrão provisório 20 em `createLeaderInstance`; o quarto argumento permite configurar outro valor. A Arena usa uma fonte fixa de cartas em vez da loja; compra/venda, economia completa, limite de mão e descarte continuam fora desta etapa. A iniciativa começa pelo humano e alterna após cada combate não terminal. Isso não define balanceamento ou ciclo oficiais, nem migra a partida antiga.

## Fora do escopo e pendências

Loja, compra de ofertas, venda, economia completa, cura, Flanco, Efeito, Elite e balanceamento permanecem fora do protótipo da arena. Ver [questões abertas](open-questions.md) e [roadmap](roadmap.md).
