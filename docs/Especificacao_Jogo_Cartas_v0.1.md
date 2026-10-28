# Especificação do jogo de cartas 1v1

**Documento de design, regras conhecidas, decisões pendentes e plano de implementação**  
**Versão:** 0.1 — consolidada em 27 de outubro de 2026  
**Status:** documento de trabalho; não equivale a uma versão final e imutável das regras.

**Objetivo deste documento:** transformar as ideias discutidas até aqui em uma referência única para o projeto e para os agentes do Codex. O documento separa o que foi efetivamente definido pelo criador, o que é uma interpretação provisória e o que ainda depende de decisão. Nenhuma proposta marcada como pendente deve ser tratada como regra aprovada.

## Sumário

1. Como ler este documento
2. Resumo executivo
3. Visão do jogo e pilares de design
4. Vocabulário do projeto
5. Regras e conceitos já definidos
6. Ambiguidades prioritárias
7. Recomendações de design a validar
8. Plano de implementação com Codex
9. Distribuição de trabalho entre agentes
10. Modelo de pedido ao Codex
11. Documentação recomendada no repositório
12. Critério para regras prontas para codificação
13. Resumo de decisões atuais
14. Próximo passo recomendado

## Como ler este documento

- **[DEFINIDO]** — declarado pelo criador do jogo durante a conversa.
- **[INTERPRETAÇÃO A VALIDAR]** — leitura razoável das ideias já apresentadas, mas que ainda precisa de confirmação explícita.
- **[PENDENTE]** — pergunta que ainda não foi respondida ou regra que não foi fechada.
- **[RECOMENDAÇÃO]** — sugestão de design ou de desenvolvimento; não é uma regra aprovada.
- **[BLOQUEADOR]** — ambiguidade que deve ser resolvida antes de implementar a parte correspondente do sistema.

**Regra de governança:** quando uma regra estiver pendente, os agentes não devem inventar uma resposta e apresentá-la como decisão do criador. Devem registrar a dúvida, explicitar as opções e solicitar uma decisão. Caso seja necessário prototipar temporariamente uma hipótese, ela deve ser isolada, identificada como provisória e fácil de alterar.

## 1. Resumo executivo

O projeto é um jogo de cartas tático 1 contra 1, organizado em rodadas. Cada jogador tem um **Líder**, cuja derrota determina a derrota do jogador. Cada lado dispõe de um campo próprio de **4 colunas por 3 fileiras**, com capacidade física de 12 posições. O posicionamento é essencial: no combate básico, as cartas interagem verticalmente, dentro da mesma coluna, e não costumam atacar cartas em colunas vizinhas.

As cartas têm custo e atributos de Ataque e Defesa. Defesa representa a vida/resistência da carta: quando chega a zero, a carta é eliminada. As classes conceituais definidas são **Tropa**, **Escudo**, **Flanco**, **Efeito** e **Elite**. Elite não foi descrita como uma família completamente separada de efeitos e atributos: é uma carta especial baseada em uma das outras quatro classes, com atributos elevados e condições próprias.

O jogo inclui uma economia ligada ao ciclo **reserva de cartas → loja → mão → campo**. Cartas aleatórias da reserva aparecem na loja; o jogador não escolhe diretamente quais cartas aparecem, mas pode comprar as ofertas disponíveis para levá-las à mão. Durante sua fase de planejamento, o jogador pode comprar cartas, posicionar cartas da mão e vender cartas já posicionadas. A venda recupera apenas parte do valor: uma carta perde valor de revenda conforme permanece em campo e também se desvaloriza ao sofrer dano.

A ideia central é combinar **posicionamento tático, proteção do Líder, gestão de recursos, seleção limitada pela loja aleatória e decisões de manter ou vender cartas usadas**. Muitos parâmetros ainda não foram definidos. A prioridade não é criar um catálogo grande de cartas imediatamente, e sim estabilizar uma partida mínima jogável, testável e fácil de ajustar.

## 2. Visão do jogo e pilares de design

### 2.1. Visão de alto nível

Um duelo no qual dois jogadores administram recursos e posicionam cartas em quatro corredores de combate. O objetivo é romper a defesa adversária e derrotar o Líder, enquanto se protege o próprio. A loja aleatória cria restrições e oportunidades; a desvalorização torna a permanência das cartas no campo uma decisão econômica, além de tática.

### 2.2. Pilares identificados

1. **Posicionamento importa.** Uma defesa numa coluna não protege automaticamente as outras. Uma coluna vazia pode abrir caminho para um ataque ao Líder.
2. **A linha de frente protege o que está atrás.** A carta inimiga mais à frente tende a ser o primeiro alvo, deixando as cartas atrás dela protegidas contra aquele ataque.
3. **Os recursos impõem escolhas.** O jogador não pode simplesmente usar todas as cartas disponíveis sem considerar custos e limites ainda a definir.
4. **A loja oferece opções, não controle total.** O jogador compra entre cartas oferecidas aleatoriamente a partir da reserva.
5. **Cartas em campo depreciam.** A permanência e o dano recebido afetam o valor que pode ser recuperado numa venda.
6. **As regras-base devem ser previsíveis.** Habilidades de Efeito e condições de Elite devem ser adicionadas sobre regras comuns claras, e não esconder contradições no motor central.

Esses pilares são uma síntese do conceito. Não substituem as regras específicas nem autorizam os agentes a criar mecânicas não aprovadas.

## 3. Vocabulário do projeto

