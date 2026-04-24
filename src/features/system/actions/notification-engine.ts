"use server";

import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Налаштування VAPID для web-push
webpush.setVapidDetails(
  "mailto:hanmaster05@gmail.com",
  (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim(),
  (process.env.VAPID_PRIVATE_KEY || "").trim()
);

/**
 * Основна функція для обробки нагадувань.
 * Має викликатися раз на хвилину або 5 хвилин через Cron.
 */
export async function processAutomatedNotificationsAction() {
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  
  const notificationsSent: string[] = [];

  // 1. Обробка Tasks (дедлайни)
  // Шукаємо таски, де дедлайн збігається з поточним часом (ігноруючи секунди)
  const dueTasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      dueDate: {
        not: null,
        lte: now // Вже настав або минув
      },
      completedAt: null
    },
    include: {
      user: {
        include: { pushSubscriptions: true }
      }
    }
  });

  for (const task of dueTasks) {
    // Тут можна додати логіку, щоб не спамити (наприклад, зберігати completedNotificationId)
    // Для простоти поки що просто шлемо, якщо дедлайн саме зараз +- 5 хв
    const diff = Math.abs(now.getTime() - task.dueDate!.getTime()) / 1000 / 60;
    if (diff < 10) {
       await sendPushToUser(task.user.id, {
         title: "Task Reminder",
         body: `Deadline for: ${task.title}`,
         url: `/life/tasks`
       });
       notificationsSent.push(`Task: ${task.title}`);
    }
  }

  // 2. Обробка Habits (специфічний час)
  const timedHabits = await prisma.habit.findMany({
    where: {
      archived: false,
      reminderTime: currentTimeStr
    },
    include: {
      user: {
        include: { pushSubscriptions: true }
      }
    }
  });

  for (const habit of timedHabits) {
    await sendPushToUser(habit.userId, {
      title: "Habit Time!",
      body: `It's time for: ${habit.action}. Remember: After I ${habit.anchor}...`,
      url: `/life/habits`
    });
    notificationsSent.push(`Habit (Timed): ${habit.name}`);
  }

  // 3. Автоматичні Habits (3 рази на день: 09:00, 14:00, 21:00)
  const autoReminderTimes = ["09:00", "14:00", "21:00"];
  if (autoReminderTimes.includes(currentTimeStr)) {
    const usersWithHabits = await prisma.user.findMany({
      where: {
        habits: { some: { archived: false, reminderTime: null } }
      },
      include: {
        habits: { where: { archived: false, reminderTime: null } }
      }
    });

    for (const user of usersWithHabits) {
      if (user.habits.length > 0) {
        await sendPushToUser(user.id, {
          title: "Daily Habit Check",
          body: `You have ${user.habits.length} habits to focus on today. Check your progress!`,
          url: `/life/habits`
        });
        notificationsSent.push(`Habit (Auto) for ${user.email}`);
      }
    }
  }

  console.log(`[Cron] Running at ${currentTimeStr}`);
  console.log(`[Cron] Due tasks found: ${dueTasks.length}`);
  console.log(`[Cron] Timed habits found: ${timedHabits.length}`);
  console.log(`[Cron] Auto habit check: ${autoReminderTimes.includes(currentTimeStr) ? 'YES' : 'NO'}`);
  
  return { success: true, sent: notificationsSent, debug: { time: currentTimeStr, tasks: dueTasks.length, habits: timedHabits.length } };
}

async function sendPushToUser(userId: string, payload: { title: string, body: string, url: string }) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  });

  if (subscriptions.length === 0) return;

  const pushPayload = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(sub => 
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        pushPayload
      )
    )
  );
}
