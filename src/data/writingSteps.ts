export type StepKey =
  | "upload"
  | "title-abstract"
  | "intro"
  | "related"
  | "algorithm"
  | "experiment"
  | "discussion"
  | "references"
  | "export";

export interface StepDef {
  key: StepKey;
  index: number;
  zh: string;
  en: string;
}

export const STEPS: StepDef[] = [
  { key: "upload",         index: 1, zh: "上传素材",     en: "Upload" },
  { key: "title-abstract", index: 2, zh: "标题与摘要",   en: "Title & Abstract" },
  { key: "intro",          index: 3, zh: "引言",         en: "Introduction" },
  { key: "related",        index: 4, zh: "相关工作",     en: "Related Work" },
  { key: "algorithm",      index: 5, zh: "算法介绍",     en: "Method" },
  { key: "experiment",     index: 6, zh: "实验结果",     en: "Experiments" },
  { key: "discussion",     index: 7, zh: "讨论和展望",   en: "Discussion" },
  { key: "references",     index: 8, zh: "引用文献",     en: "References" },
  { key: "export",         index: 9, zh: "生成 LaTeX",   en: "Export" },
];

// 全局写作数据（存在内存里，刷新会丢）
export interface WritingData {
  topic: string;
  experimentDetail: string;
  experimentResult: string;
  bibContent: string;

  title: string;
  abstract: string;

  intro: string;
  related: string;
  algorithm: string;
  algorithmFlowImage: string;    // 图片 dataURL 或 URL
  algorithmIllustImage: string;

  experiment: string;
  experimentTable: {
    headers: string[];
    rows: string[][];
  };

  discussion: string;

  references: {
    key: string;
    text: string;
  }[];
}

export const initialWritingData: WritingData = {
  topic: "",
  experimentDetail: "",
  experimentResult: "",
  bibContent: "",

  title: "",
  abstract: "",

  intro: "",
  related: "",
  algorithm: "",
  algorithmFlowImage: "",
  algorithmIllustImage: "",

  experiment: "",
  experimentTable: {
    headers: ["Method", "Dataset", "Accuracy", "F1"],
    rows: [
      ["Baseline", "", "", ""],
      ["Ours", "", "", ""],
    ],
  },

  discussion: "",

  references: [],
};