import { useState } from "react";

/**
 * Bundles the `useState<T | null>` + isOpen/close wiring repeated across every
 * component pairing a delete (or other) confirmation with <ConfirmationDialog>.
 */
export function useConfirmDialog<T = string>() {
  const [target, setTarget] = useState<T | null>(null);

  return {
    target,
    isOpen: target !== null,
    open: setTarget,
    close: () => setTarget(null),
  };
}
