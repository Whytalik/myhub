import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Loader2 size={24} className="text-accent animate-spin" />
    </div>
  );
}
