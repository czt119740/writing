import type { WritingData } from "@/data/writingSteps";

interface Props {
  data: WritingData;
  onChange: (patch: Partial<WritingData>) => void;
}

export default function Step6Experiment({ data, onChange }: Props) {
  const table = data.experimentTable;

  const updateCell = (r: number, c: number, value: string) => {
    const rows = table.rows.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row
    );
    onChange({ experimentTable: { ...table, rows } });
  };

  const updateHeader = (c: number, value: string) => {
    const headers = table.headers.map((h, i) => (i === c ? value : h));
    onChange({ experimentTable: { ...table, headers } });
  };

  const addRow = () => {
    const rows = [
      ...table.rows,
      new Array(table.headers.length).fill(""),
    ];
    onChange({ experimentTable: { ...table, rows } });
  };

  const removeRow = (r: number) => {
    if (table.rows.length <= 1) return;
    const rows = table.rows.filter((_, i) => i !== r);
    onChange({ experimentTable: { ...table, rows } });
  };

  const addColumn = () => {
    const headers = [...table.headers, `列 ${table.headers.length + 1}`];
    const rows = table.rows.map((row) => [...row, ""]);
    onChange({ experimentTable: { headers, rows } });
  };

  const removeColumn = (c: number) => {
    if (table.headers.length <= 1) return;
    const headers = table.headers.filter((_, i) => i !== c);
    const rows = table.rows.map((row) => row.filter((_, i) => i !== c));
    onChange({ experimentTable: { headers, rows } });
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-bold text-brand-700">实验结果</h2>
        <p className="mt-1 text-sm text-ink-sub">
          说明实验设置、对比方法与结果分析，并整理成表格。
        </p>
      </header>

      {/* 正文 */}
      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-ink">结果分析正文</label>
        <textarea
          value={data.experiment}
          onChange={(e) => onChange({ experiment: e.target.value })}
          placeholder="描述数据集、评价指标、对比方法和主要结论..."
          className="h-[180px] w-full resize-none rounded-lg border border-blue-100 bg-white p-5 font-serif text-[15px] leading-relaxed text-ink outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <div className="text-right text-xs text-ink-sub">
          {data.experiment.length} 字符
        </div>
      </section>

      {/* 表格编辑 */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-ink">
            结果表格
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-500 transition-all hover:bg-brand-500 hover:text-white"
            >
              + 行
            </button>
            <button
              type="button"
              onClick={addColumn}
              className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-500 transition-all hover:bg-brand-500 hover:text-white"
            >
              + 列
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-lg border border-blue-100 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f4f8ff]">
                {table.headers.map((h, ci) => (
                  <th
                    key={ci}
                    className="border border-blue-100 px-2 py-1.5 text-left font-semibold text-brand-700"
                  >
                    <div className="flex items-center gap-1">
                      <input
                        value={h}
                        onChange={(e) => updateHeader(ci, e.target.value)}
                        className="w-full min-w-[80px] bg-transparent outline-none"
                      />
                      {table.headers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(ci)}
                          className="text-[10px] text-slate-400 hover:text-red-500"
                          title="删除该列"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-8 border border-blue-100 bg-[#f4f8ff]" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-blue-50/40">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-blue-100 px-2 py-1.5"
                    >
                      <input
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full min-w-[80px] bg-transparent text-sm outline-none"
                      />
                    </td>
                  ))}
                  <td className="border border-blue-100 px-1 text-center">
                    {table.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(ri)}
                        className="text-xs text-slate-400 hover:text-red-500"
                        title="删除该行"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-ink-sub">
          ⓘ 点击表头或单元格即可编辑；右上角按钮可增删行列。
        </p>
      </section>
    </div>
  );
}