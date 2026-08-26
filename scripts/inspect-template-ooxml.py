import sys
import zipfile
from lxml import etree

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': W}

with zipfile.ZipFile(sys.argv[1]) as archive:
    root = etree.fromstring(archive.read('word/document.xml'))

targets = set(sys.argv[2:])
for text_node in root.xpath('//w:t', namespaces=NS):
    if text_node.text not in targets:
        continue
    run = text_node.getparent()
    paragraph = run.getparent()
    run_props = run.find(f'{{{W}}}rPr')
    para_props = paragraph.find(f'{{{W}}}pPr')
    print(f'\nTARGET: {text_node.text}')
    print('RUN:', etree.tostring(run_props, encoding='unicode') if run_props is not None else '<none>')
    print('PARAGRAPH:', etree.tostring(para_props, encoding='unicode') if para_props is not None else '<none>')
