# Roadmap das regras — preparação da Versão 1.0

**Status:** plano documental. Nenhuma etapa abaixo concede autorização de implementação. O roadmap técnico existente permanece preservado em `roadmap.md`; este arquivo trata somente da maturidade das regras.

## 1. Consolidado documentalmente, pendente de validação

- Campo próprio 4×3, colunas independentes, Defesa como resistência e Líder como condição de vitória.
- Propostas operacionais: frente relativa ao proprietário; primeiro defensor da coluna; fotografia e dano simultâneo; sem transbordamento; dano persistente recomendado.
- Terminologia “rodada”/“turno de planejamento”.
- Elite modelada como subtipo de classe-base.
- Integridade das zonas de carta e casa única propostas.

Esses itens têm redação coerente, mas não são decisões oficiais até o Diretor validá-los.

## 2. Decisões que aguardam validação do responsável

1. Confirmar o duelo 1v1 como direção de produto, sem apagar as propostas iniciais.
2. Validar a estrutura de planejamento e iniciativa.
3. Escolher foco simultâneo sem transbordamento ou resolução sequencial com avanço.
4. Resolver Flanco sem Defesa versus Defesa como vida.
5. Aprovar vida do Líder e regras terminais após testes de partida.
6. Fechar compra, custo, renda, ofertas, mão, ações, venda, revenda e destinos.
7. Definir Efeito, condições de Elite e seus limites.

## 3. Cenários adicionais necessários

- Comparar planejamento visível sequencial com seleção simultânea/oculta.
- Partida longa com dano persistente, sem cura, contra alternativa de recuperação.
- Foco em um bloqueador com múltiplos atacantes; comparar sem transbordamento e avanço.
- Compra, posicionamento, venda e eliminação sob limites de recurso/ação.
- Reserva esgotada e loja sem oferta válida.
- Venda e recompra sob cada política de destino.
- Efeito simultâneo a eliminação e fim de partida, após uma gramática de efeitos existir.

Consulte cenários já especificados em `rule-test-scenarios.md`. Cenários condicionados a regras ainda abertas não têm resultado afirmado.

## 4. Sistemas aptos a uma futura implementação após validação

- Modelo espacial 4×3 e coordenadas relativas, após confirmar RULE-002/003.
- Resolução de combate-base de Tropa/Escudo, após validar RULE-004..007 e vida do Líder.
- Integridade de zonas de carta após definir compra e destino.

Loja, economia completa, revenda, Flanco, Efeito e Elite não estão prontos para implementação. Esta lista mede prontidão documental potencial, não autorização.

## 5. Assuntos adiados

Tema e arte final; catálogo grande; valores balanceados; modo online e desconexão; salvamento; regra de abandono/limite de rodadas; efeitos não definidos; integração entre protótipo de pontuação e arena; comparação com fontes DOCX/TXT não disponíveis.

## 6. Etapas e critérios de conclusão

| Etapa | Entrega | Critério de conclusão |
|---|---|---|
| A — validação de identidade | Decisão explícita do Diretor sobre o recorte 1v1. | Registro oficial atualizado pelo responsável; propostas antigas preservadas. |
| B — validação do combate | Decisões sobre alvos, simultaneidade, dano, cura, Líder. | Nenhum caso-base sem resultado; cenários de combate revisados. |
| C — fechamento econômico | Compra, renda, loja, ações, destinos e revenda. | Fluxos e invariantes explícitos; cenários não permitem duplicação ou ciclo não intencional. |
| D — classes e efeitos | Flanco, Efeito, Elite e prioridades. | Cada carta/habilidade piloto tem timing, alvo, duração e estado de saída explícitos. |
| E — revisão de consistência | Revisão cruzada da especificação e cenários. | Sem contradição não registrada; questões abertas com responsável/dependência. |
| F — avaliação de partidas | Registro de partidas e dados de parâmetros. | Amostra e métricas documentadas; riscos conhecidos; sem alegação prematura de equilíbrio. |
| G — autorização futura | Pedido separado para implementação, se desejado. | Regras selecionadas e escopo técnico autorizados explicitamente. Este roadmap não substitui tal autorização. |

## 7. Critérios gerais de encerramento

Documento apto para revisão quando o Diretor puder aprovar, rejeitar ou alterar propostas identificadas por RULE; todas as questões tiverem estado e dependência; cenários normativos forem inequívocos; nenhuma hipótese de protótipo estiver apresentada como regra aprovada; e a revisão de diff confirmar que somente documentação foi alterada.
