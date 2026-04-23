import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/features/profile/services/profile-service";
import { ProfileForm } from "./ProfileForm";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "identity", href: "/profile" }]} />
      <ProfileForm initialUser={user as { id: string; name: string | null; email: string | null; createdAt: Date }} />
    </div>
  );
}
