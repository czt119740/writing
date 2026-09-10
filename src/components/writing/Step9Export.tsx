import { useMemo, useState } from "react";
import type { WritingData } from "@/data/writingSteps";
import { clearData } from "@/lib/storage";

interface Props {
  data: WritingData;
}

// ---------- 生成 main.tex ----------
function buildTex(data: WritingData): string {
  const esc = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      .replace(/#/g, "\\#");

  const para = (s: string) =>
    s
      .split(/\n\s*\n/)
      .map((p) => esc(p.trim()))
      .filter(Boolean)
      .join("\n\n");

  const tableTex = (() => {
    const { headers, rows } = data.experimentTable;
    if (headers.length === 0) return "";
    const colSpec = "l".repeat(headers.length);
    const headerRow = headers.map((h) => `\\textbf{${esc(h)}}`).join(" & ");
    const bodyRows = rows
      .map((r) => r.map((c) => esc(c)).join(" & ") + " \\\\")
      .join("\n");
    return `
\\begin{table}[htbp]
  \\centering
  \\caption{Experimental Results}
  \\label{tab:results}
  \\begin{tabular}{${colSpec}}
    \\toprule
    ${headerRow} \\\\
    \\midrule
    ${bodyRows}
    \\bottomrule
  \\end{tabular}
\\end{table}
`;
  })();

  const refsTex = data.references
    .map((r) => `\\bibitem{${r.key.split(":").pop()}} ${esc(r.text)}`)
    .join("\n");

  const flowImg = data.algorithmFlowImage
    ? "\\includegraphics[width=0.8\\linewidth]{figures/algorithm_flow.png}"
    : "% TODO: algorithm_flow.png";
  const illustImg = data.algorithmIllustImage
    ? "\\includegraphics[width=0.8\\linewidth]{figures/algorithm_illustration.png}"
    : "% TODO: algorithm_illustration.png";

  return `\\documentclass[10pt,twocolumn]{article}
\\usepackage{graphicx}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{geometry}
\\geometry{a4paper,margin=2.5cm}

\\title{${esc(data.title || "Untitled Paper")}}
\\author{Author Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${para(data.abstract)}
\\end{abstract}

\\section{Introduction}
${para(data.intro)}

\\section{Related Work}
${para(data.related)}

\\section{Method}
${para(data.algorithm)}

\\begin{figure}[htbp]
  \\centering
  ${flowImg}
  \\caption{Overview of the proposed framework.}
  \\label{fig:flow}
\\end{figure}

\\begin{figure}[htbp]
  \\centering
  ${illustImg}
  \\caption{Illustration of the proposed module.}
  \\label{fig:illust}
\\end{figure}

\\section{Experiments}
${para(data.experiment)}

${tableTex}

\\section{Discussion}
${para(data.discussion)}

\\section*{References}
\\begin{thebibliography}{99}
${refsTex}
\\end{thebibliography}

\\end{document}
`;
}

// ---------- 从 dataURL 转成 Blob ----------
function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function Step9Export({ data }: Props) {
  const [downloading, setDownloading] = useState(false);
  const tex = useMemo(() => buildTex(data), [data]);

  const handleDownloadTex = () => {
    const blob = new Blob([tex], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.tex";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      zip.file("main.tex", tex);
      zip.file("references.bib", data.bibContent || "% empty bib\n");

      const figFolder = zip.folder("figures")!;
      if (data.algorithmFlowImage) {
        figFolder.file(
          "algorithm_flow.png",
          dataUrlToBlob(data.algorithmFlowImage)
        );
      }
      if (data.algorithmIllustImage) {
        figFolder.file(
          "algorithm_illustration.png",
          dataUrlToBlob(data.algorithmIllustImage)
        );
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paper-latex.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

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
        <h2 className="text-xl font-bold text-brand-700">生成 LaTeX</h2>
        <p className="mt-1 text-sm text-ink-sub">
          确认无误后，可以下载 .tex 源文件、图片和 .bib 文件的打包结果。
        </p>
      </header>

      {/* 状态面板 */}
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

      {/* 预览 */}
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
        <pre className="max-h-[340px] min-h-[280px] overflow-auto rounded-lg border border-blue-100 bg-[#f7faff] p-4 text-[11.5px] leading-relaxed text-ink">
          {tex}
        </pre>
      </section>

      {/* 下载按钮 */}
      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadZip}
          disabled={downloading}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-700 disabled:opacity-60"
        >
          {downloading ? "打包中..." : "⬇ 下载 LaTeX 项目 (zip)"}
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
        ⓘ 下载的 zip 包含：main.tex、references.bib、figures/（两张图，若已生成）。
        打开 <b>Overleaf</b> 上传后即可编译成 PDF（建议编译器选 XeLaTeX）。
      </p>

      {/* 危险操作 */}
      <section className="mt-4 rounded-lg border border-red-100 bg-red-50/40 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-red-600">
              危险操作
            </div>
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