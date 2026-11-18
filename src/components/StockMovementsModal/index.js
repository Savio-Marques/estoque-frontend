import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useStockMovements } from '../../hooks/useProducts';

const MOVEMENT_META = {
  ENTRADA: {
    label: 'Entrada',
    icon: ArrowUpRight,
    badgeClass: 'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)] border-[var(--ledger-accent)]/20',
    deltaClass: 'text-[var(--ledger-accent)]',
    dotClass: 'bg-[var(--ledger-accent)]',
  },
  CADASTRO: {
    label: 'Cadastro',
    icon: PlusCircle,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    deltaClass: 'text-sky-700',
    dotClass: 'bg-sky-600',
  },
  SAIDA: {
    label: 'Saída',
    icon: ArrowDownLeft,
    badgeClass: 'bg-[var(--ledger-amber-soft)] text-amber-800 border-amber-300/60',
    deltaClass: 'text-amber-700',
    dotClass: 'bg-[var(--ledger-amber)]',
  },
  EXCLUSAO: {
    label: 'Exclusão',
    icon: Trash2,
    badgeClass: 'bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)] border-red-200',
    deltaClass: 'text-[var(--ledger-danger)]',
    dotClass: 'bg-[var(--ledger-danger)]',
  },
};

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StockMovementsModal({ isOpen, onClose }) {
  const { data: movements = [], isLoading, isError } = useStockMovements({ enabled: isOpen });

  return (
    <Sheet
      open={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-[calc(100%+var(--bleed))] max-sm:rounded-none sm:w-[calc(100%-2rem+var(--bleed))] sm:max-w-[calc(540px+var(--bleed))] bg-[var(--ledger-surface)] border-l border-[var(--ledger-border)] text-[var(--ledger-ink)] [--sheet-close-top:1.25rem]"
      >
        <SheetHeader className="border-b border-[var(--ledger-border)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)]">
              <History className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-[1.05rem] font-bold tracking-tight text-[var(--ledger-ink)]">
                Livro de Movimentações
              </SheetTitle>
              <SheetDescription className="text-[0.8rem] text-[var(--ledger-ink-subtle)]">
                Registro cronológico de entradas, saídas e ajustes de estoque
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-[var(--ledger-ink-subtle)]">
              <Spinner className="size-5 text-[var(--ledger-accent)]" />
              <span>Carregando movimentações...</span>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] p-4 text-sm text-[var(--ledger-danger)]">
              Erro ao carregar o histórico de movimentações.
            </div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] py-14 text-center">
              <History className="size-7 text-[var(--ledger-ink-subtle)]" />
              <p className="text-sm font-medium text-[var(--ledger-ink-muted)]">
                Nenhuma movimentação registrada ainda.
              </p>
            </div>
          ) : (
            <div className="relative space-y-3 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-[var(--ledger-border-strong)]">
              {movements.map((mov) => {
                const meta = MOVEMENT_META[mov.movementType] || {
                  label: mov.movementType,
                  icon: History,
                  badgeClass: 'bg-[var(--ledger-surface-muted)] text-[var(--ledger-ink-muted)] border-[var(--ledger-border)]',
                  deltaClass: 'text-[var(--ledger-ink)]',
                  dotClass: 'bg-[var(--ledger-ink-subtle)]',
                };
                const Icon = meta.icon;
                const sign = mov.quantityDelta > 0 ? '+' : '';

                return (
                  <div key={mov.id} className="relative">
                    <span
                      className={`absolute top-4 -left-[21px] size-2.5 rounded-full ring-4 ring-[var(--ledger-surface)] ${meta.dotClass}`}
                    />
                    <div className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 p-3.5 transition-colors hover:bg-[var(--ledger-bg)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
                            >
                              <Icon className="size-3" />
                              {meta.label}
                            </span>
                            <span className="font-mono-tabular text-[0.72rem] text-[var(--ledger-ink-subtle)]">
                              {formatDateTime(mov.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 truncate text-[0.92rem] font-semibold text-[var(--ledger-ink)]">
                            {mov.productName}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className={`font-mono-tabular text-sm font-bold ${meta.deltaClass}`}>
                            {sign}
                            {mov.quantityDelta} un.
                          </div>
                          <div className="font-mono-tabular mt-0.5 text-[0.74rem] text-[var(--ledger-ink-subtle)]">
                            {mov.previousQuantity} &rarr;{' '}
                            <strong className="text-[var(--ledger-ink)]">{mov.newQuantity}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export default StockMovementsModal;
