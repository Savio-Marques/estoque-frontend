import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import './style.css';

export default function EditDebtorModal({ debtor, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...debtor });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ ...debtor });
  }, [debtor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <form className="editDebtor-form" onSubmit={handleSubmit}>
        <h2>Editar Pagamento Pendente</h2>

        <div className="editDebtor-inputs">
          <label htmlFor="edit-debtor-name">Cliente*</label>
          <input
            id="edit-debtor-name"
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="editDebtor-inputs">
          <label htmlFor="edit-debtor-description">Descrição</label>
          <input
            id="edit-debtor-description"
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="editDebtor-inputs">
          <label htmlFor="edit-debtor-value">Valor*</label>
          <input
            id="edit-debtor-value"
            type="number"
            name="value"
            step="0.01"
            value={formData.value || ''}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="modal-actions-debtors">
          <button type="submit" className="save-button-debtors" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={onClose} className="cancel-button-debtors">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}