# Relatório de testes — Prototype 0.1

**Data:** 27/10/2026  
**Versões relevantes:** Node.js 24.22.1, npm 11.19.1, Vitest 5.0.5, Playwright 1.64.1, Vite 7.3.7.

## Execuções finais

| Comando | Resultado | Evidência |
|---|---|---|
| `npm run typecheck` | Aprovado | `tsc --noEmit`, saída 0. |
| `npm run test` | Aprovado | 1 arquivo de teste, 8 testes aprovados. |
| `npm run build` | Aprovado | TypeScript passou; Vite compilou 35 módulos e gerou `dist/`. |
| `npm run test:e2e` | Aprovado | 1 fluxo Playwright passou em 8,1 s com Chromium 156.0.8078.4. |
| `npm audit` | Aprovado após atualização | O Vitest foi atualizado para 5.0.5; instalação e consulta offline subsequente reportaram zero vulnerabilidades. |

## Cobertura observada

Vitest verifica a composição e unicidade dos dois baralhos, distribuição inicial, reprodutibilidade de seed, compra e baralho vazio, validação de turno e posse, pontuação/reposição/alternância, vitória imediata em 10 pontos, empate por esgotamento e escolha do bot pela carta de maior valor com desempate por identificador.

Playwright confirma o menu, abertura/fechamento das regras, início de partida, mão e turno humanos, jogadas com resposta do bot até o resultado e reinício da partida.

## Nota sobre o ambiente

No sandbox, Vitest/Vite foram bloqueados antes da execução pelo erro do esbuild ao ler `../..` (`Access is denied`). As execuções finais acima foram repetidas fora do sandbox com a autorização disponível e passaram. O Chromium foi instalado pelo Playwright; o fluxo e2e não depende de serviço remoto.

Não foram encontrados bugs funcionais nas execuções finais. Esta cobertura verifica o protótipo temporário, não balanceamento ou design definitivo.
