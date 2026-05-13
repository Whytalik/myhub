"use client";

import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

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

  return createPortal(
    <div
      className="fixed inset-0 z-[8000] flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop — glassmorphism */}
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`relative w-full bg-elevated border border-border/50 rounded-xl shadow-elevated animate-in slide-in-from-bottom-4 sm:zoom-in-95 fade-in duration-300 ${bare ? "" : "overflow-hidden"}`}
        style={{ maxWidth: maxWidth ?? "380px" }}
      >
        <div className={`${bare ? "" : "px-6 pt-5 pb-6"} ${noScroll ? "" : bare ? "overflow-y-auto" : "overflow-y-auto max-h-[90dvh]"}`}>
          {!bare && (
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-0.5">
                {title && (
                  <h3 className="text-heading font-bold text-text-primary leading-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-caption text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text-primary transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {children}
        </div>

        {footer && (
          <div className="bg-surface-hover border-t border-border p-4 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
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
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Confirmation required"
      maxWidth="400px"
    >
      <div className="flex flex-col gap-6">
        <p className="text-body text-text-secondary leading-relaxed">
          {description}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-note font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-lg text-note font-bold transition-all active:scale-95 ${
              variant === "danger"
                ? "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20"
                : "bg-accent text-bg hover:bg-accent-hover shadow-sm"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
