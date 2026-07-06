import { CheckCircle2, Link2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { PROFILES } from "../data";

const STATUS_LABEL: Record<string, string> = {
  linked: "FatSecret підключено",
  error: "Не вдалося підключити FatSecret",
};

export async function FatSecretLinkCard({
  banner,
}: {
  banner?: { status: string; profile: string };
}) {
  const accounts = await prisma.fatSecretAccount.findMany({
    select: { profileId: true },
  });
  const linkedProfileIds = new Set(accounts.map((a) => a.profileId));

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <span className="text-label">FatSecret</span>

      {banner && (
        <p
          className={`text-sm ${banner.status === "linked" ? "text-emerald-400" : "text-rose-400"}`}
        >
          {STATUS_LABEL[banner.status] ?? "Невідомий статус"}
          {banner.status === "linked" &&
            ` — ${PROFILES.find((p) => p.id === banner.profile)?.name ?? banner.profile}`}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {PROFILES.map((profile) => {
          const isLinked = linkedProfileIds.has(profile.id);
          return (
            <div key={profile.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-200">{profile.name}</span>
              {isLinked ? (
                <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                  <CheckCircle2 size={14} />
                  Підключено
                </span>
              ) : (
                <a
                  href={`/api/fatsecret/link?profile=${profile.id}`}
                  className="flex items-center gap-1.5 text-sm text-accent-nutrition hover:opacity-80 transition-opacity"
                >
                  <Link2 size={14} />
                  Підключити
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
