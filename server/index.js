import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL =
  process.env.DASHSCOPE_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const PORT = process.env.PORT || 3001;

// 原始域名（去掉 /compatible-mode/v1）
const RAW_HOST = (() => {
  try {
    const u = new URL(BASE_URL);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "https://dashscope.aliyuncs.com";
  }
})();

// ============ 文本生成：各章节 prompt ============
const PROMPTS = {
  "title-abstract": (ctx) => ({
    system: `You are an academic writing assistant. Write a concise and professional paper title and abstract in English based on the given topic and experiment details. Return in this exact JSON format: {"title": "...", "abstract": "..."}`,
    user: `Topic: ${ctx.topic}\n\nExperiment Details:\n${ctx.experimentDetail}\n\nExperiment Results:\n${ctx.experimentResult}\n\nPlease write a paper title and abstract.`,
  }),
  intro: (ctx) => ({
    system: `You are an academic writing assistant. Write the Introduction section in English. Use formal academic style, include research background, motivation, problem definition, and contributions. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nExperiment Details:\n${ctx.experimentDetail}\n\nWrite the Introduction section (about 800-1000 words).`,
  }),
  related: (ctx) => ({
    system: `You are an academic writing assistant. Write the Related Work section in English. Compare and contrast existing approaches, point out their limitations, and position this work. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nWrite the Related Work section (about 600-800 words).`,
  }),
  algorithm: (ctx) => ({
    system: `You are an academic writing assistant. Write the Method section in English. Describe the proposed framework, modules, and training objective. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nExperiment Details:\n${ctx.experimentDetail}\n\nWrite the Method section (about 800-1200 words).`,
  }),
  experiment: (ctx) => ({
    system: `You are an academic writing assistant. Write the Experiments section in English. Describe datasets, evaluation metrics, baselines, main results, and analysis.
Return your output as a valid JSON object with this exact structure (no markdown code fences, no extra text):
{
  "text": "the full experiments section text (800-1000 words)",
  "table": {
    "headers": ["Method", "Dataset", "Accuracy", "F1"],
    "rows": [
      ["method1", "dataset1", "value", "value"],
      ["method2", "dataset2", "value", "value"]
    ]
  }
}
The table should have 3-5 rows showing comparison between the proposed method and baselines. Values should be plausible based on the experiment description.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nExperiment Details:\n${ctx.experimentDetail}\n\nExperiment Results:\n${ctx.experimentResult}\n\nWrite the Experiments section as JSON.`,
  }),
  discussion: (ctx) => ({
    system: `You are an academic writing assistant. Write the Discussion and Conclusion section in English. Discuss findings, limitations, and future directions. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nWrite the Discussion and Conclusion section (about 400-600 words).`,
  }),
};

// ============ 路由：文本生成 ============
app.post("/api/generate", async (req, res) => {
  try {
    const { section, context } = req.body;
    if (!section || !PROMPTS[section]) {
      return res.status(400).json({ error: "Unknown section" });
    }

    const { system, user } = PROMPTS[section](context);
    const url = `${BASE_URL}/chat/completions`;
    console.log(`[Qwen] POST ${url} section=${section}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Qwen] Error:", response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    console.log(`[Qwen] OK, ${content.length} chars`);
    res.json({ content });
  } catch (e) {
    console.error("[Server] Exception:", e);
    res.status(500).json({ error: String(e) });
  }
});

// ============ 路由：图像生成 ============
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const OPENAI_BASE =
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    if (!OPENAI_KEY) {
      return res
        .status(500)
        .json({ error: "缺少 OPENAI_API_KEY，请在 server/.env 中配置" });
    }

    const url = `${OPENAI_BASE}/images/generations`;
    console.log(`[Image] POST ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "medium",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Image] Error:", response.status, errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(500).json({
        error: "未能解析图片数据",
        raw: JSON.stringify(data).slice(0, 500),
      });
    }

    const imageUrl = `data:image/png;base64,${b64}`;
    console.log(`[Image] OK, ${imageUrl.length} chars`);
    res.json({ imageUrl });
  } catch (e) {
    console.error("[Image] Exception:", e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Qwen proxy listening on http://localhost:${PORT}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Raw Host: ${RAW_HOST}`);
  console.log(
    `   API Key:  ${API_KEY ? API_KEY.slice(0, 12) + "..." : "(missing)"}`
  );
});