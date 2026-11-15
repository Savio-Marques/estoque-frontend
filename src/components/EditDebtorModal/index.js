import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import './style.css';

function EditDebtorModal({ debtor, onSave, onClose }) {
  const [formData, setFormData] = useState({ name: '', value: '', dueDate: '' });

  useEffect(() => {
    if (debtor) {
      setFormData({
        name: debtor.name || '',
        value: debtor.value || '',
        dueDate: debtor.dueDate ? debtor.dueDate.split('T')[0] : '',
      });
    }
  }, [debtor]);

  if (!debtor) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      value: parseFloat(formData.value),
    });
  };

  return (
    <Modal isOpen={Boolean(debtor)} onClose={onClose} title="Editar Lançamento">
      <form className="ledger-form" onSubmit={handleSubmit}>
        <div className="ledger-field">
          <label htmlFor="edit-debtor-name">Nome do Cliente</label>
          <input
            id="edit-debtor-name"
            className="ledger-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ledger-form-row">
          <div className="ledger-field">
            <label htmlFor="edit-debtor-value">Valor Devido</label>
            <div className="ledger-input-affix">
              <span className="affix-prefix">R$</span>
              <input
                id="edit-debtor-value"
                className="ledger-input mono"
                type="number"
                step="0.01"
                min="0"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="ledger-field">
            <label htmlFor="edit-debtor-due">Data de Vencimento</label>
            <input
              id="edit-debtor-due"
              className="ledger-input mono"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="ledger-form-actions">
          <button type="button" className="ledger-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="ledger-btn-primary">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditDebtorModal;
