// Чете персонажната карта от ai-analizator-persona.md по време на изпълнение,
// за да остане един източник на истината (файлът, не копие в кода).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PERSONA_FILE = path.join(repoRoot, "ai-analizator-persona.md");

// Връща текста между първата и последната "---" линия на файла.
export async function loadPersona() {
  const raw = await readFile(PERSONA_FILE, "utf8");
  const lines = raw.split("\n");
  const dividers = lines
    .map((line, i) => (line.trim() === "---" ? i : -1))
    .filter((i) => i !== -1);
  if (dividers.length < 2) {
    throw new Error(
      `Не намерих две "---" линии в ${PERSONA_FILE} — не мога да извлека system prompt-а.`
    );
  }
  const first = dividers[0];
  const last = dividers[dividers.length - 1];
  const persona = lines.slice(first + 1, last).join("\n").trim();
  if (!persona) {
    throw new Error(`Персонажната карта между "---" линиите е празна (${PERSONA_FILE}).`);
  }
  return persona;
}
