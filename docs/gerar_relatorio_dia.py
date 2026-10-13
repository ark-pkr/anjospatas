"""Relatório do trabalho de 9 de outubro de 2026 e renderização para revisão."""
from pathlib import Path
import sys
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tmp' / 'pdf-deps'))
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from pypdf import PdfReader
import pypdfium2 as pdfium

OUT = ROOT / 'output' / 'pdf'
QA = ROOT / 'tmp' / 'pdfs' / 'relatorio-dia'
OUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)
for family, filename in [('Arial', 'arial.ttf'), ('ArialBold', 'arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(family, str(Path('C:/Windows/Fonts') / filename)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='ArialBold', italic='Arial', boldItalic='ArialBold')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', fontName='ArialBold', fontSize=23, leading=29, textColor=colors.black, spaceAfter=14))
styles.add(ParagraphStyle(name='ReportSubtitle', fontName='Arial', fontSize=10, leading=15, textColor=colors.black, spaceAfter=20))
styles.add(ParagraphStyle(name='ReportH1', fontName='ArialBold', fontSize=16, leading=21, textColor=colors.black, spaceAfter=14))
styles.add(ParagraphStyle(name='ReportH2', fontName='ArialBold', fontSize=11.5, leading=16, textColor=colors.black, spaceBefore=13, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name='ReportBody', fontName='Arial', fontSize=10, leading=15, textColor=colors.HexColor('#332b25'), spaceAfter=9))
styles.add(ParagraphStyle(name='ReportBullet', parent=styles['ReportBody'], leftIndent=11, firstLineIndent=-9, spaceAfter=6))
styles.add(ParagraphStyle(name='Cell', fontName='Arial', fontSize=9, leading=13, spaceAfter=0))
styles.add(ParagraphStyle(name='CellHead', parent=styles['Cell'], fontName='ArialBold', textColor=colors.white))
story = []
def p(text, style='ReportBody'):
    story.append(Paragraph(text, styles[style]))
def h(text): p(text, 'ReportH2')
def b(text): p('• ' + text, 'ReportBullet')
def page(title):
    story.append(PageBreak())
    p(title, 'ReportH1')

p('Relatório de evolução do site Anjos de Patas', 'ReportTitle')
p('Registro das atividades de 9 de outubro de 2026<br/>Projeto Anjos de Patas • Balsas Maranhão', 'ReportSubtitle')
p('O site recebeu melhorias na apresentação institucional, na jornada de adoção e nas ferramentas de gestão. O acabamento visual passou a seguir uma paleta de marrom, dourado e creme, com componentes mais consistentes e uma dashboard mais compacta.')
p('Este relatório reúne as entregas trabalhadas na sessão, a situação atual do projeto e as configurações necessárias antes de disponibilizar todas as funcionalidades em produção.')
h('Principais resultados')
b('<b>Portal público:</b> catálogo com filtros e paginação, páginas individuais dos animais, manifestação de interesse, histórias, dúvidas, blog e transparência.')
b('<b>Área do adotante:</b> acesso e cadastro próprios, recuperação de senha e acompanhamento das etapas do interesse.')
b('<b>Gestão:</b> página de resgates, gerenciamento de interessados e editor do blog, além do refinamento da dashboard e dos formulários.')
b('<b>Identidade visual:</b> marrom no menu administrativo, footer e botão do assistente; dourado nas ações, filtros selecionados e etiquetas de espécie.')
b('<b>Validação local:</b> 58 testes automatizados aprovados e 22 páginas verificadas em três larguras de tela.')
h('Situação da entrega')
p('As mudanças estão nos arquivos locais do projeto. A publicação e a configuração do Supabase não foram executadas nesta sessão. As funcionalidades que dependem das novas tabelas, gatilhos e e-mails precisam das configurações descritas ao final do relatório.')

