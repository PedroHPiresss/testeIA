# Especificação do Jogo de Cartas — Versão 1.0

**Estado:** consolidação documental avançada para avaliação do Diretor Humano; não aprovada como regra definitiva.  
**Data:** 28 de outubro de 2026.  
**Base:** especificação v0.1, `docs/sistemas/game-rules.md`, `docs/sistemas/open-questions.md` e registro do projeto.  
**Convenção de leitura:** “Regra preservada” deriva da intenção documentada; “Proposta v1.0” é recomendação normativa deste documento, pendente de validação; “Hipótese de protótipo” descreve implementação temporária, não design aprovado; “Pendente” exige informação ou escolha adicional.

## 1. Propósito e identidade

O jogo em exploração nesta especificação é um duelo tático de cartas 1v1. Cada participante protege um Líder em seu campo de 4 colunas por 3 fileiras. O posicionamento por coluna cria corredores independentes: uma linha de frente pode proteger unidades atrás dela, enquanto uma coluna sem defesa pode expor o Líder. Gestão de recursos, ofertas aleatórias e venda depreciada acrescentam decisões econômicas ao combate.

Este recorte é a base de trabalho das regras v1.0, mas não registra escolha formal do conceito ou aprovação criativa. As propostas anteriores de “Cartógrafos do Impossível”, “Feira das Últimas Luas” e “Arquivo dos Ecos” continuam preservadas e não são substituídas por este documento. Tema, público, modo final e identidade visual continuam em aberto.

### Estados das regras

- **Preservada:** intenção já expressa na v0.1.
- **Consolidada documentalmente:** ambiguidade fechada por convenção recomendada para permitir avaliação; ainda sujeita ao Diretor.
- **Proposta v1.0:** solução nova recomendada, sem aprovação do Diretor.
- **Hipótese de protótipo:** valor ou fluxo presente na arena implementada, exclusivamente como evidência.
- **Pendente:** não há base segura para escolher uma regra única.
- **Adiada:** fora da fatia normativa atual.

## 2. Glossário

| Termo | Definição de trabalho |
|---|---|
| Partida | Duelo completo entre dois jogadores, da preparação ao resultado terminal. |
| Rodada | Ciclo global que inclui planejamento dos dois jogadores e uma resolução de combate. |
| Turno de planejamento | Janela de ações de um jogador dentro da rodada. Evita usar “turno” como sinônimo de rodada. |
| Campo | Grade própria de 4 colunas × 3 fileiras. |
| Frente | Posição de menor índice de fileira no campo do proprietário; orientação visual é independente. |
| Unidade/carta em campo | Carta que ocupa uma casa e pode interceptar ataques conforme sua elegibilidade. |
| Líder | Personagem/peça central do jogador; sua derrota encerra a partida. Não se presume que ocupe uma casa do campo. |
| Reserva | Conjunto de cartas ainda não expostas ou adquiridas. A composição é pendente. |
| Oferta | Carta visível na loja e disponível para compra. |
| Mão | Cartas compradas e ainda não posicionadas. |
| Defesa atual | Resistência restante. Defesa zero elimina a carta. |
| Ataque | Potência ofensiva. Na proposta-base, cada ponto causa um ponto de dano. |

## 3. Componentes e preparação

**Preservado:** dois jogadores, um Líder por jogador, dois campos próprios de 4×3 e cartas com custo, Ataque e Defesa. A composição das reservas, os atributos e a vida inicial oficial dos Líderes não estão definidos.

**Proposta v1.0:** representar fileiras em coordenadas relativas ao proprietário; fileira 0 é sempre a frente, e colunas são identificadas de 1 a 4 da esquerda para a direita na perspectiva de cada proprietário. Cada casa comporta no máximo uma carta. Uma carta recém-adquirida vai primeiro à mão; posicionamento requer casa vazia. Não há movimento nem reposicionamento depois de colocada, salvo regra de carta explícita.

**Pendente de validação:** composição e tamanho da reserva, seleção de baralho, duplicatas, mão inicial, posições de preparação, atributos do Líder e primeiro jogador. A H-09 (12 instâncias, mão de 3 e compra automática) permanece hipótese específica da arena.