| Termo | Significado no contexto deste documento | Estado |
|---|---|---|
| Jogador | Um dos dois participantes da partida. | [DEFINIDO] |
| Líder | Carta central de cada jogador; derrotá-la vence a partida. | [DEFINIDO] |
| Campo | Tabuleiro próprio do jogador, com 4 colunas e 3 fileiras. | [DEFINIDO] |
| Coluna/corredor | Uma das quatro linhas verticais de interação do combate básico. | [DEFINIDO] |
| Fileira/posição | Uma das três posições de profundidade dentro de cada coluna. | [DEFINIDO] |
| Ataque | Atributo ofensivo em pontos. O cálculo exato do dano ainda precisa ser confirmado. | Parcialmente definido |
| Defesa | Atributo em pontos que funciona como vida/resistência da carta. | [DEFINIDO] |
| Reserva / “deck” | Conjunto de cartas ainda não compradas pelo jogador e que pode alimentar a loja. O criador chamou esse conjunto de deck; “reserva” é usado aqui também para evitar confusão técnica. | [DEFINIDO na função; composição pendente] |
| Loja | Ofertas aleatórias provenientes da reserva; o jogador pode comprar as cartas expostas. | [DEFINIDO na função; regras de atualização pendentes] |
| Mão | Cartas compradas que o jogador já pode usar durante sua rodada. | [DEFINIDO] |
| Custo/preço | Valor associado à eficiência da carta. Ainda não está fechado em que momento exato o custo é pago. | Parcialmente definido |
| Valor de revenda | Quantidade recuperada ao vender uma carta em campo; cai com o tempo em campo e com o dano recebido. | [DEFINIDO na intenção; fórmula pendente] |
| Rodada/turno | Período em que um jogador planeja suas ações antes do combate. A relação exata entre o turno de cada jogador e a rodada global ainda precisa ser definida. | [PENDENTE] |
| Tropa, Escudo, Flanco, Efeito | Quatro classes-base de carta. | [DEFINIDO] |
| Elite | Carta especial que deriva de uma das quatro classes-base. | [DEFINIDO na intenção] |

## 4. Regras e conceitos já definidos

### 4.1. Partida e condição de vitória

- **[DEFINIDO]** A partida é 1v1.
- **[DEFINIDO]** Cada jogador possui uma carta Líder.
- **[DEFINIDO]** O objetivo é derrotar o Líder adversário sem deixar o próprio ser derrotado.
- **[INTERPRETAÇÃO A VALIDAR]** “Derrotar” provavelmente significa reduzir a vida/Defesa do Líder a zero, mas os atributos e as regras exatas do Líder ainda não foram descritos.
- **[PENDENTE]** Não foi definido o que acontece em caso de empate, desconexão, abandono, limite de rodadas ou impossibilidade de continuar causando dano.
- **[PENDENTE]** Ainda não foi confirmado se os oponentes serão humanos, uma IA, ou se o jogo terá mais de um desses modos. O protótipo atual deve ser inspecionado antes de decidir qualquer mudança arquitetural.

### 4.2. Tabuleiro e posicionamento

- **[DEFINIDO]** Cada jogador possui seu próprio campo.
- **[DEFINIDO]** O campo tem 4 colunas e 3 fileiras, totalizando 12 posições por jogador.
- **[DEFINIDO]** O combate básico ocorre no sentido vertical, por coluna. Cartas de colunas diferentes normalmente não interagem diretamente.
- **[DEFINIDO]** Uma carta de defesa colocada numa coluna não protege automaticamente uma coluna diferente. Se o atacante explorar uma coluna vazia, a defesa em outra coluna será ineficaz contra aquele ataque.
- **[DEFINIDO na intenção]** O posicionamento relativo à frente e atrás influencia a proteção: a carta mais à frente tende a ser o alvo, protegendo as cartas que estão atrás dela.
- **[PENDENTE]** É necessário definir a orientação visual dos campos e qual fileira é considerada “mais à frente” para cada jogador.
- **[PENDENTE]** A regra de alvo por coluna ainda precisa dizer se todos os atacantes de uma coluna atingem a mesma carta da frente, se existe alguma correspondência entre fileiras, ou se os ataques são direcionados a alvos distintos por uma regra adicional.
- **[PENDENTE]** Não foi definido se o jogador pode mover ou reposicionar uma carta que já esteja no campo, ou apenas colocar cartas da mão em posições vazias.
- **[PENDENTE]** Não foi definido se uma carta pode ser posicionada em qualquer uma das três fileiras desde o início, se existem restrições de colocação ou se há casas bloqueadas.

### 4.3. Atributos e dano

- **[DEFINIDO]** As cartas têm atributos de Ataque e Defesa, organizados por pontos.
- **[DEFINIDO]** Defesa funciona basicamente como vida. Quando chega a zero, a carta é eliminada.
- **[PENDENTE]** Ainda não está formalmente confirmado que cada ponto de Ataque causa exatamente um ponto de dano. Essa é uma hipótese natural, mas deve ser aprovada antes da implementação.
- **[PENDENTE]** Não foi decidido se o dano permanece na carta entre rodadas, se há cura, se Defesa pode exceder o valor inicial ou se algum efeito pode reduzir o dano recebido.
- **[PENDENTE]** Não foi definido se as cartas atacam automaticamente em toda resolução de combate, se podem atacar apenas uma vez, ou quais condições impedem um ataque.
- **[PENDENTE]** A ordem de resolução do combate não está definida: ataques simultâneos, resolução sequencial, prioridade por coluna ou outra ordem.
- **[PENDENTE]** Também falta decidir se uma carta que seria eliminada na resolução ainda consegue realizar seu ataque naquela mesma resolução.

### 4.4. Classes de cartas

#### Tropa

- **[DEFINIDO]** Classe comum, com Ataque e Defesa medianos.
- **[PENDENTE]** Não há valores numéricos, faixa de custo ou regra especial definida.

#### Escudo

