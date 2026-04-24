"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import webpush from "web-push";

// Налаштування VAPID для web-push
webpush.setVapidDetails(
  "mailto:hanmaster05@gmail.com",
  (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim(),
  (process.env.VAPID_PRIVATE_KEY || "").trim()
);

import { headers } from "next/headers";

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "Unknown Device";

  try {
    const { endpoint, keys } = subscription;
    
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save subscription:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getPushSubscriptionCountAction() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };
  
  const count = await prisma.pushSubscription.count({
    where: { userId: session.user.id }
  });
  
  return { count };
}

export async function sendTestNotificationAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: session.user.id }
  });

  if (subscriptions.length === 0) {
    return { success: false, error: "No active subscriptions found for this device/user." };
  }

  const payload = JSON.stringify({
    title: "Hub Notification",
    body: "This is a test notification from your Personal OS! It works! 🎉",
    url: "/home"
  });

  const results = await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );
        return { success: true, device: sub.userAgent || "Unknown" };
      } catch (error) {
        const err = error as { statusCode?: number; body?: string; message: string };
        console.error(`[Push Error] Device: ${sub.userAgent}`, err);
        return { 
          success: false, 
          device: sub.userAgent || "Unknown", 
          statusCode: err.statusCode,
          message: err.body || err.message 
        };
      }
    })
  );

  const allSuccessful = results.every(r => r.success);
  return { success: allSuccessful, results };
}
