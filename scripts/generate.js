// Генератор на скрипт за клип: Заглавие + Факт -> { hook, analiz, poanta, hashtags }
import { loadPersona } from "./persona.js";
import { validateScript } from "./validate.js";
import { callClaudeJSON } from "./claude.js";

const SCRIPT_SCHEMA = {
  type: "object",
  properties: {
    hook: { type: "string", description: "1 изречение — закачка за първите 2 секунди" },
    analiz: { type: "string", description: "3-5 изречения оригинален сатиричен коментар" },
    poanta: { type: "string", description: "1 остра завършваща реплика / риторичен въпрос" },
    hashtags: {
      type: "array",
      items: { type: "string" },
      description: "3 до 5 релевантни хаштага на български",
    },
  },
  required: ["hook", "analiz", "poanta", "hashtags"],
  additionalProperties: false,
};

export async function generateScript({ title, fact }) {
  const persona = await loadPersona();
  return callClaudeJSON({
    system: persona,
    userText: `Заглавие: ${title}\nФакт: ${fact}`,
    schema: SCRIPT_SCHEMA,
    validate: validateScript,
  });
}
