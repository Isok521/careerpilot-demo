import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Packer } from 'docx';
import { buildResumeDocument } from '../app/resume-document.ts';

const sampleResume = `林晓雨｜AI 产品经理
138-0000-0000｜xiaoyu.lin@example.com｜上海

求职方向
大模型应用产品经理｜AI 产品｜数据驱动增长

核心优势
• 具备从用户洞察、需求分析、原型设计到上线复盘的产品闭环经验，熟悉 SQL、A/B 测试与数据分析。
• 主动自学 Prompt Engineering、RAG 与 Agent 工作流，独立发起 AI 求职助手并推动 4 人团队完成可交互 Demo。

教育经历
同济大学 管理科学与工程 硕士 2022.09—2025.06
核心课程：数据分析、用户研究、运营管理

实习经历（项目经历）
某头部内容平台｜商业产品实习生 2024.03—2024.09
• 针对创作者发布转化低的业务痛点，拆解 6 个关键漏斗环节并完成 18 位用户访谈，定位发布流程中的 3 个核心阻塞点。
• 协同研发、设计推动 2 项功能迭代上线，通过 A/B 测试验证方案，上线后发布完成率提升 18%，周活跃创作者增长 12%。
• 主动研究 8 款国内外商业化产品，沉淀竞品分析框架并输出策略建议，其中 2 项进入下一季度产品规划。

AI 求职助手｜发起人 / 产品负责人 2024.10—至今
• 洞察校招生简历与岗位匹配效率低的痛点，从 0 到 1 设计 ATS 诊断、JD 关键词匹配与简历改写功能，完成需求文档、原型和验证闭环。
• 自学大模型 Prompt Engineering、RAG 与 Agent 工作流，搭建可交互 Demo；设计 12 组评测集迭代提示词，关键信息提取准确率由 71% 提升至 91%。
• 组织 4 人跨职能团队，按双周迭代推进开发与测试；招募 32 位目标用户试用，基于反馈完成 3 轮迭代，核心流程完成率达到 87%。

技能
产品：需求分析、产品规划、原型设计、用户研究、A/B 测试
数据：SQL、Python、Tableau
AI：Prompt Engineering、RAG、Agent 工作流

作品链接
[请填写可交互 Demo / 作品集链接]`;

const output = process.argv[2];
if (!output) throw new Error('请提供输出 DOCX 的绝对路径');

await mkdir(dirname(output), { recursive: true });
const document = buildResumeDocument(sampleResume, 'https://portfolio.example.com/ai-career-copilot');
await writeFile(output, await Packer.toBuffer(document));
console.log(output);
