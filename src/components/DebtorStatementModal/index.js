import React from 'react';
import {
  ArrowUpRight,
  CheckCheck,
  Coins,
  History,
  PlusCircle,
  SlidersHorizontal,
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
import { useDebtorTransactions } from '../../hooks/useDebtors';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatSignedCurrency = (value) => {
  const num = Number(value || 0);
  const absFormatted = Math.abs(num).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  if (num > 0) return `+${absFormatted}`;
  if (num < 0) return `-${absFormatted}`;
  return absFormatted;
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

const TRANSACTION_META = {
  LANCAMENTO: {
    label: 'Lançamento',
    defaultNote: 'Abertura de saldo na caderneta',
    icon: PlusCircle,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    amountClass: 'text-[var(--ledger-ink)]',
    dotClass: 'bg-sky-600',
  },
  ACRESCIMO: {
    label: 'Nova Compra',
    defaultNote: 'Valor somado ao saldo em aberto',
    icon: ArrowUpRight,
    badgeClass: 'bg-[var(--ledger-amber-soft)] text-amber-900 border-amber-300/70',
    amountClass: 'text-amber-800',
    dotClass: 'bg-[var(--ledger-amber)]',
  },
  ABATIMENTO: {
    label: 'Abatimento',
    defaultNote: 'Pagamento parcial registrado',
    icon: Coins,
    badgeClass:
      'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)] border-[var(--ledger-accent)]/20',
    amountClass: 'text-[var(--ledger-accent)]',
    dotClass: 'bg-[var(--ledger-accent)]',
  },
  QUITACAO: {
    label: 'Quitação',
    defaultNote: 'Liquidação integral do saldo',
    icon: CheckCheck,
    badgeClass:
      'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)] border-[var(--ledger-accent)]/30',
    amountClass: 'text-[var(--ledger-accent)]',
    dotClass: 'bg-[var(--ledger-accent)]',
  },
  AJUSTE: {
    label: 'Ajuste',
    defaultNote: 'Alteração manual de saldo',
    icon: SlidersHorizontal,
    badgeClass:
      'bg-[var(--ledger-surface-muted)] text-[var(--ledger-ink-muted)] border-[var(--ledger-border-strong)]',
    amountClass: 'text-[var(--ledger-ink-muted)]',
    dotClass: 'bg-[var(--ledger-ink-subtle)]',
  },
};

function DebtorStatementModal({ isOpen, debtor = null, onClose }) {
  const debtorId = debtor?.id ?? null;
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useDebtorTransactions({
    debtorId,
    enabled: Boolean(isOpen),
  });

  const isClientSpecific = Boolean(debtor);

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
          <div className="flex items-center gap-2.5 pr-6">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)]">
              <History className="size-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate text-[1.05rem] font-bold tracking-tight text-[var(--ledger-ink)]">
                {isClientSpecific ? `Extrato · ${debtor.name}` : 'Extrato da Caderneta'}
              </SheetTitle>
              <SheetDescription className="text-[0.8rem] text-[var(--ledger-ink-subtle)]">
                {isClientSpecific
                  ? 'Histórico cronológico de compras, abatimentos e quitações'
                  : 'Últimas movimentações registradas entre todos os clientes'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-4 py-4">
          {isClientSpecific && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] p-3.5">
              <div>
                <span className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                  Situação Atual
                </span>
                {debtor.paid ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--ledger-accent)]/25 bg-[var(--ledger-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--ledger-accent)]">
                      <CheckCheck className="size-3.5" />
                      Conta Quitada
                    </span>
                    {debtor.settledAt && (
                      <span className="font-mono-tabular text-xs text-[var(--ledger-ink-subtle)]">
                        em {formatDateTime(debtor.settledAt)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="mt-0.5 block text-xs font-medium text-[var(--ledger-ink-muted)]">
                    Conta ativa com saldo pendente
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                  Saldo Devido
                </span>
                <strong
                  className={`font-mono-tabular mt-0.5 block text-base font-extrabold ${
                    debtor.paid ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-ink)]'
                  }`}
                >
                  {formatCurrency(debtor.value)}
                </strong>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-[var(--ledger-ink-subtle)]">
              <Spinner className="size-5 text-[var(--ledger-accent)]" />
              <span>Carregando extrato...</span>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] p-4 text-sm text-[var(--ledger-danger)]">
              Erro ao carregar o extrato de movimentações da caderneta.
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] py-14 text-center">
              <History className="size-7 text-[var(--ledger-ink-subtle)]" />
              <p className="text-sm font-medium text-[var(--ledger-ink-muted)]">
                Nenhuma movimentação registrada ainda.
              </p>
            </div>
          ) : (
            <div className="relative space-y-3 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-[var(--ledger-border-strong)]">
              {transactions.map((tx) => {
                const meta = TRANSACTION_META[tx.transactionType] || {
                  label: tx.transactionType,
                  defaultNote: 'Movimentação registrada',
                  icon: History,
                  badgeClass:
                    'bg-[var(--ledger-surface-muted)] text-[var(--ledger-ink-muted)] border-[var(--ledger-border)]',
                  amountClass: 'text-[var(--ledger-ink)]',
                  dotClass: 'bg-[var(--ledger-ink-subtle)]',
                };
                const Icon = meta.icon;

                return (
                  <div key={tx.id} className="relative">
                    <span
                      className={`absolute top-4 -left-[21px] size-2.5 rounded-full ring-4 ring-[var(--ledger-surface)] ${meta.dotClass}`}
                    />
                    <div className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 p-3.5 transition-colors hover:bg-[var(--ledger-bg)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
                            >
                              <Icon className="size-3" />
                              {meta.label}
                            </span>
                            <span className="font-mono-tabular text-[0.72rem] text-[var(--ledger-ink-subtle)]">
                              {formatDateTime(tx.createdAt)}
                            </span>
                          </div>

                          {!isClientSpecific && (
                            <p className="mt-1.5 truncate text-[0.92rem] font-bold text-[var(--ledger-ink)]">
                              {tx.debtorName}
                            </p>
                          )}

                          <p
                            className={`${
                              isClientSpecific ? 'mt-1.5 text-[0.86rem]' : 'mt-0.5 text-xs'
                            } leading-snug text-[var(--ledger-ink-muted)]`}
                          >
                            {tx.description || meta.defaultNote}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className={`font-mono-tabular text-sm font-bold ${meta.amountClass}`}>
                            {formatSignedCurrency(tx.amount)}
                          </div>
                          <div className="font-mono-tabular mt-0.5 text-[0.72rem] text-[var(--ledger-ink-subtle)]">
                            {formatCurrency(tx.previousBalance)} &rarr;{' '}
                            <strong className="text-[var(--ledger-ink)]">
                              {formatCurrency(tx.newBalance)}
                            </strong>
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

export default DebtorStatementModal;
