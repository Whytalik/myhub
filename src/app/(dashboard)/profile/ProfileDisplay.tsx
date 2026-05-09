import { User, Mail, Calendar } from "lucide-react";

interface ProfileDisplayProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
  };
}

export function ProfileDisplay({ user }: ProfileDisplayProps) {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-note font-mono text-muted uppercase tracking-widest font-bold">
              User Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                <User size={16} />
              </div>
              <div className="w-full bg-raised border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-text">
                {user.name || "Not set"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-note font-mono text-muted uppercase tracking-widest font-bold">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                <Mail size={16} />
              </div>
              <div className="w-full bg-raised border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-text">
                {user.email || "Not set"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface/40 border border-border/40 rounded-2xl p-8 flex items-center gap-6">
          <div className="p-4 rounded-full bg-raised text-muted border border-border/30 shadow-inner">
             <Calendar size={24} />
          </div>
          <div>
             <p className="text-caption font-mono text-muted uppercase tracking-widest">Member since</p>
             <p className="text-sm font-bold mt-1">
               {user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
             </p>
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
           <h4 className="text-caption font-mono text-accent uppercase tracking-[0.3em] mb-2 font-bold">Privacy Matrix</h4>
           <p className="text-note text-secondary leading-relaxed">
             Your data is strictly isolated within the hub. Encryption keys are linked to your neural signature (password).
           </p>
        </div>
      </div>
    </div>
  );
}
