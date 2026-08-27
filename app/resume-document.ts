import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  LevelFormat,
  Paragraph,
  ShadingType,
  TabStopType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { isCompactPersonName, isResumeSectionTitle, normalizeResumeTextForEditing } from './resume-text';

const COLORS = {
  slate: '879CB5',
  slateDark: '7188A3',
  ink: '404040',
  body: '686868',
  muted: '8A8A8A',
  pale: 'F2F2F2',
  line: 'D9DDE2',
  white: 'FFFFFF',
};

const FONT = 'Microsoft YaHei';
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const PAGE_MARGIN_X = 680;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN_X * 2;

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: COLORS.white };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER };
const THIN_BORDER = { style: BorderStyle.SINGLE, size: 6, color: COLORS.line };

export type ResumePhoto = {
  data: Uint8Array;
  type: 'jpg' | 'png' | 'gif' | 'bmp';
};

type ResumeSection = { title: string; lines: string[] };

function cleanLine(line: string) {
  return line.replace(/^\+/, '').trim();
}

function splitResume(text: string) {
  const lines = normalizeResumeTextForEditing(text).split('\n').map(cleanLine).filter(Boolean);
  const masthead = findIdentity(lines);
  const sections: ResumeSection[] = [];

  for (const line of lines) {
    if (isResumeSectionTitle(line)) {
      sections.push({ title: line, lines: [] });
      continue;
    }
    if (isIdentityOrBasicLine(line, masthead)) continue;
    if (!sections.length) sections.push({ title: inferLooseSection(line), lines: [] });
    sections.at(-1)?.lines.push(line);
  }

  return { masthead, sections };
}

function safeShortField(value: string | undefined, fallback: string, maxLength: number) {
  const line = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!line || line.length > maxLength || /(?:手机|邮箱|毕业院校|主修课程|工具能力|语言与证书|个人兴趣|教育背景|经历)/.test(line)) return fallback;
  return line;
}

function findIdentity(lines: string[]) {
  const compactHeader = lines.find((line) => /^[^｜|\n]{2,18}[｜|][^｜|\n]{2,36}$/.test(line));
  if (compactHeader) return [compactHeader];

  const roleIndex = lines.findIndex((line) => /^意向岗位\s*[:：]/.test(line));
  const nearbyName = roleIndex >= 0
    ? lines.slice(Math.max(0, roleIndex - 3), roleIndex + 4).find((line, index, nearby) => isCompactPersonName(line) && nearby.indexOf(line) !== roleIndex)
    : undefined;
  const anyName = lines.find((line) => isCompactPersonName(line) && !/(能力|兴趣|证书|课程|岗位|产品|项目|实习|教育|校园|技能|评价|本科|硕士|大学|学院)/.test(line));
  const name = nearbyName || anyName || '';
  const role = roleIndex >= 0 ? lines[roleIndex].replace(/^意向岗位\s*[:：]\s*/, '') : '';
  return [name, role].filter(Boolean);
}

function isIdentityOrBasicLine(line: string, masthead: string[]) {
  if (masthead.includes(line)) return true;
  if (/^意向岗位\s*[:：]/.test(line)) return true;
  return /^(?:年龄|籍贯|学历|专业|经验|手机|邮箱|毕业院校|政治面貌)\s*[:：]/.test(line.replace(/\s+/g, ''));
}

function inferLooseSection(line: string) {
  if (/^(?:工具能力|语言与证书|个人兴趣|技能|证书)/.test(line)) return '技能专长';
  return '个人简介';
}

function splitNameAndRole(line = '') {
  const parts = line.split(/[｜|]/).map((item) => item.trim()).filter(Boolean);
  return {
    name: safeShortField(parts[0], '姓名', 18),
    role: safeShortField(parts.slice(1).join(' / '), '', 40),
  };
}

