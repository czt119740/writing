import type { WritingData } from "@/data/writingSteps";

interface Props {
  data: WritingData;
  onChange: (patch: Partial<WritingData>) => void;
}

export default function Step2TitleAbstract({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-bold text-brand-700">标题与摘要</h2>
        <p className="mt-1 text-sm text-ink-sub">
          为论文拟定标题，并撰写一段可独立阅读的摘要（150~250 词）。
        </p>
      </header>

      {/* 标题 */}
      <section>
        <label className="mb-2 block text-sm font-semibold text-ink">
          论文标题
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="例如：A Contrastive Learning Framework for Few-Shot Image Classification"
          className="w-full rounded-lg border border-blue-100 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-1 text-right text-xs text-ink-sub">
          {data.title.length} 字符
        </div>
      </section>

      {/* 摘要 */}
      <section className="flex min-h-0 flex-1 flex-col">
        <label className="mb-2 block text-sm font-semibold text-ink">
          摘要（Abstract）
        </label>
        <textarea
          value={data.abstract}
          onChange={(e) => onChange({ abstract: e.target.value })}
          placeholder="在这里撰写摘要。建议包含：研究背景、存在问题、本文方法、主要结果与贡献。"
          className="h-[280px] w-full resize-none rounded-lg border border-blue-100 bg-white p-4 font-serif text-[15px] leading-relaxed text-ink outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-sub">
          <span>建议 150~250 词</span>
          <span>{data.abstract.length} 字符</span>
        </div>
      </section>
    </div>
  );
}