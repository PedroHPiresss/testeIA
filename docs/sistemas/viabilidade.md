# Avaliação de viabilidade técnica — propostas iniciais

## Escopo e premissas

Esta avaliação considera somente os conceitos registrados em `docs/propostas/game-designer.md`. As durações, quantidades de jogadores e complexidade citadas ali são metas de design, não resultados de teste. Viabilidade abaixo é uma estimativa preliminar, não aprovação nem escolha de formato ou proposta. Nenhuma regra está fechada.

## 1. Cartógrafos do Impossível

**Viabilidade:** formato físico parece direto para um primeiro protótipo; cartas em grade e marcadores permitem acompanhar o mapa. O formato digital também é possível, mas exigiria lógica para rotação/deslocamento, conexões, objetivos e validação de rotas. A implementação digital teria mais regras de estado que a apresentação física.

**Dados e componentes:** cartas de lugar com bordas/conexões, eventos, ferramentas, objetivos e retorno; grade ou superfície delimitada; marcadores para jogadores, expedição e regiões estabilizadas. Será preciso definir formalmente orientação, adjacência, limites da grade e o que acontece com peças sobre uma área movida.

**Complexidade e riscos:** estado espacial visível, porém mudanças de região podem invalidar rotas e exigir rechecagem de objetivos. Manipulação e leitura podem ficar lentas, e eventos aleatórios podem destruir planejamento sem contrajogo. Em digital, regras de colisão e estado inválido são riscos centrais. Em mesa, o risco maior é erro de posicionamento e manutenção de componentes.

**Dependências desconhecidas:** dimensões e formato da grade; se o mapa cresce ou se reorganiza dentro de limite fixo; quantidade de símbolos, eventos e objetivos; política para estados impossíveis; como manter participação cooperativa sem liderança dominante.

**Próximo experimento conceitual:** montar um mapa pequeno com cartas provisórias e poucos eventos de rotação/deslocamento. Observar legibilidade, tempo para reconstruir rotas, frequência de planos frustrados e quem toma as decisões. Não requer arte final nem código.

**Vantagens técnicas:** componentes familiares, estado compartilhado observável e possibilidade de testar sem infraestrutura. **Desvantagens:** exceções espaciais podem crescer rapidamente; balancear eventos contra agência da equipe pode exigir muitas iterações.

## 2. Feira das Últimas Luas

**Viabilidade:** fisicamente viável com cartas de oferta/demanda/rumor, contratos, recursos e uma referência simples de mercado. Digitalmente viável, mas negociação verbal e blefe são difíceis de automatizar; a experiência dependeria de interação entre pessoas, não de sistemas sofisticados.

**Dados e componentes:** cartas simultâneas de oferta/demanda/rumor, eventos futuros, contratos, recursos ou fichas de mercadoria e trilha ou quadro de preços/estoque. Para evitar ambiguidades, o mercado precisa de limites e atualização determinística após revelações.

**Complexidade e riscos:** mecânica simultânea é administrável; a camada de negociação introduz estados informais (promessas, ofertas, acordos) difíceis de arbitrar. Rodadas podem se alongar, e contratos podem ficar impossíveis por escassez ou acaso. Em digital, chat, temporização, privacidade da escolha e eventual suporte a partidas remotas ampliariam escopo.

**Dependências desconhecidas:** se acordos são vinculantes ou apenas verbais; quais trocas são permitidas; como preços e estoque mudam; como lidar com empates, recusas e contratos inviáveis; se haverá moeda ou troca direta.

**Próximo experimento conceitual:** simular poucas rodadas com mercado e contratos anotados em papel, sem inventar grande volume de cartas. Registrar tempo de negociação, oportunidades de participar, impacto de uma oferta ruim e clareza da atualização de preço. Repetir com grupos de familiaridade diferente, se possível.

**Vantagens técnicas:** estado econômico pode ser representado por poucos números e cartas; escolhas simultâneas podem reduzir tempo de espera. **Desvantagens:** negociação depende do grupo e resiste a automação; conteúdo e equilíbrio econômico podem crescer com cada nova mercadoria, contrato ou rumor.

## 3. Arquivo dos Ecos

**Viabilidade:** versão física é possível com cartas de texto/ícone, marcadores de confiança e objetivos secretos. A versão digital é tecnicamente possível, mas edição, apresentação de texto, acessibilidade, idioma e fluxo de disputas exigem mais trabalho de conteúdo e interface.

**Dados e componentes:** fragmentos de memória identificáveis, fontes/testemunhos, grau de confiança, objetivos, sequência narrativa e marcadores para apoio, questionamento ou preservação de versões. Uma estrutura de dados futura provavelmente precisaria associar cada fragmento a etiquetas e relações de apoio/contradição, além do texto apresentado.

**Complexidade e riscos:** a sequência pública é simples de observar, mas avaliação de coerência e justificativas pode ser subjetiva. Sem critérios claros, pontuação e resolução de disputas serão inconsistentes. Texto longo aumenta custo editorial e de localização; texto curto pode limitar expressão. Objetivos secretos podem criar incentivos difíceis de explicar.

**Dependências desconhecidas:** volume e tamanho dos textos; classificação de confiança; se julgamentos são feitos por regra, voto ou consenso; como avaliar justificativas; como criar conteúdo inclusivo e traduzível; política para acessibilidade visual e leitura em voz alta.

**Próximo experimento conceitual:** testar uma narrativa curta feita de fragmentos provisórios com etiquetas verificáveis e alguns conflitos. Medir tempo para ler/argumentar, consistência entre grupos ao aplicar os mesmos critérios e compreensão dos objetivos, sem exigir textos finais.

**Vantagens técnicas:** estrutura de cartas e etiquetas pode suportar protótipo físico barato; conteúdo modular facilita variar histórias. **Desvantagens:** maior dependência de autoria, revisão e localização; critérios de interpretação são difíceis de formalizar e podem demandar suporte editorial contínuo.

## Comparação para decisão futura

| Proposta | Principal custo técnico/de produção | Formato inicial mais simples de avaliar | Pergunta crítica |
|---|---|---|---|
| Cartógrafos do Impossível | Regras de transformação espacial e validação de rotas | Físico, com grade e cartas provisórias | A mudança do mapa cria tensão sem apagar agência? |
| Feira das Últimas Luas | Fluxo de negociação, economia e acordos | Físico, com fichas e mercado anotado | A negociação mantém ritmo e participação equilibrada? |
| Arquivo dos Ecos | Escrita, julgamento consistente, acessibilidade/localização | Físico, com fragmentos curtos | Grupos diferentes interpretam e pontuam de modo compreensível? |

As três parecem prototipáveis sem programação. Recomenda-se que a próxima etapa seja um teste de papel orientado pela pergunta crítica de cada conceito; isso é uma recomendação de processo, não recomendação de qual jogo escolher. Estimativas de prazo, custo e arquitetura digital dependem de plataforma, escopo e equipe ainda não definidos.
