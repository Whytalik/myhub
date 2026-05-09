import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/features/profile/services/profile-service";
import { ProfileDisplay } from "./ProfileDisplay";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "identity",
        title: "Account Details",
        description: "Your identity across the hub. Manage your name, security settings, and personal data.",
      }}
      intelligence={{
        items: [
          { label: "Authentication", value: "NextAuth.js" },
          { label: "Data Storage", value: "PostgreSQL" },
          { label: "Privacy", value: "Fully Isolated" },
        ],
      }}
    >
      <ProfileDisplay user={user as { id: string; name: string | null; email: string | null; createdAt: Date }} />
    </SpaceLanding>
  );
}
