# Помощни скриптове за novinarski-kanal

Малък Node.js сървър с три endpoint-а, които Make.com вика през webhook.
Node 20+ е нужен (провери с `node --version`).

## Инсталация (веднъж)

```bash
# от главната папка на repo-то:
npm install
```

## Ключове (веднъж)

1. Копирай `.env.example` като `.env`:
   ```bash
   cp .env.example .env
   ```
2. Отвори `.env` и попълни:
   - `ANTHROPIC_API_KEY` — от https://platform.claude.com/ → API Keys → Create Key
   - `DEEPGRAM_API_KEY` — от https://console.deepgram.com/ → API Keys
   - `PORT` — може да остане празно (тогава е 3000)

`.env` е личен файл с тайни — той НЕ се качва в GitHub (погрижили сме се в `.gitignore`).

## Пускане локално

```bash
npm start
```

Сървърът тръгва на `http://localhost:3000`. Спираш го с `Ctrl+C`.

## Какво прави всеки endpoint

| Endpoint | Вход (JSON) | Изход (JSON) |
|---|---|---|
| `POST /generate` | `{ "title": "...", "fact": "..." }` | `{ hook, analiz, poanta, hashtags }` — скриптът за клипа |
| `POST /transcribe` | `{ "audioUrl": "https://..." }` | `{ transcript }` — чист текст от аудиото (Deepgram, български) |
| `POST /extract-topics` | `{ "transcript": "..." }` | `{ topics: [{ title, fact }, ...] }` — до 8 неутрални теми |

- `/generate` чете персонажа от `ai-analizator-persona.md` при всяко викане — ако редактираш персонажа там, промяната важи веднага, без да пипаш код.
- Ако Claude върне невалиден JSON, скриптът сам опитва до 3 пъти. Ако и след това е невалидно — връща грешка 422 с обяснение (Make може да я хване и да прати известие).

## Бърз тест с curl

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"Асфалтът в Пловдив достигна 67°C при екстремна жега","fact":"Измерена температура на асфалта 67 градуса по време на гореща вълна."}'
```

## Автоматични тестове

```bash
npm test
```

- Тестовете на валидацията минават винаги (без ключове).
- Живият тест на генератора (3-те примера от `03-prototip-primeri.md`) изисква
  `ANTHROPIC_API_KEY` в `.env` — без ключ се пропуска с ясно съобщение.

## Как Make вика сървъра

Make.com не вижда твоя компютър (`localhost`). Варианти:

1. **За тест:** пусни `npm start` и в друг терминал `npx ngrok http 3000` (или `cloudflared tunnel --url http://localhost:3000`) — получаваш публичен адрес, който слагаш в Make HTTP модула.
2. **За постоянно:** качи скриптовете на безплатен/евтин хостинг (Render, Railway, Fly.io) — кажи в Cowork и ще получиш готов prompt за деплой.

Подробно как се връзва всичко в Make: виж `scripts/make-integration.md`.
