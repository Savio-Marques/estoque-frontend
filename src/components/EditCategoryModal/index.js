import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

function EditCategoryModal({ category, onSave, onClose }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...category, name });
  };

  if (!category) return null;

  return (
    <Modal isOpen={Boolean(category)} onClose={onClose} title="Editar Categoria">
      <form className="ledger-form" onSubmit={handleSubmit}>
        <div className="ledger-field">
          <label htmlFor="edit-category-name">Nome da Categoria</label>
          <input
            id="edit-category-name"
            className="ledger-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
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

export default EditCategoryModal;
