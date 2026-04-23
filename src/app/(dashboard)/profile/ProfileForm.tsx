"use client";

import { useActionState, useEffect, useMemo } from "react";
import { updateProfileAction } from "@/features/profile/actions/profile-actions";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Mail, Calendar } from "lucide-react";

interface ProfileFormProps {
  initialUser: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [error, action, isPending] = useActionState(updateProfileAction, null);

  useEffect(() => {
    if (!error) return;
    if (error?.success) {
      toast.success("Profile updated successfully");
    } else if (error?.error) {
      toast.error(error.error);
    }
  }, [error]);

  const showSuccess = useMemo(() => {
    return !!error?.success && !isPending;
  }, [error, isPending]);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-start">
        <div>
          <Heading title="Account Details" />
          <p className="text-secondary text-sm mt-1">Manage your identity across the hub.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-8">
          <form action={action} className="bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-muted uppercase tracking-widest font-bold">
                User Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  name="name"
                  defaultValue={initialUser.name || ""}
                  placeholder="Your Name"
                  className="w-full bg-raised border border-border rounded-xl pl-11 pr-4 py-3 text-[14px] text-text placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 opacity-60 grayscale cursor-not-allowed">
              <label className="text-[11px] font-mono text-muted uppercase tracking-widest font-bold">
                Email Address (ReadOnly)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  disabled
                  value={initialUser.email || ""}
                  className="w-full bg-raised/30 border border-border/50 rounded-xl pl-11 pr-4 py-3 text-[14px] text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end items-center gap-4">
               {showSuccess && (
                 <p className="text-[11px] font-mono text-accent animate-in fade-in zoom-in duration-300">Changes Saved Successfully</p>
               )}
               <Button type="submit" disabled={isPending} className="px-8 min-w-[140px]">
                 {isPending ? "Syncing..." : "Update Details"}
               </Button>
            </div>
          </form>

          <div className="bg-surface/40 border border-border/40 rounded-2xl p-8 flex items-center gap-6">
            <div className="p-4 rounded-full bg-raised text-muted border border-border/30 shadow-inner">
               <Calendar size={24} />
            </div>
            <div>
               <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Neural Link Established</p>
               <p className="text-sm font-bold mt-1">
                 Member since {initialUser.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
              <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] mb-2 font-bold">Privacy Matrix</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                Your data is strictly isolated within the hub. Encryption keys are linked to your neural signature (password).
              </p>
           </div>
        </div>      </div>
    </div>
  );
}
