# Gestão de adoção, recuperação e blog

## Configuração antes de publicar

1. Aplique no SQL Editor do Supabase, nesta ordem:
   - `docs/migrations/20261009_interesse_adocao.sql` (se ainda não aplicada);
   - `docs/migrations/20261009_gestao_adocao_blog.sql`;
   - `docs/migrations/20261009_blog_artigos_iniciais.sql`.
2. Em Authentication → Email Templates → Reset Password, configure um e-mail por código. Exemplo de corpo:

   ```html
   <h2>Recuperação de senha — Anjos de Patas</h2>
   <p>Seu código de recuperação é: <strong>{{ .Token }}</strong></p>
   <p>Volte à página de recuperação, informe este código e escolha uma nova senha.</p>
   <p>Se você não solicitou esta alteração, ignore esta mensagem.</p>
   ```

   Use `{{ .Token }}`, não um código fixo. O formulário aceita códigos de 6 a 10 dígitos. Configure a entrega de e-mail/SMTP, validade e limites no Supabase. O modelo padrão baseado em link não atende ao formulário por código. Referências oficiais: [envio de recuperação](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) e [verificação de código](https://supabase.com/docs/reference/javascript/auth-verifyotp).
3. Publique o backend e os arquivos da interface juntos. Valide com duas contas de teste (uma de equipe e uma de adotante), sem dados reais. As alterações locais não aplicam SQL nem configuram o Supabase automaticamente.

## Acompanhamento e interessados

- Menu administrativo → Interessados: pesquisa por nome, e-mail, telefone ou animal, filtro por etapa e paginação de 20 cadastros. Gerenciar permite atualizar etapa, registrar contato e escrever notas internas.
- Etapas: recebido, triagem, entrevista, aprovado, concluída e encerrado. É permitido corrigir etapas durante a triagem. O histórico mostra o que efetivamente foi registrado; não inventa etapas anteriores para cadastros legados.
- Ao registrar uma adoção na tela Adoções, um gatilho de banco conclui o acompanhamento na mesma transação de inserção. Só é permitido concluir se já existir adoção vinculada. Uma conclusão não pode ser revertida pelo formulário de triagem.
- Atualizações usam versão e bloqueio de linha para impedir que dois operadores sobrescrevam o mesmo cadastro. Notas e eventos são persistidos juntos. Na alteração de etapa pela tela antiga de Adoções, os gatilhos também sincronizam a etapa.
- A área do adotante consulta exclusivamente o e-mail confirmado da própria sessão. Mostra etapa e datas, sem notas, contatos internos ou identificadores da equipe. Continua existindo um cadastro por e-mail.
- Notas/contatos exibem até os 100 eventos mais recentes por cadastro. Os registros anteriores permanecem no banco.
- As novas tabelas e a função de escrita não têm acesso direto de `anon` ou `authenticated`: as APIs validam a equipe antes de usar o cliente de serviço. Não exponha a chave de serviço no navegador. O cadastro administrativo de interessados também exige autenticação; o formulário público usa `/api/interesses`.

## Blog

- Menu administrativo → Gestão do blog: criar, editar, pré-visualizar, salvar rascunho e publicar. Desmarcar “Publicar no site” e salvar retira o artigo do ar.
- Conteúdo em texto, com parágrafos separados por linha em branco e subtítulos iniciados por `## `. HTML é mostrado como texto, nunca executado.
- Blog público e listagem administrativa paginam 12 artigos. A pesquisa pública ignora acentos e consulta título/resumo. Rascunhos não são retornados pela API pública. Artigos editados têm controle de versão.
- A migração de conteúdo importa os três artigos existentes sem sobrescrever edições. Seus endereços antigos passam a consultar o conteúdo do banco, respeitando a retirada do ar.

## Revisão de lançamento

Foram aprovados 56 testes automatizados de rotas protegidas, isolamento de dados, recuperação por código, conflitos de edição, publicação e retirada de artigos, formulários, links locais e estados de falha. As três migrações foram executadas em PostgreSQL local com esquema de teste, incluindo gatilhos, permissões, conflito de versão, rollback e importação idempotente. Isso não valida o esquema ou as políticas do banco remoto.

Na revisão local com Chrome e dados fictícios, 22 páginas foram verificadas em 360, 768 e 1440 px (66 combinações), sem erros de JavaScript ou rolagem horizontal. Também foi conferido o avanço do formulário de recuperação e a posição do assistente acima do rodapé. Capturas de telas representativas foram inspecionadas e os ajustes de botões, ícones e visibilidade dos formulários foram aplicados. Essa checagem não constitui uma auditoria completa de acessibilidade nem uma medição de desempenho em produção.

Após configurar o ambiente, conferir em 360 px, 768 px e desktop: menu pelo teclado, foco, formulários sem rolagem horizontal, textos de erro, leitura de etapas, paginação e botão do assistente acima do rodapé. Testar envio real de e-mail, código inválido/expirado, recuperação nas duas áreas, duas contas de adotante com interesses diferentes, notas privadas e artigo retirado do ar inclusive no endereço antigo. Verificar também as políticas RLS já existentes de `adotantes`, `adocoes` e `perfis` no projeto remoto.
