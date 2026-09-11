import { useState } from "react";
import MathRenderer from "./MathRenderer";

interface Props {
  text: string;
}

export default function PreviewButton({ text }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!text.trim()}
        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-sub transition-all hover:bg-brand-100 hover:text-brand-500 disabled:opacity-50"
      >
        👁 预览公式
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-[900px] flex-col rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-blue-100 px-6 py-3">
              <h3 className="text-sm font-bold text-brand-700">
                公式预览（只读）
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-sub hover:bg-slate-200"
              >
                ✕ 关闭
              </button>
            </div>
            <div className="overflow-auto px-8 py-6">
              <MathRenderer
                text={text}
                className="text-[15px] leading-relaxed text-ink"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}