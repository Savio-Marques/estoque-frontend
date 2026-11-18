import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';

function Modal({ isOpen, onClose, title, description, size = 'default', children }) {
  return (
    <Dialog
      open={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent
        size={size}
        className="bg-[var(--ledger-surface)] border border-[var(--ledger-border)] text-[var(--ledger-ink)] shadow-2xl [--sheet-close-top:1.5rem] sm:[--sheet-close-top:1.15rem] sm:[--sheet-close-end:1.15rem]"
      >
        {title && (
          <DialogHeader className="border-b border-[var(--ledger-border)] pb-4 max-sm:pt-8">
            <DialogTitle className="text-[1.05rem] font-bold tracking-tight text-[var(--ledger-ink)]">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-[0.84rem] text-[var(--ledger-ink-subtle)]">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <DialogBody className={title ? 'pt-4' : 'pt-6'}>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
