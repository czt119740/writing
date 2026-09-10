import { useState } from "react";
import type { WritingData } from "@/data/writingSteps";
import { generateWithQwen } from "@/lib/qwen";

interface Props {
  data: WritingData;
  onChange: (patch: Partial<WritingData>) => void;
}

export default function Step5Algorithm({ data, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const text = await generateWithQwen("algorithm", data);
      onChange({ algorithm: text });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = (
    kind: "algorithmFlowImage" | "algorithmIllustImage"
  ) => {
    const label =
      kind === "algorithmFlowImage" ? "Algorithm Flow" : "Illustration";
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <rect width="600" height="360" fill="#EEF4FF"/>
  <rect x="20" y="20" width="560" height="320" fill="none" stroke="#79AFF3" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="300" y="170" text-anchor="middle" font-family="Arial" font-size="22" fill="#2B7DE9" font-weight="bold">${label}</text>
  <text x="300" y="205" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">Placeholder — image2 API will fill here</text>
</svg>`.trim();
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    onChange({ [kind]: dataUrl } as Partial<WritingData>);
  };

  const clearImage = (kind: "algorithmFlowImage" | "algorithmIllustImage") => {
    onChange({ [kind]: "" } as Partial<WritingData>);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-700">算法介绍</h2>
          <p className="mt-1 text-sm text-ink-sub">
            描述你的方法框架、模块组成和核心公式，并可生成两张配图：算法框架流程图 + 方法示意图。
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
        <label className="text-sm font-semibold text-ink">方法正文</label>
        <textarea
          value={data.algorithm}
          onChange={(e) => onChange({ algorithm: e.target.value })}
          placeholder="在这里描述你的算法：整体框架、各模块作用、训练目标等。"
          className="h-[220px] w-full resize-none rounded-lg border border-blue-100 bg-white p-5 font-serif text-[15px] leading-relaxed text-ink outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <div className="text-right text-xs text-ink-sub">
          {data.algorithm.length} 字符
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ImageSlot
          title="算法框架流程图"
          description="由实验细节自动生成：输入→模块→输出 的整体流程"
          image={data.algorithmFlowImage}
          onGenerate={() => handleGenerateImage("algorithmFlowImage")}
          onClear={() => clearImage("algorithmFlowImage")}
        />
        <ImageSlot
          title="方法示意图"
          description="关键模块的结构示意图，突出创新点"
          image={data.algorithmIllustImage}
          onGenerate={() => handleGenerateImage("algorithmIllustImage")}
          onClear={() => clearImage("algorithmIllustImage")}
        />
      </section>

      <p className="text-xs text-ink-sub">
        ⓘ 当前为占位图，接入 image2 API 后点击按钮即可生成真实图像。
      </p>
    </div>
  );
}

interface ImageSlotProps {
  title: string;
  description: string;
  image: string;
  onGenerate: () => void;
  onClear: () => void;
}

function ImageSlot({
  title,
  description,
  image,
  onGenerate,
  onClear,
}: ImageSlotProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-white/70 p-4">
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-xs text-ink-sub">{description}</div>
      </div>

      <div className="grid h-[200px] place-items-center overflow-hidden rounded-lg border border-dashed border-blue-200 bg-[#f7faff]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-center text-xs text-ink-sub">
            <div className="mb-1 text-2xl text-blue-200">🖼</div>
            尚未生成
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onGenerate}
          className="flex-1 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-700"
        >
          {image ? "重新生成" : "生成图片"}
        </button>
        {image && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-ink-sub transition-all hover:bg-red-100 hover:text-red-600"
          >
            清空
          </button>
        )}
      </div>
    </div>
  );
}