function normalizeSections(sections: ResumeSection[]) {
  const take = (...titles: string[]) => sections.filter((section) => titles.includes(section.title)).flatMap((section) => section.lines);
  const used = new Set(['求职方向', '教育背景', '教育经历', '工作经历', '实习经历', '项目经历', '实习经历（项目经历）', '校园经历', '技能', '专业技能', '技能专长', '核心优势', '个人简介', '自我评价', '作品链接']);
  const normalized: ResumeSection[] = [];
  const education = take('教育背景', '教育经历');
  const experience = take('工作经历', '实习经历', '实习经历（项目经历）', '项目经历');
  const campus = take('校园经历');
  const summaryAndSkills = [...take('技能', '专业技能', '技能专长'), ...take('核心优势', '个人简介', '自我评价')];
  const skills = summaryAndSkills.filter((line) => /^(?:工具能力|语言与证书|个人兴趣|产品|数据|AI|软件|证书|语言)\s*[:：]/i.test(line));
  const summary = summaryAndSkills.filter((line) => !skills.includes(line) && !/^ia土木工程$/i.test(line));
  const portfolio = take('作品链接');

  if (education.length) normalized.push({ title: '教育背景', lines: education });
  normalized.push({
    title: '实习经历（项目经历）',
    lines: experience.length ? experience : ['请补充真实经历：项目 / 公司｜角色｜时间，并按“背景—行动—量化结果”描述后再投递。'],
  });
  if (campus.length) normalized.push({ title: '校园经历', lines: campus });
  if (skills.length) normalized.push({ title: '技能专长', lines: skills });
  if (summary.length) normalized.push({ title: '自我评价', lines: summary });
  if (portfolio.length) normalized.push({ title: '作品链接', lines: portfolio });
  normalized.push(...sections.filter((section) => !used.has(section.title)));
  return normalized;
}

function splitTrailingDate(line: string) {
  const match = line.match(/\s*((?:(?:19|20)\d{2}(?:[.\-/年]\d{1,2})?|至今|现在)(?:\s*[—–~-]\s*(?:(?:19|20)\d{2}(?:[.\-/年]\d{1,2})?|至今|现在))?)\s*$/);
  if (!match?.index) return { label: line, date: '' };
  return { label: line.slice(0, match.index).trim(), date: match[1].trim() };
}

function isEntryHeading(line: string) {
  return /[｜|]/.test(line) || Boolean(splitTrailingDate(line).date);
}

function extractBasics(text: string, masthead: string[], sections: ResumeSection[]) {
  const phone = text.match(/(?<!\d)1[3-9]\d{9}(?!\d)/)?.[0];
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const location = text.match(/(?:所在地|籍贯|城市)\s*[:：]\s*([^\n｜|]{2,12})/)?.[1]?.trim();
  const educationText = sections.filter((section) => /教育/.test(section.title)).flatMap((section) => section.lines).join(' ');
  const degree = educationText.match(/博士|硕士|本科|大专|专科/)?.[0];
  const school = educationText.match(/[\u4e00-\u9fa5]{2,16}(?:大学|学院)/)?.[0];
  const majorMatch = school ? educationText.slice(educationText.indexOf(school) + school.length).match(/\s*([^\d｜|]{2,20}?)(?=\s*(?:博士|硕士|本科|大专|专科|(?:19|20)\d{2}))/) : null;
  const major = majorMatch?.[1]?.trim().replace(/[\s\-–—]+$/, '');
  const hasExperience = sections.some((section) => /实习|项目|工作/.test(section.title) && section.lines.length);
  return [
    location ? ['所在地', location] : null,
    phone ? ['手机', phone] : null,
    email ? ['邮箱', email] : null,
    degree ? ['学历', degree] : null,
    major ? ['专业', major] : null,
    school ? ['毕业院校', school] : null,
    hasExperience ? ['经历', '实习 / 项目'] : null,
  ].filter((item): item is string[] => Boolean(item));
}

function paragraph(text: string, options: { bold?: boolean; color?: string; size?: number; alignment?: typeof AlignmentType[keyof typeof AlignmentType] } = {}) {
  return new Paragraph({
    alignment: options.alignment,
    spacing: { after: 0, line: 240 },
    children: [new TextRun({ text, bold: options.bold, color: options.color ?? COLORS.body, size: options.size ?? 17, font: FONT })],
  });
}

