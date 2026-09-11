import { useMemo } from "react";
import katex from "katex";

interface Props {
  text: string;
  className?: string;
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

    // 先转义 HTML 特殊字符（但保留数学公式部分不转义）
    // 策略：先找出所有公式段，替换成占位符，转义其余文本，再替换回公式
    const mathSegments: { placeholder: string; rendered: string }[] = [];
    let counter = 0;

    let working = text;

    // 1. 匹配 $$...$$（独立公式，优先级最高）
    working = working.replace(/\$\$([\s\S]+?)\$\$/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `$$${formula}$$` });
      }
      return placeholder;
    });

    // 2. 匹配 \[...\]（独立公式）
    working = working.replace(/\\\[([\s\S]+?)\\\]/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `\\[${formula}\\]` });
      }
      return placeholder;
    });

    // 3. 匹配 $...$（行内公式，避免匹配 $$）
    working = working.replace(/\$([^$\n]+?)\$/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `$${formula}$` });
      }
      return placeholder;
    });

    // 4. 匹配 \(...\)（行内公式）
    working = working.replace(/\\\(([\s\S]+?)\\\)/g, (_, formula) => {
      const placeholder = `@@MATH_${counter++}@@`;
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        mathSegments.push({ placeholder, rendered });
      } catch {
        mathSegments.push({ placeholder, rendered: `\\(${formula}\\)` });
      }
      return placeholder;
    });

    // 5. 转义剩余文本的 HTML
    working = working
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 6. 换行处理
    working = working.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>");

    // 7. 把公式替换回渲染结果
    for (const { placeholder, rendered } of mathSegments) {
      working = working.replace(placeholder, rendered);
    }

    return `<p>${working}</p>`;
  }, [text]);

  return (
    <div
      className={`math-rendered whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}