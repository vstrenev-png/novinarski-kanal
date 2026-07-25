// HTTP сървър, който Make.com вика през "HTTP -> Make a request".
// Endpoints: POST /generate, POST /transcribe, POST /extract-topics
import "dotenv/config";
import express from "express";
import { generateScript } from "./generate.js";
import { transcribeUrl } from "./transcribe.js";
import { extractTopics } from "./topics.js";
import { InvalidOutputError } from "./claude.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    endpoints: ["POST /generate", "POST /transcribe", "POST /extract-topics"],
  });
});

// Вход А (RSS) и обща стъпка: Заглавие + Факт -> скрипт за клип
app.post("/generate", async (req, res) => {
  const { title, fact } = req.body ?? {};
  if (typeof title !== "string" || !title.trim() || typeof fact !== "string" || !fact.trim()) {
    return res.status(400).json({ error: 'Очаквам JSON тяло: { "title": "...", "fact": "..." }' });
  }
  try {
    const { data, attempt } = await generateScript({ title, fact });
    console.log(`[generate] "${title}" — OK (опит ${attempt}${attempt === 1 ? ", от първия" : ""})`);
    return res.json(data);
  } catch (err) {
    return handleError(res, err, `[generate] "${title}"`);
  }
});

// Вход Б, част 1: аудио URL -> чист текст (транскрипт)
app.post("/transcribe", async (req, res) => {
  const { audioUrl } = req.body ?? {};
  if (typeof audioUrl !== "string" || !audioUrl.trim()) {
    return res.status(400).json({ error: 'Очаквам JSON тяло: { "audioUrl": "https://..." }' });
  }
  try {
    const transcript = await transcribeUrl({ audioUrl });
    console.log(`[transcribe] OK (${transcript.length} знака)`);
    return res.json({ transcript });
  } catch (err) {
    return handleError(res, err, "[transcribe]");
  }
});

// Вход Б, част 2: транскрипт -> до 8 теми { title, fact }
app.post("/extract-topics", async (req, res) => {
  const { transcript } = req.body ?? {};
  if (typeof transcript !== "string" || !transcript.trim()) {
    return res.status(400).json({ error: 'Очаквам JSON тяло: { "transcript": "..." }' });
  }
  try {
    const { data, attempt } = await extractTopics({ transcript });
    console.log(`[extract-topics] OK — ${data.length} теми (опит ${attempt})`);
    return res.json({ topics: data });
  } catch (err) {
    return handleError(res, err, "[extract-topics]");
  }
});

function handleError(res, err, label) {
  if (err instanceof InvalidOutputError) {
    console.error(`${label} — невалиден изход след всички опити:`, err.details);
    return res.status(422).json({ error: err.message, details: err.details });
  }
  console.error(`${label} — грешка:`, err.message);
  return res.status(500).json({ error: err.message });
}

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Сървърът слуша на http://localhost:${port}`);
});
