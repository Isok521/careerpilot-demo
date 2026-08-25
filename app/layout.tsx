import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '职跃 CareerPilot｜大厂 ATS 简历优化',
  description: '解析简历与岗位 JD，进行 ATS 匹配分析并生成针对性优化的 Word 简历。',
  openGraph: {
    title: '职跃 CareerPilot｜大厂 ATS 简历优化',
    description: '让简历先被机器看见，再让 HR 记住。',
    images: [{ url: '/og.png', width: 1672, height: 939, alt: '职跃 CareerPilot 简历优化工具' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '职跃 CareerPilot｜大厂 ATS 简历优化',
    description: '让简历先被机器看见，再让 HR 记住。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
