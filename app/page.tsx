'use client';

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Download,
  ExternalLink,
  FileImage,
  FileText,
  Gauge,
  ImageIcon,
  Link2,
  LoaderCircle,
  LockKeyhole,
  PencilLine,
  RefreshCw,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { normalizeResumeTextForEditing } from './resume-text';

const SAMPLE_RESUME = `林晓雨｜产品经理
138-0000-0000｜xiaoyu.lin@example.com｜上海

教育经历
同济大学 管理科学与工程 硕士 2022.09—2025.06
核心课程：数据分析、用户研究、运营管理

实习经历（项目经历）
某头部内容平台｜商业产品实习生 2024.03—2024.09
• 负责创作者增长产品需求分析，跟进产品迭代和项目上线。
• 通过用户访谈和数据分析定位内容发布流程问题，协同研发优化功能。
• 参与商业化策略研究，输出行业竞品分析报告。

AI 求职助手｜发起人 / 产品负责人 2024.10—至今
• 设计简历诊断和岗位匹配功能，完成从需求分析到原型设计。
• 自学大模型 Prompt Engineering，搭建可交互 Demo。
• 组织 4 人团队完成开发与测试。

技能
SQL、Python、Figma、Axure、Tableau、A/B 测试、用户研究`;

const SAMPLE_JD = `大模型应用产品经理（校招）
岗位职责：
1. 负责 AI 产品的需求分析、产品规划、原型设计及全生命周期管理；
2. 深入理解用户场景，结合数据分析和用户研究持续迭代产品；
3. 协同算法、研发、设计和运营团队推动项目高质量落地；
4. 跟踪大模型、Agent、RAG 等前沿技术并探索创新应用。

任职要求：
1. 本科及以上学历，计算机、人工智能或相关专业优先；
2. 熟悉 SQL、A/B 测试、数据分析，具备良好的产品逻辑；
3. 有 AI 产品、生成式 AI 或大模型应用项目经验；
4. 主动性强，学习能力优秀，有完整产品作品或可交互 Demo 者优先。`;

