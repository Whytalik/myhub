"use client";

import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/actions/button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  bare?: boolean;
  noScroll?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth,
  bare,
  noScroll,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const contentStyle = { maxWidth: maxWidth ?? "420px" };
  const bodyClass = `px-6 pt-5 pb-6 ${noScroll ? "" : "overflow-y-auto max-h-[85dvh]"}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[8000] flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full" style={contentStyle}>
        <div className="glass-elevated overflow-hidden">
          <div className={bodyClass}>
            {!bare && (
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  {title && <h3 className="text-panel-title">{title}</h3>}
                  {description && <p className="text-caption">{description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={18} />
                </Button>
              </div>
            )}

            {children}
          </div>

          {footer && (
            <div className="bg-white/[0.02] border-t border-white/[0.06] p-4 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Confirmation required"
      maxWidth="400px"
    >
      <div className="flex flex-col gap-6">
        <p className="text-body">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
