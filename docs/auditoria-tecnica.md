# Auditoria e arquitetura técnica — Prototype 0.1

## Auditoria inicial (27/10/2026)

- O repositório continha `AGENTS.md` e documentos de concepção em `docs/`; não havia `package.json`, `README.md`, fontes, testes, planos `GDD.md`/`TECH_SPEC.md`/`TASKS.md`/`TEST_PLAN.md`/`DECISIONS.md`, nem pasta de configuração de agentes `.agents/`.
- O diretório não era um checkout Git e não havia histórico a preservar. Node.js 24.22.1, npm 11.19.1 e Git 2.56.0.windows.4 estão disponíveis.
- Não havia aplicação React ou estrutura conflitante.
- A orientação anterior do `AGENTS.md` restringia a fase à concepção. A ordem do Diretor Humano para o Prototype 0.1 autorizou especificamente a fundação técnica e as regras temporárias, sem aprovar conceito definitivo.

## Arquitetura escolhida

React apresenta a partida; o motor TypeScript em `src/game/` é independente de React e DOM. `cards.ts` separa definições e instâncias; `decks.ts` cria, embaralha e compra; `state.ts` prepara o estado central; `engine.ts` valida ações, pontua e encerra; `bot.ts` escolhe a maior carta usando apenas a mão recebida pela política; `random.ts` fornece aleatoriedade reproduzível por seed. A interface fica em `src/App.tsx` e `src/styles.css`.

Vite serve e compila a aplicação. Vitest testa o motor; Playwright testa o navegador. Não há backend, persistência, conexão externa, API de IA ou recurso visual remoto. A UI é funcional e provisória.

## Dependências e versões

As faixas declaradas estão em `package.json`; `package-lock.json` fixa as versões resolvidas. Versões instaladas: React/React DOM 19.3.1, Vite 7.3.7, TypeScript 5.9.3, Vitest 5.0.5, Playwright 1.64.1, plugin React para Vite 5.2.0, jsdom 26.1.0 e tipos React 19.3.0 / Node 24.19.2. O `npm audit` encontrou avisos na versão inicial do Vitest; ele foi atualizado para 5.0.5 e a nova instalação reportou zero vulnerabilidades. Reexecute `npm audit` ao atualizar dependências.

## Riscos e limites

Este protótipo testa somente as regras de `PROTOTYPE_RULES.md`; não implementa grade, mercado ou narrativa das propostas anteriores. O bot é determinístico e simples. Não há salvamento de partida. A aleatoriedade é reproduzível para o motor, e a interface começa com seed local incremental. O formato de dados e a UI podem mudar após decisão do Diretor Humano.
