# Roadmap técnico

## Início da Versão 1.0 — combate e arena manual

- [x] Implementar resolução pura de combate por coluna para Tropa e defesa por Escudo.
- [x] Registrar hipóteses H-01 a H-08 e questões abertas.
- [x] Cobrir seleção, dano acumulado, eliminação, vida do Líder, empate e imutabilidade com testes.
- [x] Executar `npm test` (39 testes), `npm run typecheck` e `npm run build`.
- [x] Disponibilizar a Arena de Combate com cenário repetível e exibição do estado/eventos do resolvedor.
- [x] Manter a partida de pontuação do Prototype 0.1 separada da demonstração.
- [x] Executar Playwright (2 fluxos: partida existente e arena de combate).

## Etapa atual — mãos, recursos e rodadas

- [x] Evoluir `DuelState` para mãos, fontes de cartas, recursos, fase, iniciativa e preparação.
- [x] Implementar posicionamento legal com pagamento e limite de uma carta por participante/rodada.
- [x] Fazer o bot escolher apenas cartas da própria mão, usando validador compartilhado e estado público redigido.
- [x] Resolver combate uma vez após ambas as preparações e avançar compra/renda/iniciativa.
- [x] Verificar privacidade da mão adversária fornecida à política do bot.
- [x] Executar `npm test` (48 testes), `npm run typecheck`, `npm run build` e `npm run test:e2e` (3 fluxos).
- [x] Verificar visualmente a partida, o posicionamento, a ação do bot, o combate e o reinício.

## Próximas etapas — ainda não iniciadas

1. Comparar a documentação Markdown local com DOCX/TXT de referência, quando disponíveis.
2. Revisar e aprovar regras provisórias com o Diretor Humano.
3. Decidir integração do estado da fundação à UI e ciclo de partida.
4. Definir regras de economia, turnos e recuperação antes de implementá-los.
5. Definir regras de Flanco, Efeito e Elite antes de incluí-los no combate.
6. Fazer partidas de avaliação e ajustar parâmetros, incluindo vida do Líder.
