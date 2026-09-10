import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const API_KEY = process.env.DASHSCOPE_API_KEY;
const BASE_URL =
  process.env.DASHSCOPE_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const PORT = process.env.PORT || 3001;

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
    system: `You are an academic writing assistant. Write the Experiments section in English. Describe datasets, evaluation metrics, baselines, main results, and analysis. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nExperiment Details:\n${ctx.experimentDetail}\n\nExperiment Results:\n${ctx.experimentResult}\n\nWrite the Experiments section (about 800-1000 words).`,
  }),
  discussion: (ctx) => ({
    system: `You are an academic writing assistant. Write the Discussion and Conclusion section in English. Discuss findings, limitations, and future directions. Output plain text only.`,
    user: `Topic: ${ctx.topic}\n\nTitle: ${ctx.title}\n\nAbstract: ${ctx.abstract}\n\nWrite the Discussion and Conclusion section (about 400-600 words).`,
  }),
};

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

app.listen(PORT, () => {
  console.log(`✅ Qwen proxy listening on http://localhost:${PORT}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   API Key:  ${API_KEY ? API_KEY.slice(0, 12) + "..." : "(missing)"}`);
});