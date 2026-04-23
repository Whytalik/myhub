import { NextResponse } from "next/server";
import { processAutomatedNotificationsAction } from "@/features/system/actions/notification-engine";

/**
 * Ендпоінт для запуску автоматизованих сповіщень.
 * Може бути захищений ключем API у хедері.
 */
export async function GET(request: Request) {
  // Перевірка секретного ключа (опціонально)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processAutomatedNotificationsAction();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
