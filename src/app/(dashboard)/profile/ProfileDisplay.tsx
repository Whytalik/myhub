import { User, Mail, Calendar, Shield, Key, Clock, Activity, Heart, Brain, Wallet, Target, Bell } from "lucide-react";
import type { getDomainStats } from "@/features/profile/services/profile-service";
import type { Prisma } from "@/app/generated/prisma";

type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true; name: true; email: true; emailVerified: true;
    systemStatus: true; privateTaskPasswordHash: true;
    createdAt: true; updatedAt: true;
  };
}>;

interface ProfileDisplayProps {
  user: UserProfile;
  stats: Awaited<ReturnType<typeof getDomainStats>>;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0`} style={{ backgroundColor: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted">{label}</span>
        <span className="text-base font-bold text-text">{value}</span>
      </div>
    </div>
  );
}

function DomainSection({ title, icon: Icon, color, children }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3" style={{ backgroundColor: `${color}08` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 className="text-base font-bold text-text">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

export function ProfileDisplay({ user, stats }: ProfileDisplayProps) {
  const statusColors: Record<string, string> = {
    STABLE: "#10b981",
    CRISIS_SURVIVAL: "#ef4444",
    CRISIS_STABILIZATION: "#f59e0b",
    CRISIS_RE_ENTRY: "#6366f1",
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Identity + Security Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-note font-mono text-muted uppercase tracking-widest font-bold flex items-center gap-2">
            <User size={14} /> Identity
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Display Name</label>
              <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text">
                {user.name || "Not set"}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Email</label>
              <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text flex items-center gap-2">
                <Mail size={14} className="text-muted shrink-0" />
                <span className="truncate">{user.email || "Not set"}</span>
              </div>
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">System Status</label>
              <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base font-bold" style={{ color: statusColors[user.systemStatus] || "#a3a3a3" }}>
                {user.systemStatus.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-note font-mono text-muted uppercase tracking-widest font-bold flex items-center gap-2">
            <Shield size={14} /> Security
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Password</label>
              <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text flex items-center gap-2">
                <Key size={14} className="text-muted shrink-0" />
                <span>{user.privateTaskPasswordHash ? "Set" : "Not configured"}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Email Verified</label>
              <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text">
                {user.emailVerified ? user.emailVerified.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No"}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Member Since</label>
                <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text flex items-center gap-2">
                  <Calendar size={14} className="text-muted shrink-0" />
                  <span>{user.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Last Updated</label>
                <div className="mt-1 bg-raised border border-border rounded-xl px-4 py-2.5 text-base text-text flex items-center gap-2">
                  <Clock size={14} className="text-muted shrink-0" />
                  <span>{user.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Stats */}
      <div className="flex flex-col gap-5">
        <h3 className="text-note font-mono text-muted uppercase tracking-widest font-bold pl-1">Domain Activity</h3>

        <DomainSection title="Operations" icon={Activity} color="#6366f1">
          <StatCard icon={Target} label="Tasks" value={stats.operations.tasks} color="#6366f1" />
          <StatCard icon={Activity} label="Habits" value={stats.operations.habits} color="#6366f1" />
          <StatCard icon={User} label="Spheres" value={stats.operations.spheres} color="#6366f1" />
          <StatCard icon={Target} label="Milestones" value={stats.operations.milestones} color="#6366f1" />
        </DomainSection>

        <DomainSection title="Health" icon={Heart} color="#10b981">
          <StatCard icon={User} label="Profiles" value={stats.health.nutritionPersons} color="#10b981" />
          <StatCard icon={Activity} label="Products" value={stats.health.products} color="#10b981" />
          <StatCard icon={Heart} label="Dishes" value={stats.health.dishes} color="#10b981" />
          <StatCard icon={Calendar} label="Week Plans" value={stats.health.weekPlans} color="#10b981" />
        </DomainSection>

        <DomainSection title="Mind" icon={Brain} color="#8b5cf6">
          <StatCard icon={Brain} label="Languages" value={stats.mind.languages} color="#8b5cf6" />
          <StatCard icon={Activity} label="Vocabulary" value={stats.mind.vocabulary} color="#8b5cf6" />
          <StatCard icon={Target} label="Library" value={stats.mind.library} color="#8b5cf6" />
        </DomainSection>

        <DomainSection title="Wealth" icon={Wallet} color="#f59e0b">
          <StatCard icon={Wallet} label="Wishlist" value={stats.wealth.wishlist} color="#f59e0b" />
        </DomainSection>

        <DomainSection title="Planning" icon={Target} color="#ec4899">
          <StatCard icon={Target} label="Visions" value={stats.planning.visions} color="#ec4899" />
          <StatCard icon={Calendar} label="Sprints" value={stats.planning.sprints} color="#ec4899" />
        </DomainSection>

        <DomainSection title="System" icon={Bell} color="#64748b">
          <StatCard icon={Calendar} label="Journal Entries" value={stats.system.dailyEntries} color="#64748b" />
          <StatCard icon={Bell} label="Push Devices" value={stats.system.pushSubscriptions} color="#64748b" />
        </DomainSection>
      </div>
    </div>
  );
}
