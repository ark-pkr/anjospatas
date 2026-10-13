# Validação da interface e evidências da TED 2

Data da revisão do código: 05/10/2026. Os testes automatizados usam dados simulados; este roteiro confirma comportamento visual e persistência no ambiente de demonstração.

## Preparação

Execute `npm install`, configure o `.env`, inicie `npm run dev` e abra `index.html` pelo Live Server em `http://127.0.0.1:5500`. Use uma conta autorizada de demonstração e registros fictícios; cadastros feitos pela interface são persistidos no Supabase.

## Verificações

| Fluxo | Ação | Resultado esperado |
| --- | --- | --- |
| Catálogo público | Abrir a página inicial | Mostrar apenas animais com situação disponível, conforme a API. |
| Filtros | Combinar espécie e sexo e limpar | Exibir somente os cartões compatíveis e apresentar mensagem se não houver resultados. |
| Detalhes | Abrir e fechar os detalhes de um cartão | Mostrar características cadastradas, com estado expandido atualizado. |
| Falha de conexão | Parar temporariamente o back-end e atualizar | Mostrar falha de carregamento e botão Tentar novamente; não apresentar animais fictícios como dados reais. |
| Login | Informar senha incorreta; depois usar conta válida | Mostrar erro na primeira tentativa e abrir o Dashboard após autenticação válida. |
| Proteção | Abrir uma tela administrativa sem sessão | Redirecionar para login. |
| Cadastro de animal | Cadastrar um animal fictício disponível | Mostrar confirmação e cartão na lista; ao atualizar a página, manter o registro. |
| Edição | Alterar nome, características e situação | Atualizar o cartão e preservar a alteração após recarregar. |
| Histórico | Registrar resgate, saúde, vacina e tratamento | Mostrar cada registro na seção correspondente ao animal escolhido. |
| Interessado | Cadastrar pessoa fictícia e concluir a triagem | Exibir o cadastro e a situação atualizada. |
| Adoção | Selecionar animal disponível e interessado aprovado | Confirmar registro, retirar animal do catálogo e manter o histórico administrativo. |
| Perfil | Alterar nome e confirmar o diálogo | Atualizar os dados, confirmar sucesso e voltar ao Dashboard. |
| Assistente | Pedir informações sobre animal existente pelo nome | Consultar os dados cadastrados, sem erro de nome usado como ID. |
| Sessão | Clicar em Sair e tentar voltar à área interna | Exigir nova autenticação. |

## Responsividade e acessibilidade

Teste larguras de 360, 768 e 1366 pixels e zoom de 200%. Confira ausência de rolagem horizontal, legibilidade dos campos, botões e menu. Navegue com Tab e Shift+Tab, use Enter nos botões e Escape no menu móvel e nos diálogos. Verifique rótulos, foco visível, mensagens de erro e ordem de leitura com leitor de tela. Registre falhas encontradas antes da entrega.

## Capturas e publicação

Salve as imagens indicadas em `evidencias/README.md`, com as telas já carregadas. Inclua pelo menos a tela inicial, catálogo filtrado, login, Dashboard, cadastro/edição, histórico, adoções, perfil e versões móveis. Envie essas imagens para completar a seção de evidências do PDF. Se houver publicação, acrescente a URL pública e a data de validação ao README e ao documento; localhost identifica apenas o ambiente local.