- **[DEFINIDO]** Defesa alta e nenhum Ataque.
- **[PENDENTE]** Como Defesa é vida, Escudo precisa de Defesa positiva; não foi definido se “nenhum Ataque” significa Ataque zero e ausência completa de ação ofensiva.
- **[PENDENTE]** Não está definido se a carta bloqueia simplesmente por ocupar a posição ou se possui alguma capacidade adicional de proteção.

#### Flanco

- **[DEFINIDO na intenção]** Ataque alto e “nada de defesa”.
- **[BLOQUEADOR]** Há um conflito potencial importante: se Defesa representa vida e uma carta com Defesa zero é eliminada, um Flanco com Defesa literalmente igual a zero não poderia permanecer em campo para atacar. Antes de implementar Flanco, o criador precisa definir o significado de “nada de defesa”. Uma possibilidade de design é que Flanco tenha Defesa/vida baixa, mas positiva; outra seria separar vida de armadura/proteção. Nenhuma dessas opções está aprovada.
- **[PENDENTE]** Além dessa questão, não foram definidos números nem condições especiais do Flanco.

#### Efeito

- **[DEFINIDO]** Cartas cujo propósito é aplicar algum tipo de efeito nas cartas em campo.
- **[PENDENTE]** Não está definido se uma carta Efeito ocupa uma das 12 posições, se tem Ataque/Defesa, se permanece no campo ou é consumida ao ser usada.
- **[PENDENTE]** Não estão definidos alvos possíveis, duração, alcance, momento de ativação, acúmulo de efeitos, possibilidade de anulação ou custo.

#### Elite

- **[DEFINIDO na intenção]** É uma carta especial baseada em uma das quatro classes anteriores — Tropa, Escudo, Flanco ou Efeito —, com atributos elevados e condições especiais.
- **[INTERPRETAÇÃO A VALIDAR]** É mais seguro modelar Elite como um atributo/subtipo especial associado a uma classe-base, em vez de uma classe de combate completamente independente. Isso permite que uma carta seja, por exemplo, uma Elite do tipo Tropa. Esta é uma recomendação técnica/design, ainda não aprovada.
- **[PENDENTE]** Não estão definidos a raridade, limite de cópias, custo relativo, requisitos para entrar em campo ou o formato das condições especiais.

### 4.5. Custo, recursos e eficiência

- **[DEFINIDO]** Cada carta tem um preço que deve refletir sua eficiência.
- **[DEFINIDO na intenção]** Os recursos disponíveis condicionam quantas cartas podem ser colocadas em campo durante a rodada.
- **[PENDENTE / BLOQUEADOR]** A conversa descreve a compra na loja como uma ação que leva a carta para a mão, mas também diz que os recursos condicionam quantas cartas podem ser posicionadas. Portanto, falta escolher quando o custo é pago:
  1. pagar o custo ao comprar da loja para a mão e posicionar sem custo adicional;
  2. comprar para a mão e pagar novamente (ou outro valor) ao posicionar;
  3. comprar da loja de outra forma e pagar o custo principal ao posicionar;
  4. adotar outro modelo explicitamente definido pelo criador.
- **[PENDENTE]** Não foram definidos a quantidade inicial de recursos, a renda por rodada, limite de recursos acumulados, aumentos/reduções de renda ou recompensas por combate.
- **[PENDENTE]** Não foi definido se há limite de compras, limite de posicionamentos ou ambos por rodada.
- **[PENDENTE]** O custo de cartas é ainda conceitual. Os valores precisam ser calibrados depois que os atributos, o número de ataques por rodada, os recursos e a venda estiverem definidos.

### 4.6. Reserva, loja e mão

O fluxo conhecido é:

**reserva/deck não comprado → ofertas da loja → compra → mão → posicionamento no campo.**

- **[DEFINIDO]** O jogador tem uma mão com cartas que pode posicionar durante sua rodada.
- **[DEFINIDO]** O deck, no sentido usado pelo criador, contém cartas à disposição do jogador que ele ainda não comprou e, portanto, ainda não pode usar diretamente.
- **[DEFINIDO]** Cartas aleatórias dessa reserva aparecem na loja.
- **[DEFINIDO]** O jogador não escolhe quais cartas aparecem na loja.
- **[DEFINIDO]** O jogador pode comprar uma carta disponível na loja para que ela vá para sua mão.
- **[PENDENTE]** Não está definido quantas cartas ficam visíveis na loja por vez.
- **[PENDENTE]** Não está definido se as ofertas não compradas permanecem, expiram ou são substituídas na rodada seguinte.
- **[PENDENTE]** Não está definido se uma carta comprada é removida definitivamente da reserva, se pode voltar à loja após ser vendida, ou se existem cópias limitadas/ilimitadas.
- **[PENDENTE]** Não está definido se a loja pode repetir cartas, como se comporta quando a reserva se esgota, ou se o jogador pode pagar para renovar a loja.
- **[PENDENTE]** Não está definido o tamanho máximo da mão nem o que ocorre caso ela ultrapasse esse limite.
- **[PENDENTE]** Também não está definida a composição inicial da reserva, a seleção de cartas para o baralho de cada jogador ou se existe uma coleção comum de cartas disponível para ambos.

**Nota de terminologia:** o documento preserva o sentido usado pelo criador, mas recomenda distinguir “reserva/pool” de “deck de compra” na documentação técnica. Não é necessário mudar a linguagem do jogo na interface; a distinção serve para impedir que agentes implementem, por engano, um baralho tradicional de compra aleatória quando a intenção atual é uma loja que exibe ofertas.

### 4.7. Venda e desvalorização