function makeHeader(name: string, role: string, photo?: ResumePhoto) {
  const photoChildren = photo
    ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new ImageRun({ type: photo.type, data: photo.data, transformation: { width: 74, height: 94 }, altText: { title: '个人证件照', description: '求职者个人证件照', name: '个人证件照' } })] })]
    : [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 250, after: 250 }, children: [new TextRun({ text: '证件照', color: COLORS.slateDark, size: 14, font: FONT })] })];

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [2500, 4950, CONTENT_WIDTH - 7450],
    layout: TableLayoutType.FIXED,
    borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 2500, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 220, bottom: 190, left: 20, right: 80 }, borders: NO_BORDERS, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: name, color: COLORS.ink, size: 42, font: FONT })] })] }),
      new TableCell({ width: { size: 4950, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 230, bottom: 190, left: 80, right: 120 }, borders: { ...NO_BORDERS, bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.slate } }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: '意向岗位：', color: COLORS.muted, size: 17, font: FONT }), new TextRun({ text: role || '请填写求职方向', color: COLORS.ink, size: 20, font: FONT })] })] }),
      new TableCell({
        width: { size: CONTENT_WIDTH - 7450, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, fill: COLORS.slate, color: 'auto' }, margins: { top: 100, bottom: 100, left: 250, right: 250 }, borders: NO_BORDERS,
        children: [new Table({ width: { size: 1350, type: WidthType.DXA }, columnWidths: [1350], layout: TableLayoutType.FIXED, borders: NO_BORDERS, rows: [new TableRow({ children: [new TableCell({ width: { size: 1350, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: COLORS.white, color: 'auto' }, verticalAlign: VerticalAlign.CENTER, margins: { top: 60, bottom: 60, left: 60, right: 60 }, borders: NO_BORDERS, children: photoChildren })] })] })],
      }),
    ] })],
  });
}

function makeBasics(items: string[][]) {
  const slots = items.slice(0, 6);
  while (slots.length < 6) slots.push(['', '']);
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [3500, 3500, CONTENT_WIDTH - 7000], layout: TableLayoutType.FIXED,
    borders: { ...NO_BORDERS, bottom: { style: BorderStyle.SINGLE, size: 18, color: COLORS.slate } },
    rows: [0, 1].map((rowIndex) => new TableRow({ children: [0, 1, 2].map((columnIndex) => {
      const [label, value] = slots[rowIndex * 3 + columnIndex];
      return new TableCell({
        width: { size: columnIndex === 2 ? CONTENT_WIDTH - 7000 : 3500, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: COLORS.pale, color: 'auto' }, verticalAlign: VerticalAlign.CENTER,
        margins: { top: 90, bottom: 90, left: 150, right: 80 }, borders: NO_BORDERS,
        children: [new Paragraph({ spacing: { after: 0, line: 235 }, children: label ? [new TextRun({ text: `${label}：`, color: COLORS.muted, size: 17, font: FONT }), new TextRun({ text: value, color: COLORS.body, size: 17, font: FONT })] : [] })],
      });
    }) })),
  });
}

function sectionCode(title: string) {
  if (/教育/.test(title)) return 'EDU';
  if (/实习|项目|工作/.test(title)) return 'EXP';
  if (/校园/.test(title)) return 'ACT';
  if (/技能/.test(title)) return 'SKL';
  if (/评价|优势|简介/.test(title)) return 'ME';
  if (/作品/.test(title)) return 'URL';
  return '＋';
}

function makeSectionHeading(title: string) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA }, columnWidths: [650, CONTENT_WIDTH - 650], layout: TableLayoutType.FIXED, borders: NO_BORDERS,
    rows: [new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 650, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, shading: { type: ShadingType.CLEAR, fill: COLORS.slate, color: 'auto' }, margins: { top: 70, bottom: 70, left: 45, right: 45 }, borders: NO_BORDERS, children: [paragraph(sectionCode(title), { bold: true, color: COLORS.white, size: 13, alignment: AlignmentType.CENTER })] }),
      new TableCell({ width: { size: CONTENT_WIDTH - 650, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 60, bottom: 60, left: 220, right: 100 }, borders: { top: THIN_BORDER, bottom: THIN_BORDER, left: NO_BORDER, right: THIN_BORDER }, children: [paragraph(title, { color: COLORS.ink, size: 25 })] }),
    ] })],
  });
}

function makeEntryHeading(line: string) {
  const { label, date } = splitTrailingDate(line);
  const parts = label.split(/[｜|]/).map((item) => item.trim()).filter(Boolean);
  const children = parts.map((part, index) => new TextRun({ text: index === 0 ? part : `  ｜  ${part}`, bold: index === 0, color: index === 0 ? COLORS.ink : COLORS.body, size: 17, font: FONT }));
  if (date) children.push(new TextRun({ text: `\t${date}`, color: COLORS.muted, size: 17, font: 'Arial' }));
  return new Paragraph({ keepNext: true, keepLines: true, tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }], spacing: { before: 35, after: 12, line: 228 }, children });
}

function makeBullet(line: string) {
  return new Paragraph({ numbering: { reference: 'resume-bullets', level: 0 }, keepLines: true, spacing: { after: 12, line: 246 }, children: [new TextRun({ text: line.replace(/^[-•·]\s*/, ''), color: COLORS.body, size: 17, font: FONT })] });
}

