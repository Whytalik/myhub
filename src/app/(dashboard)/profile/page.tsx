import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile, getDomainStats } from "@/features/profile/services/profile-service";
import { ProfileDisplay } from "./ProfileDisplay";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, stats] = await Promise.all([
    getUserProfile(session.user.id),
    getDomainStats(session.user.id),
  ]);
  if (!user) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "identity",
        title: "Account Profile",
        description: "Your identity, security settings, and activity across all spaces.",
      }}
      intelligence={{
        items: [
          { label: "Auth", value: "NextAuth v5" },
          { label: "Status", value: user.systemStatus },
          { label: "Data", value: "PostgreSQL" },
        ],
      }}
    >
      <ProfileDisplay user={user} stats={stats} />
    </SpaceLanding>
  );
}