- **[DEFINIDO]** O jogador pode vender cartas que estejam no campo.
- **[DEFINIDO]** A venda só pode acontecer durante a própria rodada do jogador, antes do combate, na fase de planejamento em que ele também compra e posiciona cartas.
- **[INTERPRETAÇÃO A VALIDAR]** A carta vendida deve deixar de permanecer no campo, como consequência natural da venda; confirmar se existe alguma exceção pretendida.
- **[DEFINIDO]** O valor recuperado é depreciado: a carta perde valor de revenda conforme o número de rodadas/períodos em que permanece em campo.
- **[DEFINIDO]** O dano recebido também diminui o valor de revenda.
- **[DEFINIDO na intenção]** A desvalorização começa de imediato e aumenta conforme a permanência e o desgaste. “Imediata” indica que a carta não deve permanecer indefinidamente com valor de revenda intacto; o marco exato de atualização ainda precisa ser especificado.
- **[PENDENTE]** Não há fórmula, taxa ou tabela de revenda definida.
- **[PENDENTE]** É necessário determinar se o desgaste por tempo é uma quantia fixa, porcentagem por rodada ou combinação; como o dano contribui; e se o cálculo usa dano total sofrido ou Defesa atual.
- **[PENDENTE]** É necessário estabelecer um piso de revenda (por exemplo, nunca abaixo de zero). Essa é uma recomendação de segurança econômica, não uma regra já aprovada.
- **[PENDENTE]** Não foi definido em que momento exato se aplica o primeiro desconto: ao posicionar a carta, no início da próxima rodada ou no encerramento da rodada em que ela foi colocada.
- **[PENDENTE]** Não foi definido o destino de uma carta vendida ou eliminada: retorno à reserva, descarte permanente, pilha de descarte ou outro sistema.
- **[PENDENTE]** Não foi definido se uma carta pode ser comprada, colocada e vendida na mesma rodada, nem quais custos/limites impedem ciclos economicamente abusivos.

### 4.8. Combate por coluna

O comportamento pretendido do combate básico pode ser resumido assim:

1. O jogador posiciona cartas nas fileiras e colunas do próprio campo.
2. Ao chegar ao momento do combate, as cartas que podem causar dano atacam ao longo da sua coluna, em direção ao campo adversário.
3. O alvo é uma carta inimiga posicionada mais à frente na coluna correspondente.
4. Uma carta que esteja atrás de outra não deve ser atingida por um ataque que seja bloqueado pela carta à frente.
5. Se a coluna relevante estiver vazia — isto é, não houver carta inimiga que intercepte o ataque —, o dano pode atingir diretamente o Líder adversário.
6. Cartas colocadas em outras colunas não interceptam esse ataque.
7. A Defesa da carta atingida é reduzida conforme a regra de dano a definir; ao chegar a zero, a carta é eliminada.

**Importante:** a lista acima descreve a intenção estratégica, mas ainda não é um algoritmo completo. Antes de codificar o combate, é obrigatório especificar a seleção do alvo, o tratamento de vários atacantes na mesma coluna, o que acontece se a primeira carta morrer durante a resolução e se o Líder recebe ataques múltiplos na mesma rodada.

### 4.9. Fases da rodada: proposta, não regra aprovada

A conversa estabelece que compra, venda e posicionamento acontecem durante a rodada do jogador, antes do combate. A ordem global do turno, porém, ainda não está fechada. A estrutura abaixo é uma **[RECOMENDAÇÃO]** a avaliar:

1. **Início do turno:** conceder recursos e atualizar a loja, se aplicável.
2. **Planejamento:** comprar ofertas, vender cartas em campo e posicionar cartas da mão conforme os limites definidos.
3. **Resolução de combate:** resolver os ataques do campo conforme as regras de coluna e alvo.
4. **Encerramento:** remover cartas eliminadas, atualizar desgaste/desvalorização e conferir a vitória.
5. **Próximo jogador/rodada:** avançar para o próximo estado conforme o modelo de turnos aprovado.

Ainda é preciso determinar se cada jogador tem seu próprio turno sequencial e o combate ocorre após cada turno, se os dois planejam antes de um combate conjunto, ou se a palavra “rodada” tem outro significado. Não implemente esta sequência como definitiva sem confirmação.

## 5. Ambiguidades prioritárias: o que precisa ser decidido

As prioridades abaixo indicam dependência de desenvolvimento, não importância criativa. Recomenda-se resolver os itens P0 antes de escrever o motor de combate/economia definitivo.

### P0 — Bloqueadores de regras e arquitetura

| ID | Pergunta | Por que bloqueia | O que precisa ser decidido |
|---|---|---|---|
| P0-01 | Flanco tem Defesa zero ou apenas pouca proteção? | Defesa é vida; zero significa eliminação. Uma carta com Defesa literalmente zero não consegue existir em campo sob a regra atual. | Escolher: Defesa/vida baixa e positiva; separar Vida de Armadura/Defesa; ou outro significado explícito. |
| P0-02 | Em que momento é pago o custo da carta? | A compra leva a carta à mão, mas os recursos também limitam o posicionamento. Não é possível implementar corretamente a economia sem saber se comprar e jogar são cobranças separadas. | Definir custo de compra, custo de posicionamento e limites por turno. |
| P0-03 | Como recursos são recebidos? | Loja, compras e venda dependem de renda e saldo. | Definir recurso inicial, renda por turno, acumulação e limites, ainda que em valores temporários de protótipo. |
| P0-04 | Qual é o ciclo exato de turno/rodada? | Determina quando comprar, vender, colocar cartas, atacar, depreciar e verificar vitória. | Definir a sequência dos dois jogadores e quando ocorre o combate. |
| P0-05 | Quem recebe cada ataque numa coluna? | A descrição define alvo “mais à frente”, mas não esclarece o caso de vários atacantes e vários defensores. | Definir regra de alvo por ataque, prioridade da linha de frente, correspondência por fileira e efeito de eliminar um alvo durante a resolução. |
| P0-06 | Ataque é igual ao dano? | Os atributos e os pontos de dano foram mencionados, mas a fórmula não foi explicitada. | Confirmar dano = Ataque, ou definir modificadores/defesa/redução. |
| P0-07 | Como ataques são resolvidos? | Simultaneidade/sequência altera se cartas eliminadas conseguem atacar e a sobrevivência das unidades. | Definir ordem por coluna/carta ou resolução simultânea; definir quando as eliminações são aplicadas. |
| P0-08 | Como o Líder funciona? | O Líder é a condição de vitória e alvo quando uma coluna não tem bloqueador, mas seus atributos e regras não foram descritos. | Definir vida/Defesa, se ataca, se pode receber efeitos e quando a derrota encerra a partida. |
| P0-09 | Cartas de Efeito ocupam posição e têm vida? | Isso muda a ocupação dos 12 espaços e como o combate as trata. | Definir se são permanentes, consumíveis, globais ou posicionadas. |

