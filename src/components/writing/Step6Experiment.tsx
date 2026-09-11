import { useState } from "react";
import type { WritingData } from "@/data/writingSteps";
import { generateWithQwen } from "@/lib/qwen";
import WordCounter from "./WordCounter";
import TranslateButton from "./TranslateButton";
import PreviewButton from "./PreviewButton";

interface Props {
  data: WritingData;
  onChange: (patch: Partial<WritingData>) => void;
}

export default function Step6Experiment({ data, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await generateWithQwen("experiment", data);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);

          if (typeof parsed.text === "string") {
            onChange({ experiment: parsed.text });
          } else {
            onChange({ experiment: raw });
          }

          if (
            parsed.table &&
            Array.isArray(parsed.table.headers) &&
            Array.isArray(parsed.table.rows)
          ) {
            const headers = parsed.table.headers.map((h: unknown) =>
              String(h ?? "")
            );
            const rows = parsed.table.rows.map((r: unknown[]) =>
              headers.map((_: string, i: number) => String(r[i] ?? ""))
            );
            onChange({ experimentTable: { headers, rows } });
          }
        } catch {
          onChange({ experiment: raw });
        }
      } else {
        onChange({ experiment: raw });
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-700">实验结果</h2>
          <p className="mt-1 text-sm text-ink-sub">
            说明实验设置、对比方法与结果分析。
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !data.topic}
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "生成中..." : "✨ AI 生成"}
        </button>
      </header>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink">结果分析正文</label>
        <textarea
          value={data.experiment}
          onChange={(e) => onChange({ experiment: e.target.value })}
          placeholder="描述数据集、评价指标、对比方法和主要结论..."
          className="h-[220px] w-full resize-none rounded-lg border border-blue-100 bg-white p-5 font-serif text-[15px] leading-relaxed text-ink outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex flex-col gap-2">
          <WordCounter text={data.experiment} min={400} max={1000} />
          <div className="flex flex-wrap gap-2">
            <TranslateButton
              text={data.experiment}
              onApply={(translated) => onChange({ experiment: translated })}
            />
            <PreviewButton text={data.experiment} />
          </div>
        </div>
      </section>

      {/* 只保留标题，内容区域删掉 */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink">结果表格</label>
      </section>
    </div>
  );
}