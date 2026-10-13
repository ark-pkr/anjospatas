# Publicação da aplicação no Render

O projeto está preparado para servir a interface e a API pelo mesmo servidor. Localmente, após `npm run dev`, você também pode abrir `http://localhost:3000`. Na publicação, o JavaScript usa automaticamente o endereço público do próprio site.

## Preparar o GitHub

Transfira os arquivos atualizados para o clone do repositório da equipe, revise as alterações e faça commit e push. Inclua `render.yaml`, as páginas, os scripts, os estilos e os arquivos de configuração npm. Não envie `.env`, `node_modules` ou `tmp`. A cópia baixada como ZIP não contém o histórico `.git`.

## Publicar

Para habilitar as manifestações de interesse vinculadas a um animal, execute também `migrations/20261009_interesse_adocao.sql`. Consulte `interesse-e-transparencia.md` para detalhes do fluxo e da publicação dos documentos oficiais.

Antes de usar o campo de imagem no cadastro e na edição de animais, execute o conteúdo de `migrations/20261005_imagem_animal.sql` no SQL Editor do Supabase. Ele adiciona a coluna opcional `imagem_url` sem alterar os registros existentes. O campo recebe o link direto de uma foto hospedada; deixá-lo vazio remove a imagem.

Para habilitar o envio de fotos do computador ou celular, execute `migrations/20261005_upload_animal.sql` no SQL Editor do Supabase. Esse script também cria a coluna e configura o bucket público `animais-imagens` para JPG, PNG e WebP de até 5 MB. A API exige login e permissão da ONG para enviar fotos. O upload usa [Supabase Storage](https://supabase.com/docs/reference/javascript/file-buckets-upload), com a chave administrativa apenas no servidor. As fotos são públicas para aparecer no catálogo. Ao substituir ou remover uma foto do animal, o arquivo antigo permanece no Storage.

1. Entre em https://dashboard.render.com com sua conta.
2. Escolha **New > Blueprint** e conecte o repositório que contém estes arquivos.
3. Confira o serviço `anjos-de-patas` e o plano **Free** definido no `render.yaml`.
4. Preencha `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `GEMINI_API_KEY` usando os valores do seu ambiente. Cadastre-os apenas nos campos de variáveis do Render.
5. Inicie a criação do serviço e aguarde o deploy ficar **Live**.
6. Abra o endereço HTTPS fornecido pelo Render e confira a página inicial e `/health`.
7. Execute o roteiro de `roteiro-validacao.md`, confira catálogo, login e assistente e capture as telas.

Se usar **New > Web Service** em vez do Blueprint, selecione o mesmo repositório, runtime Node, comando de build `npm ci`, comando de inicialização `npm start` e plano Free. Cadastre as quatro variáveis acima. O Render define `PORT` e `RENDER_EXTERNAL_URL`; a aplicação usa esses valores automaticamente.

## Link da entrega

O upload cria automaticamente o bucket `animais-imagens` se ele ainda não existir, usando a API administrativa do servidor. A coluna `imagem_url` continua precisando existir na tabela `animais`; o SQL acima configura ambos antecipadamente.

Copie o endereço real do serviço após o deploy bem-sucedido. Acrescente-o à seção Publicação do README e à seção 21.1 de `TED2-complemento.md`, com a data da verificação. Não use um endereço de exemplo nem localhost como link publicado. Atualize o PDF com `python docs/gerar_documento.py`.

O plano gratuito pode suspender o serviço após períodos sem acesso, tornando a primeira abertura mais lenta. Abra a aplicação antes da apresentação para conferir seu funcionamento.

Documentação oficial: https://render.com/docs/deploy-node-express-app e https://render.com/docs/blueprint-spec.