### P1 — Regras necessárias para uma partida completa

| ID | Pergunta | Decisão necessária |
|---|---|---|
| P1-01 | Quantas ofertas tem a loja? | Número de cartas visíveis por jogador e se as ofertas são compartilhadas ou independentes. |
| P1-02 | O que ocorre com ofertas não compradas? | Permanecem, expiram, são substituídas ou podem ser renovadas mediante pagamento. |
| P1-03 | Como cartas circulam pela reserva? | Remoção ao comprar, cópias, retorno após venda, descarte após eliminação e comportamento quando esgota. |
| P1-04 | Há limite de mão? | Tamanho máximo e tratamento de excesso. |
| P1-05 | Quantas cartas podem ser compradas/colocadas? | Limite de ações, limite de cartas, limite por custo ou apenas saldo disponível. |
| P1-06 | É possível mover cartas já posicionadas? | Se sim, em quais condições, com qual custo e se isso conta como ação. |
| P1-07 | Como o dano persiste? | Se cartas mantêm a Defesa atual entre rodadas e se há cura/reparo. |
| P1-08 | Como a desvalorização é calculada? | Fórmula de tempo, fórmula de dano, momento de atualização, piso de revenda e arredondamento. |
| P1-09 | O que acontece com cartas eliminadas? | Remoção imediata ou ao fim do combate e destino na economia/reserva. |
| P1-10 | Como funcionam os efeitos? | Alvos, alcance, duração, ordem, acumulação, remoção, cancelamento e timing. |
| P1-11 | Quais são as regras de Elite? | Classe-base, atributos, gatilhos, restrições de cópia, custo e complexidade de condições especiais. |
| P1-12 | Como a partida termina? | Vitória por Líder a zero, empates, limites de duração e abandono/desconexão. |
| P1-13 | Como se prepara uma partida? | Reservas iniciais, seleção de cartas, cartas duplicadas e configuração dos Líderes. |

### P2 — Balanceamento, experiência e robustez

- Valores exatos de Ataque, Defesa, custo e estatísticas do Líder.
- Quantidade de cartas por classe e proporção de ofertas.
- Probabilidade de aparecer cada carta, proteção contra sequências de azar e repetição na loja.
- Se existe limite de Elite por jogador ou no campo.
- Feedback visual para alvo, dano, venda, desvalorização e bloqueio.
- Histórico de combate/log de ações para explicar os resultados ao jogador.
- Regras de animação versus resolução lógica: a animação deve representar um estado de combate já determinado, não alterar a lógica.
- Interface para indicar preço original, valor de revenda atual, dano sofrido e custo de uma compra.
- Métricas de balanceamento: taxa de vitória por estratégia, duração média, frequência de vitória por coluna e uso das classes.
- Modos de partida e comportamento da IA adversária, depois de inspecionar o protótipo atual.

## 6. Recomendações de design para validar — ainda não aprovadas

Esta seção não transforma sugestões em regras. São hipóteses para facilitar decisões futuras.

### 6.1. Manter Vida e Armadura coerentes

Como Defesa já significa vida, evitar atribuir Defesa zero a uma carta que deve permanecer em campo. Para preservar a fantasia de um atacante frágil, uma solução simples é usar Defesa baixa, mas positiva. Uma alternativa mais complexa é criar atributos separados para Vida e Armadura; isso só deveria ser escolhido se adicionar profundidade suficiente para compensar a complexidade.

### 6.2. Fixar uma regra de alvo determinística

Para a primeira versão, escolher uma regra simples, fácil de explicar e testar. Por exemplo, uma única carta inimiga mais à frente poderia bloquear a coluna; no entanto, ainda é preciso decidir se ela recebe todos os ataques, se existe correspondência por fileira e se ataques posteriores podem avançar após a eliminação do alvo. Não adotar esse exemplo sem decisão do criador.

### 6.3. Separar conteúdo de lógica

Sempre que possível, representar cartas como dados (identificador, classe-base, atributos, custo e habilidades), enquanto as regras de combate e economia permanecem em funções de lógica testáveis. Isso deve ser adaptado à arquitetura que o protótipo já utiliza, sem reescrever o projeto automaticamente.

### 6.4. Usar uma fórmula de revenda explicável

A fórmula deve ser previsível para o jogador e exibir o valor atual antes da venda. Convém evitar valores negativos e definir explicitamente arredondamento. A forma exata (taxa fixa, percentual ou combinação) precisa ser decidida e testada; nenhum número é proposto como definitivo neste documento.

### 6.5. Tratar a aleatoriedade como sistema testável

