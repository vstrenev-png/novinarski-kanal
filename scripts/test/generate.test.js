// Тест на генератора: 3-те примерни новини от 03-prototip-primeri.md
// минават през /generate логиката и резултатът се валидира.
// Изисква ANTHROPIC_API_KEY — без ключ тестовете се пропускат (skip) с ясно съобщение.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { validateScript } from "../validate.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXAMPLES_FILE = path.join(repoRoot, "03-prototip-primeri.md");

// Изважда двойките (Заглавие, Факт) от файла с примерите.
async function loadExamples() {
  const raw = await readFile(EXAMPLES_FILE, "utf8");
  const examples = [];
  let currentTitle = null;
  for (const line of raw.split("\n")) {
    const titleMatch = line.match(/^- Заглавие:\s*(.+)$/);
    if (titleMatch) {
      currentTitle = titleMatch[1].trim().replace(/^[„"]/, "").replace(/["“”]$/, "");
      continue;
    }
    const factMatch = line.match(/^- Факт:\s*(.+)$/);
    if (factMatch && currentTitle) {
      examples.push({ title: currentTitle, fact: factMatch[1].trim() });
      currentTitle = null;
    }
  }
  return examples;
}

test("03-prototip-primeri.md съдържа 3 примера (заглавие + факт)", async () => {
  const examples = await loadExamples();
  assert.equal(examples.length, 3, `Очаквах 3 примера, намерих ${examples.length}`);
});

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY);

test(
  "генераторът връща валиден JSON за 3-те примерни новини",
  { skip: hasKey ? false : "Няма ANTHROPIC_API_KEY — попълни .env, за да пуснеш живия тест." },
  async (t) => {
    const { generateScript } = await import("../generate.js");
    const examples = await loadExamples();
    for (const example of examples) {
      await t.test(`пример: ${example.title}`, async () => {
        const { data } = await generateScript(example);
        const result = validateScript(data);
        assert.equal(
          result.valid,
          true,
          `Невалиден изход за "${example.title}": ${result.errors.join("; ")}\n` +
            JSON.stringify(data, null, 2)
        );
      });
    }
  }
);
