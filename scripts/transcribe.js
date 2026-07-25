// Транскрипция на аудио (линк към файл) през Deepgram, език български.
// Не сваляме видео — работим само с подадено аудио URL (виж 04-novinarski-blokove.md).
import { createClient } from "@deepgram/sdk";

let deepgram;
function getDeepgram() {
  if (!deepgram) {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error(
        "Липсва DEEPGRAM_API_KEY. Копирай .env.example като .env и попълни ключа си."
      );
    }
    deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  }
  return deepgram;
}

export async function transcribeUrl({ audioUrl }) {
  const { result, error } = await getDeepgram().listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    { model: "nova-2", language: "bg", smart_format: true, punctuate: true }
  );
  if (error) {
    throw new Error(`Deepgram грешка: ${error.message ?? String(error)}`);
  }
  const transcript =
    result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  if (!transcript.trim()) {
    throw new Error("Deepgram върна празен транскрипт — провери аудио URL-а.");
  }
  return transcript;
}