A seleção aleatória da loja deve poder ser testada de maneira reproduzível. Recomenda-se permitir uma fonte de aleatoriedade controlável por testes (por exemplo, semente ou função injetável), evitando testes que falham ocasionalmente por causa de sorte não controlada. Isso é recomendação de implementação, não regra visível ao jogador.

### 6.6. Começar com uma fatia jogável pequena

Não é necessário criar dezenas de cartas antes de validar o loop. Uma primeira fatia pode usar um conjunto pequeno de cartas de Tropa e Escudo, mais um modelo de ataque para testar o combate; Flanco só entra depois que a questão de Defesa estiver resolvida. Efeitos e Elites podem ser adicionados após o motor-base ficar estável. A lista exata de cartas de teste será decidida durante o projeto.

## 7. Plano de implementação com Codex

### Princípios para todas as fases

1. **Inspecionar antes de alterar.** O protótipo 0.1 já foi descrito pelo criador como funcional e testado. O agente deve verificar o repositório real e preservar o que funciona.
2. **Uma fatia por vez.** Cada tarefa deve ter objetivo, escopo, itens fora de escopo, critérios de aceitação e testes.
3. **Regra aprovada antes do código definitivo.** Não resolver ambiguidades de design silenciosamente.
4. **Testes junto com implementação.** Não deixar os testes para o final; cada regra central deve ter exemplos previsíveis.
5. **Mudanças pequenas e revisáveis.** Evitar reescrita ampla e alterações em arquivos sem relação com a tarefa.
6. **Validar a experiência no protótipo.** Testes automatizados são essenciais, mas a pessoa que cria o jogo também deve conseguir jogar e avaliar as decisões.
7. **Documentação sincronizada.** Quando uma regra for aprovada ou alterada, atualizar este documento e os testes afetados.

### Fase 0 — Auditoria do protótipo atual (somente leitura)

**Objetivo:** entender a base existente antes de definir como integrar o sistema.

**Pedir ao Codex:**

> Analise o repositório completo do protótipo atual sem modificar arquivos. Identifique a stack, a arquitetura, os pontos de entrada, como executar o projeto, os scripts disponíveis, os testes existentes e o estado do controle de versão. Descreva quais partes do jogo já existem e como estão implementadas. Compare o que encontrar com a especificação do jogo, distinguindo: já implementado, parcialmente implementado, ausente e incompatível. Liste riscos de integração e recomende o menor caminho para implementar o sistema de regras. Não implemente nada, não formate arquivos e não faça alterações. Se alguma conclusão não puder ser verificada, marque-a como hipótese.

**Conclusão da fase:** relatório de auditoria revisado pelo criador; comandos para rodar e testar o protótipo conhecidos; nenhuma alteração inesperada no repositório.

### Fase 1 — Fechar os bloqueadores das regras

**Objetivo:** decidir os itens P0 antes de implementar o motor.

**Pedir ao Codex:**

> Com base na especificação e na auditoria do repositório, prepare uma lista objetiva dos bloqueadores de regras P0. Para cada item, apresente a ambiguidade, por que ela impacta código/testes e 2–3 opções com consequências. Não escolha por mim e não altere código. Identifique dependências entre decisões e recomende uma ordem para eu aprová-las.

O criador decide; o Codex atualiza o documento e converte as decisões aprovadas em regras testáveis. Esta fase não precisa fechar todo o balanceamento, mas deve fechar as regras que determinam estado, compra/posicionamento, dano, alvo e turno.

**Conclusão da fase:** especificação mínima sem contradições conhecidas nos fluxos que serão implementados. O que continuar pendente fica explicitamente fora do escopo.

### Fase 2 — Modelar o estado do jogo e os dados das cartas

**Objetivo:** criar ou adaptar as estruturas internas sem implementar todas as mecânicas ao mesmo tempo.

**Escopo candidato:** jogador, Líder, carta e seus atributos, classe-base, estado da carta, campo 4×3, mão, reserva, loja, saldo de recursos, turno/fase e estado da partida. Adotar os nomes e tipos adequados à stack já existente.

**Critérios de conclusão:** estado serializável/inspecionável conforme a arquitetura; invariantes documentados (por exemplo, nenhuma carta pode ocupar duas posições ao mesmo tempo); testes de criação e alteração básica de estado; nenhuma regra de combate ainda escondida na camada visual.

**Nota:** o Codex deve adaptar esse escopo ao código real. Não criar uma arquitetura excessiva só porque a lista sugere entidades separadas.

### Fase 3 — Tabuleiro e posicionamento

**Objetivo:** representar os dois campos e validar a ocupação das 12 posições por jogador.

**Critérios de conclusão:** 4 colunas × 3 fileiras corretamente mapeadas; cartas posicionadas em uma posição válida; prevenção de ocupação duplicada; limites por rodada aplicados somente conforme regras aprovadas; nenhuma interação horizontal introduzida no combate básico sem uma regra específica de Efeito.

**Testes sugeridos:** campo vazio; primeira colocação; colocação em diferentes colunas; tentativa de ocupar posição já ocupada; campo cheio; validação de orientação/frente definida.

### Fase 4 — Motor de combate básico

**Objetivo:** implementar ataque, seleção de alvo, dano, eliminação e dano ao Líder sem depender da interface ou da loja.

**Pré-requisitos:** decisões P0-01, P0-04, P0-05, P0-06, P0-07 e P0-08 aprovadas.

**Critérios de conclusão:** a regra de coluna é obedecida; alvos são escolhidos conforme a regra definida; cartas com Defesa zero são removidas no momento especificado; a coluna vazia pode atingir o Líder nas condições aprovadas; a partida reconhece a derrota do Líder; os casos-limite têm testes determinísticos.

