"use server";

import { prisma } from "@/lib/prisma";
import webpush from "web-push";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:hanmaster05@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.trim(),
    process.env.VAPID_PRIVATE_KEY.trim()
  );
}

type PushSub = { endpoint: string; p256dh: string; auth: string };

async function sendPush(subscriptions: PushSub[], payload: { title: string; body: string; url: string }) {
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

/**
 * Основна функція для обробки нагадувань.
 * Має викликатися раз на хвилину або 5 хвилин через Cron.
 */
export async function processAutomatedNotificationsAction() {
  const now = new Date();
  const kyivTimeStr = now.toLocaleString("en-GB", {
    timeZone: "Europe/Kyiv",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const currentTimeStr = kyivTimeStr;

  const notificationsSent: string[] = [];

  const dueTasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      dueDate: { not: null, lte: now },
      completedAt: null
    },
    include: {
      user: { select: { id: true, pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } } } }
    }
  });

  for (const task of dueTasks) {
    if (!task.hasDueTime) continue;
    const diff = Math.abs(now.getTime() - task.dueDate!.getTime()) / 1000 / 60;
    if (diff < 5) {
      const priorityEmoji = { LOW: "🟢", MEDIUM: "🟡", HIGH: "🟠", URGENT: "🔴" }[task.priority] || "⚪";
      await sendPush(task.user.pushSubscriptions, {
        title: `${priorityEmoji} Task Deadline`,
        body: `⏰ ${task.title}${task.description ? "\n" + task.description.slice(0, 50) : ""}`,
        url: `/life/tasks`
      });
      notificationsSent.push(`Task (Deadline): ${task.title}`);
    }
  }

  const plannedTasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      plannedDate: { not: null, lte: now },
      completedAt: null
    },
    include: {
      user: { select: { id: true, pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } } } }
    }
  });

  for (const task of plannedTasks) {
    if (!task.hasPlannedTime) continue;
    const diff = Math.abs(now.getTime() - task.plannedDate!.getTime()) / 1000 / 60;
    if (diff < 5) {
      const priorityEmoji = { LOW: "🟢", MEDIUM: "🟡", HIGH: "🟠", URGENT: "🔴" }[task.priority] || "⚪";
      await sendPush(task.user.pushSubscriptions, {
        title: `${priorityEmoji} Time to Start`,
        body: `📋 ${task.title}${task.description ? "\n" + task.description.slice(0, 50) : ""}`,
        url: `/life/tasks`
      });
      notificationsSent.push(`Task (Planned): ${task.title}`);
    }
  }

  const timedHabits = await prisma.habit.findMany({
    where: {
      archived: false,
      reminderTime: currentTimeStr
    },
    include: {
      user: { select: { id: true, pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } } } }
    }
  });

  for (const habit of timedHabits) {
    await sendPush(habit.user.pushSubscriptions, {
      title: "⚡ Habit Time",
      body: `🎯 ${habit.action}\n🔗 After: ${habit.anchor}`,
      url: `/life/habits`
    });
    notificationsSent.push(`Habit (Timed): ${habit.name}`);
  }

  const autoReminderTimes = ["09:00", "14:00", "21:00"];
  if (autoReminderTimes.includes(currentTimeStr)) {
    const timeLabel = currentTimeStr === "09:00" ? "Morning" : currentTimeStr === "14:00" ? "Afternoon" : "Evening";
    const usersWithHabits = await prisma.user.findMany({
      where: {
        habits: { some: { archived: false, reminderTime: null } }
      },
      include: {
        habits: { where: { archived: false, reminderTime: null }, select: { id: true } },
        pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } }
      }
    });

    for (const user of usersWithHabits) {
      if (user.habits.length > 0) {
        await sendPush(user.pushSubscriptions, {
          title: `☀️ ${timeLabel} Habit Check`,
          body: `📊 ${user.habits.length} habit${user.habits.length > 1 ? "s" : ""} to focus on. Keep going!`,
          url: `/life/habits`
        });
        notificationsSent.push(`Habit (Auto) for ${user.id}`);
      }
    }
  }

  console.log(`[Cron] Server UTC: ${now.toISOString()}`);
  console.log(`[Cron] Kyiv time: ${currentTimeStr}`);
  console.log(`[Cron] Due tasks found: ${dueTasks.length}`);
  console.log(`[Cron] Planned tasks found: ${plannedTasks.length}`);
  console.log(`[Cron] Timed habits found: ${timedHabits.length}`);
  console.log(`[Cron] Auto habit check: ${autoReminderTimes.includes(currentTimeStr) ? 'YES' : 'NO'}`);

  return { success: true, sent: notificationsSent, debug: { utc: now.toISOString(), kyiv: currentTimeStr, dueTasks: dueTasks.length, plannedTasks: plannedTasks.length, matchedHabits: timedHabits.length } };
}