function makeLabeledLine(line: string) {
  const colon = line.search(/[:：]/);
  if (colon < 1 || colon > 12) return null;
  return new Paragraph({ keepLines: true, spacing: { after: 12, line: 244 }, children: [new TextRun({ text: line.slice(0, colon + 1), bold: true, color: COLORS.ink, size: 17, font: FONT }), new TextRun({ text: line.slice(colon + 1).trim(), color: COLORS.body, size: 17, font: FONT })] });
}

function makePortfolio(line: string) {
  const url = line.match(/https?:\/\/\S+/i)?.[0];
  return new Paragraph({
    keepLines: true, border: { left: { style: BorderStyle.SINGLE, size: 16, color: COLORS.slate, space: 7 } }, shading: { type: ShadingType.CLEAR, fill: COLORS.pale, color: 'auto' }, indent: { left: 130, right: 80 }, spacing: { before: 25, after: 35, line: 245 },
    children: url ? [new ExternalHyperlink({ link: url, children: [new TextRun({ text: url, color: COLORS.slateDark, underline: {}, bold: true, size: 18, font: 'Arial' })] })] : [new TextRun({ text: line, color: COLORS.muted, italics: true, size: 18, font: FONT })],
  });
}

function makeBodyLine(line: string, section: string) {
  if (/^[-•·]/.test(line)) return makeBullet(line);
  if (section === '作品链接') return makePortfolio(line);
  if (isEntryHeading(line)) return makeEntryHeading(line);
  const labeled = /技能|教育/.test(section) ? makeLabeledLine(line) : null;
  if (labeled) return labeled;
  return new Paragraph({ keepLines: true, alignment: AlignmentType.JUSTIFIED, spacing: { after: 12, line: 246 }, children: [new TextRun({ text: line, color: COLORS.body, size: 17, font: FONT })] });
}

/**
 * 李彦澄参考简历复刻版：保留蓝灰视觉、信息带和分区条，同时把原模板
 * 的浮动文本框重建为 ATS 可读取的正常段落、固定几何表格和真实项目符号。
 */
export function buildResumeDocument(resumeText: string, portfolioLink = '', photo?: ResumePhoto) {
  const normalizedText = normalizeResumeTextForEditing(resumeText);
  const hydratedText = portfolioLink ? normalizedText.replace(/\[(?:请填写)?[^\]]*(?:Demo|作品集|GitHub)[^\]]*\]/i, portfolioLink) : normalizedText;
  const { masthead, sections: rawSections } = splitResume(hydratedText);
  const { name, role: mastheadRole } = splitNameAndRole(masthead[0]);
  const extractedRole = masthead.length > 1 && !/[｜|]/.test(masthead[0]) ? masthead[1] : '';
  const targetRole = safeShortField(rawSections.find((section) => section.title === '求职方向')?.lines[0]?.split(/[｜|]/)[0]?.trim() || mastheadRole || extractedRole, '请填写求职方向', 40);
  const basics = extractBasics(hydratedText, masthead, rawSections);
  const sections = normalizeSections(rawSections);
  const children: Array<Paragraph | Table> = [makeHeader(name, targetRole, photo), makeBasics(basics)];
  for (const section of sections) {
    children.push(new Paragraph({ spacing: { before: 14, after: 0 }, children: [] }));
    children.push(makeSectionHeading(section.title));
    children.push(...section.lines.map((line) => makeBodyLine(line, section.title)));
  }

  return new Document({
    creator: 'CareerPilot 职跃', title: `${name} - ${targetRole || '求职简历'}`, subject: '参考李彦澄简历版式的 ATS 友好专业简历', description: '蓝灰一页式、可编辑、ATS 可读取的 A4 Word 简历',
    numbering: { config: [{ reference: 'resume-bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { run: { color: COLORS.slate, font: 'Arial', size: 15 }, paragraph: { indent: { left: 360, hanging: 190 } } } }] }] },
    styles: { default: { document: { run: { font: FONT, size: 18, color: COLORS.body }, paragraph: { spacing: { line: 264, after: 22 } } } } },
    sections: [{ properties: { page: { size: { width: PAGE_WIDTH, height: PAGE_HEIGHT }, margin: { top: 520, right: PAGE_MARGIN_X, bottom: 560, left: PAGE_MARGIN_X, header: 240, footer: 240 } } }, children }],
  });
}