**Testes sugeridos:** coluna sem cartas; uma carta em frente de outra; várias cartas na mesma coluna; múltiplos atacantes contra um alvo; alvo eliminado durante a resolução; duas cartas que se eliminariam mutuamente; vários ataques ao Líder; nenhuma interação entre colunas adjacentes.

### Fase 5 — Turnos e ciclo econômico

**Objetivo:** integrar recursos, loja, compra, mão, posicionamento, venda e desvalorização.

**Pré-requisitos:** P0-02, P0-03 e P0-04 aprovados, além das decisões P1 necessárias para um ciclo mínimo completo.

**Subetapas recomendadas:**

1. implementar recursos e regras de fase;
2. implementar seleção e atualização das ofertas da loja;
3. implementar compra e passagem para a mão;
4. implementar posicionamento da mão no campo;
5. implementar venda de cartas em campo;
6. implementar desvalorização por tempo e dano;
7. integrar tudo ao ciclo de combate e avanço de turno.

**Critérios de conclusão:** o saldo é correto após cada ação; a loja respeita as regras de aleatoriedade e reposição; a compra coloca a carta na mão; só as ações autorizadas podem acontecer na fase atual; a venda ocorre antes do combate e remove a carta do campo; a revenda usa a fórmula aprovada; não há formas não intencionais de duplicar cartas ou gerar recursos infinitos.

### Fase 6 — Primeiro loop jogável de ponta a ponta

**Objetivo:** garantir que uma partida curta possa começar, avançar por turnos, comprar/posicionar cartas, resolver combate e terminar por vitória.

**Critérios de conclusão:** jogador consegue experimentar o ciclo inteiro usando a interface que o protótipo já possui; recursos e estado do tabuleiro permanecem consistentes; existe indicação inteligível de vitória/derrota; o protótipo permanece executável e os testes anteriores continuam passando.

**Regra:** só depois desta fase vale a pena expandir significativamente o catálogo de cartas. Se a experiência não for interessante, ajustar o loop fundamental antes de adicionar complexidade.

### Fase 7 — Cartas de Efeito

**Objetivo:** implementar a estrutura geral de habilidades e um pequeno conjunto de efeitos de teste.

**Pré-requisitos:** P0-09 e regras gerais de alvo, duração, timing e ocupação aprovadas.

**Critérios de conclusão:** efeitos são aplicados no momento correto; os alvos são válidos; duração e término são determinísticos; efeitos não deixam o estado inconsistente; cada efeito tem testes isolados e teste de integração com o combate.

**Cuidado:** evitar escrever um sistema excessivamente genérico para efeitos hipotéticos que ainda não existem. Criar abstração suficiente para as habilidades realmente aprovadas.

### Fase 8 — Cartas Elite

**Objetivo:** implementar o formato aprovado de cartas Elite usando as regras-base já existentes.

**Pré-requisitos:** conceito de classe-base/Elite e condições especiais definidos; Efeitos suficientemente estáveis se houver Elite de Efeito.

**Critérios de conclusão:** uma Elite expressa sua classe-base e suas condições especiais sem duplicar o motor de combate; as regras especiais são testáveis; limites e custos são respeitados.

### Fase 9 — Balanceamento, revisão e polimento

**Objetivo:** usar partidas reais e testes para ajustar custo, Ataque, Defesa, renda, loja e desvalorização.

**Atividades:** registrar partidas; observar se uma coluna dominante decide jogos com pouca resposta; verificar se Escudo trava o combate excessivamente; verificar se Flanco consegue ser útil sem ser eliminado automaticamente; avaliar se a loja aleatória cria escolhas ou apenas frustração; investigar se a revenda favorece ciclos abusivos; ajustar valores em pequenos lotes.

**Critérios de conclusão:** não é “jogo perfeitamente balanceado”; é uma versão em que as regras são coerentes, os problemas conhecidos estão registrados, não há exploits óbvios e o sistema é fácil de testar e modificar.

### Fase 10 — Modo de jogo e melhorias futuras

Após auditar o protótipo e confirmar o objetivo de produto, definir a prioridade entre adversário de IA, dois jogadores locais ou partidas online. Se houver multiplayer online, isso afetará autoridade do estado, sincronização, validação de ações e tratamento de desconexão. Não implementar infraestrutura de rede antes de confirmar que esse é o modo desejado e entender como o protótipo está estruturado.

## 8. Como distribuir o trabalho entre agentes de IA

A recomendação é usar múltiplos agentes por tarefas delimitadas, não fazer com que todos tentem projetar e implementar o jogo inteiro ao mesmo tempo.

| Papel | Responsabilidade | Limites |
|---|---|---|
| Agente coordenador/principal | Mantém o plano, escolhe a tarefa seguinte, integra alterações e resolve conflitos técnicos. | Não decide silenciosamente as regras de design. |
| Revisor de regras | Procura ambiguidades, contradições, casos-limite e critérios de teste ausentes. | Não muda as regras aprovadas sem autorização. |
| Agente implementador | Implementa uma fase/tarefa específica. | Não amplia o escopo nem refaz módulos não relacionados. |
| Agente de testes/revisão | Cria/executa testes, procura regressões e verifica os critérios de aceitação. | Reporta falhas com evidência; não “corrige” o design inventando regras. |

Esses papéis podem ser atribuídos a sessões diferentes ou acionados apenas quando úteis. A estratégia deve ser adaptada ao que o Codex e o repositório suportarem.

**Regra de concorrência:** evitar que dois agentes editem ao mesmo tempo os mesmos arquivos centrais. Trabalho paralelo é mais seguro quando as tarefas são independentes (por exemplo, revisar regras enquanto outro prepara casos de teste sem editar a mesma implementação). Um agente deve ser responsável pela integração final.

## 9. Modelo de pedido para cada tarefa do Codex

Usar este formato para tarefas de implementação:

