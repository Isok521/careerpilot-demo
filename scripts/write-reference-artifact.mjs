import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const output = process.argv[2];
if (!output) throw new Error('Missing output artifact path');

const artifact = `# Reference resume template contract

## Reference
- Source: E:\\格式化前要用的资料\\工作简历\\李彦澄简历（产品经理）.docx
- SHA-256: 276A1D27BB23EF3DAA067CFB8B08B48904D38B0DD017E0A12F90D0FBDECFE669
- Source size: 600286 bytes
- Page count: 1
- Section count: 1
- Render evidence: D:\\CareerPilot\\reference-li-yancheng\\render\\page-1.png
- Section audit: A4 portrait, 11906 x 16838 DXA, source margins 1800 DXA left/right and 1440 DXA top/bottom.

## Page system
- The visual design is a one-page A4 resume.
- The source uses anchored DrawingML/WPS text boxes and shapes that extend outside the nominal 1.25-inch body margins.
- Recreation override: normal-flow content with 680 DXA side margins, 520 DXA top, 560 DXA bottom. This preserves the source's full-width visual proportions while restoring ATS reading order.
- No header, footer, or page number.

## Typography
- Source face: 汉仪文黑-55简. Portable recreation face: Microsoft YaHei, with Arial for dates and Latin text.
- Name: 17 pt source evidence; recreation 21 pt, #404040, regular.
- Intended role: 10.5 pt, #767171.
- Section title: 13 pt, #404040, regular, vertically centered.
- Body: 10.5 pt source evidence, #767171; recreation 9-9.5 pt to support ATS-safe normal flow and one-page density.
- Body line spacing: source 312/240 = 1.3; compact recreation 1.15-1.2.

## Palette and components
- Primary slate blue: #879CB5 (sampled from rendered source; used for header band and section tags).
- Body gray: #767171.
- Dark title gray: #404040.
- Metadata band: #F2F2F2.
- Hairline border: #D9DDE2.
- Header: name and intended role on white; slate-blue block on the right; optional portrait in a white frame.
- Basic information: light-gray band with three semantic columns.
- Section heading: narrow slate-blue label cell plus a white bordered title cell.
- Education: date, school, and degree/major aligned across one row.
- Experience: entry heading with date/organization/role, followed by real Word bullets.

## Content flow and slot map
1. Header name: first pre-section line, before the full-width separator.
2. Target role: the remainder of the first line or the 求职方向 section.
3. Contact and basic facts: derived only from resume text (phone, email, city, degree, major, school, experience status). Missing facts are omitted; never invented.
4. Optional portrait: user-provided image; otherwise a neutral 证件照 placeholder.
5. 教育背景: content from 教育经历.
6. 实习经历（项目经历）: required explicit section, merging content from 工作经历, 实习经历, and 项目经历 while preserving original order within each group.
7. 校园经历: only when source text contains it.
8. 技能专长: content from 技能 or 专业技能.
9. 自我评价: content from 核心优势 or 个人简介.
10. 作品链接: content from the portfolio field or existing section.

## Lists and tables
- All bullets use a real Word numbering definition; no manual Unicode bullet text.
- Tables use fixed DXA geometry and no autofit: header, metadata, section bars, and education alignment only.
- Experience prose remains normal paragraphs for ATS readability.

## Package preservation and fidelity gates
- The retained source is read-only and must remain byte-for-byte unchanged.
- Recreation is not a package patch because the source relies on floating shapes that are unsuitable for dynamic ATS-safe content.
- Visual fidelity gates: A4 one page for the sample; recognizable blue-gray masthead; pale metadata band; repeated blue section tags; right-aligned dates; optional portrait; no clipping, overlap, or orphan section.
- ATS gates: single logical reading order, real paragraphs, real bullets, editable text, no body content inside floating text boxes.
`;

await mkdir(dirname(output), { recursive: true });
await writeFile(output, artifact, 'utf8');
console.log(output);
