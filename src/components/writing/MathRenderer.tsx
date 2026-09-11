import { useMemo } from "react";
import katex from "katex";

interface Props {
  text: string;
  className?: string;
}

/** 把 Unicode 数学符号替换成 LaTeX 命令 */
function normalizeUnicodeMath(s: string): string {
  return s
    .replace(/ℝ/g, "\\mathbb{R}")
    .replace(/ℕ/g, "\\mathbb{N}")
    .replace(/ℤ/g, "\\mathbb{Z}")
    .replace(/ℚ/g, "\\mathbb{Q}")
    .replace(/ℂ/g, "\\mathbb{C}")
    .replace(/∈/g, "\\in")
    .replace(/∉/g, "\\notin")
    .replace(/⊂/g, "\\subset")
    .replace(/⊆/g, "\\subseteq")
    .replace(/⊃/g, "\\supset")
    .replace(/⊇/g, "\\supseteq")
    .replace(/∪/g, "\\cup")
    .replace(/∩/g, "\\cap")
    .replace(/×/g, "\\times")
    .replace(/÷/g, "\\div")
    .replace(/±/g, "\\pm")
    .replace(/∓/g, "\\mp")
    .replace(/≥/g, "\\geq")
    .replace(/≤/g, "\\leq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/≡/g, "\\equiv")
    .replace(/∞/g, "\\infty")
    .replace(/∑/g, "\\sum")
    .replace(/∏/g, "\\prod")
    .replace(/∫/g, "\\int")
    .replace(/√/g, "\\sqrt{}")
    .replace(/∂/g, "\\partial")
    .replace(/∇/g, "\\nabla")
    .replace(/α/g, "\\alpha")
    .replace(/β/g, "\\beta")
    .replace(/γ/g, "\\gamma")
    .replace(/δ/g, "\\delta")
    .replace(/ε/g, "\\epsilon")
    .replace(/ζ/g, "\\zeta")
    .replace(/η/g, "\\eta")
    .replace(/κ/g, "\\kappa")
    .replace(/λ/g, "\\lambda")
    .replace(/μ/g, "\\mu")
    .replace(/ν/g, "\\nu")
    .replace(/ξ/g, "\\xi")
    .replace(/ρ/g, "\\rho")
    .replace(/σ/g, "\\sigma")
    .replace(/τ/g, "\\tau")
    .replace(/φ/g, "\\phi")
    .replace(/χ/g, "\\chi")
    .replace(/ψ/g, "\\psi")
    .replace(/ω/g, "\\omega")
    .replace(/θ/g, "\\theta")
    .replace(/Γ/g, "\\Gamma")
    .replace(/Δ/g, "\\Delta")
    .replace(/Θ/g, "\\Theta")
    .replace(/Λ/g, "\\Lambda")
    .replace(/Ξ/g, "\\Xi")
    .replace(/Π/g, "\\Pi")
    .replace(/Σ/g, "\\Sigma")
    .replace(/Φ/g, "\\Phi")
    .replace(/Ψ/g, "\\Psi")
    .replace(/Ω/g, "\\Omega")
    .replace(/→/g, "\\rightarrow")
    .replace(/←/g, "\\leftarrow")
    .replace(/↔/g, "\\leftrightarrow")
    .replace(/⇒/g, "\\Rightarrow")
    .replace(/⇐/g, "\\Leftarrow")
    .replace(/⇔/g, "\\Leftrightarrow")
    .replace(/∀/g, "\\forall")
    .replace(/∃/g, "\\exists")
    .replace(/⋅/g, "\\cdot")
    .replace(/·/g, "\\cdot")
    .replace(/⋯/g, "\\cdots")
    .replace(/…/g, "\\ldots");
}

/**
 * 渲染文本中的 LaTeX 数学公式
 * 支持：
 *   $...$       行内公式
 *   $$...$$     独立公式
 *   \[...\]     独立公式
 *   \(...\)     行内公式
 */
export default function MathRenderer({ text, className = "" }: Props) {
  const html = useMemo(() => {
    if (!text) return "";

    const mathSegments: { placeholder: string; rendered: string }[] = [];
    let counter = 0;

    let working = text;

    // 1. $$...$$（独立公式）
    working = working.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(
          normalizeUnicodeMath(formula.trim()),
          { displayMode: true, throwOnError: false }
        );
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `$$${formula}$$` });
      }
      return placeholder;
    });

    // 2. \[...\]（独立公式）
    working = working.replace(/\\\[([\s\S]+?)\\\]/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(
          normalizeUnicodeMath(formula.trim()),
          { displayMode: true, throwOnError: false }
        );
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `\\[${formula}\\]` });
      }
      return placeholder;
    });

    // 3. $...$（行内公式）
    working = working.replace(/\$([^$\n]+?)\$/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(
          normalizeUnicodeMath(formula.trim()),
          { displayMode: false, throwOnError: false }
        );
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `$${formula}$` });
      }
      return placeholder;
    });

    // 4. \(...\)（行内公式）
    working = working.replace(/\\\(([\s\S]+?)\\\)/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(
          normalizeUnicodeMath(formula.trim()),
          { displayMode: false, throwOnError: false }
        );
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `\\(${formula}\\)` });
      }
      return placeholder;
    });

    // 5. 转义 HTML 特殊字符
    working = working
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 6. 换行
    working = working.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>");

    // 7. 公式替换回渲染结果
    for (const { placeholder, rendered } of mathSegments) {
      working = working.replace(placeholder, rendered);
    }

    return `<p>${working}</p>`;
  }, [text]);

  return (
    <div
      className={`math-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}