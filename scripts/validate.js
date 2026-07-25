// Валидация на изходите от Claude стъпките.
// Изнесена в отделен модул, за да се преизползва от сървъра и тестовете.

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Схема на скрипта за клип: { hook, analiz, poanta, hashtags }
// hook/analiz/poanta — непразни стрингове; hashtags — масив от 3 до 5 непразни стринга.
export function validateScript(data) {
  const errors = [];
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, errors: ["Резултатът не е JSON обект."] };
  }
  for (const field of ["hook", "analiz", "poanta"]) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`Полето "${field}" липсва или не е непразен стринг.`);
    }
  }
  if (!Array.isArray(data.hashtags)) {
    errors.push('Полето "hashtags" липсва или не е масив.');
  } else {
    if (data.hashtags.length < 3 || data.hashtags.length > 5) {
      errors.push(`"hashtags" трябва да са между 3 и 5, а са ${data.hashtags.length}.`);
    }
    if (!data.hashtags.every(isNonEmptyString)) {
      errors.push('Всеки елемент в "hashtags" трябва да е непразен стринг.');
    }
  }
  return { valid: errors.length === 0, errors };
}

// Схема на извлечените теми от ТВ емисия: масив от { title, fact }, от 1 до 8 елемента.
export function validateTopics(topics) {
  const errors = [];
  if (!Array.isArray(topics)) {
    return { valid: false, errors: ["Резултатът не е масив от теми."] };
  }
  if (topics.length < 1 || topics.length > 8) {
    errors.push(`Темите трябва да са между 1 и 8, а са ${topics.length}.`);
  }
  topics.forEach((topic, i) => {
    if (topic === null || typeof topic !== "object" || Array.isArray(topic)) {
      errors.push(`Тема #${i + 1} не е обект.`);
      return;
    }
    if (!isNonEmptyString(topic.title)) {
      errors.push(`Тема #${i + 1}: "title" липсва или не е непразен стринг.`);
    }
    if (!isNonEmptyString(topic.fact)) {
      errors.push(`Тема #${i + 1}: "fact" липсва или не е непразен стринг.`);
    }
  });
  return { valid: errors.length === 0, errors };
}
