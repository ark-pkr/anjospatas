# Identidade visual do portal

A camada compartilhada `css/design-system.css`, carregada por último nas 22 páginas, define a apresentação atual do portal e das áreas de acesso e gestão.

## Paleta

| Uso | Cor |
| --- | --- |
| Texto principal | `#252b2d` |
| Texto secundário | `#565f62` |
| Navegação administrativa, rodapé e assistente | `#292e30` |
| Superfícies neutras | `#f0f2ef` |
| Ação principal | `#edc785` |
| Texto dos botões dourados | `#302b22` |
| Destaque dourado em fundo claro | `#765724` |
| Bordas de campos | `#89948c` |

O dourado identifica ações principais e destaques. Cartões informativos usam bordas neutras, sem faixas douradas repetidas. Os estados de sucesso e erro mantêm cores próprias e mensagens por texto.

## Componentes

- Controles com raio de 5 px; cartões com raio de 8 px.
- Botões principais dourados, secundários brancos e assistente grafite.
- Formulários com fundo branco nos campos, rótulos escuros e foco visível.
- Tipografia do sistema operacional, sem dependência de fontes externas.
- Fotos e logo preservadas; cabeçalho continua acompanhando a rolagem de forma fixa na parte superior.

## Verificação local

As 22 páginas foram conferidas no Chrome em 360, 768 e 1440 px, com dados fictícios, sem erros de JavaScript nem rolagem horizontal. Após os ajustes, nove telas representativas passaram também pela checagem automatizada do contraste dos textos visíveis sobre fundos sólidos. Fotos, gradientes e conteúdo fora da área visível não fazem parte dessa checagem; ela não equivale a uma auditoria completa de acessibilidade.

Contrastes calculados: texto secundário sobre branco 6,54:1; texto dourado sobre branco 6,65:1; texto dos botões sobre dourado 8,77:1; texto do rodapé sobre grafite 10,37:1. Os 56 testes funcionais existentes permaneceram aprovados.
