import type { WritingData } from "@/data/writingSteps";

/** 转义 LaTeX 特殊字符 */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/** 把多段文字拆成 LaTeX 段落（空行分段） */
function paragraphs(s: string): string {
  return s
    .split(/\n\s*\n/)
    .map((p) => esc(p.trim()))
    .filter(Boolean)
    .join("\n\n");
}

/** 生成实验结果的 LaTeX 表格 */
function buildTable(data: WritingData): string {
  const { headers, rows } = data.experimentTable;
  if (headers.length === 0 || rows.length === 0) return "";

  const colSpec = "l".repeat(headers.length);
  const headerRow = headers.map((h) => `\\textbf{${esc(h)}}`).join(" & ");
  const bodyRows = rows
    .map((r) => r.map((c) => esc(c)).join(" & ") + " \\\\")
    .join("\n    ");

  return `
\\begin{table}[t]
  \\centering
  \\caption{Experimental results on the evaluated benchmarks.}
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
}

/** 生成 main.tex（CVPR 格式） */
export function buildCvprTex(data: WritingData): string {
  const title = esc(data.title || "Untitled Paper");

  // 图片段落：只在有图时才 \includegraphics
  const flowFig = data.algorithmFlowImage
    ? `\\includegraphics[width=\\linewidth]{figures/algorithm_flow.png}`
    : `% \\includegraphics[width=\\linewidth]{figures/algorithm_flow.png}`;

  const illustFig = data.algorithmIllustImage
    ? `\\includegraphics[width=\\linewidth]{figures/algorithm_illustration.png}`
    : `% \\includegraphics[width=\\linewidth]{figures/algorithm_illustration.png}`;

  return `% CVPR 2026 Paper Template
% Based on the CVPR Author Kit: https://github.com/cvpr-org/author-kit
% !TEX program = pdflatex

\\documentclass[10pt,twocolumn,letterpaper]{article}

\\usepackage[review]{cvpr}
% 可选：
%   [review]        审稿版（匿名 + 行号）
%   [pagenumbers]   arXiv 版（有页码）
%   （不加参数）    Camera-ready 版

\\input{preamble}

\\definecolor{cvprblue}{rgb}{0.21,0.49,0.74}
\\usepackage[pagebackref,breaklinks,colorlinks,allcolors=cvprblue]{hyperref}

% 匿名审稿信息
\\def\\paperID{*****}
\\def\\confName{CVPR}
\\def\\confYear{2026}

\\title{${title}}

\\author{Anonymous CVPR submission\\\\
Paper ID \\paperID}

\\begin{document}
\\maketitle

\\begin{abstract}
${paragraphs(data.abstract)}
\\end{abstract}

\\section{Introduction}
${paragraphs(data.intro)}

\\section{Related Work}
${paragraphs(data.related)}

\\section{Method}
${paragraphs(data.algorithm)}

\\begin{figure}[t]
  \\centering
  ${flowFig}
  \\caption{Overview of the proposed framework.}
  \\label{fig:flow}
\\end{figure}

\\begin{figure}[t]
  \\centering
  ${illustFig}
  \\caption{Illustration of the key module of our method.}
  \\label{fig:illust}
\\end{figure}

\\section{Experiments}
${paragraphs(data.experiment)}

${buildTable(data)}

\\section{Discussion and Conclusion}
${paragraphs(data.discussion)}

{
\\small
\\bibliographystyle{ieeenat_fullname}
\\bibliography{main}
}

\\end{document}
`;
}

/** 生成 main.bib（把用户输入的结构化引用转成 BibTeX） */
export function buildCvprBib(data: WritingData): string {
  if (!data.references || data.references.length === 0) {
    return "% Empty bibliography. Add your references here.\n";
  }

  return data.references
    .map((ref, idx) => {
      // key 形如 "article:smith2020" 或直接是 "smith2020"
      const rawKey = ref.key.includes(":") ? ref.key.split(":").pop()! : ref.key;
      const safeKey = rawKey.replace(/[^a-zA-Z0-9_:-]/g, "_");

      // 尝试从 text 里提取年份
      const yearMatch = ref.text.match(/(19|20)\d{2}/);
      const year = yearMatch ? yearMatch[0] : "2024";

      // 其余文本作为 title 字段（简单处理）
      const cleanText = ref.text.replace(/\s+/g, " ").trim();
      const title = cleanText.length > 200 ? cleanText.slice(0, 200) : cleanText;

      return `@article{${safeKey},
  author    = {Unknown},
  title     = {${title.replace(/[{}]/g, "")}},
  journal   = {arXiv preprint},
  year      = {${year}},
  note      = {Reference ${idx + 1}}
}`;
    })
    .join("\n\n");
}