## 4. Cartas, atributos e classes

Uma definição de carta deve conter, no mínimo, identificador de conteúdo, classe-base, custo, Ataque, Defesa inicial e texto de habilidade, se houver. Uma instância mantém proprietário, posição quando em campo e Defesa atual. Valores máximos e mínimos, custo e catálogo são parâmetros de balanceamento, não definidos aqui.

- **Tropa — preservada:** unidade geral com Ataque e Defesa medianos. A proposta-base permite atacar.
- **Escudo — preservada:** Defesa alta e não ataca por regra de classe. Ocupa uma casa e pode interceptar como outra unidade elegível.
- **Flanco — pendente:** intenção de Ataque alto e “nada de Defesa” conflita com Defesa zero eliminar imediatamente. Recomendação a validar: Defesa baixa, mas positiva, preservando os dois atributos existentes. Alternativa mais complexa: separar vida e armadura; exige justificativa adicional.
- **Efeito — pendente:** cartas que aplicam efeitos; não há definição segura sobre ocupar casa, ser consumida, timing, alvos ou duração.
- **Elite — consolidada documentalmente como subtipo:** tratar Elite como especialização associada a uma classe-base, e não como quinto comportamento independente. Isso preserva exemplos de Elite Tropa/Escudo/Flanco/Efeito. Bônus, condição, limite e raridade continuam pendentes.

Classes sem regras definidas não devem ser tratadas como inválidas por natureza. Até sua validação, ficam fora do conjunto de cartas habilitado para uma partida normativa.

## 5. Estrutura recomendada da rodada

As fontes afirmam que compra, venda e posicionamento ocorrem no planejamento do próprio jogador antes do combate, mas não determinam a ordem global. A estrutura abaixo é uma **proposta v1.0**, não a regra H-11 aprovada:

1. **Início da rodada:** verificar fim de partida; conceder renda definida; atualizar ofertas conforme regra da loja.
2. **Planejamento do primeiro jogador:** comprar ofertas, posicionar cartas da mão em casas válidas e vender cartas em campo, respeitando recursos e limites por ação.
3. **Planejamento do segundo jogador:** mesmas permissões e limites. A iniciativa alterna após cada rodada não terminal.
4. **Resolução de combate:** registrar alvos e ataques usando a fotografia dos campos após ambos os planejamentos; aplicar danos; remover unidades eliminadas; verificar Líderes.
5. **Fechamento:** atualizar idade/desvalorização das cartas sobreviventes no marco especificado pela regra econômica; avançar rodada.

O combate único depois dos dois planejamentos preserva a simetria da hipótese H-11 e evita que o primeiro combatente receba uma resolução extra. Ainda assim, abre uma escolha criativa: o segundo jogador planeja vendo alterações do primeiro no campo. Alternativas são planejamento simultâneo/oculto ou alternância com combate depois de cada jogador; comparar por cenários antes de validar.

**Proposta de ações:** as ações são individuais e explicitamente limitadas por tipo; custo de recurso, por si só, não define quantas compras/vendas são permitidas. Não há passe obrigatório se o jogador puder simplesmente encerrar planejamento. Quantidades de ações por rodada permanecem pendentes; H-11 (uma colocação ou passe) é hipótese de protótipo, não regra herdada.

## 6. Economia, loja e gestão

**Preservado:** fluxo conceitual reserva → ofertas aleatórias da loja → compra → mão → campo; recursos limitam ações; cartas no campo podem ser vendidas antes do combate; revenda diminui tanto com tempo em campo quanto com dano.

**Proposta normativa mínima:** compras transferem a oferta para a mão e removem aquela instância da oferta; posicionamento transfere uma carta da mão a uma casa vazia. Uma mesma instância não pode existir simultaneamente em reserva, oferta, mão e campo. O jogador não pode gastar recursos abaixo de zero. Estas convenções fecham integridade de estado, não determinam os valores econômicos.

