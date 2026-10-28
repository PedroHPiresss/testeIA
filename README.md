# Card Game Laboratory — Prototype 0.1

Prova de conceito local para validar uma fundação de jogo de cartas. Cartas, regras e apresentação são temporárias; não representam o design definitivo.

## Pré-requisitos

- Node.js 20.19+ (ambiente auditado: 24.22.1).
- npm 10+ (ambiente auditado: 11.19.1).
- Git instalado para controle de versões.

## Instalação e execução

No Windows, abra o PowerShell neste diretório e execute:

```powershell
npm install
npm run dev
```

Abra o endereço `localhost` informado pelo Vite no terminal. A aplicação e o motor funcionam localmente, sem backend ou autenticação.

## Testes e validações

```powershell
npm run typecheck
npm run test
npx playwright install chromium   # necessário na primeira execução se o navegador não estiver instalado
npm run test:e2e
```

Vitest cobre o motor puro; Playwright exercita o fluxo no navegador. Não considere uma verificação aprovada sem executá-la.

Consulte o [relatório de testes executados](docs/relatorio-testes.md) para resultados e limitações do ambiente.

## Build de produção

```powershell
npm run build
```

O Vite gera os arquivos em `dist/`. Veja [PROTOTYPE_RULES.md](PROTOTYPE_RULES.md) para o escopo provisório e [auditoria técnica](docs/auditoria-tecnica.md) para a estrutura escolhida.
