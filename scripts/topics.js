// Извличане на теми от транскрипт на ТВ емисия (вход Б).
// Правна рамка (04-novinarski-blokove.md): работим само с текст/теми,
// неутрални заглавия без сатира, без цитати и без преразказ.
import { validateTopics } from "./validate.js";
import { callClaudeJSON } from "./claude.js";

const TOPICS_SYSTEM = `Ти извличаш новинарски теми от транскрипт на телевизионна новинарска емисия на български.

Правила:
- Извади до 8 отделни новинарски теми от транскрипта.
- За всяка тема върни кратко НЕУТРАЛНО заглавие (без сатира, без оценки) + едно изречение факт.
- Без цитати от емисията, без преразказ — само темата и голият факт.
- Не споменавай името на телевизията, предаването или водещите.
- Не измисляй факти, които не са в транскрипта.`;

const TOPICS_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Кратко неутрално заглавие" },
          fact: { type: "string", description: "Едно изречение факт" },
        },
        required: ["title", "fact"],
        additionalProperties: false,
      },
    },
  },
  required: ["topics"],
  additionalProperties: false,
};

export async function extractTopics({ transcript }) {
  const { data, attempt } = await callClaudeJSON({
    system: TOPICS_SYSTEM,
    userText: `Транскрипт на емисията:\n\n${transcript}`,
    schema: TOPICS_SCHEMA,
    validate: (payload) => validateTopics(payload?.topics),
  });
  return { data: data.topics, attempt };
}
