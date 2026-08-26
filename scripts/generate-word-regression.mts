import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import mammoth from 'mammoth';
import { Packer } from 'docx';
import { buildResumeDocument } from '../app/resume-document.ts';
import { normalizeResumeTextForEditing } from '../app/resume-text.ts';

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error('请提供输入 DOCX 与输出 DOCX 的绝对路径');

const source = await readFile(input);
const extracted = await mammoth.extractRawText({ buffer: source });
const normalized = normalizeResumeTextForEditing(extracted.value);
if (!normalized) throw new Error('参考 Word 中没有可提取的文字');

await mkdir(dirname(output), { recursive: true });
const document = buildResumeDocument(normalized);
await writeFile(output, await Packer.toBuffer(document));
console.log(JSON.stringify({ output, characters: normalized.length, lines: normalized.split('\n').filter(Boolean).length }));
