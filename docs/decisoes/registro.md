# Registro de decisões

Este é o registro oficial de decisões do projeto. Uma proposta ou recomendação de agente não constitui aprovação. Somente decisões explícitas do Diretor Humano devem ser adicionadas como aprovadas.

## Estado inicial — 26/10/2026

- **Projeto:** jogo de cartas original; temática, identidade, cartas e regras permanecem em aberto.
- **Autoridade:** Diretor Humano decide em última instância.
- **Coordenação:** Produtor Executivo organiza entregas, dependências e sínteses sem substituir a autoridade do Diretor.
- **Fase:** concepção e avaliação. Nenhuma implementação autorizada nesta etapa.
- **Pendências:** receber propostas do Game Designer, avaliação técnica do Analista de Sistemas e territórios visuais do Diretor de Arte; consolidar vantagens, desvantagens, riscos e recomendações para decisão do Diretor.

## Nova ordem e escopo atual — 27/10/2026

- **Autorização:** o Diretor Humano autorizou implementar a prova de conceito técnica Prototype 0.1 com regras explicitamente temporárias.
- **Escopo autorizado:** aplicação React/TypeScript/Vite local, motor separado da UI, bot determinístico, testes Vitest e Playwright.
- **Limites mantidos:** as regras não definem o jogo definitivo; não houve seleção entre os três conceitos da rodada anterior nem aprovação de arte final. Nenhum backend ou serviço externo foi autorizado.
- **Auditoria:** a estrutura anterior continha apenas documentos; não havia código, configuração de agentes do projeto, setup de testes, aplicação existente ou histórico Git. Node.js, npm e Git estão disponíveis. Detalhes e arquitetura registrados em `docs/auditoria-tecnica.md`.
- **Documentos deste escopo:** `PROTOTYPE_RULES.md`, `README.md` e `docs/auditoria-tecnica.md`.

Esta autorização substitui a restrição de não implementar na fase de concepção, somente para o Prototype 0.1.

## Verificação do Prototype 0.1 — 27/10/2026

Implementação e verificações da prova de conceito concluídas. Typecheck, Vitest (8 testes), build de produção, Playwright (1 fluxo) e audit de dependências passaram. Evidências e nota do sandbox estão em `docs/relatorio-testes.md`. Esta conclusão técnica não aprova o jogo definitivo nem seleciona uma proposta ou identidade visual; essas decisões continuam com o Diretor Humano.

Ainda não há decisões de design aprovadas.

## Entregas de concepção — 26/10/2026

Por solicitação do Diretor Humano, foram organizadas três avaliações independentes: Game Designer (três conceitos), Analista de Sistemas (viabilidade técnica dos conceitos) e Diretor de Arte (quatro territórios visuais). As conclusões estão em `docs/propostas/game-designer.md`, `docs/sistemas/viabilidade.md` e `docs/arte/direcao-visual.md`; a síntese executiva está em `docs/sintese-executiva.md`.

Esta anotação registra o trabalho concluído, não aprova nem prioriza qualquer alternativa. **Próxima ação pendente:** decisão do Diretor Humano sobre qual exploração, se alguma, deve avançar.
