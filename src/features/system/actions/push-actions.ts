"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import webpush from "web-push";

// Налаштування VAPID для web-push
webpush.setVapidDetails(
  "mailto:vitalii@hub.local",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return { success: false, error: "Invalid subscription data" };
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
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

  const results = await Promise.allSettled(
    subscriptions.map(sub => 
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        },
        payload
      )
    )
  );

  return { success: true, results };
}