Permanecem pendentes: instante de cobrança (compra, posicionamento ou ambos), renda e teto, número de ofertas, renovação e custo de renovar, permanência das ofertas não compradas, limite da mão e descarte quando excedido, esgotamento da reserva, repetição, custo de compra/posicionamento, fórmula de revenda, arredondamento, piso, marco da primeira depreciação, destino de carta vendida e destino de carta eliminada. H-09/H-10 não resolvem esses pontos: a arena compra de uma fonte pessoal e cobra ao posicionar, com recursos 3, +1/rodada e teto 8.

**Recomendação para avaliação:** comparar retorno à reserva, descarte permanente e pilha de descarte para cartas vendidas. Retorno pode fechar ciclo, mas pode criar compra-venda repetida; descarte evita reciclagem, mas reduz oferta efetiva. Não definir fórmula de revenda antes de resolver destino, frequência de aquisição e renda.

## 7. Posicionamento e combate

### 7.1. Elegibilidade e alvo

**Proposta-base derivada das H-01/H-02:** cada unidade atacante válida escolhe o primeiro defensor elegível na mesma coluna adversária, começando pela fileira 0. Um ataque não seleciona uma unidade atrás enquanto existir uma unidade elegível à frente. Fileiras dos atacantes não limitam alcance; unidades em qualquer profundidade podem atacar. Colunas diferentes não interagem no combate básico.

Se não houver defensor elegível na coluna, o ataque seleciona o Líder adversário. Esta regra precisa ser revisada quando Efeito/Elite definirem novos tipos de alvo. Escudo é defensor elegível e não atacante. Ataque zero causa zero dano e não pode, sozinho, encerrar a partida.

### 7.2. Resolução determinística

**Proposta consolidada documentalmente, pendente de validação:**

1. Congelar uma fotografia do campo no início da resolução.
2. Para cada atacante elegível vivo na fotografia, escolher um alvo conforme a regra da coluna.
3. Registrar todos os ataques antes de alterar Defesa. Atacantes distintos podem focar o mesmo alvo.
4. Cada ponto de Ataque causa um ponto de dano; somar os danos por alvo e aplicar simultaneamente, limitando Defesa/vida inferior a zero.
5. Remover cartas com Defesa zero após a aplicação. Não há transbordamento de excesso de dano para carta atrás nem redirecionamento ao Líder na mesma resolução.
6. Ataques de unidades que também chegam a Defesa zero nesta resolução continuam válidos, pois foram determinados pela fotografia inicial.
7. Verificar simultaneamente a vida dos dois Líderes. Um só Líder a zero dá vitória ao adversário; ambos a zero dão empate imediato.

Essa regra favorece foco e trocas simultâneas, reduz dependência da ordem de iteração e dá valor à linha de frente. Seu custo estratégico é não haver avanço na mesma resolução após matar o bloqueador. Alternativa sequencial com redirecionamento aumenta explosividade e torna ordem/prioridade mais sensíveis. A escolha requer validação do Diretor.

### 7.3. Dano persistente e cura

H-08 mantém dano entre combates sem cura automática, mas é apenas provisória. **Recomendação:** manter dano persistente como regra simples de desgaste; não presumir cura, reparo, regeneração ou Defesa acima do valor inicial. Cura e prevenção só existem quando um efeito explícito as definir. Requer teste de ritmo e sobrevivência de unidades.

## 8. Líder e encerramento

O Líder é a condição de derrota, não necessariamente uma unidade no tabuleiro. Ataques diretos ocorrem quando a coluna não tem defensor elegível na fotografia de combate. A vida 20 da H-07 é parâmetro provisório, configurável na implementação, e não valor recomendado ou balanceado.

**Proposta:** fim imediato após a resolução simultânea de dano quando um ou ambos os Líderes atingem zero. Não há empate por repetição, limite de rodadas ou impasse definidos. Essas condições, abandono, desconexão e modo online ficam adiados; qualquer modo digital futuro precisará política explícita de desconexão.

## 9. Efeitos, prioridades e estados

