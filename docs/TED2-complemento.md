# Documento Técnico do Projeto Anjos de Patas

## Versão 2.0 Implementação da interface

UNIBALSAS - Centro Universitário de Balsas. Curso de Análise e Desenvolvimento de Sistemas. Disciplina de Programação para Web. Professor Marcos David Souza Ramos. Balsas - MA. Atualização de 05 de outubro de 2026.

Equipe: Carinne da Silva Borges, Analista de Requisitos / QA; João Pedro Strasser Santos, Desenvolvedor Front-end / UI/UX; Júlio César Lima dos Reis, Banco de Dados / Back-end; Rogério Mota de Melo, Desenvolvedor Back-end. As funções seguem a TED 1.

Este complemento documenta a implementação da interface pública e administrativa do sistema Anjos de Patas. Descreve a organização do código, as interações, as decisões arquiteturais e a relação com os requisitos definidos na etapa anterior. A versão consolidada mantém integralmente as 12 páginas da TED 1 e acrescenta as seções a seguir, sem alterar o diagnóstico, os requisitos, o cronograma ou os protótipos originais.

## 14 Estrutura da aplicação

A aplicação separa a apresentação em HTML, CSS e JavaScript da API em Node.js e Express. O Supabase fornece persistência em PostgreSQL e autenticação. O navegador envia requisições HTTP com JSON; as rotas administrativas validam token, perfil e situação ativa antes de executar a operação.

| Local | Responsabilidade |
| --- | --- |
| index.html | Página pública, catálogo, filtros, informações institucionais e assistente. |
| pages/ | Login, Dashboard, perfil, animais e adoções. |
| css/ | Estilos das telas e regras de adaptação; admin.css compartilha formulários e painéis administrativos. |
| js/ | Interações, sessão e consumo da API. api.js centraliza a URL pública da API e requisições das novas telas. |
| src/app.js e src/server.js | Configuração das rotas e inicialização do servidor. |
| src/controllers/ | Coordenação das operações de autenticação, animais, histórico, perfil, adotantes e Dashboard. |
| src/services/ e src/schemas/ | Serviços do assistente, ferramentas de consulta e validações dos dados. |
| src/middlewares/ e src/config/ | Autorização, validação, segurança, erros e clientes Supabase. |
| assets/, test/ e docs/ | Recursos visuais, testes automatizados e documentação de validação. |

O arquivo .env fica na raiz e contém as credenciais usadas somente no servidor. O arquivo .env.example documenta os nomes das variáveis sem fornecer chaves. node_modules e tmp são excluídos do versionamento.

## 15 Documentação da interface desenvolvida

### 15.1 Área pública

A página inicial apresenta a identidade visual, a navegação, a consulta de animais, as etapas de adoção, a apresentação institucional e a seção de contato. O catálogo consulta GET /api/animais e exibe apenas registros disponíveis para adoção. Filtros por espécie e sexo são combináveis. Cada cartão permite expandir as características cadastradas, sem inventar idade exata, vacinação ou castração quando esses dados não são fornecidos pela API.

O carregamento apresenta uma mensagem enquanto aguarda a API. Falhas de conexão oferecem nova tentativa; a interface não substitui o resultado por animais fictícios. A ausência de resultados recebe mensagem própria. As fotos dos animais permanecem como indicação de imagem ainda não disponível; não foi implementado envio de fotografias nesta etapa.

O assistente envia a mensagem e o identificador da conversa para POST /api/agente. O servidor usa Gemini e ferramentas de consulta para buscar animais e apresentar informações. A consulta de detalhes passou a aceitar nome ou ID numérico, evitando enviar o nome do animal à coluna bigint. Nomes duplicados exigem identificação adicional, sem escolher arbitrariamente um animal.

### 15.2 Autenticação e Dashboard

