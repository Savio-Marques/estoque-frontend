import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import './style.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, children, confirmButtonClass }) {
  const isPositive = confirmButtonClass === 'confirm-button-paid';

  return (
    <AlertDialog
      open={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <AlertDialogContent
        size="sm"
        className="bg-[var(--ledger-surface)] border border-[var(--ledger-border)] text-[var(--ledger-ink)] shadow-2xl"
      >
        <AlertDialogHeader>
          <AlertDialogMedia
            variant={isPositive ? 'default' : 'destructive'}
            className={
              isPositive
                ? 'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)]'
                : 'bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)]'
            }
          >
            {isPositive ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-[1rem] font-bold text-[var(--ledger-ink)]">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[0.875rem] leading-relaxed text-[var(--ledger-ink-muted)]">
            {children}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t border-[var(--ledger-border)] bg-[var(--ledger-bg)]/60">
          <AlertDialogCancel className="border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-surface-muted)]">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant={isPositive ? 'default' : 'destructive'}
            className={
              isPositive
                ? 'bg-[var(--ledger-accent)] text-white hover:bg-[var(--ledger-accent-hover)]'
                : 'bg-[var(--ledger-danger)] text-white hover:bg-red-700'
            }
            onClick={() => {
              if (onConfirm) {
                return onConfirm();
              }
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationModal;
