import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import './style.css';

function EditDebtorModal({ debtor, onSave, onClose, isPending = false }) {
  const [formData, setFormData] = useState({ name: '', description: '', value: '' });

  useEffect(() => {
    if (debtor) {
      setFormData({
        name: debtor.name || '',
        description: debtor.description || '',
        value: debtor.value ?? '',
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
      name: formData.name.trim(),
      description: formData.description.trim(),
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

        <div className="ledger-field">
          <label htmlFor="edit-debtor-description">Descrição / Itens</label>
          <textarea
            id="edit-debtor-description"
            className="ledger-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ex: 1 Coca-Cola 2L, 4 Biscoitos Amori..."
            maxLength={255}
          />
        </div>

        <div className="ledger-field">
          <label htmlFor="edit-debtor-value">Valor Devido</label>
          <div className="ledger-input-affix">
            <span className="affix-prefix">R$</span>
            <input
              id="edit-debtor-value"
              className="ledger-input mono"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="ledger-form-actions">
          <button
            type="button"
            className="ledger-btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button type="submit" className="ledger-btn-primary" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditDebtorModal;
