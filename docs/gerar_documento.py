"""Gera o complemento da TED 2 e o anexa à TED 1 sem reescrever suas páginas.

Dependências de documentação: reportlab, pypdf e pypdfium2 (apenas para revisão).
Uso: python docs/gerar_documento.py
"""
from pathlib import Path
import re
import sys
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
TEMP_DEPS = ROOT / 'tmp' / 'pdf-deps'
if TEMP_DEPS.exists():
    sys.path.insert(0, str(TEMP_DEPS))

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, Image
from pypdf import PdfReader, PdfWriter

OUT = ROOT / 'output' / 'pdf'
TMP = ROOT / 'tmp' / 'pdfs'
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
source = next(ROOT.glob('TED 1*.pdf'))
original = PdfReader(source)
page_size = (float(original.pages[2].mediabox.width), float(original.pages[2].mediabox.height))
header = TMP / 'unibalsas-cabecalho.png'
header.write_bytes(original.pages[2].images[0].data)
arial = Path('C:/Windows/Fonts/arial.ttf')
arial_bold = Path('C:/Windows/Fonts/arialbd.ttf')
if arial.exists() and arial_bold.exists():
    pdfmetrics.registerFont(TTFont('ArialProjeto', str(arial)))
    pdfmetrics.registerFont(TTFont('ArialProjetoBold', str(arial_bold)))
    regular, bold = 'ArialProjeto', 'ArialProjetoBold'
else:
    regular, bold = 'Helvetica', 'Helvetica-Bold'
left_margin = 63.744
right_margin = 56.3
content_width = page_size[0] - left_margin - right_margin
styles = getSampleStyleSheet()
styles.add(ParagraphStyle('TextoProjeto', fontName=regular, fontSize=12, leading=20.7, alignment=TA_JUSTIFY, firstLineIndent=35.4, spaceAfter=6, allowWidows=0, allowOrphans=0))
styles.add(ParagraphStyle('CelulaProjeto', fontName=regular, fontSize=12, leading=13.8))
styles.add(ParagraphStyle('CelulaDestaque', fontName=bold, fontSize=12, leading=13.8))
styles.add(ParagraphStyle('CabecalhoTabela', fontName=bold, fontSize=12, leading=13.8, textColor=colors.white, alignment=1))
styles.add(ParagraphStyle('TituloProjeto', fontName=bold, fontSize=12, leading=15, spaceAfter=12))
styles.add(ParagraphStyle('SecaoProjeto', fontName=bold, fontSize=12, leading=15, spaceBefore=12, spaceAfter=10, keepWithNext=True))
styles.add(ParagraphStyle('SubsecaoProjeto', fontName=bold, fontSize=12, leading=15, spaceBefore=10, spaceAfter=8, keepWithNext=True))

def par(text, style='TextoProjeto'):
    text = escape(text)
    if style == 'CelulaDestaque':
        text = text.replace('@supabase/supabase-js', '@supabase/<br/>supabase-js')
    return Paragraph(text, styles[style])

story = []
evidence_names = {
    '01-inicio-desktop.png': 'Página inicial em computador',
    '02-catalogo-filtros.png': 'Catálogo com filtros aplicados',
    '03-login.png': 'Tela de login',
    '04-dashboard.png': 'Dashboard administrativo',
    '05-animais.png': 'Gestão de animais',
    '06-historico.png': 'Histórico individual',
    '07-adocoes.png': 'Gestão de adoções',
    '08-perfil.png': 'Perfil do usuário',
    '09-inicio-mobile.png': 'Página inicial em celular',
    '10-animais-mobile.png': 'Gestão de animais em celular',
    '11-assistente.png': 'Consulta ao assistente por nome',
}
evidences = [(ROOT/'docs'/'evidencias'/name, caption) for name,caption in evidence_names.items() if (ROOT/'docs'/'evidencias'/name).is_file()]
lines = (ROOT / 'docs' / 'TED2-complemento.md').read_text(encoding='utf-8').splitlines()
i = 0
while i < len(lines):
    line = lines[i].strip()
    if line.startswith('## 21 ') and evidences:
        for number, (image_path, caption) in enumerate(evidences, 1):
            image = Image(str(image_path))
            scale = min(content_width/image.imageWidth, (17*cm)/image.imageHeight)
            image.drawWidth = image.imageWidth * scale
            image.drawHeight = image.imageHeight * scale
            story.append(KeepTogether([image, Spacer(1,6), par(f'Figura {number} {caption}'), Spacer(1,12)]))
    if line.startswith('A inclusão de capturas') and len(evidences) == len(evidence_names):
        line = 'As capturas a seguir documentam as telas da aplicação. O roteiro de validação descreve os fluxos associados a cada evidência.'
    if not line:
        i += 1
        continue
    if line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            cells = [cell.strip() for cell in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r':?-+:?', cell) for cell in cells):
                is_header = not rows
                rows.append([par(cell.upper() if is_header else cell, 'CabecalhoTabela' if is_header else ('CelulaDestaque' if column == 0 else 'CelulaProjeto')) for column, cell in enumerate(cells)])
            i += 1
        n = len(rows[0])
        width = content_width
        widths = [width * .28, width * .72] if n == 2 else [width * .16, width * .19, width * .65]
        table = Table(rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
        table.setStyle(TableStyle([
            ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#c0504d')),
            ('VALIGN',(0,0),(-1,-1),'TOP'),
            ('LEFTPADDING',(0,0),(-1,-1),5), ('RIGHTPADDING',(0,0),(-1,-1),5),
            ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6),
            ('GRID',(0,0),(-1,-1),.5,colors.black),
        ]))
        story.extend([table, Spacer(1,10)])
        continue
    if line.startswith('# '): story.append(par(line[2:].upper(), 'TituloProjeto'))
    elif line.startswith('## '): story.append(par(line[3:].upper(), 'SecaoProjeto'))
    elif line.startswith('### '): story.append(par(line[4:], 'SubsecaoProjeto'))
    else: story.append(par(line))
    i += 1

def page_header(canvas, doc):
    canvas.saveState()
    canvas.drawImage(str(header), 16.3, 733.84, width=563.29, height=80.75, mask='auto')
    canvas.restoreState()

supplement = TMP / 'TED2-complemento.pdf'
doc = SimpleDocTemplate(str(supplement), pagesize=page_size, rightMargin=right_margin-6, leftMargin=left_margin-6, topMargin=4.1*cm, bottomMargin=1*cm,
    title='Documento Técnico Anjos de Patas Versão 2.0', author='Equipe Anjos de Patas')
doc.build(story, onFirstPage=page_header, onLaterPages=page_header)

writer = PdfWriter()
writer.append(original)
writer.append(PdfReader(supplement))
writer.add_metadata({'/Title':'Documento Técnico Anjos de Patas Versão 2.0', '/Author':'Equipe Anjos de Patas'})
final = OUT / 'Documento-Tecnico-Anjos-de-Patas-v2.pdf'
with final.open('wb') as f:
    writer.write(f)

consolidated = PdfReader(final)
for index, page in enumerate(original.pages):
    assert page.extract_text() == consolidated.pages[index].extract_text(), f'Texto original alterado na página {index+1}'
    assert page.get_contents().get_data() == consolidated.pages[index].get_contents().get_data(), f'Conteúdo original alterado na página {index+1}'
print(f'PDF criado: {len(original.pages)} páginas originais preservadas + {len(consolidated.pages)-len(original.pages)} páginas de complemento.')
