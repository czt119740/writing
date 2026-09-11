import { useMemo, useState } from "react";
import type { WritingData } from "@/data/writingSteps";
import { clearData } from "@/lib/storage";
import { buildCvprTex, buildCvprBib } from "@/lib/cvprTex";

interface Props {
  data: WritingData;
}

export default function Step9Export({ data }: Props) {
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState("");

  const tex = useMemo(() => buildCvprTex(data), [data]);

  // 下载 main.tex
  const handleDownloadTex = () => {
    const blob = new Blob([tex], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.tex";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 一键编译 PDF
  const handleCompile = async () => {
    setCompiling(true);
    setError("");
    try {
      const files: Record<string, string> = {};
      files["main.tex"] = tex;
      files["main.bib"] = buildCvprBib(data);

      // 图片转 dataURL
      const toDataUrl = async (url: string): Promise<string> => {
        if (url.startsWith("data:")) return url;
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.readAsDataURL(blob);
        });
      };

      if (data.algorithmFlowImage) {
        files["figures/algorithm_flow.png"] = await toDataUrl(
          data.algorithmFlowImage
        );
      }
      if (data.algorithmIllustImage) {
        files["figures/algorithm_illustration.png"] = await toDataUrl(
          data.algorithmIllustImage
        );
      }

      const res = await fetch("http://localhost:3001/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `编译失败（${res.status}）`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cvpr-paper.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`编译失败：${String(e)}`);
    } finally {
      setCompiling(false);
    }
  };

  // 预览
  const handlePreview = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<pre style="white-space:pre-wrap;font-family:Menlo,Consolas,monospace;font-size:12px;padding:20px;line-height:1.5">${tex
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</pre>`
    );
    w.document.title = "main.tex 预览";
  };

  // 清空全部
  const handleClearAll = () => {
    const ok = window.confirm(
      "确定要清空所有已保存的数据吗？此操作不可恢复。"
    );
    if (!ok) return;
    clearData();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-bold text-brand-700">生成 CVPR PDF</h2>
        <p className="mt-1 text-sm text-ink-sub">
          一键将论文编译成符合 CVPR 投稿格式的 PDF（后端自动套用 CVPR 模板）。
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="标题" value={data.title ? "✓" : "—"} />
        <Stat label="摘要" value={data.abstract ? "✓" : "—"} />
        <Stat label="引用" value={`${data.references.length} 条`} />
        <Stat
          label="配图"
          value={`${
            (data.algorithmFlowImage ? 1 : 0) +
            (data.algorithmIllustImage ? 1 : 0)
          }/2`}
        />
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <section className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-ink">
            main.tex 预览
          </label>
          <button
            type="button"
            onClick={handlePreview}
            className="text-xs text-brand-500 underline-offset-2 hover:underline"
          >
            在新窗口打开
          </button>
        </div>
        <pre className="max-h-[340px] min-h-[260px] overflow-auto rounded-lg border border-blue-100 bg-[#f7faff] p-4 text-[11.5px] leading-relaxed text-ink">
          {tex}
        </pre>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCompile}
          disabled={compiling}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-700 disabled:opacity-60"
        >
          {compiling ? "编译中..." : "🔨 一键编译 PDF"}
        </button>
        <button
          type="button"
          onClick={handleDownloadTex}
          className="rounded-lg bg-brand-100 px-5 py-2.5 text-sm font-semibold text-brand-500 transition-all hover:bg-brand-500 hover:text-white"
        >
          ⬇ 仅下载 main.tex
        </button>
      </section>

      <p className="text-xs text-ink-sub">
        ⓘ 编译需要后端已安装 TeX Live，并已补装 CVPR 需要的宏包。首次编译可能需要 10~30 秒。
      </p>

      <section className="mt-4 rounded-lg border border-red-100 bg-red-50/40 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-red-600">危险操作</div>
            <div className="mt-0.5 text-xs text-ink-sub">
              清空所有已保存在本地的数据（课题、章节内容、上传文件等）。
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="shrink-0 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-red-600"
          >
            清空全部数据
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white/70 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-ink-sub">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-brand-700">{value}</div>
    </div>
  );
}