const SAMPLE_OPTIMIZED = `林晓雨｜AI 产品经理
138-0000-0000｜xiaoyu.lin@example.com｜上海

求职方向
大模型应用产品经理｜AI 产品｜数据驱动增长

核心优势
• 具备从用户洞察、需求分析、原型设计到上线复盘的产品闭环经验，熟悉 SQL、A/B 测试与数据分析。
• 主动自学 Prompt Engineering、RAG 与 Agent 工作流，独立发起 AI 求职助手并推动 4 人团队完成可交互 Demo。

教育经历
同济大学 管理科学与工程 硕士 2022.09—2025.06
核心课程：数据分析、用户研究、运营管理

实习经历
某头部内容平台｜商业产品实习生 2024.03—2024.09
• 针对创作者发布转化低的业务痛点，拆解 6 个关键漏斗环节并完成 18 位用户访谈，定位发布流程中的 3 个核心阻塞点。
• 协同研发、设计推动 2 项功能迭代上线，通过 A/B 测试验证方案，上线后发布完成率提升 18%，周活跃创作者增长 12%。
• 主动研究 8 款国内外商业化产品，沉淀竞品分析框架并输出策略建议，其中 2 项进入下一季度产品规划。

项目经历
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

const KEYWORD_LIBRARY = [
  '大模型', '生成式 AI', 'AI 产品', 'Agent', 'RAG', 'Prompt Engineering',
  'SQL', 'Python', 'A/B 测试', '数据分析', '用户研究', '需求分析',
  '产品规划', '原型设计', '项目管理', '全生命周期', '竞品分析', '商业化',
  '增长', '转化率', '协同研发', '跨职能', '从 0 到 1', '用户场景', '产品作品',
];

type Phase = 0 | 1 | 2 | 3;
type ProcessingState = { label: string; progress: number } | null;

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.toLowerCase().includes(term.toLowerCase()));
}

function extractKeywords(jd: string) {
  const detected = KEYWORD_LIBRARY.filter((keyword) => jd.toLowerCase().includes(keyword.toLowerCase()));
  const tokens = jd.match(/[A-Za-z][A-Za-z+.#-]{2,}|[\u4e00-\u9fa5]{4,8}/g) ?? [];
  const noise = ['岗位职责', '任职要求', '负责', '具备', '良好', '相关专业', '本科以上', '优先考虑', '持续迭代'];
  const extras = tokens.filter((token) => !noise.some((word) => token.includes(word))).slice(0, 8);
  return Array.from(new Set([...detected, ...extras])).slice(0, 16);
}

function calculateScores(resume: string, jd: string) {
  const keywords = extractKeywords(jd);
  const matched = keywords.filter((keyword) => resume.toLowerCase().includes(keyword.toLowerCase()));
  const missing = keywords.filter((keyword) => !matched.includes(keyword));
  const keyword = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 68;
  const metrics = (resume.match(/\d+(?:\.\d+)?%|\d+\s*(?:人|项|个|款|组|轮|万|周|月)/g) ?? []).length;
  const results = Math.min(96, 42 + metrics * 7 + (hasAny(resume, ['提升', '增长', '降低', '达到', '节省']) ? 14 : 0));
  const structure = Math.min(95, 52 + (hasAny(resume, ['教育经历', '实习经历', '项目经历']) ? 20 : 0) + (hasAny(resume, ['痛点', '通过', '上线', '复盘']) ? 18 : 0));
  const initiative = Math.min(96, 48 + (hasAny(resume, ['主动', '发起', '自学', '从 0 到 1', '独立']) ? 30 : 0) + (hasAny(resume, ['作品', 'Demo', '开源']) ? 14 : 0));
  const potential = Math.min(95, 50 + (hasAny(resume, ['大模型', 'AI', 'Agent', 'RAG', 'Prompt']) ? 25 : 0) + (hasAny(resume, ['自学', '探索', '前沿']) ? 15 : 0));
  const total = Math.round(keyword * 0.38 + results * 0.22 + structure * 0.16 + initiative * 0.14 + potential * 0.1);
  return { total, keyword, results, structure, initiative, potential, keywords, matched, missing };
}

function buildOptimizedResume(resume: string, keywords: string[]) {
  if (!resume.trim() || resume.trim() === SAMPLE_RESUME.trim()) return SAMPLE_OPTIMIZED;
  const topKeywords = keywords.slice(0, 6).join('、');
  const hasPortfolio = /作品链接|作品集|demo|github/i.test(resume);
  return `${resume.trim()}\n\n求职匹配补充\n+• 岗位关键词：${topKeywords || '请根据岗位要求补充关键能力'}\n+• 项目表达建议：围绕“业务背景/用户痛点—个人行动—量化结果—复盘沉淀”补齐闭环，并确保每项成果真实可追溯。${hasPortfolio ? '' : '\n\n作品链接\n[请填写可交互 Demo / 作品集 / GitHub 链接]'}`;
}

function fileSize(size: number) {
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

function AppHeader({ phase, onReset }: { phase: Phase; onReset: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#d9ddd4]/90 bg-[#fbfaf6]/90 px-5 backdrop-blur-xl md:px-10">
      <button onClick={onReset} className="flex items-center gap-3 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-[#7ea06f]">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#173f2f] text-sm font-black text-white shadow-[0_6px_18px_rgba(23,63,47,.18)]">跃</span>
        <span>
          <span className="block text-[15px] font-black tracking-[-0.02em]">职跃 CareerPilot</span>
          <span className="block text-[9px] font-bold tracking-[0.16em] text-[#7d857f]">AI RESUME COPILOT</span>
        </span>
      </button>
      <div className="hidden items-center gap-6 md:flex">
        <span className="flex items-center gap-2 text-xs text-[#68736b]"><LockKeyhole size={13} /> 文件仅在当前会话处理</span>
        {phase > 0 && (
          <button onClick={onReset} className="rounded-full border border-[#d5dad2] bg-white px-4 py-2 text-xs font-bold text-[#466052] transition hover:border-[#86988c]">重新开始</button>
        )}
      </div>
    </header>
  );
}

function Stepper({ phase, onStep }: { phase: Phase; onStep: (phase: Phase) => void }) {
  const labels = ['上传材料', '校对解析', 'ATS 分析', '优化导出'];
  return (
    <nav aria-label="处理进度" className="grid grid-cols-4 overflow-hidden rounded-xl border border-[#d7dbd3] bg-[#e9e9e3] p-1">
      {labels.map((label, index) => {
        const accessible = index <= phase;
        return (
          <button
            key={label}
            disabled={!accessible}
            onClick={() => accessible && onStep(index as Phase)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-1.5 py-2.5 text-[10px] font-bold transition sm:text-xs ${index === phase ? 'bg-white text-[#173f2f] shadow-sm' : index < phase ? 'text-[#476456]' : 'text-[#979c97]'}`}
          >
            <span className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${index < phase ? 'bg-[#173f2f] text-white' : 'border border-current'}`}>{index < phase ? <Check size={10} strokeWidth={3} /> : index + 1}</span>
            <span className="hidden min-[390px]:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function FileCard({
  kind,
  file,
  processing,
  onFile,
  onClear,
}: {
  kind: 'resume' | 'jd';
  file: File | null;
  processing: ProcessingState;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isResume = kind === 'resume';
  const accept = isResume
    ? '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : '.png,.jpg,.jpeg,.webp,image/*';
  const Icon = isResume ? FileText : FileImage;
  const active = Boolean(file);

  const pickFile = (selected?: File) => {
    if (!selected) return;
    onFile(selected);
  };

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); pickFile(event.dataTransfer.files[0]); }}
      className={`relative min-h-[274px] overflow-hidden rounded-[24px] border p-7 transition ${isResume ? 'border-[#ccd3cb] bg-[#fbfaf6] text-[#17231d]' : 'border-[#214b3a] bg-[#173f2f] text-white'} ${active ? 'ring-2 ring-[#b9dd65] ring-offset-2 ring-offset-[#f4f2eb]' : ''}`}
    >
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(event) => pickFile(event.target.files?.[0])} />
      {!file ? (
        <button onClick={() => inputRef.current?.click()} className="flex h-full min-h-[218px] w-full flex-col text-left focus:outline-none">
          <div className="mb-auto flex w-full items-start justify-between">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${isResume ? 'bg-[#e4ebdf] text-[#315542]' : 'bg-white/10 text-[#d9f28d]'}`}><UploadCloud size={23} /></span>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${isResume ? 'border-[#d7dbd3] text-[#707972]' : 'border-white/15 text-white/60'}`}>{isResume ? 'PDF · DOCX · 最大 10MB' : 'PNG · JPG · WEBP'}</span>
          </div>
          <h2 className="mb-2 mt-10 text-2xl font-black tracking-[-0.035em]">{isResume ? '上传 PDF / Word 简历' : '上传岗位 JD 图片'}</h2>
          <p className={`text-sm leading-6 ${isResume ? 'text-[#6c756f]' : 'text-white/60'}`}>{isResume ? '拖入 PDF 或 DOCX 文件，自动提取文字与章节' : '识别岗位职责、硬性门槛与高权重关键词'}</p>
        </button>
      ) : (
        <div className="flex min-h-[218px] flex-col">
          <div className="flex items-start justify-between">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${isResume ? 'bg-[#e4ebdf] text-[#315542]' : 'bg-white/10 text-[#d9f28d]'}`}><Icon size={23} /></span>
            {!processing && <button onClick={onClear} aria-label="移除文件" className={`grid h-8 w-8 place-items-center rounded-full ${isResume ? 'bg-[#eeeee9] hover:bg-[#e3e5df]' : 'bg-white/10 hover:bg-white/15'}`}><X size={15} /></button>}
          </div>
          <div className="mt-auto">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 size={17} className={isResume ? 'text-[#5e805e]' : 'text-[#d9f28d]'} />
              <span className="text-xs font-bold">{processing ? processing.label : '文件已就绪'}</span>
            </div>
            <p className="truncate text-xl font-black tracking-[-0.03em]">{file.name}</p>
            <p className={`mt-1 text-xs ${isResume ? 'text-[#79817b]' : 'text-white/50'}`}>{fileSize(file.size)}</p>
            {processing && (
              <div className={`mt-5 h-1.5 overflow-hidden rounded-full ${isResume ? 'bg-[#e0e3dc]' : 'bg-white/10'}`}>
                <span className={`block h-full rounded-full transition-all duration-300 ${isResume ? 'bg-[#52725f]' : 'bg-[#b9dd65]'}`} style={{ width: `${processing.progress}%` }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadPhase({
  resumeFile,
  jdFile,
  resumeProcessing,
  jdProcessing,
  setResumeFile,
  setJdFile,
  onContinue,
  onSample,
}: {
  resumeFile: File | null;
  jdFile: File | null;
  resumeProcessing: ProcessingState;
  jdProcessing: ProcessingState;
  setResumeFile: (file: File | null) => void;
  setJdFile: (file: File | null) => void;
  onContinue: () => void;
  onSample: () => void;
}) {
  const ready = Boolean(resumeFile && jdFile && !resumeProcessing && !jdProcessing);
  return (
    <section className="animate-rise">
      <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c8d2c5] bg-white px-3 py-1 text-xs font-bold text-[#416152]"><Sparkles size={12} /> 大厂 ATS 初筛逻辑 · 中文简历优化</p>
          <h1 className="max-w-3xl text-[clamp(38px,5.5vw,68px)] font-black leading-[0.98] tracking-[-0.06em]">
            让简历先被机器看见，<br /><span className="text-[#4f715f]">再让 HR 记住。</span>
          </h1>
        </div>
        <div className="border-l-2 border-[#b9dd65] pl-5">
          <p className="text-sm leading-7 text-[#5f6c64]">解析你的简历与岗位 JD，拆解关键词、项目闭环与结果证据，生成一份高匹配度 Word 简历。</p>
          <button onClick={onSample} className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#365944] hover:underline">没有文件？体验示例 <ArrowRight size={13} /></button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FileCard kind="resume" file={resumeFile} processing={resumeProcessing} onFile={(file) => setResumeFile(file)} onClear={() => setResumeFile(null)} />
        <FileCard kind="jd" file={jdFile} processing={jdProcessing} onFile={(file) => setJdFile(file)} onClear={() => setJdFile(null)} />
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#78817a]">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> 不上传服务器</span>
          <span className="flex items-center gap-1.5"><ScanSearch size={14} /> OCR 识别</span>
          <span className="flex items-center gap-1.5"><FileText size={14} /> Word 可编辑导出</span>
        </div>
        <button disabled={!ready} onClick={onContinue} className="primary-button w-full sm:w-auto">
          {resumeProcessing || jdProcessing ? <LoaderCircle size={16} className="animate-spin" /> : <Zap size={16} />}
          开始解析 <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function EditablePanel({ title, subtitle, value, onChange, tone = 'light', badge }: { title: string; subtitle: string; value: string; onChange: (value: string) => void; tone?: 'light' | 'dark'; badge?: string }) {
  const dark = tone === 'dark';
  return (
    <article className={`overflow-hidden rounded-[22px] border ${dark ? 'border-[#244c3d] bg-[#173f2f] text-white' : 'border-[#d3d8d0] bg-[#fbfaf6]'}`}>
      <div className={`flex items-start justify-between border-b p-5 ${dark ? 'border-white/10' : 'border-[#e0e2dd]'}`}>
        <div>
          <div className="flex items-center gap-2"><h2 className="font-black tracking-[-0.02em]">{title}</h2>{badge && <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${dark ? 'bg-[#d9f28d] text-[#173f2f]' : 'bg-[#e5eadf] text-[#466052]'}`}>{badge}</span>}</div>
          <p className={`mt-1 text-xs ${dark ? 'text-white/50' : 'text-[#7a837c]'}`}>{subtitle}</p>
        </div>
        <PencilLine size={16} className={dark ? 'text-white/40' : 'text-[#809087]'} />
      </div>
      <textarea
        aria-label={title}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className={`min-h-[430px] w-full resize-y border-0 bg-transparent p-5 text-[13px] leading-7 outline-none ${dark ? 'text-white/85 placeholder:text-white/30' : 'text-[#334038] placeholder:text-[#99a099]'}`}
      />
      <div className={`flex items-center justify-between border-t px-5 py-3 text-[10px] ${dark ? 'border-white/10 text-white/40' : 'border-[#e0e2dd] text-[#89908a]'}`}>
        <span>可直接编辑修正识别结果</span><span>{value.length.toLocaleString()} 字符</span>
      </div>
    </article>
  );
}

function ReviewPhase({ resumeText, jdText, setResumeText, setJdText, onBack, onAnalyze }: { resumeText: string; jdText: string; setResumeText: (value: string) => void; setJdText: (value: string) => void; onBack: () => void; onAnalyze: () => void }) {
  return (
    <section className="animate-rise">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="eyebrow">STEP 02 · HUMAN IN THE LOOP</p><h1 className="section-title">校对解析结果</h1><p className="section-copy">AI 已完成初步识别。请核对关键信息，修改后再进入匹配分析。</p></div>
        <div className="rounded-xl border border-[#d9d7c7] bg-[#fffbed] px-4 py-3 text-xs leading-5 text-[#756b40]"><CircleAlert size={14} className="mr-1.5 inline" /> 建议重点检查姓名、数字和英文术语</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <EditablePanel title="简历文字版" subtitle="按原简历章节顺序解析" value={resumeText} onChange={setResumeText} badge="可编辑" />
        <EditablePanel title="岗位 JD" subtitle="已提取职责、门槛和优先项" value={jdText} onChange={setJdText} tone="dark" badge="OCR" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="secondary-button"><ArrowLeft size={15} /> 返回上传</button>
        <button onClick={onAnalyze} disabled={!resumeText.trim() || !jdText.trim()} className="primary-button"><Gauge size={16} /> 生成 ATS 匹配报告 <ArrowRight size={16} /></button>
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring" style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}>
      <div><strong>{score}</strong><span>/ 100</span></div>
    </div>
  );
}

function MetricBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Target }) {
  const color = value >= 80 ? '#557a60' : value >= 60 ? '#c28a42' : '#c75f50';
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 font-bold text-[#516057]"><Icon size={14} />{label}</span><strong>{value}</strong></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7e1]"><span className="block h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

function AnalysisPhase({ scores, onBack, onOptimize }: { scores: ReturnType<typeof calculateScores>; onBack: () => void; onOptimize: () => void }) {
  const grade = scores.total >= 85 ? '强匹配' : scores.total >= 70 ? '较匹配' : '需优化';
  return (
    <section className="animate-rise">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="eyebrow">STEP 03 · ATS DIAGNOSIS</p><h1 className="section-title">匹配度诊断</h1><p className="section-copy">以关键词命中、结果证据、项目闭环、主动性与成长潜力综合评估。</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e1e9de] px-4 py-2 text-xs font-black text-[#3d604a]"><TrendingUp size={14} /> 当前结论：{grade}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <article className="rounded-[24px] bg-[#173f2f] p-7 text-white">
          <div className="mb-7 flex items-center justify-between"><div><p className="text-[10px] font-black tracking-[0.17em] text-white/45">OVERALL MATCH</p><h2 className="mt-1 text-xl font-black">综合匹配度</h2></div><Award className="text-[#d9f28d]" /></div>
          <ScoreRing score={scores.total} />
          <div className="mt-7 rounded-2xl bg-white/8 p-4 text-xs leading-6 text-white/65">
            {scores.total >= 80 ? '已具备较强的人岗相关性。进一步补齐硬指标和作品证据，可显著提升面试转化。' : '基础经历相关，但关键词密度与量化结果不足，容易在 ATS 或 HR 快速浏览中失分。'}
          </div>
        </article>

        <article className="rounded-[24px] border border-[#d3d8d0] bg-[#fbfaf6] p-6 md:p-7">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-black tracking-[-0.025em]">五维能力雷达</h2><span className="text-[10px] font-bold text-[#929891]">基于大厂初筛权重</span></div>
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <MetricBar label="关键词对齐" value={scores.keyword} icon={Target} />
            <MetricBar label="数据与结果" value={scores.results} icon={BarChart3} />
            <MetricBar label="项目闭环" value={scores.structure} icon={RefreshCw} />
            <MetricBar label="主动性 / 作品" value={scores.initiative} icon={Rocket} />
            <MetricBar label="学习与潜力" value={scores.potential} icon={BookOpen} />
          </div>
          <p className="mt-7 border-t border-[#e1e3de] pt-4 text-[10px] leading-5 text-[#8a918b]">提示：评分用于发现表达缺口，不代表任何企业的正式招聘结论。</p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[22px] border border-[#d3d8d0] bg-white p-6">
          <div className="mb-5 flex items-center gap-2"><CheckCircle2 size={18} className="text-[#5f8168]" /><h2 className="font-black">已命中关键词</h2><span className="ml-auto text-xs font-black text-[#5f8168]">{scores.matched.length} 项</span></div>
          <div className="flex flex-wrap gap-2">{scores.matched.length ? scores.matched.map((keyword) => <span key={keyword} className="keyword-chip matched">{keyword}</span>) : <span className="text-xs text-[#8a918b]">暂无明显命中，请在经历中补充真实相关能力。</span>}</div>
        </article>
        <article className="rounded-[22px] border border-[#e5d8c3] bg-[#fffaf0] p-6">
          <div className="mb-5 flex items-center gap-2"><CircleAlert size={18} className="text-[#b67b37]" /><h2 className="font-black">高权重缺口</h2><span className="ml-auto text-xs font-black text-[#b67b37]">{scores.missing.length} 项</span></div>
          <div className="flex flex-wrap gap-2">{scores.missing.length ? scores.missing.map((keyword) => <span key={keyword} className="keyword-chip missing">{keyword}</span>) : <span className="text-xs text-[#7b795f]">核心关键词覆盖完整，建议继续检查使用场景和成果证据。</span>}</div>
        </article>
      </div>

      <article className="mt-4 overflow-hidden rounded-[22px] border border-[#d3d8d0] bg-[#fbfaf6]">
        <div className="flex items-center justify-between border-b border-[#e1e3de] px-6 py-4"><h2 className="font-black">HR 视角优先修改清单</h2><span className="rounded-full bg-[#173f2f] px-3 py-1 text-[9px] font-black text-white">TOP 4</span></div>
        <div className="divide-y divide-[#e7e8e4]">
          {[
            ['01', '先写痛点，再写动作', '把“负责某功能”改成“针对什么业务/用户问题，采取了什么动作”。'],
            ['02', '把结果做成视觉锚点', '每段经历至少保留 1—2 个数字：转化率、效率、用户量、成本或周期。'],
            ['03', '突出超越岗位边界的主动性', '显性写出主动发起、自学验证、沉淀方法论或推动跨团队协作。'],
            ['04', '补齐可验证的作品入口', '为可交互 Demo、作品集、GitHub 或研究报告预留独立链接栏。'],
          ].map(([number, title, text]) => (
            <div key={number} className="grid gap-2 px-6 py-4 sm:grid-cols-[46px_190px_1fr] sm:items-center"><span className="font-mono text-xs font-bold text-[#88918a]">{number}</span><strong className="text-sm">{title}</strong><p className="text-xs leading-5 text-[#737c75]">{text}</p></div>
          ))}
        </div>
      </article>

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="secondary-button"><ArrowLeft size={15} /> 返回校对</button>
        <button onClick={onOptimize} className="primary-button"><Sparkles size={16} /> 按 JD 智能优化 <ArrowRight size={16} /></button>
      </div>
    </section>
  );
}

function DiffCard({ before, after, label }: { before: string; after: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#d8dcd5] bg-white p-4">
      <p className="mb-3 text-[9px] font-black tracking-[0.15em] text-[#6b786f]">{label}</p>
      <div className="space-y-3 text-xs leading-5"><p className="rounded-xl bg-[#f6efec] p-3 text-[#80675f]"><span className="mr-1.5 font-black text-[#b46252]">−</span>{before}</p><p className="rounded-xl bg-[#edf4e9] p-3 text-[#4b6954]"><span className="mr-1.5 font-black text-[#4f7b59]">+</span>{after}</p></div>
    </div>
  );
}

function ExportPhase({ optimizedText, setOptimizedText, portfolioLink, setPortfolioLink, photoFile, setPhotoFile, onBack, onDownload, downloading }: { optimizedText: string; setOptimizedText: (value: string) => void; portfolioLink: string; setPortfolioLink: (value: string) => void; photoFile: File | null; setPhotoFile: (value: File | null) => void; onBack: () => void; onDownload: () => void; downloading: boolean }) {
  return (
    <section className="animate-rise">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="eyebrow">STEP 04 · FINAL RESUME</p><h1 className="section-title">针对岗位优化完成</h1><p className="section-copy">内容已按 JD 重排权重并强化 STAR 表达。请在导出前确认所有数字真实。</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#e1e9de] px-4 py-2 text-xs font-black text-[#3d604a]"><CheckCircle2 size={14} /> ATS 友好版</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="overflow-hidden rounded-[24px] border border-[#d3d8d0] bg-white shadow-[0_18px_60px_rgba(30,50,40,.07)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3e5e0] bg-[#fbfaf6] px-6 py-4">
            <div><h2 className="font-black">优化后的简历内容</h2><p className="mt-1 text-[10px] text-[#858d86]">可继续修改，导出时将按 Word 简历版式排版</p></div>
            <span className="flex items-center gap-1.5 rounded-full border border-[#d7dbd3] bg-white px-3 py-1.5 text-[10px] font-bold text-[#607067]"><PencilLine size={12} /> 可编辑</span>
          </div>
          <textarea value={optimizedText} onChange={(event) => setOptimizedText(event.target.value)} spellCheck={false} className="min-h-[700px] w-full resize-y border-0 p-6 text-[13px] leading-7 text-[#2f3e35] outline-none md:p-8" />
        </article>

        <aside className="space-y-4">
          <article className="rounded-[22px] bg-[#173f2f] p-6 text-white">
            <div className="mb-5 flex items-center gap-2"><Link2 size={18} className="text-[#d9f28d]" /><h2 className="font-black">作品链接</h2></div>
            <p className="mb-4 text-xs leading-5 text-white/55">提供可交互、可视化的作品，比一句“熟练掌握”更有说服力。</p>
            <label className="block text-[9px] font-black tracking-[0.13em] text-white/45">PORTFOLIO / DEMO URL</label>
            <div className="mt-2 flex items-center rounded-xl border border-white/15 bg-white/8 px-3"><ExternalLink size={14} className="text-white/40" /><input value={portfolioLink} onChange={(event) => setPortfolioLink(event.target.value)} placeholder="https://..." className="w-full bg-transparent px-2 py-3 text-xs text-white outline-none placeholder:text-white/25" /></div>
          </article>

          <article className="rounded-[22px] border border-[#d3d8d0] bg-[#fbfaf6] p-6">
            <h2 className="mb-5 font-black">本次优化动作</h2>
            <div className="space-y-3">
              {['关键词自然嵌入高权重段落', '项目改写为背景—行动—结果闭环', '量化结果前置，形成视觉锚点', '主动学习与作品证据显性化', '保留单栏 ATS 友好结构'].map((item) => <div key={item} className="flex items-start gap-2 text-xs leading-5 text-[#606c64]"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#dfe9da] text-[#4f7359]"><Check size={10} strokeWidth={3} /></span>{item}</div>)}
            </div>
          </article>

          <DiffCard label="STAR 改写示例" before="负责创作者增长需求分析，跟进项目上线。" after="拆解 6 个关键漏斗环节并推动 2 项功能上线，发布完成率提升 18%。" />

          <article className="overflow-hidden rounded-[22px] border border-[#ced5dd] bg-white">
            <div className="border-t-[7px] border-[#879cb5] px-5 pb-5 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[9px] font-black tracking-[0.15em] text-[#7d8792]">REFERENCE TEMPLATE</p><h2 className="mt-1.5 font-black text-[#536a83]">蓝灰 · 参考同款版</h2></div>
                <span className="rounded-full bg-[#e8edf2] px-2.5 py-1 text-[9px] font-black text-[#60758c]">已启用</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#68737e]">按参考简历重建蓝灰页眉、信息带和分区条，新增“实习经历（项目经历）”，同时保留 ATS 阅读顺序。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['A4 版式', '参考同款', 'ATS 友好', 'Word 可编辑'].map((item) => <span key={item} className="rounded-md border border-[#d8dee5] bg-[#f5f7f9] px-2 py-1 text-[9px] font-bold text-[#667687]">{item}</span>)}
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#b9c5d0] bg-[#f4f6f8] px-3 py-3 text-xs text-[#657484] transition hover:border-[#879cb5] hover:bg-[#eef2f5]">
                <input type="file" accept="image/png,image/jpeg,image/gif,image/bmp" className="hidden" onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)} />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#879cb5] text-white"><ImageIcon size={15} /></span>
                <span className="min-w-0"><strong className="block truncate text-[#4f6173]">{photoFile?.name ?? '上传证件照（可选）'}</strong><span className="mt-0.5 block text-[9px] text-[#87919b]">未上传时保留“证件照”占位框</span></span>
              </label>
            </div>
          </article>

          <button onClick={onDownload} disabled={downloading} className="download-button">
            {downloading ? <LoaderCircle size={18} className="animate-spin" /> : <Download size={18} />} {downloading ? '正在生成参考同款 Word…' : '导出参考同款 Word 简历'}
          </button>
          <p className="text-center text-[10px] leading-4 text-[#8a918b]">导出为 .docx，可在 Word / WPS 中继续编辑</p>
        </aside>
      </div>
      <button onClick={onBack} className="secondary-button mt-6"><ArrowLeft size={15} /> 返回分析</button>
    </section>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>(0);
  const [resumeFile, setResumeFileState] = useState<File | null>(null);
  const [jdFile, setJdFileState] = useState<File | null>(null);
  const [resumeProcessing, setResumeProcessing] = useState<ProcessingState>(null);
  const [jdProcessing, setJdProcessing] = useState<ProcessingState>(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const scores = useMemo(() => calculateScores(resumeText, jdText), [resumeText, jdText]);

  const setResumeFile = async (file: File | null) => {
    setResumeFileState(file);
    if (!file) { setResumeText(''); return; }
    const isWord = /\.docx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    setResumeProcessing({ label: isWord ? '正在解析 Word…' : '正在解析 PDF…', progress: 14 });
    try {
      const data = await file.arrayBuffer();
      if (isWord) {
        const mammoth = await import('mammoth');
        setResumeProcessing({ label: '正在提取 Word 文字与段落…', progress: 58 });
        const result = await mammoth.extractRawText({ arrayBuffer: data });
        const extractedText = normalizeResumeTextForEditing(result.value);
        if (!extractedText) throw new Error('Word 文档中没有可提取的文字');
        setResumeText(extractedText);
      } else {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const pdf = await pdfjs.getDocument({ data }).promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          setResumeProcessing({ label: `正在识别第 ${pageNumber} / ${pdf.numPages} 页`, progress: 15 + Math.round((pageNumber / pdf.numPages) * 75) });
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' ').replace(/\s+/g, ' ').trim());
        }
        setResumeText(normalizeResumeTextForEditing(pages.join('\n\n')));
      }
      setResumeProcessing({ label: '解析完成', progress: 100 });
    } catch {
      setResumeText(`${isWord ? 'Word' : 'PDF'} 文本识别未完成。请在下一步粘贴或修改你的简历文字内容。`);
      setResumeProcessing({ label: '可手动校对', progress: 100 });
    } finally {
      window.setTimeout(() => setResumeProcessing(null), 450);
    }
  };

  const setJdFile = async (file: File | null) => {
    setJdFileState(file);
    if (!file) { setJdText(''); return; }
    setJdProcessing({ label: '正在准备 OCR…', progress: 8 });
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['chi_sim', 'eng'], 1, {
        logger: (message: { status: string; progress?: number }) => setJdProcessing({
          label: message.status.includes('recognizing') ? '正在识别岗位文字…' : '正在加载识别模型…',
          progress: Math.max(10, Math.round((message.progress ?? 0.1) * 100)),
        }),
      });
      const result = await worker.recognize(file);
      await worker.terminate();
      setJdText(result.data.text.trim());
      setJdProcessing({ label: '识别完成', progress: 100 });
    } catch {
      setJdText('图片 OCR 暂未完成。请在下一步粘贴或修改岗位 JD 文字。');
      setJdProcessing({ label: '可手动校对', progress: 100 });
    } finally {
      window.setTimeout(() => setJdProcessing(null), 450);
    }
  };

  const reset = () => {
    setPhase(0); setResumeFileState(null); setJdFileState(null); setResumeText(''); setJdText(''); setOptimizedText(''); setPortfolioLink(''); setPhotoFile(null); setResumeProcessing(null); setJdProcessing(null);
  };

  const loadSample = () => {
    setResumeText(SAMPLE_RESUME); setJdText(SAMPLE_JD); setOptimizedText(SAMPLE_OPTIMIZED); setPhase(1);
  };

  const createOptimized = () => {
    setOptimizedText(buildOptimizedResume(resumeText, scores.keywords));
    setPhase(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadWord = async () => {
    setDownloading(true);
    try {
      const [{ Packer }, { buildResumeDocument }] = await Promise.all([import('docx'), import('./resume-document')]);
      const extension = photoFile?.name.split('.').pop()?.toLowerCase();
      const photoType: 'png' | 'gif' | 'bmp' | 'jpg' = extension === 'png' || extension === 'gif' || extension === 'bmp' ? extension : 'jpg';
      const photo = photoFile ? { data: new Uint8Array(await photoFile.arrayBuffer()), type: photoType } : undefined;
      const doc = buildResumeDocument(optimizedText, portfolioLink, photo);
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = '职跃_参考同款蓝灰简历.docx'; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setDownloading(false);
    }
  };

  const setPhaseAndScroll = (next: Phase) => { setPhase(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className="min-h-screen bg-[#f4f2eb] text-[#17231d]">
      <AppHeader phase={phase} onReset={reset} />
      <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-7 md:px-10 md:pb-24 md:pt-9">
        <div className="mb-9"><Stepper phase={phase} onStep={setPhaseAndScroll} /></div>
        {phase === 0 && <UploadPhase resumeFile={resumeFile} jdFile={jdFile} resumeProcessing={resumeProcessing} jdProcessing={jdProcessing} setResumeFile={setResumeFile} setJdFile={setJdFile} onContinue={() => setPhaseAndScroll(1)} onSample={loadSample} />}
        {phase === 1 && <ReviewPhase resumeText={resumeText} jdText={jdText} setResumeText={setResumeText} setJdText={setJdText} onBack={() => setPhaseAndScroll(0)} onAnalyze={() => setPhaseAndScroll(2)} />}
        {phase === 2 && <AnalysisPhase scores={scores} onBack={() => setPhaseAndScroll(1)} onOptimize={createOptimized} />}
        {phase === 3 && <ExportPhase optimizedText={optimizedText} setOptimizedText={setOptimizedText} portfolioLink={portfolioLink} setPortfolioLink={setPortfolioLink} photoFile={photoFile} setPhotoFile={setPhotoFile} onBack={() => setPhaseAndScroll(2)} onDownload={downloadWord} downloading={downloading} />}
      </div>
      <footer className="border-t border-[#d9ddd4] bg-[#ebeae4] px-5 py-6 text-center text-[10px] leading-5 text-[#7d857f] md:px-10">职跃 CareerPilot · 只优化真实经历的表达，不虚构项目、职责或数据 · 最终内容请由本人确认</footer>
    </main>
  );
}
