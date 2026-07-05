import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/actions/button";

async function AuthGate() {
  const session = await auth();
  if (session?.user) redirect("/life");

  return (
    <Link href="/login" className="w-full">
      <Button className="w-full shadow-md">Увійти</Button>
    </Link>
  );
}

export default function RootPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 opacity-30 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/5 opacity-20 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-[380px] px-4 flex flex-col items-center gap-8 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
            <Sparkles size={16} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-zinc-50 tracking-tight">
            My<span className="text-accent">Hub</span>
          </h1>
        </div>

        <p className="text-sm text-zinc-400">Особистий простір для життя, звичок і харчування.</p>

        <Suspense fallback={<div className="h-10 w-full" />}>
          <AuthGate />
        </Suspense>
      </div>
    </div>
  );
}
