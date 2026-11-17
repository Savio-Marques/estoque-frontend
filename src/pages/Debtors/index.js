import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Coins,
  FileText,
  Pencil,
  Plus,
  Search,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useDebtors, useDebtorMutations } from '../../hooks/useDebtors';
import { InsightCard } from '@/components/motion/insight-card';
import { NumberTicker } from '@/components/motion/number-ticker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import EditDebtorModal from '../../components/EditDebtorModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/Modal';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString('pt-BR');

const formatEntryDate = (dateString) => {
  if (!dateString) return '—';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return String(dateString);
  return parsed.toLocaleDateString('pt-BR');
};

const getDaysOpen = (dateString) => {
  if (!dateString) return 0;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diffMs = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

const SORT_LABELS = {
  recent: 'Mais recentes',
  oldest: 'Mais antigos',
  highest: 'Maior valor',
  name: 'Nome (A–Z)',
};

function Debtors() {
  const outletContext = useOutletContext() || {};
  const { openModal } = outletContext;
  const searchInputRef = useRef(null);

  const [editingDebtor, setEditingDebtor] = useState(null);
  const [payingDebtor, setPayingDebtor] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(debtorSearchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [debtorSearchTerm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      const tagName = target?.tagName;
      if (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target?.isContentEditable ||
        document.querySelector('[role="dialog"], [role="alertdialog"]')
      ) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { data: debtorsData, isLoading, isError } = useDebtors({
    searchTerm: debouncedSearch,
  });

  const debtors = useMemo(() => debtorsData?.debtorDTOList || [], [debtorsData]);
  const summaryDebtorsDTO = debtorsData?.summaryDebtorsDTO || { totalValue: 0, totalDebtors: 0 };

  const overdueStats = useMemo(() => {
    return debtors.reduce(
      (acc, debtor) => {
        if (getDaysOpen(debtor.date) >= 30) {
          acc.count += 1;
          acc.total += Number(debtor.value || 0);
        }
        return acc;
      },
      { count: 0, total: 0 }
    );
  }, [debtors]);

  const visibleDebtors = useMemo(() => {
    const filtered = onlyOverdue
      ? debtors.filter((d) => getDaysOpen(d.date) >= 30)
      : [...debtors];

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        case 'highest':
          return Number(b.value || 0) - Number(a.value || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '', 'pt-BR');
        case 'recent':
        default:
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
    });
  }, [debtors, onlyOverdue, sortBy]);

  const { updateDebtorMutation, partialPayMutation, markAsPaidMutation } = useDebtorMutations({
    onUpdateSuccess: () => setEditingDebtor(null),
    onPaidSuccess: () => {
      setConfirmationProps({ isOpen: false });
      setPayingDebtor(null);
      setPartialAmount('');
    },
  });

  const handleSaveChanges = (updatedData) => {
    updateDebtorMutation.mutate({
      ...editingDebtor,
      ...updatedData,
    });
  };

  const handleConfirmPayment = (debtor) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Quitação',
      message: `Confirmar pagamento integral de "${debtor.name}" no valor de ${formatCurrency(debtor.value)}?`,
      confirmButtonClass: 'confirm-button-paid',
      onConfirm: () => markAsPaidMutation.mutateAsync(debtor.id),
    });
  };

  const handlePartialPaySubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(partialAmount);
    if (!amount || amount <= 0 || !payingDebtor) return;

    partialPayMutation.mutate({ id: payingDebtor.id, amount });
  };

  const payingBalance = Number(payingDebtor?.value || 0);
  const parsedPartial = parseFloat(partialAmount);
  const hasValidPartial =
    Number.isFinite(parsedPartial) && parsedPartial > 0 && parsedPartial <= payingBalance;
  const remainingBalance = hasValidPartial
    ? Number((payingBalance - parsedPartial).toFixed(2))
    : null;

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
            Caderneta de Clientes
          </h2>
          <p className="mt-1 hidden text-sm text-[var(--ledger-ink-muted)] sm:block">
            Consulte os itens anotados, registre abatimentos parciais e quite saldos em aberto.
          </p>
        </div>

        {openModal && (
          <button
            type="button"
            onClick={() => openModal('addPayment')}
            className="ledger-btn-primary self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Novo Lançamento</span>
          </button>
        )}
      </div>

      {/* 3 Debtor KPI Cards */}
      <div className="easeui-theme grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <InsightCard
          label="Total a Receber"
          value={
            <NumberTicker
              value={Number(summaryDebtorsDTO?.totalValue || 0)}
              format={formatCurrency}
            />
          }
          icon={<Wallet className="size-4 text-[var(--ledger-accent)]" />}
          className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] shadow-none"
        />

        <button
          type="button"
          onClick={() => setOnlyOverdue(false)}
          aria-pressed={!onlyOverdue}
          className="w-full rounded-xl text-left transition-transform active:scale-[0.99]"
        >
          <InsightCard
            label="Clientes em Aberto"
            value={
              <NumberTicker
                value={Number(summaryDebtorsDTO?.totalDebtors || 0)}
                format={formatInteger}
              />
            }
            icon={<Users className="size-4 text-[var(--ledger-amber)]" />}
            className={`cursor-pointer rounded-xl border bg-[var(--ledger-surface)] shadow-none transition-colors hover:border-[var(--ledger-border-strong)] ${
              !onlyOverdue
                ? 'border-[var(--ledger-accent)] ring-2 ring-[var(--ledger-accent)]/20'
                : 'border-[var(--ledger-border)]'
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => setOnlyOverdue((prev) => !prev)}
          aria-pressed={onlyOverdue}
          className="w-full rounded-xl text-left transition-transform active:scale-[0.99]"
        >
          <InsightCard
            label="Acima de 30 Dias"
            value={
              <div className="flex flex-col">
                <NumberTicker value={overdueStats.count} format={formatInteger} />
                <span className="font-mono-tabular mt-1 text-[0.72rem] font-medium text-[var(--ledger-ink-subtle)]">
                  {formatCurrency(overdueStats.total)} em atraso
                </span>
              </div>
            }
            icon={
              <AlertTriangle
                className={`size-4 ${
                  overdueStats.count > 0 ? 'text-[var(--ledger-danger)]' : 'text-[var(--ledger-amber)]'
                }`}
              />
            }
            className={`cursor-pointer rounded-xl border bg-[var(--ledger-surface)] shadow-none transition-colors hover:border-red-400 ${
              onlyOverdue
                ? 'border-red-500 ring-2 ring-red-500/25'
                : overdueStats.count > 0
                  ? 'border-red-300/80'
                  : 'border-[var(--ledger-border)]'
            }`}
          />
        </button>
      </div>

      {/* Search Bar & Sorting */}
      <div className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="ledger-search-wrapper min-w-0 flex-1 sm:max-w-md">
            <Search className="ledger-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar cliente por nome..."
              value={debtorSearchTerm}
              onChange={(e) => setDebtorSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
            {debtorSearchTerm ? (
              <button
                type="button"
                onClick={() => setDebtorSearchTerm('')}
                aria-label="Limpar busca de cliente"
                className="ledger-search-clear"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="font-mono-tabular pointer-events-none absolute right-2.5 hidden rounded border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[var(--ledger-ink-subtle)] sm:inline-block"
              >
                /
              </kbd>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-[var(--ledger-ink-subtle)] sm:inline">
              Ordenar:
            </span>
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val ? String(val) : 'recent')}
            >
              <SelectTrigger aria-label="Ordenar lançamentos" className="w-full sm:w-48">
                <SelectValue>{(val) => SORT_LABELS[val] || SORT_LABELS.recent}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{SORT_LABELS.recent}</SelectItem>
                <SelectItem value="oldest">{SORT_LABELS.oldest}</SelectItem>
                <SelectItem value="highest">{SORT_LABELS.highest}</SelectItem>
                <SelectItem value="name">{SORT_LABELS.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Digital Ledger Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] py-16 text-sm text-[var(--ledger-ink-subtle)]">
          <Spinner className="size-6 text-[var(--ledger-accent)]" />
          <span>Carregando caderneta...</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--ledger-danger-soft)] p-5 text-sm font-medium text-[var(--ledger-danger)]">
          Erro ao carregar a lista de clientes.
        </div>
      ) : visibleDebtors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-16 text-center">
          <BookOpen className="size-8 text-[var(--ledger-ink-subtle)]" />
          <div>
            <p className="text-base font-bold text-[var(--ledger-ink)]">
              {onlyOverdue && debtors.length > 0
                ? 'Nenhum cliente com atraso acima de 30 dias'
                : 'Nenhum lançamento encontrado'}
            </p>
            <p className="mt-1 text-sm text-[var(--ledger-ink-subtle)]">
              {onlyOverdue && debtors.length > 0
                ? 'Todos os saldos em aberto estão dentro do prazo de 30 dias.'
                : 'Não há clientes em aberto correspondentes à busca atual.'}
            </p>
          </div>
          {onlyOverdue && debtors.length > 0 ? (
            <button
              type="button"
              onClick={() => setOnlyOverdue(false)}
              className="ledger-btn-secondary mt-1"
            >
              Mostrar todos os clientes
            </button>
          ) : (
            openModal && (
              <button
                type="button"
                onClick={() => openModal('addPayment')}
                className="ledger-btn-primary mt-1"
              >
                <Plus className="size-4" />
                <span>Novo Lançamento</span>
              </button>
            )
          )}
        </div>
      ) : (
        <>
          {/* Desktop Digital Ledger Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[0.7rem] font-bold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-5 py-3.5">Descrição</th>
                    <th className="px-5 py-3.5">Data de Entrada</th>
                    <th className="px-5 py-3.5 text-right">Saldo Devido</th>
                    <th className="px-5 py-3.5 text-right">Operações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ledger-border)]">
                  {visibleDebtors.map((debtor) => {
                    const daysOpen = getDaysOpen(debtor.date);
                    const isOverdue = daysOpen >= 30;

                    return (
                    <tr
                      key={debtor.id}
                      className="transition-colors hover:bg-[var(--ledger-surface-hover)]"
                    >
                      <td className="px-5 py-3.5 align-top">
                        <span className="font-bold text-[var(--ledger-ink)]">{debtor.name}</span>
                      </td>
                      <td className="max-w-sm px-5 py-3.5 align-top">
                        {debtor.description ? (
                          <p className="text-[0.84rem] leading-snug text-[var(--ledger-ink-muted)]">
                            {debtor.description}
                          </p>
                        ) : (
                          <span className="text-xs italic text-[var(--ledger-ink-subtle)]">
                            Sem descrição informada
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono-tabular text-xs font-medium text-[var(--ledger-ink-muted)]">
                            {formatEntryDate(debtor.date)}
                          </span>
                          {daysOpen > 0 && (
                            <span
                              className={`font-mono-tabular inline-flex items-center rounded border px-1.5 py-0.5 text-[0.68rem] font-semibold ${
                                isOverdue
                                  ? 'border-red-200 bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)]'
                                  : 'border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-subtle)]'
                              }`}
                            >
                              há {daysOpen}d
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="font-mono-tabular px-5 py-3.5 text-right align-top text-[0.95rem] font-bold text-[var(--ledger-ink)]">
                        {formatCurrency(debtor.value)}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingDebtor(debtor)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-2.5 text-xs font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
                          >
                            <Pencil className="size-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPayingDebtor(debtor);
                              setPartialAmount('');
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-[var(--ledger-amber-soft)] px-2.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-200/80"
                          >
                            <Coins className="size-3.5" />
                            <span>Abater</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmPayment(debtor)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--ledger-accent)] px-3 text-xs font-semibold text-white transition-colors hover:bg-[var(--ledger-accent-hover)]"
                          >
                            <CheckCheck className="size-3.5" />
                            <span>Quitar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Ledger Ticket Cards (Android & iOS friendly) */}
          <div className="space-y-3 md:hidden">
            {visibleDebtors.map((debtor) => {
              const daysOpen = getDaysOpen(debtor.date);
              const isOverdue = daysOpen >= 30;

              return (
              <article
                key={debtor.id}
                className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-[var(--ledger-ink)]">
                      {debtor.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[var(--ledger-ink-subtle)]">
                      <CalendarClock className="size-3.5" />
                      <span>Entrada em</span>
                      <span className="font-mono-tabular font-medium text-[var(--ledger-ink-muted)]">
                        {formatEntryDate(debtor.date)}
                      </span>
                      {daysOpen > 0 && (
                        <span
                          className={`font-mono-tabular inline-flex items-center rounded border px-1.5 py-0.5 text-[0.65rem] font-semibold ${
                            isOverdue
                              ? 'border-red-200 bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)]'
                              : 'border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-subtle)]'
                          }`}
                        >
                          há {daysOpen}d
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono-tabular shrink-0 rounded-lg bg-[var(--ledger-bg)] px-2.5 py-1 text-base font-extrabold text-[var(--ledger-ink)]">
                    {formatCurrency(debtor.value)}
                  </span>
                </div>

                {/* Description Block */}
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 px-3 py-2.5">
                  <FileText className="mt-0.5 size-3.5 shrink-0 text-[var(--ledger-ink-subtle)]" />
                  <p className="text-[0.83rem] leading-relaxed text-[var(--ledger-ink-muted)]">
                    {debtor.description ? (
                      debtor.description
                    ) : (
                      <span className="italic text-[var(--ledger-ink-subtle)]">
                        Sem descrição registrada
                      </span>
                    )}
                  </p>
                </div>

                {/* Thumb-friendly 40px+ Action Strip */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-[var(--ledger-border)] pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingDebtor(debtor)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-xs font-semibold text-[var(--ledger-ink)] active:scale-95"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayingDebtor(debtor);
                      setPartialAmount('');
                    }}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-[var(--ledger-amber-soft)] text-xs font-semibold text-amber-900 active:scale-95"
                  >
                    <Coins className="size-3.5" />
                    <span>Abater</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment(debtor)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--ledger-accent)] text-xs font-semibold text-white active:scale-95"
                  >
                    <CheckCheck className="size-3.5" />
                    <span>Quitar</span>
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        </>
      )}

      <EditDebtorModal
        debtor={editingDebtor}
        onSave={handleSaveChanges}
        onClose={() => setEditingDebtor(null)}
        isPending={updateDebtorMutation.isPending}
      />

      {/* Partial Pay Modal */}
      <Modal
        isOpen={Boolean(payingDebtor)}
        onClose={() => setPayingDebtor(null)}
        title="Abater Valor da Dívida"
      >
        <form className="ledger-form" onSubmit={handlePartialPaySubmit}>
          <div className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] p-3.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-[var(--ledger-ink-muted)]">Cliente</span>
              <strong className="text-[var(--ledger-ink)]">{payingDebtor?.name}</strong>
            </div>
            {payingDebtor?.description && (
              <div className="mt-1.5 text-xs text-[var(--ledger-ink-subtle)]">
                {payingDebtor.description}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--ledger-border)] pt-2 text-sm">
              <span className="text-[var(--ledger-ink-muted)]">Saldo atual</span>
              <strong className="font-mono-tabular text-[var(--ledger-ink)]">
                {formatCurrency(payingDebtor?.value)}
              </strong>
            </div>
            {hasValidPartial && (
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-[var(--ledger-border-strong)] pt-2 text-xs">
                {remainingBalance === 0 ? (
                  <span className="font-semibold text-[var(--ledger-accent)]">
                    Quitação integral — o registro será encerrado
                  </span>
                ) : (
                  <>
                    <span className="text-[var(--ledger-ink-muted)]">
                      Novo saldo após abatimento
                    </span>
                    <strong className="font-mono-tabular text-[var(--ledger-ink)]">
                      {formatCurrency(remainingBalance)}
                    </strong>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ledger-field">
            <label htmlFor="partialAmount">Valor a Abater</label>
            <div className="ledger-input-affix">
              <span className="affix-prefix">R$</span>
              <input
                id="partialAmount"
                className="ledger-input mono"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                max={payingDebtor?.value}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
            {payingBalance > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPartialAmount((payingBalance / 2).toFixed(2))}
                  className="rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
                >
                  50% ({formatCurrency(payingBalance / 2)})
                </button>
                <button
                  type="button"
                  onClick={() => setPartialAmount(payingBalance.toFixed(2))}
                  className="rounded-lg border border-[var(--ledger-accent)]/30 bg-[var(--ledger-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ledger-accent)] transition-colors hover:bg-[var(--ledger-accent)] hover:text-white"
                >
                  Quitar Tudo ({formatCurrency(payingBalance)})
                </button>
              </div>
            )}
          </div>

          <div className="ledger-form-actions">
            <button
              type="button"
              className="ledger-btn-secondary"
              onClick={() => setPayingDebtor(null)}
              disabled={partialPayMutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ledger-btn-primary"
              disabled={partialPayMutation.isPending}
            >
              {partialPayMutation.isPending ? 'Processando...' : 'Confirmar Abatimento'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationProps.isOpen}
        onClose={() => setConfirmationProps({ isOpen: false })}
        onConfirm={confirmationProps.onConfirm}
        title={confirmationProps.title}
        confirmButtonClass={confirmationProps.confirmButtonClass}
      >
        {confirmationProps.message}
      </ConfirmationModal>
    </div>
  );
}

export default Debtors;
