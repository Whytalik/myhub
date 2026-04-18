import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="flex-1 bg-bg flex items-center px-14 min-h-screen">
      <div>
        <p className="text-[11px] font-mono text-muted uppercase tracking-[0.2em] mb-4">
          welcome back, {session.user?.name}
        </p>
        <h1 className="font-heading text-9xl text-accent leading-none tracking-tight">
          My Hub
        </h1>
        <div className="mt-5 h-0.5 w-16 bg-accent" />
      </div>
    </main>
  );
}
