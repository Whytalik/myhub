import { useState, useCallback, useRef, useEffect } from "react";

export interface PositionCoords {
  top: number;
  left: number;
  align: 'top' | 'bottom';
}

interface UseDynamicPositioningOptions {
  contentHeight?: number;
  contentWidth?: number;
  offset?: number;
}

export function useDynamicPositioning<T extends HTMLElement = HTMLElement, C extends HTMLElement = HTMLElement>({ 
  contentHeight = 0, 
  contentWidth = 0, 
  offset = 8 
}: UseDynamicPositioningOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PositionCoords | null>(null);
  const triggerRef = useRef<T | null>(null);
  const contentRef = useRef<C | null>(null);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      // Measure actual content if available, fallback to options
      const h = contentRef.current?.offsetHeight ?? contentHeight;
      const w = contentRef.current?.offsetWidth ?? contentWidth;
      
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Determine vertical alignment: prefer bottom, flip to top if space below is insufficient 
      // AND space above is better.
      let align: 'top' | 'bottom' = 'bottom';
      
      if (spaceBelow < h + offset && spaceAbove > spaceBelow) {
        align = 'top';
      }

      let top = align === 'bottom' ? rect.bottom + offset : rect.top - offset;
      
      // Determine horizontal position (ensure it doesn't overflow window)
      let left = rect.left;
      if (left + w > windowWidth) {
        left = Math.max(8, windowWidth - w - 16);
      }

      setCoords({ top, left, align });
    }
  }, [contentHeight, contentWidth, offset]);

  // Re-calculate when content height changes (e.g. after portal render)
  useEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen, updateCoords]);

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
    contentRef,
    toggle,
    open,
    close,
    updateCoords,
    setIsOpen
  };
}