page('Portal público e jornada de adoção')
h('Catálogo e páginas dos animais')
b('Catálogo conectado à API, com filtros por espécie e sexo, paginação de nove animais por página e tratamento de listagens vazias ou falhas de consulta.')
b('Reinício da paginação ao alterar filtros e respeito aos limites da listagem. Animais adotados não são apresentados como disponíveis.')
b('Páginas individuais com informações do animal e formulário de manifestação de interesse. A disponibilidade é conferida novamente antes do envio.')
b('Campos de contato com formatação de telefone brasileiro, incluindo uso em formulários de adoção e administrativos.')
h('Acesso e acompanhamento do adotante')
b('Botão “Entrar” do cabeçalho direcionado aos adotantes, com cadastro próprio. Acesso administrativo transferido para o footer.')
b('Telas de acesso do adotante alinhadas à composição visual do login administrativo, utilizando outra fotografia.')
b('Acompanhamento das etapas recebido, triagem, entrevista, aprovado, concluída e encerrado, conforme registros efetivos do sistema.')
b('Consulta restrita ao e-mail confirmado da própria sessão. Notas e contatos internos da equipe não são exibidos ao adotante.')
h('Conteúdo e informação institucional')
b('Páginas de histórias de adoção, perguntas frequentes, blog e transparência, com indicadores provenientes dos registros do sistema.')
b('Artigos com conteúdo seguro em texto, pesquisa que ignora acentos e paginação de 12 itens. Artigos retirados do ar deixam de aparecer também nos endereços antigos.')
b('Recuperação de senha por código de e-mail, com confirmação da nova senha e tratamento de erros. O envio real depende da configuração do Supabase.')
h('Navegação e assistente')
p('O cabeçalho permanece fixo durante a rolagem, conforme a preferência mais recente. O botão flutuante do assistente se mantém acima do footer, sem avançar sobre seu conteúdo. A pata gigante sobreposta à foto do login foi removida.')

page('Área administrativa e gestão')
h('Dashboard mais compacta')
b('Redução da altura dos indicadores e dos atalhos, do tamanho dos ícones e dos espaços do cabeçalho.')
b('Quatro indicadores em duas colunas no celular, reduzindo a rolagem sem eliminar informações.')
b('Menu em marrom, fundo creme, textos em tons de marrom e detalhes dourados nos ícones, bordas e item selecionado.')
h('Resgates e formulários')
b('Criação da página de resgates vinculada ao botão existente, com consulta, pesquisa e registro associado ao animal selecionado.')
b('Preservação do formulário quando uma operação falha, bloqueio de registro quando a consulta necessária não está disponível e opção de atualização.')
b('Campos com rótulos, formatação de telefone, foco visível e apresentação consistente. Envio de foto antes de salvar, com preservação dos dados quando o upload falha.')
h('Gerenciamento de interessados')
b('Listagem com busca por nome, e-mail, telefone ou animal; filtro por etapa e paginação de 20 cadastros.')
b('Atualização de etapas, registro de contato, notas internas e histórico dos 100 eventos mais recentes. Eventos anteriores permanecem armazenados.')
b('Controle de versão e bloqueio de registro para evitar que dois operadores sobrescrevam alterações concorrentes.')
b('Conclusão do acompanhamento vinculada à existência de uma adoção registrada. Registro de adoção exige aprovação prévia.')
h('Gestão do blog')
b('Criação, edição, pré-visualização, rascunho, publicação e retirada de artigos, com controle de versão e paginação.')
b('Aviso sobre alterações não salvas. Conteúdo inserido como HTML é tratado como texto, sem execução no navegador.')
h('Controle de acesso')
p('Rotas administrativas exigem autenticação. As estruturas novas de eventos e blog não permitem acesso direto público; a API valida a equipe. O formulário público de interesse permanece separado do cadastro administrativo.')

page('Identidade visual e refinamento da interface')
h('Paleta e componentes')
p('O refinamento consolidou os tons da logo e substituiu o cinza predominante por superfícies quentes. O branco foi mantido em cartões e áreas de leitura, com marrom para estrutura e dourado para ações e destaque.')
rows = [[Paragraph('Aplicação',styles['CellHead']), Paragraph('Cor principal',styles['CellHead']), Paragraph('Referência',styles['CellHead'])]]
for row in [('Menu footer e assistente','Marrom','#654531'), ('Ações e filtros selecionados','Dourado','#EDC785'), ('Fundos suaves','Creme','#FAF6EF'), ('Texto principal do portal','Marrom profundo','#392D25')]:
    rows.append([Paragraph(escape(x),styles['Cell']) for x in row])
