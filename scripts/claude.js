// Общ помощник за викане на Claude с гарантирано валиден JSON изход.
// Комбинира две защити: structured outputs (API-то само спазва схемата)
// + наша валидация с retry до 3 опита.
import Anthropic from "@anthropic-ai/sdk";

// Актуалният препоръчан модел от Messages API (Claude Opus 5).
export const MODEL = "claude-opus-5";

export const MAX_ATTEMPTS = 3;

let client;
export function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "Липсва ANTHROPIC_API_KEY. Копирай .env.example като .env и попълни ключа си."
      );
    }
    client = new Anthropic();
  }
  return client;
}

// Вика Claude и връща валидиран JSON обект.
// - system: system prompt (стринг)
// - userText: потребителското съобщение
// - schema: JSON schema за structured outputs
// - validate: функция (data) => { valid, errors }
// Прави до MAX_ATTEMPTS опита; ако всички са невалидни, хвърля InvalidOutputError.
export class InvalidOutputError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "InvalidOutputError";
    this.details = details;
  }
}

export async function callClaudeJSON({ system, userText, schema, validate }) {
  const anthropic = getClient();
  let lastErrors = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system,
      output_config: { format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: userText }],
    });

    if (response.stop_reason === "refusal") {
      lastErrors = ["Моделът отказа заявката (stop_reason: refusal)."];
      continue;
    }
    if (response.stop_reason === "max_tokens") {
      lastErrors = ["Изходът беше отрязан (stop_reason: max_tokens)."];
      continue;
    }

    const text = response.content.find((block) => block.type === "text")?.text ?? "";
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      lastErrors = ["Отговорът не е валиден JSON."];
      continue;
    }

    const result = validate(data);
    if (result.valid) {
      return { data, attempt };
    }
    lastErrors = result.errors;
  }

  throw new InvalidOutputError(
    `Невалиден изход от Claude след ${MAX_ATTEMPTS} опита.`,
    lastErrors
  );
}
