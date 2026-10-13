# Perfil público, interesse e transparência

As páginas `pages/animal.html?id=ID` e `pages/transparencia.html` são servidas pelo mesmo servidor da aplicação.

## Preparação do banco

Execute `docs/migrations/20261009_interesse_adocao.sql` no SQL Editor do Supabase antes de abrir o formulário ao público. A migração acrescenta a coluna JSONB `interesse` à tabela `adotantes`, sem alterar os cadastros existentes. O código local não aplica essa migração automaticamente.

A rota de interesse insere o cadastro com a situação `em triagem` e a preferência de animal. Na página administrativa de adoções, a equipe vê o animal, a cidade e a mensagem. Um e-mail já cadastrado retorna conflito; o formulário público nunca modifica um cadastro existente sem autenticação.

## Endpoints

- `GET /api/animais/:id`: perfil com campos públicos, somente se disponível.
- `POST /api/interesses`: nome, e-mail, telefone, cidade, mensagem opcional, animal_id e consentimento=true. Revalida disponibilidade, limita envios e não retorna dados pessoais.
- `GET /api/resultados`: três contagens agregadas e instante da consulta. Nenhum dado de adotante ou histórico clínico é publicado.

O formulário registra o pedido no sistema. Não envia e-mail nem WhatsApp automaticamente. A equipe precisa acompanhar a triagem administrativa e realizar o contato.

## Publicação de documentos

Os relatórios financeiros, de atividades e documentos institucionais estão sinalizados como ainda não publicados. Substitua esses estados por links a arquivos oficiais aprovados quando a ONG os disponibilizar. Os indicadores são acumulados/atuais e não representam prestação de contas financeira ou auditoria.

Cadastre os canais oficiais da ONG antes do lançamento público para permitir acompanhamento do pedido e solicitações sobre dados pessoais.
