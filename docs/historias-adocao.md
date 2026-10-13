# Publicação de histórias de adoção

A página `pages/historias.html` lê `assets/data/historias.json`. Não depende de migração do banco. O arquivo começa vazio porque ainda não foram fornecidos relatos oficiais autorizados.

A página inicial também consulta esse arquivo: a seção “Por trás de cada adoção” destaca o primeiro relato com `autorizada=true` e `publicada=true`, título e relato preenchidos. Exibe uma prévia de até 420 caracteres e um link para a página de histórias. Sem relato aprovado, permanece um texto editorial sobre adoção responsável com fotografia identificada como ilustrativa. A foto do relato substitui a ilustrativa quando cadastrada; em caso de falha, retorna à imagem ilustrativa e à legenda correspondente.

Para publicar, adicione um objeto ao array `historias` com os campos abaixo:

| Campo | Conteúdo |
| --- | --- |
| titulo | Título do relato confirmado pela equipe |
| animal | Nome do animal |
| relato | Texto da história real |
| foto | Opcional: caminho `../assets/images/arquivo.jpg` ou URL HTTPS |
| foto_alt | Descrição da imagem para leitores de tela |
| depoimento | Opcional: depoimento autorizado |
| autoria | Opcional: identificação cuja publicação foi autorizada |
| autorizada | `true` após a equipe confirmar autorização para todos os conteúdos publicados |
| publicada | `true` para exibir na página |

Inclua somente dados que possam ser publicados. **O JSON é público**, inclusive registros com `publicada=false`: mantenha rascunhos, contatos, documentos de autorização e informações privadas fora desse arquivo. Os indicadores de resultados continuam vindo do banco; histórias não alteram as contagens.

As perguntas frequentes ficam em `pages/perguntas-frequentes.html`. Revise as orientações com a equipe quando houver definição de documentos, prazos e canais oficiais.
