# Acesso de adotantes

O botão Entrar do cabeçalho público abre `pages/entrar-adotante.html`, com link para `pages/cadastro-adotante.html`. O acesso da equipe continua em `pages/login.html`, ligado no rodapé como Área administrativa.

O cadastro usa Supabase Auth e não insere perfil nem atribui permissões administrativas. O acesso administrativo continua exigindo perfil autorizado na tabela `perfis`. Confira que eventuais triggers personalizados do projeto não concedem perfis administrativos automaticamente a novos cadastros públicos.

Para ativar, habilite cadastro com e-mail/senha em Supabase Auth e configure o Site URL de produção e o envio de confirmação de e-mail. A área do adotante exige e-mail confirmado. A aplicação não modifica essas configurações automaticamente. Não foi feito cadastro de teste no serviço remoto.

A senha é encaminhada diretamente ao serviço de autenticação pelo servidor; não é armazenada em tabelas da aplicação. O token de adotante fica em `sessionStorage` sob uma chave diferente da sessão administrativa.

A conta não cria uma manifestação de interesse automaticamente. Para acompanhar um pedido existente, o e-mail confirmado precisa coincidir com o e-mail usado no formulário. A consulta ignora parâmetros de e-mail do cliente e usa exclusivamente o e-mail da sessão verificada. Ela retorna a situação do cadastro e o nome do animal, sem expor dados de outros interessados.

O fluxo depende da coluna `adotantes.interesse` documentada em `interesse-e-transparencia.md`. Aplique a migração correspondente se ainda estiver pendente. O sistema atual possui um cadastro por e-mail; não oferece múltiplas manifestações por conta.