A tela de login possui campos identificados, alternância de visibilidade da senha, indicação de carregamento e mensagens de falha. Após a autenticação, o navegador mantém o token e o resumo do usuário em sessionStorage. O Dashboard consulta indicadores de animais acolhidos, adoções concluídas, cuidados médicos e pedidos pendentes. O menu lateral oferece acesso a animais, registros, adoções e perfil, com adaptação para telas menores.

### 15.3 Perfil

A tela permite consultar nome, e-mail e perfil e alterar o nome de exibição. A confirmação da atualização é apresentada em um diálogo com foco no botão de confirmação. O conteúdo de fundo fica inativo durante o diálogo; Tab mantém o foco e Enter ou Escape concluem a confirmação. O servidor valida o nome e a identidade autenticada.

### 15.4 Animais e histórico

A tela de animais consulta a listagem administrativa e oferece pesquisa por nome e filtro por situação. O formulário cadastra ou edita nome, espécie, sexo, porte, faixa etária, temperamento, convivência e situação. Os campos obrigatórios são validados antes do envio e o botão fica desabilitado durante a gravação. O resultado apresenta confirmação ou erro.

O histórico é aberto a partir do cartão do animal selecionado. Ele organiza resgates, registros de saúde, vacinas, tratamentos e adoções. O formulário muda os campos conforme o tipo de registro, envia os dados à rota correspondente e recarrega o histórico após a gravação. O histórico de animais adotados continua acessível pela listagem administrativa.

### 15.5 Adotantes e adoções

A tela de adoções oferece cadastro de interessados, consulta e atualização da situação da triagem. O formulário de adoção apresenta animais disponíveis e adotantes aprovados. O registro informa animal, adotante, data e observações. A API registra a adoção e altera a situação do animal para adotado. Após o sucesso, a interface atualiza as opções e a listagem de adoções.

O acompanhamento de adotantes e a confirmação de adoções são atividades da equipe autenticada. O assistente não aprova nem registra automaticamente uma adoção. A tela não representa adoção concluída antes de receber sucesso do servidor.

## 16 Decisões arquiteturais da implementação

| Decisão | Motivo e efeito |
| --- | --- |
| HTML CSS e JavaScript sem framework de interface | Mantém a stack da TED 1 e separa estrutura, estilo e comportamento sem uma etapa de compilação do front-end. |
| API em Node.js e Express | Centraliza regras de negócio, autenticação, validação e acesso ao banco fora do navegador. |
| Supabase Auth e tabela perfis | Auth controla a conta e o token; perfis mantém nome, função e situação ativa da equipe. |
| Requisições com token nas rotas internas | A proteção efetiva é feita pelo servidor, além do redirecionamento visual para login. |
| Configuração da API em js/api.js | Facilita mudar o endereço do servidor; não armazena credenciais no front-end. |
| Mensagens e controles durante carregamento | Orienta o usuário e reduz envios duplicados enquanto aguarda uma operação. |
| Criação de elementos com textContent | Apresenta nomes e observações como texto, reduzindo a interpretação de dados como HTML. |
| Ferramentas do assistente com validação | Restringe argumentos e consultas; não aceita nomes como identificadores numéricos. |

A interface usa as rotas existentes para persistir registros. O esquema do banco e as políticas de acesso precisam estar configurados no Supabase. A aplicação não inclui uma migração automática de criação dessas tabelas. A gravação de adoção e a mudança de situação ocorrem em operações separadas, com tentativa de reversão em falha; uma transação no banco permanece uma melhoria possível.

## 17 Tecnologias efetivamente utilizadas

