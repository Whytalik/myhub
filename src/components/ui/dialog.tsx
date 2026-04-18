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
  bare?: boolean; // skip the left-border content wrapper
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div
        className="relative w-full bg-surface border border-border rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 fade-in duration-300 overflow-hidden"
        style={{ maxWidth: maxWidth ?? "380px" }}
      >
        <div className="px-6 pt-6 pb-6 overflow-y-auto max-h-[84vh]">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-0.5">
              {title && (
                <h3 className="text-lg font-black text-text tracking-tight leading-none">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-[10px] font-mono text-muted tracking-wider">
                  {description}
                </p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-raised rounded text-muted hover:text-text transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
          
          {bare ? children : (
            <div className="text-secondary leading-normal py-0.5">
              {children}
            </div>
          )}
        </div>

        {footer && (
          <div className="bg-raised/30 border-t border-border/50 p-4 flex justify-end gap-2">
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
        <p className="text-[13px] text-secondary leading-relaxed">
          {description}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-mono tracking-wider text-muted hover:text-text transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-xl text-[11px] font-mono tracking-wider font-bold transition-all active:scale-95 ${
              variant === "danger"
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                : "bg-accent text-bg hover:bg-accent/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