> **Contexto:** consulte `GAME_RULES.md` e as instruções do repositório.  
> **Objetivo:** [uma única entrega clara].  
> **Regras aprovadas relevantes:** [IDs/seções da especificação].  
> **Escopo:** [o que deve mudar].  
> **Fora do escopo:** [o que não deve mudar].  
> **Critérios de aceitação:** [resultados observáveis].  
> **Testes:** adicione/atualize testes para os casos normais e os limites descritos; rode os testes relevantes e informe o resultado real.  
> **Compatibilidade:** preserve o comportamento existente que não foi explicitamente alterado.  
> **Dúvidas:** não invente respostas para regras pendentes; pare e reporte as ambiguidades que bloqueiam a execução.  
> **Entrega:** resumo dos arquivos alterados, decisões tomadas dentro do escopo, testes executados, resultado, limitações e próximos passos sugeridos. Não declare testes aprovados sem executá-los.

### Pedido de revisão após cada fase

> Revise a implementação da fase [N] contra os critérios de aceitação em `GAME_RULES.md`/`ROADMAP.md`. Não adicione funcionalidades. Procure inconsistências de regras, casos-limite, duplicação de estado, regressões e testes ausentes. Execute a suíte relevante e relate cada problema com evidência, severidade e arquivo/local aproximado. Se encontrar uma ambiguidade de design, registre-a em vez de escolher uma regra por conta própria.

## 10. Estrutura de documentação recomendada no repositório

A proposta inicial é manter poucos documentos, com funções distintas:

- `GAME_RULES.md` — regras oficiais e decisões aprovadas; documento de referência para o jogo.
- `OPEN_QUESTIONS.md` — ambiguidades pendentes, opções consideradas, responsável pela decisão e estado.
- `ROADMAP.md` — fases, dependências, critérios de aceitação e progresso.
- `AGENTS.md` — instruções persistentes para os agentes: como executar testes, convenções e limites de alteração.
- Testes automatizados — exemplos executáveis das regras que não podem regredir.

Este documento consolidado pode ser usado como ponto de partida para esses arquivos, mas não é obrigatório copiar tudo para quatro arquivos antes de começar. Após a auditoria, o Codex pode propor uma divisão mínima e sem duplicação. A versão consolidada deve continuar sendo fácil de atualizar.

## 11. Critério para considerar uma regra pronta para codificação

Uma regra está pronta quando:

1. a intenção está escrita sem contradição com outras regras;
2. é possível descrever o comportamento esperado em situações normais e de limite;
3. as condições de entrada, resultado e momento de aplicação são explícitas;
4. há pelo menos um exemplo verificável ou teste correspondente;
5. casos não decididos estão identificados como fora do escopo, e não resolvidos silenciosamente pelo agente.

Exemplo: “Defesa é vida e uma carta com Defesa zero é eliminada” é uma regra clara. “Flanco não tem Defesa” entra em conflito com ela se o valor for literalmente zero. Antes de desenvolver Flanco, esse conflito precisa ser resolvido. Do mesmo modo, “ataques atingem a carta mais à frente” precisa explicar qual carta é selecionada quando há múltiplas cartas e vários atacantes na mesma coluna.

## 12. Resumo de decisões atuais

### Pode ser tratado como definido

- Jogo 1v1, com um Líder para cada jogador.
- Vitória relacionada à derrota do Líder adversário e sobrevivência do próprio.
- Campo próprio de 4 colunas × 3 fileiras por jogador.
- Combate básico orientado por coluna; sem ataques horizontais comuns entre colunas diferentes.
- Cartas da frente protegem as que estão atrás, de acordo com uma regra de alvo que ainda precisa de precisão operacional.
- Defesa funciona como vida; ao chegar a zero, a carta é eliminada.
- Classes conceituais: Tropa, Escudo, Flanco, Efeito e Elite.
- Tropa tem Ataque/Defesa medianos; Escudo tem Defesa alta e não ataca; Flanco tem Ataque alto e “nada de Defesa” (conflito a resolver); Efeito aplica efeitos; Elite deriva de uma das quatro classes e possui atributos elevados e condições especiais.
- Cartas têm custo associado à eficiência.
- Cartas não compradas permanecem numa reserva/deck e ofertas aleatórias aparecem na loja.
- O jogador compra uma oferta para levar a carta à mão.
- Durante a própria rodada, antes do combate, o jogador pode vender cartas em campo, comprar ofertas e posicionar cartas da mão.
- O valor de revenda diminui com o tempo em campo e com o dano recebido.

### Ainda não deve ser implementado como regra definitiva

- Fórmula de dano e valor numérico dos atributos.
- Turnos, fases e ordem de resolução completa.
- Modelo de recursos e momento de cobrança dos custos.
- Algoritmo exato de alvos por coluna e tratamento de múltiplos ataques.
- Regras de vida/ataque do Líder.
- Interpretação final da Defesa do Flanco.
- Regras completas de Efeito e Elite.
- Quantidade/atualização da loja, composição da reserva, limite de mão e movimentação de cartas.
- Fórmula e momento da desvalorização, destino de cartas vendidas/eliminadas e condição de empate.
- Modo de jogo final (humano, IA local, local ou online).

## 13. Próximo passo recomendado

O próximo pedido ao Codex deve ser **a Fase 0: auditoria somente de leitura do protótipo atual**. Não comece pedindo ao Codex para implementar todo o sistema. Primeiro descubra a estrutura e o estado real do projeto; depois feche os bloqueadores P0 e só então construa as regras em fatias testáveis.

O sucesso deste processo não será medido pela quantidade de código produzida por rodada de agentes, mas por cada etapa acrescentar uma mecânica compreensível, testada e integrada sem quebrar o que já funciona.