| Tecnologia | Aplicação |
| --- | --- |
| HTML5 CSS3 JavaScript | Estrutura semântica, estilos, responsividade, filtros, formulários e requisições Fetch. |
| Node.js Express | Servidor HTTP, rotas da API e execução dos testes com node:test. |
| PostgreSQL Supabase e @supabase/supabase-js | Persistência, autenticação e clientes de acesso aos dados. |
| Google Gemini e @google/genai | Interpretação da conversa e ferramentas do assistente de adoção. |
| Zod | Validação de mensagens, argumentos e formulários recebidos pela API. |
| Helmet cors e express-rate-limit | Cabeçalhos de segurança, controle de origem e limitação de requisições. |
| dotenv | Leitura das variáveis de ambiente do back-end. |
| Nodemon | Reinicialização do servidor durante o desenvolvimento. |
| LinkeDOM | DOM simulado para testes de interação do JavaScript da interface. |
| Figma Git GitHub e Visual Studio Code | Prototipação prevista na TED 1, colaboração e desenvolvimento. |

Os intervalos de versões das bibliotecas estão no package.json e as versões resolvidas estão no package-lock.json. LinkeDOM e Nodemon são dependências de desenvolvimento. A interface não utiliza React, Vue ou outro framework de componentes.

## 18 Usabilidade acessibilidade e responsividade

A navegação utiliza identificação de seções, botões de ação e retorno ao Dashboard. A página pública e as telas de gestão oferecem um link para pular ao conteúdo principal. Os campos possuem rótulos associados e as ações por animal incluem seu nome. Mensagens dinâmicas são apresentadas com regiões de status. Os detalhes atualizam aria-expanded e as telas possuem foco visível.

O CSS adapta o catálogo, os formulários e os painéis para telas menores. Nas novas páginas administrativas, as grades usam uma coluna em até 720 pixels. O menu móvel admite fechamento com Escape e mantém a navegação por Tab dentro do menu quando aberto. A interface existente também possui regras para reduzir animações quando o usuário prefere menos movimento.

Essas medidas foram conferidas no código e em testes do DOM. A validação visual em navegador, a avaliação com leitor de tela, os testes de contraste e a conferência em dispositivos reais permanecem etapas do roteiro de validação manual. Não foi realizada certificação de conformidade de acessibilidade.

## 19 Relação com os requisitos da TED 1

| Requisitos | Implementação na interface |
| --- | --- |
| RF01 | Login de conta autorizada, sessão e proteção das rotas administrativas. |
| RF02 RF03 RF04 RF05 | Cadastro, edição, listagem e pesquisa na tela de animais. |
| RF06 RF07 RF08 RF09 RF10 | Formulários de resgate, saúde, vacina e tratamento e consulta do histórico. |
| RF11 RF12 RF13 | Definição da situação e catálogo público de animais disponíveis. |
| RF14 RF15 RF16 | Registro de adoção, mudança de situação pela API e consulta do histórico após adoção. |
| RNF01 RNF05 RNF08 | CSS responsivo, navegação por seções e organização dos campos. |
| RNF02 RNF03 RNF04 | Autenticação e autorização no servidor, com persistência no Supabase. |
| RNF06 RNF07 | Validação dos campos e mensagens de confirmação e falha. |

O quadro identifica os pontos de implementação. A confirmação da persistência de cada fluxo depende da execução do roteiro no banco de demonstração. Elementos de doações e alertas ilustrados no protótipo do Dashboard não possuem módulos implementados nesta versão. A implementação preserva a organização geral de catálogo, filtros, menu lateral e indicadores, com ajustes visuais e de escopo em relação aos protótipos.

## 20 Validação e evidências do funcionamento

### 20.1 Verificação automatizada

Foram aprovados 20 testes em 05/10/2026. A suíte abrange validações e autorização, tratamento de erros, consulta por nome ou ID no assistente, filtros do catálogo, falha de conexão, dados apresentados como texto, edição de animais, envio de registros do histórico, opções de adoção, cadastro de interessados, rótulos e destinos de links. Os testes usam dados e credenciais fictícios e não gravam registros no banco da ONG.

