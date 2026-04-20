import { useState, useCallback, useRef, useEffect } from "react";

export interface PositionCoords {
  top: number;
  left: number;
  align: 'top' | 'bottom';
}

interface UseDynamicPositioningOptions {
  contentHeight: number;
  contentWidth: number;
  offset?: number;
}

export function useDynamicPositioning<T extends HTMLElement = HTMLElement>({ contentHeight, contentWidth, offset = 8 }: UseDynamicPositioningOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PositionCoords | null>(null);
  const triggerRef = useRef<T | null>(null);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      const spaceBelow = windowHeight - rect.bottom;
      
      // Determine vertical alignment
      let align: 'top' | 'bottom' = 'bottom';
      let top = rect.bottom + offset;

      if (spaceBelow < contentHeight && rect.top > contentHeight) {
        align = 'top';
        top = rect.top - offset;
      }

      // Determine horizontal position (ensure it doesn't overflow window)
      let left = rect.left;
      if (left + contentWidth > windowWidth) {
        left = Math.max(8, windowWidth - contentWidth - 16);
      }

      setCoords({ top, left, align });
    }
  }, [contentHeight, contentWidth, offset]);

  const toggle = useCallback(() => {
    if (!isOpen) updateCoords();
    setIsOpen(prev => !prev);
  }, [isOpen, updateCoords]);

  const open = useCallback(() => {
    updateCoords();
    setIsOpen(true);
  }, [updateCoords]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, updateCoords]);

  return {
    isOpen,
    coords,
    triggerRef,
    toggle,
    open,
    close,
    updateCoords,
    setIsOpen
  };
}
