import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TabKey = "meeting" | "latex" | "format";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "meeting", label: "会议", icon: "📅" },
  { key: "latex", label: "Latex", icon: "📄" },
  { key: "format", label: "文章格式", icon: "📝" },
];

export default function LearnPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("meeting");

  return (
    <main className="grid min-h-screen place-items-center bg-page-bg">
      <div className="flex h-[600px] w-[900px] overflow-hidden rounded-xl border border-white/80 bg-white shadow-2xl">
        <aside className="flex w-[220px] flex-col border-r border-slate-100 bg-[#f4f8ff] p-5">
          <Button
            variant="secondary"
            className="mb-[30px] h-[38px] w-auto self-start"
            onClick={() => navigate("/")}
          >
            ← 返回首页
          </Button>

          <nav className="flex flex-col gap-2.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center rounded-lg px-4 py-3 text-left font-medium transition-all",
                  tab === t.key
                    ? "bg-brand-100 text-brand-500"
                    : "text-ink-sub hover:bg-brand-500/5"
                )}
              >
                <span className="mr-3 text-lg">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-10">
          <header className="mb-10 flex items-center border-b border-slate-100 pb-5">
            <span className="mr-4 text-3xl text-brand-500">
              {TABS.find((t) => t.key === tab)?.icon}
            </span>
            <h2 className="text-2xl font-bold text-ink">
              {TABS.find((t) => t.key === tab)?.label}
            </h2>
          </header>

          {tab === "meeting" ? (
            <div
              key={tab}
              className="flex animate-[fadeIn_.4s_ease-in-out] flex-col gap-[30px]"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-[30%]" />
                  <Skeleton className="w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div
              key={tab}
              className="animate-[fadeIn_.4s_ease-in-out] text-ink-sub"
            >
              {tab === "latex"
                ? "这里是 Latex 编辑器的内容区域..."
                : "这里是关于文章排版格式的详细说明..."}
            </div>
          )}
        </section>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}