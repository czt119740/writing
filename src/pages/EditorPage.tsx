import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sections as initialSections, type Section } from "@/data/sections";

const NAV = [
  { key: "intro", icon: "▣", label: "引言" },
  { key: "related", icon: "▰", label: "相关工作" },
  { key: "model", icon: "⚒", label: "算法模型" },
  { key: "method", icon: "⚙", label: "方法介绍" },
  { key: "experiment", icon: "▰", label: "实验结果" },
  { key: "discussion", icon: "☁", label: "讨论和总结" },
  { key: "references", icon: "▣", label: "引用文献" },
];

export default function EditorPage() {
  const navigate = useNavigate();
  const [sections, setSections] =
    useState<Record<string, Section>>(initialSections);
  const [current, setCurrent] = useState("related");

  const section = sections[current];

  const updateField = (field: "en" | "zh", value: string) => {
    setSections((prev) => ({
      ...prev,
      [current]: { ...prev[current], [field]: value },
    }));
  };

  return (
    <main className="grid h-screen grid-cols-[220px_minmax(240px,1fr)_minmax(250px,1fr)] gap-3.5 bg-[linear-gradient(108deg,#f5f6f5_0%,#e5f0fd_51%,#bfdcff_100%)] p-[22px_18px_18px]">
      <aside className="relative rounded-[13px] border border-blue-200/20 bg-white/20 p-3 pb-[88px]">
        <Button
          variant="secondary"
          className="mb-3 h-[30px] px-3 text-[13px]"
          onClick={() => navigate("/")}
        >
          ← 返回首页
        </Button>

        <nav className="grid gap-1.5">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrent(item.key)}
              className={cn(
                "flex h-[58px] items-center gap-3 rounded-xl px-3.5 text-left text-base transition-all",
                current === item.key
                  ? "bg-gradient-to-br from-[#a8d1f7] to-[#8bbdf0] shadow-md"
                  : "hover:bg-white/50"
              )}
            >
              <span className="text-xl text-brand-500">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="grid h-[38px] w-[38px] place-items-center rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-700">
                ▰
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold">
                我的文件
              </DropdownMenuLabel>
              <DropdownMenuItem>新建文档</DropdownMenuItem>
              <DropdownMenuItem>导入论文</DropdownMenuItem>
              <DropdownMenuItem>项目文件夹</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="grid h-[38px] w-[38px] place-items-center rounded-full border-2 border-white bg-[#fcba91] text-white shadow-md">
                👤
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold">
                个人中心
              </DropdownMenuLabel>
              <DropdownMenuItem>账户设置</DropdownMenuItem>
              <DropdownMenuItem>我的收藏</DropdownMenuItem>
              <DropdownMenuItem>退出登录</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <WorkspacePanel
        title={section.enTitle}
        value={section.en}
        onChange={(v) => updateField("en", v)}
        lang="en"
      />
      <WorkspacePanel
        title={section.zhTitle}
        value={section.zh}
        onChange={(v) => updateField("zh", v)}
        lang="zh"
      />
    </main>
  );
}

interface PanelProps {
  title: string;
  value: string;
  onChange: (v: string) => void;
  lang: "en" | "zh";
}

function WorkspacePanel({ title, value, onChange, lang }: PanelProps) {
  return (
    <section
      key={title}
      className="grid min-w-0 grid-rows-[52px_minmax(0,1fr)] animate-[fadeIn_.4s_ease-in-out] overflow-hidden rounded-[14px] border border-white/70 bg-[rgba(235,242,252,0.58)] shadow-lg"
    >
      <header className="flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5 text-base font-bold">
          <span className="text-xl text-brand-500">▣</span>
          <span>{title}</span>
        </div>
        <button className="border-0 bg-transparent text-lg tracking-widest text-brand-500">
          •••
        </button>
      </header>
      <div className="min-h-0 rounded-t-xl bg-white/80">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "px-7 pt-[72px] font-serif",
            lang === "zh" && "font-[Songti_SC,SimSun,serif]"
          )}
        />
      </div>
    </section>
  );
}