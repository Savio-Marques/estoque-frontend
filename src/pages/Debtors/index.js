import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  CheckCheck,
  Coins,
  Pencil,
  Plus,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import { useDebtors, useDebtorMutations } from '../../hooks/useDebtors';
import { InsightCard } from '@/components/motion/insight-card';
import { NumberTicker } from '@/components/motion/number-ticker';
import { Spinner } from '@/components/ui/spinner';
import EditDebtorModal from '../../components/EditDebtorModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/Modal';
import './style.css';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString('pt-BR');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const isOverdue = (dateString) => {
  if (!dateString) return false;
  const isoDay = dateString.split('T')[0];
  const todayIso = new Date().toISOString().split('T')[0];
  return isoDay < todayIso;
};

function Debtors() {
  const outletContext = useOutletContext() || {};
  const { openModal } = outletContext;

  const [editingDebtor, setEditingDebtor] = useState(null);
  const [payingDebtor, setPayingDebtor] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(debtorSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [debtorSearchTerm]);

  const { data: debtorsData, isLoading, isError } = useDebtors({
    searchTerm: debouncedSearch,
  });

  const debtors = debtorsData?.debtorDTOList || [];
  const summaryDebtorsDTO = debtorsData?.summaryDebtorsDTO || { totalValue: 0, totalDebtors: 0 };

  const { updateDebtorMutation, partialPayMutation, markAsPaidMutation } = useDebtorMutations({
    onUpdateSuccess: () => setEditingDebtor(null),
    onPaidSuccess: () => {
      setConfirmationProps({ isOpen: false });
      setPayingDebtor(null);
      setPartialAmount('');
    },
  });

  const handleSaveChanges = (updatedData) => {
    updateDebtorMutation.mutate({ id: editingDebtor.id, debtorData: updatedData });
  };

  const handleConfirmPayment = (debtor) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Quitação',
      message: `Confirmar pagamento integral de "${debtor.name}" no valor de ${formatCurrency(debtor.value)}?`,
      confirmButtonClass: 'confirm-button-paid',
      onConfirm: () => {
        markAsPaidMutation.mutate(debtor.id);
      },
    });
  };

  const handlePartialPaySubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(partialAmount);
    if (!amount || amount <= 0) return;

    partialPayMutation.mutate(
      { id: payingDebtor.id, amount },
      {
        onSuccess: () => {
          setPayingDebtor(null);
          setPartialAmount('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tabular text-[0.72rem] font-semibold uppercase tracking-widest text-[var(--ledger-amber)]">
            Contas a Receber
          </span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
            Caderneta de Clientes
          </h2>
          <p className="mt-1 text-sm text-[var(--ledger-ink-muted)]">
            Acompanhe prazos de vencimento, registre abatimentos parciais e quite saldos em aberto.
          </p>
        </div>

        {openModal && (
          <button
            type="button"
            onClick={() => openModal('addPayment')}
            className="ledger-btn-primary self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Novo Cliente</span>
          </button>
        )}
      </div>

      {/* 2 Debtor KPI Cards */}
      <div className="easeui-theme grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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

        <InsightCard
          label="Clientes em Aberto"
          value={
            <NumberTicker
              value={Number(summaryDebtorsDTO?.totalDebtors || 0)}
              format={formatInteger}
            />
          }
          icon={<Users className="size-4 text-[var(--ledger-amber)]" />}
          className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] shadow-none"
        />
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-3.5 sm:p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--ledger-ink-subtle)]" />
          <input
            type="text"
            placeholder="Buscar cliente por nome..."
            value={debtorSearchTerm}
            onChange={(e) => setDebtorSearchTerm(e.target.value)}
            className="ledger-input pl-9"
          />
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
      ) : debtors.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-16 text-center">
          <BookOpen className="size-8 text-[var(--ledger-ink-subtle)]" />
          <div>
            <p className="text-base font-bold text-[var(--ledger-ink)]">
              Nenhum lançamento encontrado
            </p>
            <p className="mt-1 text-sm text-[var(--ledger-ink-subtle)]">
              Não há clientes em aberto correspondentes à busca atual.
            </p>
          </div>
          {openModal && (
            <button
              type="button"
              onClick={() => openModal('addPayment')}
              className="ledger-btn-primary mt-1"
            >
              <Plus className="size-4" />
              <span>Registrar Lançamento</span>
            </button>
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
                    <th className="px-5 py-3.5">Vencimento</th>
                    <th className="px-5 py-3.5 text-right">Saldo Devido</th>
                    <th className="px-5 py-3.5 text-right">Operações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ledger-border)]">
                  {debtors.map((debtor) => {
                    const overdue = isOverdue(debtor.dueDate);
                    return (
                      <tr
                        key={debtor.id}
                        className="transition-colors hover:bg-[var(--ledger-surface-hover)]"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-[var(--ledger-ink)]">{debtor.name}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-tabular text-xs font-medium text-[var(--ledger-ink-muted)]">
                              {formatDate(debtor.dueDate)}
                            </span>
                            {overdue ? (
                              <span className="inline-flex items-center rounded-md border border-red-200 bg-[var(--ledger-danger-soft)] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--ledger-danger)]">
                                Vencido
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-[var(--ledger-ink-muted)]">
                                Em dia
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono-tabular px-5 py-3.5 text-right text-[0.95rem] font-bold text-[var(--ledger-ink)]">
                          {formatCurrency(debtor.value)}
                        </td>
                        <td className="px-5 py-3.5">
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

          {/* Mobile Ledger Cards */}
          <div className="space-y-3 md:hidden">
            {debtors.map((debtor) => {
              const overdue = isOverdue(debtor.dueDate);
              return (
                <article
                  key={debtor.id}
                  className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-[var(--ledger-ink)]">
                        {debtor.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--ledger-ink-muted)]">
                        <CalendarClock className="size-3.5 text-[var(--ledger-ink-subtle)]" />
                        <span className="font-mono-tabular">{formatDate(debtor.dueDate)}</span>
                        {overdue && (
                          <span className="rounded bg-[var(--ledger-danger-soft)] px-1.5 py-0.5 text-[0.65rem] font-bold uppercase text-[var(--ledger-danger)]">
                            Vencido
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-mono-tabular shrink-0 text-base font-extrabold text-[var(--ledger-ink)]">
                      {formatCurrency(debtor.value)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--ledger-border)] pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingDebtor(debtor)}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-xs font-semibold text-[var(--ledger-ink)]"
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
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-amber-300 bg-[var(--ledger-amber-soft)] text-xs font-semibold text-amber-900"
                    >
                      <Coins className="size-3.5" />
                      <span>Abater</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmPayment(debtor)}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-[var(--ledger-accent)] text-xs font-semibold text-white"
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
            <div className="mt-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="text-[var(--ledger-ink-muted)]">Saldo atual</span>
              <strong className="font-mono-tabular text-[var(--ledger-ink)]">
                {formatCurrency(payingDebtor?.value)}
              </strong>
            </div>
          </div>

          <div className="ledger-field">
            <label htmlFor="partialAmount">Valor a Abater</label>
            <div className="ledger-input-affix">
              <span className="affix-prefix">R$</span>
              <input
                id="partialAmount"
                className="ledger-input mono"
                type="number"
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
          </div>

          <div className="ledger-form-actions">
            <button
              type="button"
              className="ledger-btn-secondary"
              onClick={() => setPayingDebtor(null)}
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
