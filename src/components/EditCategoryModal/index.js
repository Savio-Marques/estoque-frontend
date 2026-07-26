import React, { useState } from 'react';
import Modal from '../Modal';

export default function EditCategoryModal({ category, onSave, onClose }) {
  const [name, setName] = useState(category ? category.name : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({ ...category, name });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <form className="add-container" onSubmit={handleSubmit}>
        <h2>Editar Categoria</h2>
        <div className="add-inputs-wrapper">
          <label htmlFor="edit-category-name">Nome da categoria*</label>
          <input
            id="edit-category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button className="add-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </Modal>
  );
}