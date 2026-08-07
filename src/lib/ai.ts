import { RuntimeEnv } from "./cloudflare";
import { ConflictEntry, Memory, categoryLabels, people } from "./types";

type DraftEntry = Pick<ConflictEntry, "owner" | "partner" | "hurt" | "angryBecause">;

export async function generateAiAnswer(env: RuntimeEnv, entry: DraftEntry, memories: Memory[]) {
  if (env.GEMINI_API_KEY) {
  const answer = await askGemini(env, entry, memories).catch((err) => {
    console.error("Gemini error:", err);
    return "";
  });

  if (answer.trim()) return answer.trim();
}

  return makeFallbackAnswer(entry, memories);
}

async function askGemini(env: RuntimeEnv, entry: DraftEntry, memories: Memory[]) {
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(entry, memories) }],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1300,
        },
      }),
    },
  );

  if (!response.ok) {
  console.error("Gemini status:", response.status);
  console.error(await response.text());
  return "";
}

const data = (await response.json()) as {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

console.log("Gemini response:", JSON.stringify(data, null, 2));

return data.candidates?.[0]?.content?.parts
  ?.map((part) => part.text ?? "")
  .join("\n") ?? "";
}

function buildPrompt(entry: DraftEntry, memories: Memory[]) {
  const owner = people[entry.owner].name;
  const partner = people[entry.partner].name;
  const memoryText = memories
    .map((memory) => `${people[memory.owner].name} / ${categoryLabels[memory.category]}: ${memory.text}`)
    .join("\n");

  return `Ти теплий україномовний AI-помічник для пари. Пиши українською з легким суржиком, м'яко, без моралізаторства.
Не ставай на сторону однієї людини. Допоможи ${owner} заспокоїтись, побачити сторону ${partner}, згадати любов і зробити маленький крок до примирення.
Не пиши сухий шаблон. Відповідь має бути персональна, жива, ніжна, але чесна.

Хто звернувся: ${owner}
Партнер: ${partner}
Чим образили: ${entry.hurt}
Чому злий/зла або сумний/сумна: ${entry.angryBecause}

Пам'ять про пару:
${memoryText || "Пам'яті ще мало. Не вигадуй фактів, просто відповідай обережно."}

Формат відповіді:
- коротко заспокой;
- поясни, чому це могло так боліти;
- обережно покажи, що може відчувати партнер;
- нагадай, як партнер може любити;
- дай 3-4 конкретні кроки, що сказати або зробити зараз.`;
}

function memoriesForOwner(memories: Memory[], owner: DraftEntry["owner"]) {
  return memories.filter((memory) => memory.owner === owner);
}

function selectMemory(memories: Memory[], category: Memory["category"]) {
  return memories
    .filter((memory) => memory.category === category)
    .slice(-3)
    .map((memory) => memory.text);
}

function sentenceList(items: string[], fallback: string) {
  if (!items.length) return fallback;
  return items.map((item) => `- ${item}`).join("\n");
}

function makeFallbackAnswer(entry: DraftEntry, memories: Memory[]) {
  const owner = people[entry.owner].name;
  const partner = people[entry.partner].name;
  const ownerMemories = memoriesForOwner(memories, entry.owner);
  const partnerMemories = memoriesForOwner(memories, entry.partner);

  const partnerLove = selectMemory(partnerMemories, "love");
  const partnerPain = selectMemory(partnerMemories, "pain");
  const ownerPain = selectMemory(ownerMemories, "pain");
  const support = selectMemory(ownerMemories, "support");
  const agreements = selectMemory([...ownerMemories, ...partnerMemories], "agreements");
  const good = selectMemory([...ownerMemories, ...partnerMemories], "good");

  return `${owner}, йди сюди, трошки видихнемо. Те, що тебе зачепило: "${entry.hurt}". І злість зараз не з нуля, бо для тебе важливо: "${entry.angryBecause}".

Я не буду ставати ні на чию сторону. Тут схоже, що тобі болить не тільки сама ситуація, а ще відчуття: "мене не почули / мною не дорожать / мене лишили самого з цим". Це дуже людське.

Що може бути з боку ${partner}:
${sentenceList(partnerPain, `${partner} може закриватись або мовчати не тому, що не любить, а тому що не знає як нормально сказати, коли всередині важко.`)}

Як ${partner} може проявляти любов:
${sentenceList(partnerLove, `${partner} може любити не ідеально словами, але через турботу, присутність і бажання не втратити вас.`)}

Що важливо пам'ятати про тебе:
${sentenceList(ownerPain, "тобі особливо боляче, коли тебе ігнорять, не відповідають або ніби не вибирають у моменті.")}

Слова, які тобі можуть зараз допомогти:
${sentenceList(support, "ти не поганий і не зайвий. Ти просто дуже хочеш тепла, ясності і щоб тебе вибрали не потім, а зараз.")}

Ваші теплі опори:
${sentenceList(good, "між вами є не тільки сварки. Є близькість, звичка тягнутись одне до одного і причина, чому ви досі стараєтесь.")}

Домовленості, які варто згадати:
${sentenceList(agreements, "поки домовленостей мало, краще зараз просити не ідеальної розмови, а маленького кроку: спокійно відповісти, обійнятись або сказати, що ви не вороги.")}

Що зробити зараз:
1. Не добивай розмову на піку злості.
2. Скажи коротко: "мені боляче, але я не хочу сваритись, я хочу щоб ми почули одне одного".
3. Попроси один конкретний жест: відповідь, обійми, 10 хвилин спокійної розмови.
4. Якщо ${partner} не готова/не готовий, дай паузу, але не перетворюй її на покарання.

Ти любиш. І тебе теж можуть любити, навіть якщо зараз все криво сказалось.`;
}
