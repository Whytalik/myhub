import "dotenv/config";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const TODAY = new Date().toISOString().split("T")[0];

const OPS_PROMPT = `You are Karasik, AI assistant for personal OS "Hub".
ALWAYS reply with valid JSON only. No extra text.

Format:
{"reply":"your text reply","actions":[{"domain":"operations"|"health","action":"action_name","payload":{},"reason":"why"}]}

Available actions: createTask, updateTask, createSprint, createObjective

createTask payload: {title, description?, priority:"LOW"|"MEDIUM"|"HIGH"|"URGENT", status:"BACKLOG"|"TODO"|"IN_PROGRESS"|"DONE", sphereId?, plannedDate:"YYYY-MM-DD", dueDate:"YYYY-MM-DDTHH:MM"}
createSprint payload: {number, year, startDate:"YYYY-MM-DD", endDate:"YYYY-MM-DD"}

Today's date: ${TODAY}. Use YYYY-MM-DD format for dates. "завтра" = tomorrow's date.

Examples:
"Додай задачу підготуватись до іспиту" → {"reply":"Додано задачу","actions":[{"domain":"operations","action":"createTask","payload":{"title":"Підготуватись до іспиту","priority":"HIGH","status":"TODO"},"reason":"Іспит потребує підготовки"}]}
"Створи на завтра таску на 20:00" → {"reply":"Створено","actions":[{"domain":"operations","action":"createTask","payload":{"title":"Задача","priority":"MEDIUM","status":"TODO","plannedDate":"${TODAY}","dueDate":"${TODAY}T20:00"},"reason":"Запит користувача"}]}
"Що робити?" → {"reply":"Перевір задачі в TODO.","actions":[]}`;

const HEALTH_PROMPT = `You are Karasik, AI assistant for personal OS "Hub".
ALWAYS reply with valid JSON only. No extra text.

Format:
{"reply":"your text reply","actions":[{"domain":"operations"|"health","action":"action_name","payload":{},"reason":"why"}]}

Available actions: createHabit, updateHabit, createDailyEntry

createHabit payload: {name, anchor, action, celebration?, reminderTime?}
createDailyEntry payload: {date:"YYYY-MM-DD", sleepHours?, energy?, mood?, weight?, nutrition?}

Examples:
"Додай звичку пити воду вранці" → {"reply":"Звичку додано","actions":[{"domain":"health","action":"createHabit","payload":{"name":"Пити воду вранці","anchor":"Після пробудження","action":"Випити склянку води"},"reason":"Гідратація покращує енергію"}]}
"Сон 7год, енергія 8" → {"reply":"Записано","actions":[{"domain":"health","action":"createDailyEntry","payload":{"date":"${TODAY}","sleepHours":7,"energy":8},"reason":"Дані від користувача"}]}`;

async function testAI(userMessage: string, domain: "operations" | "health" = "operations") {
  console.log(`\n🧪 [${domain}] "${userMessage}"`);
  console.log("─".repeat(50));

  const prompt = domain === "operations" ? OPS_PROMPT : HEALTH_PROMPT;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://myhub.local",
      "X-Title": "MyHub AI Test",
    },
    body: JSON.stringify({
      model: "google/gemma-3-4b-it:free",
      messages: [
        { role: "user", content: `${prompt}\n\n${userMessage}` },
      ],
      max_tokens: 300,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`❌ Error ${response.status}: ${error.slice(0, 200)}`);
    return;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const usage = data.usage;

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ Reply: ${parsed.reply}`);
      console.log(`📋 Actions: ${parsed.actions?.length || 0}`);
      if (parsed.actions?.length > 0) {
        parsed.actions.forEach((a: { domain: string; action: string; payload: Record<string, unknown>; reason: string }, i: number) => {
          console.log(`   ${i + 1}. ${a.domain}/${a.action}`);
          console.log(`      Payload: ${JSON.stringify(a.payload)}`);
          console.log(`      Reason: ${a.reason}`);
        });
      }
      console.log(`📊 Tokens: ${usage?.total_tokens || "N/A"}`);
    } else {
      console.log(`⚠️  No JSON: ${text.slice(0, 200)}`);
    }
  } catch {
    console.log(`❌ Parse error: ${text.slice(0, 200)}`);
  }
}

async function main() {
  console.log("🐟 Karasik AI Test Suite");
  console.log(`📅 Today: ${TODAY}`);
  console.log("=".repeat(50));

  await testAI('Створи на завтра таску "Помнєцкать лєгонько" на 20:00 важливсть High', "operations");
  await testAI("Додай звичку пити воду вранці", "health");
  await testAI("Що робити далі?", "operations");
  await testAI("Створи спринт на 2 тижні з понеділка", "operations");
  await testAI("Записати сьогодні: сон 7год, енергія 8, настрій 7", "health");

  console.log("\n" + "=".repeat(50));
  console.log("✅ Tests complete");
}

main().catch(console.error);
