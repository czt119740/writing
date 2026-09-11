export type TranslateDirection = "zh2en" | "en2zh";

export async function translateText(
  text: string,
  direction: TranslateDirection
): Promise<string> {
  if (!text.trim()) {
    throw new Error("内容为空，无需翻译");
  }

  const res = await fetch("http://localhost:3001/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, direction }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`翻译失败：${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  return json.translation as string;
}