import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WritingSidebar from "@/components/editor/WritingSidebar";
import { STEPS, initialWritingData, type WritingData } from "@/data/writingSteps";
import { cn } from "@/lib/utils";

import Step1Upload from "@/components/writing/Step1Upload";
import Step2TitleAbstract from "@/components/writing/Step2TitleAbstract";
import Step3To8Text from "@/components/writing/Step3To8Text";
import Step5Algorithm from "@/components/writing/Step5Algorithm";
import Step6Experiment from "@/components/writing/Step6Experiment";
import Step8References from "@/components/writing/Step8References";
import Step9Export from "@/components/writing/Step9Export";

export default function EditorPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<WritingData>(initialWritingData);

  const handleChange = (patch: Partial<WritingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const currentStep = STEPS[stepIndex];

  const canNext = (() => {
    if (currentStep.key === "upload") return data.topic.trim().length > 0;
    if (currentStep.key === "title-abstract")
      return data.title.trim().length > 0 && data.abstract.trim().length > 0;
    return true;
  })();

  const goPrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const goNext = () => {
    if (!canNext) return;
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  return (
    <main className="grid h-screen grid-cols-[200px_1fr] bg-[linear-gradient(108deg,#f5f6f5_0%,#e5f0fd_51%,#bfdcff_100%)]">
      <WritingSidebar />

      <section className="flex min-w-0 flex-col overflow-hidden p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/60 shadow-lg backdrop-blur">
          {/* 顶部：返回 + 标题 */}
          <header className="flex items-center gap-4 border-b border-blue-100 bg-white/70 px-6 py-3">
            <Button
              variant="secondary"
              className="h-8 shrink-0 px-3 text-xs"
              onClick={() => navigate("/")}
            >
              ← 返回首页
            </Button>
            <span className="text-sm font-bold text-brand-700">
              写作 · Writing
            </span>
          </header>

          {/* 步骤条 */}
          <div className="flex items-center gap-1 border-b border-blue-100 bg-white/60 px-6 py-3">
            {STEPS.map((s, idx) => {
              const isDone = idx < stepIndex;
              const isActive = idx === stepIndex;
              return (
                <div
                  key={s.key}
                  className="flex flex-1 items-center gap-1"
                >
                  <button
                    onClick={() => {
                      // 只能跳回已完成的步骤或当前步，不能跳到未完成的
                      if (idx <= stepIndex) setStepIndex(idx);
                    }}
                    className="flex items-center gap-2 transition-all"
                    title={s.zh}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-all",
                        isActive
                          ? "bg-brand-500 text-white shadow-md"
                          : isDone
                          ? "bg-brand-100 text-brand-500 cursor-pointer"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={cn(
                        "hidden whitespace-nowrap text-xs transition-all xl:inline",
                        isActive
                          ? "font-semibold text-brand-700"
                          : "text-ink-sub"
                      )}
                    >
                      {s.zh}
                    </span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-[2px] flex-1 rounded",
                        idx < stepIndex ? "bg-brand-300" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* 当前步骤标题 + 内容 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-8">
            {/* 步骤内容 */}
            <div className="mx-auto flex w-full max-w-[900px] min-h-0 flex-1 flex-col">
              {currentStep.key === "upload" && (
                <Step1Upload data={data} onChange={handleChange} />
              )}
              {currentStep.key === "title-abstract" && (
                <Step2TitleAbstract data={data} onChange={handleChange} />
              )}
              {currentStep.key === "intro" && (
                <Step3To8Text
                  data={data}
                  onChange={handleChange}
                  field="intro"
                  title="引言"
                  hint="介绍研究背景、动机、问题定义和本文主要贡献。建议 800~1200 词。"
                  placeholder="在这里撰写引言..."
                />
              )}
              {currentStep.key === "related" && (
                <Step3To8Text
                  data={data}
                  onChange={handleChange}
                  field="related"
                  title="相关工作"
                  hint="梳理与本文最相关的研究，指出它们的不足与本文的区别。"
                  placeholder="在这里撰写相关工作..."
                />
              )}
              {currentStep.key === "algorithm" && (
                <Step5Algorithm data={data} onChange={handleChange} />
              )}
              {currentStep.key === "experiment" && (
                <Step6Experiment data={data} onChange={handleChange} />
              )}
              {currentStep.key === "discussion" && (
                <Step3To8Text
                  data={data}
                  onChange={handleChange}
                  field="discussion"
                  title="讨论和展望"
                  hint="讨论方法的意义、局限，以及未来可能的研究方向。"
                  placeholder="在这里撰写讨论和展望..."
                />
              )}
              {currentStep.key === "references" && (
                <Step8References data={data} onChange={handleChange} />
              )}
              {currentStep.key === "export" && <Step9Export data={data} />}
            </div>
          </div>

          {/* 底部：上一步 / 下一步 */}
          <footer className="flex items-center justify-between gap-4 border-t border-blue-100 bg-white/70 px-6 py-3">
            <div className="text-xs text-ink-sub">
              第 <b className="text-brand-700">{stepIndex + 1}</b> / {STEPS.length} 步 ·{" "}
              <b className="text-brand-700">{currentStep.zh}</b>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="h-9 px-5 text-sm"
                onClick={goPrev}
                disabled={stepIndex === 0}
              >
                ← 上一步
              </Button>
              {stepIndex < STEPS.length - 1 && (
                <Button
                  className="h-9 px-5 text-sm"
                  onClick={goNext}
                  disabled={!canNext}
                >
                  下一步 →
                </Button>
              )}
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}