import { useTransition } from "react";
import { toast } from "sonner";

interface ActionResultLike<T> {
  success: boolean;
  error?: string;
  data?: T;
}

interface RunOptions<T> {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Wraps the repeated startTransition -> await action -> toast pattern used
 * across client components that call server actions returning {success, error, data?}.
 */
export function useServerAction() {
  const [isPending, startTransition] = useTransition();

  function run<T = void>(action: Promise<ActionResultLike<T>>, options: RunOptions<T> = {}) {
    startTransition(async () => {
      const result = await action;
      if (result.success) {
        if (options.successMessage) toast.success(options.successMessage);
        options.onSuccess?.(result.data as T);
      } else {
        const message = result.error || options.errorMessage || "Something went wrong";
        toast.error(message);
        options.onError?.(message);
      }
    });
  }

  return { run, isPending };
}
