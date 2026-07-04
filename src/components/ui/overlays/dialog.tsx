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

      onClick={(e) => e.stopPropagation()}
    >
      {}
      <div

        onClick={onClose}
      />

      {}
      <div

      >
        <div >
          <div >
            {!bare && (
              <div >
                <div >
                  {title && (
                    <h3 >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}

                >
                  <X size={18} />
                </button>
              </div>
            )}

            {children}
          </div>

          {footer && (
            <div >
              {footer}
            </div>
          )}
        </div>
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
      <div >
        <p >
          {description}
        </p>
        <div >
          <button
            onClick={onClose}

          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}

          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
