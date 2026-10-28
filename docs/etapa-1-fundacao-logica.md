# Etapa 1 — Fundação lógica

**Status:** concluída em 27/10/2026. Escopo restrito a modelos, campos e operações estruturais. Nenhuma regra de combate ou economia foi implementada.

## Referência e auditoria

A instrução citava `docs/GAME_DESIGN.md`, que não existe no repositório. A especificação foi localizada e lida em `docs/Especificacao_Jogo_Cartas_v0.1.md`. Antes das alterações, o protótipo passou no typecheck, nos 8 testes Vitest existentes, no build e no teste Playwright. O e2e iniciou a aplicação local. No Git não havia commits; por isso, não existia histórico versionado anterior para comparar.

## Estrutura adicionada

O módulo novo fica em `src/game/foundation/`, separado do motor provisório já usado pela interface:

- `types.ts`: tipos de definição/instância, classe-base, Líder, jogador, campo, estado 1v1 e resultados tipados.
- `cards.ts`: valida e cria definições e instâncias; a Defesa atual inicializa com a Defesa da definição.
- `field.ts`: campo de 4 colunas × 3 fileiras em ordem row-major (`row * 4 + column`), coordenadas neutras e consulta/atualização imutável.
- `players.ts` e `state.ts`: jogador com campo e Líder separados; estado com dois jogadores distintos e validação de owner, 12 posições e IDs de cartas únicos nos campos.
- `operations.ts`: posicionamento e retirada imutáveis. Posicionar valida jogador, coordenadas, owner, casa vazia e duplicação global; retirar devolve a instância ao chamador sem presumir destino.
- `foundation.test.ts`: 21 testes para modelos, validações, campos independentes, posicionamento, retirada e integridade.

Os arquivos do protótipo anterior, a UI e o e2e não foram alterados. Não foram adicionadas dependências.

## Decisões técnicas e limites

As quatro classes-base são representadas separadamente de `isElite`. Defesa zero é aceita no modelo, sem comportamento de eliminação. Coordenadas não significam frente ou fundo. Líder é um modelo independente, com atributos configuráveis e sem valores ou regras de combate padrão. Operações estruturais não incluem custo, turno, compra, venda, dano ou elegibilidade por classe.

Continuam pendentes as decisões de design documentadas na especificação, incluindo a contradição potencial do Flanco com Defesa zero, atributos/regras do Líder, posição e comportamento de cartas Efeito, semântica de combate/ataque, custos e economia. Este resultado não aprova nenhuma dessas regras.

## Verificações finais

- `npm run typecheck`: aprovado.
- `npm run test`: 2 arquivos, 29 testes aprovados (8 existentes + 21 da fundação).
- `npm run build`: aprovado; Vite transformou 35 módulos.
- `npm run test:e2e`: 1 teste aprovado; o protótipo continuou iniciando e o fluxo de menu/partida/resultado/reinício passou.

Vitest, build e Playwright foram executados fora do sandbox, pois o esbuild não conseguia ler a configuração Vite no contexto restrito. O QA revisou os casos e pediu testes adicionais para campos/Líderes com proprietário incompatível; eles foram incluídos antes da execução final. Não há lint configurado no projeto.

## Próxima etapa sugerida

Revisar esta fundação e, antes de implementar o motor principal, fechar os bloqueadores P0 aplicáveis na especificação. A próxima mudança de código deve ser autorizada separadamente e seguir a ordem de dependências nela descrita.