table = Table(rows, colWidths=[8.4*cm,4.2*cm,3.2*cm], hAlign='LEFT')
table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#404040')),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#D9D9D9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F6F6F6')])]))
story.append(table)
story.append(Spacer(1,8))
b('Footer e botão flutuante do assistente em marrom, com textos claros e estado de passagem do mouse mais escuro.')
b('Filtros selecionados e etiquetas “Cachorro” e “Gato” em dourado, com texto marrom para leitura.')
b('Bordas suavizadas, cartões mais discretos, hierarquia de títulos revisada e estados de botões mais consistentes.')
h('Mais ritmo na página inicial')
b('Catálogo aproximado do início da página e alternância entre áreas brancas, creme, fotografia e faixas de destaque.')
b('Nova seção “Por trás de cada adoção”, com fotografia maior, texto editorial e estrutura preparada para destacar uma história autorizada.')
b('Histórias, dúvidas e blog reunidos em uma área de leitura com links numerados, reduzindo a repetição de cartões.')
b('Elementos de animais nas três orientações: cachorro, gato e patinha, em traços discretos e fundo dourado suave, preservando a numeração.')
h('Conteúdo real e autorização')
p('Nenhum depoimento ou resultado de adoção foi inventado. A fotografia editorial está identificada como ilustrativa. O destaque da página inicial só utiliza um relato quando estiver marcado como publicado e autorizado.')

page('Validações e próximos passos')
h('Verificações concluídas')
b('<b>58 testes automatizados aprovados:</b> cobertura de regras de dados, rotas protegidas, isolamento entre contas, formulários, paginação, recuperação, publicação, conflitos e links locais.')
b('<b>22 páginas em 360 768 e 1440 pixels:</b> 66 combinações verificadas no Chrome local, com dados fictícios, sem erros de JavaScript ou rolagem horizontal.')
b('Inspeção visual de telas representativas, incluindo página inicial, login, dashboard, catálogo, blog e formulários.')
b('Migrações verificadas em PostgreSQL local de teste, incluindo gatilhos, permissões, conflitos, rollback e importação sem duplicação.')
p('Essas verificações não comprovam a configuração do banco remoto, a entrega real de e-mails ou o comportamento em produção. Também não constituem auditoria completa de acessibilidade ou medição de desempenho.')
h('Configurações antes da publicação')
b('Aplicar as migrações SQL na ordem: 20261009_interesse_adocao.sql, 20261009_gestao_adocao_blog.sql e 20261009_blog_artigos_iniciais.sql, disponíveis em docs/migrations.')
b('Configurar o modelo Reset Password do Supabase para envio de código com {{ .Token }}, além de SMTP, validade e limites. O modelo padrão baseado em link não atende ao formulário por código.')
b('Publicar o backend e os arquivos da interface juntos. Revisar as políticas de acesso do banco remoto e testar com contas distintas da equipe e dos adotantes.')
b('Validar envio real de e-mail, código inválido ou expirado, isolamento dos interessados, privacidade das notas e retirada de artigos do ar.')
b('Cadastrar histórias reais somente com autorização e revisar fotos, informações institucionais e documentos destinados à transparência.')
h('Arquivos de referência')
p('A implementação está documentada em docs/gestao-adocao-blog.md, docs/historias-adocao.md, docs/contas-adotantes.md e docs/interesse-e-transparencia.md. Os estilos finais concentram-se em css/design-system.css e css/home-editorial.css. O relatório registra a situação local ao fim do trabalho; não representa confirmação de publicação.')

target = OUT / 'Relatorio_Anjos_de_Patas_2026-10-09.pdf'
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Arial',8)
    canvas.setFillColor(colors.HexColor('#716052'))
    canvas.drawString(1.8*cm,1.3*cm,'Anjos de Patas | Relatório de atividades | 09/10/2026')
    canvas.drawRightString(A4[0]-1.8*cm,1.3*cm,str(doc.page))
    canvas.restoreState()
doc = SimpleDocTemplate(str(target),pagesize=A4,rightMargin=1.8*cm,leftMargin=1.8*cm,topMargin=1.7*cm,bottomMargin=2*cm,title='Relatório de evolução do site Anjos de Patas',author='Anjos de Patas')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(str(target))
pdf=pdfium.PdfDocument(str(target))
for i in range(len(pdf)):
    pdf[i].render(scale=1.6).to_pil().save(QA / f'page-{i+1}.png')
print(f'PDF: {target}\nPáginas: {len(reader.pages)}\nRevisão: {QA}')
