import React, { useState } from 'react';
import { Banknote, UsersRound, SquarePen, CircleCheck } from 'lucide-react';
import EditDebtorModal from '../../components/EditDebtorModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import Modal from '../../components/Modal';
import useDebounce from '../../hooks/useDebounce';
import { useDebtors, useDebtorMutations } from '../../hooks/useDebtors';
import './style.css';

export default function Debtors() {
  const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
  const [editingDebtor, setEditingDebtor] = useState(null);
  const [payingDebtor, setPayingDebtor] = useState(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const debouncedDebtorSearchTerm = useDebounce(debtorSearchTerm, 500);

  const {
    data: debtorData = { debtorDTOList: [], summaryDebtorsDTO: { totalValue: 0, totalDebtors: 0 } },
    isLoading,
  } = useDebtors({ searchTerm: debouncedDebtorSearchTerm });

  const debtors = debtorData.debtorDTOList;
  const debtorSummary = debtorData.summaryDebtorsDTO;

  const { updateDebtorMutation, markAsPaidMutation, partialPayMutation } = useDebtorMutations({
    onUpdateSuccess: () => setEditingDebtor(null),
    onPaidSuccess: () => setConfirmationProps({ isOpen: false }),
    onPartialPaySuccess: () => {
      setPayingDebtor(null);
      setPartialAmount('');
    },
  });

  const handlePartialPaySubmit = async (e) => {
    e.preventDefault();
    if (!payingDebtor) return;
    await partialPayMutation.mutateAsync({
      id: payingDebtor.id,
      amount: parseFloat(partialAmount),
    });
  };

  const requestMarkAsPaidConfirmation = (debtor) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Pagamento',
      message: `Você confirma o recebimento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtor.value)} de ${debtor.name}?`,
      onConfirm: () => markAsPaidMutation.mutate(debtor.id),
      confirmButtonClass: 'confirm-button-paid',
    });
  };

  return (
    <div className="debtors">
      <div className="debtors-container">
        <div className="stats-group-debtors">
          <div className="stat-card-debtors">
            <div>
              <p>Valor total</p>
              <span>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  debtorSummary.totalValue
                )}
              </span>
            </div>
            <div>
              <Banknote color="blue" size={28} />
            </div>
          </div>
          <div className="stat-card-debtors">
            <div>
              <p>Clientes pendentes</p>
              <span>{debtorSummary.totalDebtors}</span>
            </div>
            <div>
              <UsersRound color="orange" size={28} />
            </div>
          </div>
        </div>

        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Pesquisar clientes..."
              value={debtorSearchTerm}
              onChange={(e) => setDebtorSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="debtors-list">
          <div className="debtors-list-title">
            <h3>Pagamentos pendentes</h3>
            <p>Lista de clientes com pagamentos em aberto</p>
          </div>
          <table className="debtors-list-table">
            <thead>
              <tr>
                <th className="col-table-name">Cliente</th>
                <th className="col-table-description">Descrição</th>
                <th className="col-table-value">Valor</th>
                <th className="col-table-date">Data de entrada</th>
                <th className="col-table-action">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Carregando pagamentos pendentes...
                  </td>
                </tr>
              ) : debtors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum pagamento pendente encontrado.
                  </td>
                </tr>
              ) : (
                debtors.map((debtor) => (
                  <tr key={debtor.id}>
                    <td data-label="Cliente" className="col-table-name">
                      <strong>{debtor.name}</strong>
                    </td>
                    <td data-label="Descrição" className="col-table-description">
                      {debtor.description || '—'}
                    </td>
                    <td data-label="Valor" className="col-table-value">
                      <strong>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(debtor.value)}
                      </strong>
                    </td>
                    <td data-label="Data de entrada" className="col-table-date">
                      {new Date(debtor.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td data-label="Ações" className="col-table-action">
                      <span className="debtors-table-icon-wrapper">
                        <button
                          type="button"
                          className="debtors-table-pencil"
                          onClick={() => setEditingDebtor(debtor)}
                        >
                          <SquarePen size={17} /> Editar
                        </button>
                        <button
                          type="button"
                          className="debtors-table-pay"
                          onClick={() => {
                            setPayingDebtor(debtor);
                            setPartialAmount('');
                          }}
                        >
                          <Banknote size={17} /> Abater
                        </button>
                        <button
                          type="button"
                          className="debtors-table-check"
                          onClick={() => requestMarkAsPaidConfirmation(debtor)}
                        >
                          <CircleCheck size={17} /> Pago
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editingDebtor && (
          <EditDebtorModal
            debtor={editingDebtor}
            onSave={(data) => updateDebtorMutation.mutateAsync(data)}
            onClose={() => setEditingDebtor(null)}
          />
        )}

        <Modal
          isOpen={Boolean(payingDebtor)}
          onClose={() => setPayingDebtor(null)}
          title="Abater Dívida"
        >
          {payingDebtor && (
            <form className="partial-pay-form" onSubmit={handlePartialPaySubmit}>
              <p className="partial-pay-info">
                Devedor: <strong>{payingDebtor.name}</strong> — Dívida atual:{' '}
                <strong>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    payingDebtor.value
                  )}
                </strong>
              </p>
              <div className="add-inputs-wrapper">
                <label htmlFor="partial-pay-amount">Valor do abatimento (R$)*</label>
                <input
                  id="partial-pay-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={payingDebtor.value}
                  placeholder="Ex: 50.00"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  required
                />
              </div>
              <button
                className="add-button"
                type="submit"
                disabled={partialPayMutation.isPending}
              >
                <Banknote size={18} />
                {partialPayMutation.isPending ? 'Registrando...' : 'Confirmar Abatimento'}
              </button>
            </form>
          )}
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
    </div>
  );
}
