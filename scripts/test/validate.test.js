// Тестове на валидацията (scripts/validate.js) — не изискват API ключове.
import test from "node:test";
import assert from "node:assert/strict";
import { validateScript, validateTopics } from "../validate.js";

const validScript = {
  hook: "Закачка.",
  analiz: "Три до пет изречения анализ.",
  poanta: "Остра поанта.",
  hashtags: ["#едно", "#две", "#три"],
};

test("validateScript приема валиден скрипт", () => {
  assert.equal(validateScript(validScript).valid, true);
});

test("validateScript отхвърля празен hook", () => {
  const result = validateScript({ ...validScript, hook: "  " });
  assert.equal(result.valid, false);
});

test("validateScript отхвърля липсващо поле", () => {
  const { poanta, ...withoutPoanta } = validScript;
  assert.equal(validateScript(withoutPoanta).valid, false);
});

test("validateScript отхвърля под 3 хаштага", () => {
  const result = validateScript({ ...validScript, hashtags: ["#само", "#два"] });
  assert.equal(result.valid, false);
});

test("validateScript отхвърля над 5 хаштага", () => {
  const result = validateScript({
    ...validScript,
    hashtags: ["#1", "#2", "#3", "#4", "#5", "#6"],
  });
  assert.equal(result.valid, false);
});

test("validateScript отхвърля не-обект", () => {
  assert.equal(validateScript("текст").valid, false);
  assert.equal(validateScript(null).valid, false);
  assert.equal(validateScript([validScript]).valid, false);
});

test("validateTopics приема валидни теми", () => {
  const topics = [{ title: "Заглавие", fact: "Факт." }];
  assert.equal(validateTopics(topics).valid, true);
});

test("validateTopics отхвърля празен масив и над 8 теми", () => {
  assert.equal(validateTopics([]).valid, false);
  const nine = Array.from({ length: 9 }, () => ({ title: "т", fact: "ф" }));
  assert.equal(validateTopics(nine).valid, false);
});

test("validateTopics отхвърля тема без fact", () => {
  assert.equal(validateTopics([{ title: "Заглавие" }]).valid, false);
});
