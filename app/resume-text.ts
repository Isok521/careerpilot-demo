export const RESUME_SECTION_TITLES = [
  '个人简介', '求职方向', '核心优势', '教育背景', '教育经历', '工作经历',
  '实习经历', '项目经历', '实习经历（项目经历）', '校园经历', '科研经历',
  '技能', '专业技能', '技能专长', '证书与奖项', '作品链接', '自我评价', '求职匹配补充',
] as const;

const SECTION_TITLE_SET = new Set<string>(RESUME_SECTION_TITLES);

/**
 * WPS/Word 浮动文本框经 Mammoth 提取时，换行有时会变成字面量 "\\n"。
 * 这里恢复段落并统一常见标题，保证校对页和 Word 导出使用同一份结构化文本。
 */
export function normalizeResumeTextForEditing(input: string) {
  return input
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line, index, lines) => line || (index > 0 && lines[index - 1]))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isResumeSectionTitle(line: string) {
  return SECTION_TITLE_SET.has(line.trim());
}

export function isCompactPersonName(value: string) {
  const line = value.trim();
  return /^[\u3400-\u9fff·]{2,6}$/.test(line) && !SECTION_TITLE_SET.has(line);
}
