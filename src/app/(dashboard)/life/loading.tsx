import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full py-32">
      <Loader2 size={24} className="text-accent animate-spin" />
    </div>
  );
}
