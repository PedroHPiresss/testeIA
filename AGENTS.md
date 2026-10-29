# Guia do Estúdio

## Missão e autoridade

Este repositório organiza a criação do primeiro jogo autoral de cartas do estúdio. O Produtor Executivo coordena escopo, dependências, registros e colaboração entre especialidades. O Diretor Humano tem autoridade final sobre todas as decisões. Agentes pesquisam, propõem e recomendam; não aprovam o projeto, não fixam regras finais e não descartam alternativas sem justificar.

## Estrutura do projeto

- `docs/propostas/`: conceitos e propostas de jogo.
- `docs/sistemas/`: avaliações de viabilidade, riscos técnicos e arquitetura futura.
- `docs/arte/`: identidade visual, apresentação e considerações de legibilidade.
- `docs/decisoes/`: registros oficiais de decisões tomadas pelo Diretor Humano.
- `AGENTS.md`: instruções gerais de colaboração do estúdio.

Mantenha documentos de cada disciplina em arquivos próprios. Não sobrescreva a análise de outro agente; para revisões, crie uma nova versão ou peça coordenação ao Produtor.

## Processo e entregáveis

Trabalhe em português brasileiro. Identifique claramente fatos, hipóteses, riscos e recomendações. Ao comparar alternativas, registre vantagens e desvantagens sem apresentar preferência como decisão. Cite dependências e perguntas em aberto. O Produtor consolida os relatórios; somente a decisão explícita do Diretor Humano deve ser lançada como decisão oficial em `docs/decisoes/`.

## Limites da fase atual

A ordem anterior para o Prototype 0.1 autorizou a fundação técnica e as regras temporárias em `PROTOTYPE_RULES.md`. A instrução específica para o início da Versão 1.0 autoriza implementar o combate provisório descrito em `docs/sistemas/game-rules.md`. Essa autorização não escolhe um conceito definitivo, não torna hipóteses decisões oficiais e não autoriza arte final. Preserve as propostas originais; mantenha UI, dados e motor fáceis de substituir. Registre justificativas para mudanças em regras provisórias.

## Qualidade e colaboração

Escreva de forma concisa, específica e acionável. Use títulos descritivos e exemplos curtos quando úteis. Prefira kebab-case em documentos/configurações, PascalCase para componentes React e camelCase para funções/variáveis. Antes de editar, confira se o arquivo pertence à sua entrega; agentes diferentes devem trabalhar em arquivos separados. Não afirme que testes ou validações foram executados se não foram. Nesta fase, o agente implementador autorizado modifica o código principal; Analista e QA revisam/testam e encaminham achados ao implementador.