As fontes não definem uma gramática de efeitos. Para preparar expansão sem inventar um sistema amplo, cada futura habilidade deve especificar: momento de disparo, condição, controlador, alvos legais, duração, empilhamento/substituição, prevenção/cancelamento e o que ocorre se alvo/origem deixar de existir. Até lá, Efeito e habilidades Elite estão pendentes.

**Ordem provisória de prioridade para a regra-base:** validação de estado e ações; fechamento dos planejamentos; fotografia de combate; seleção de alvos; cálculo agregado de danos; aplicação simultânea; eliminações; condição de vitória; fechamento econômico. Uma habilidade futura poderá substituir uma etapa somente se disser explicitamente qual etapa e em que prioridade.

Estado inválido (carta duplicada em zonas, duas cartas na mesma casa, recurso negativo) deve impedir a ação que o produziria; não há regra para reparo automático de estado corrompido.

## 10. Exemplos normativos propostos

1. **Foco:** duas Tropas atacam a mesma coluna com Escudo na frente e Tropa atrás. Ambas atingem o Escudo; dano excedente não avança. A unidade traseira não recebe dano.
2. **Troca:** uma Tropa atacando é eliminada por dano simultâneo. Seu ataque continua aplicado porque atacante e alvo foram registrados antes do dano.
3. **Coluna vazia:** unidade atacante numa coluna sem defensor elegível causa dano ao Líder. Um Escudo em coluna adjacente não interfere.
4. **Bloqueador eliminado:** o dano combinado elimina o defensor frontal. A unidade atrás e o Líder não recebem dano adicional nesta resolução.
5. **Derrota simultânea:** ataques registrados em colunas abertas reduzem ambos os Líderes a zero; o resultado é empate.
6. **Casa ocupada:** posicionar carta da mão numa casa já ocupada é ação inválida e não altera mão, recursos ou campo.

Os cenários formais e dependências estão em `rule-test-scenarios.md` e `rule-dependencies.md`; não foram executados no protótipo.

## 11. Balanceamento e parâmetros

Não há evidência suficiente para afirmar equilíbrio de cartas, classes, economia ou duração. Vida 20, recursos 3/+1/teto 8, mão inicial 3, reserva de 12 instâncias, compra automática de 1 e limite de uma colocação são parâmetros hipotéticos de protótipo, não parâmetros da Versão 1.0 aprovada.

Avaliar em partidas futuras: duração e taxa de vitória por iniciativa; dano por coluna; proporção de ataques ao Líder; cartas compradas, posicionadas, vendidas e eliminadas; recursos acumulados/não gastos; valor recuperado e tempo em campo; frequência de uso e resultado por classe; número de rodadas sem mudança relevante. Ajustes devem mudar poucos parâmetros por vez e registrar amostra e condições.

## 12. Pendências de validação e escopo adiado

Prioridades e dependências constam em `open-questions.md` e `rule-dependencies.md`. Bloqueadores criativos principais: confirmar que este recorte 1v1 é a direção do produto; escolher planejamento visível sequencial ou simultâneo; aprovar resolução de foco simultâneo sem transbordamento; definir semântica de Flanco; especificar Efeito/Elite; fechar economia, compra e destino das cartas; validar vida do Líder e os parâmetros após partidas.

**Fora desta especificação normativa:** tema definitivo, arte final, catálogo completo, multiplayer online, desconexão, persistência de partida, implementação e balanceamento comprovado. Nada neste roadmap ou documento autoriza alterações de código.

## 13. Histórico e fontes

- **v0.1 (27/10/2026):** intenção do duelo, campo, classes e loja/venda registradas como regras conhecidas, recomendações e pendências.
- **H-01 a H-13 (27–28/10/2026):** implementação provisória da arena e seus parâmetros; não aprovada como design final.
- **v1.0 documental (28/10/2026):** propostas de fechamento operacional com status de validação explícito; nenhuma decisão oficial adicionada ao registro do Diretor.

Fontes adicionais consultadas: `docs/decisoes/registro.md`, `docs/auditoria-tecnica.md`, `docs/relatorio-testes.md`, `PROTOTYPE_RULES.md`, síntese e proposta de game design. Código/testes foram tratados apenas como evidência de comportamento; nenhum teste foi executado nesta missão.
