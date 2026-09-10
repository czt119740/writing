import type { WritingData } from "@/data/writingSteps";

interface Props {
  data: WritingData;
  onChange: (patch: Partial<WritingData>) => void;
  field: "intro" | "related" | "discussion";
  title: string;
  hint: string;
  placeholder: string;
}

export default function Step3To8Text({
  data,
  onChange,
  field,
  title,
  hint,
  placeholder,
}: Props) {
  const value = data[field];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header>
        <h2 className="text-xl font-bold text-brand-700">{title}</h2>
        <p className="mt-1 text-sm text-ink-sub">{hint}</p>
      </header>

      <textarea
        value={value}
        onChange={(e) => onChange({ [field]: e.target.value } as Partial<WritingData>)}
        placeholder={placeholder}
        className="min-h-0 flex-1 resize-none rounded-lg border border-blue-100 bg-white p-5 font-serif text-[15px] leading-relaxed text-ink outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
      />

      <div className="text-right text-xs text-ink-sub">
        {value.length} 字符
      </div>
    </div>
  );
}