O comando padrão é npm test. Em um ambiente que bloqueia a criação de processos do Node, o comando node --test --test-isolation=none test/*.test.js executa a mesma suíte sem isolamento de processos. Foi conferida também a sintaxe dos scripts alterados. Esses resultados não comprovam a renderização visual, a persistência em banco nem o funcionamento de uma chamada real ao Gemini.

### 20.2 Capturas reais da interface

A inclusão de capturas da aplicação funcionando está pendente. Os protótipos preservados nas páginas originais não são evidências de execução. As imagens devem ser obtidas em um ambiente de demonstração após a validação dos fluxos e inseridas nesta seção com legenda, data e contexto.

| Captura planejada | Conteúdo que deve ficar visível |
| --- | --- |
| Início e catálogo filtrado | Página carregada e resultado da combinação de filtros. |
| Login e Dashboard | Formulário de login e indicadores após autenticação. |
| Animais e histórico | Cadastro ou edição e um registro consultado após salvar. |
| Adoções e perfil | Registro de adoção e confirmação de alteração do nome. |
| Versões móveis | Tela inicial e gestão de animais em largura de 360 pixels. |
| Assistente | Consulta por nome de um animal e resposta obtida sem erro. |

O arquivo docs/roteiro-validacao.md orienta as verificações e docs/evidencias/README.md define os nomes das imagens. As capturas devem utilizar dados fictícios e ocultar informações pessoais e credenciais.

## 21 Execução publicação e histórico de versões

### 21.1 Ambiente local

Instale as dependências com npm install e configure o .env na raiz a partir do .env.example. Preencha SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY e GEMINI_API_KEY. Use PORT=3000 e FRONTEND_URL=http://127.0.0.1:5500. Execute npm run dev na raiz e abra index.html pelo Live Server. A API pode ser conferida em http://localhost:3000/health.

O endereço http://127.0.0.1:5500 identifica o ambiente local e não constitui um link público. Não há uma versão publicada validada para registrar nesta atualização. Quando a equipe disponibilizar a aplicação, deve acrescentar a URL pública ao README e a esta seção, com a data de verificação.

### 21.2 Histórico de versões

| Versão | Data ou período | Registro |
| --- | --- | --- |
| 1.0 TED 1 | 2026 | Diagnóstico, instituição, público-alvo, requisitos, arquitetura, stack, cronograma e protótipos. Conteúdo integral preservado. |
| 2.0 TED 2 | 05/10/2026 | Implementação das telas, integração do catálogo e gestão com a API, correção da consulta do assistente por nome, testes de interface e documentação da implementação. Capturas reais e publicação pendentes. |

### 21.3 Organização da entrega Git

Os arquivos devem ser integrados ao repositório original da equipe, com revisão das alterações e commits que descrevam o trabalho realizado. A cópia local inspecionada não contém a pasta .git; por isso, o histórico anterior não pôde ser verificado. O README orienta a transferência dos arquivos para um clone existente, preservando o histórico e excluindo credenciais e dependências instaladas.

Repositório indicado no README: https://github.com/Anjos-de-Patas/Anjos-de-Patas. Os protótipos e referências da etapa inicial permanecem nas páginas da TED 1. A documentação da API está em API.md e o roteiro de validação em docs/roteiro-validacao.md.

### 21.4 Conferência da entrega

| Item solicitado | Situação nesta atualização |
| --- | --- |
| Código atualizado e organizado | Telas e integrações incluídas no projeto; testes automatizados aprovados. |
| README com instalação execução e utilização | Atualizado com configuração, fluxos, testes e solução de problemas. |
| Preservação integral da TED 1 | As 12 páginas foram mantidas; o gerador verifica texto e conteúdo das páginas. |
| Documentação técnica da implementação | Estrutura, interface, arquitetura, tecnologias e histórico registrados neste complemento. |
| Capturas reais do funcionamento | Pendente de validação manual e inclusão das imagens em docs/evidencias. |
| Histórico consistente de commits | Precisa ser conferido e atualizado no clone do repositório original da equipe. |
| Link da aplicação quando disponível | Incluir após disponibilização e verificação de um ambiente publicado. |
