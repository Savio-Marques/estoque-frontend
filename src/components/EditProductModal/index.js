import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import './style.css';

export default function EditProductModal({ product, categories = [], onSave, onClose, onDeleteRequest }) {
  const [formData, setFormData] = useState({ ...product });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ ...product });
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'categoryId' || name === 'qtd' ? parseInt(value, 10) : value;
    setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
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

  const handleDeleteClick = () => {
    onDeleteRequest(product);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <form className="editProduct-form" onSubmit={handleSubmit}>
        <h2 className="editProduct-title">Editar Produto</h2>

        <div className="editProduct-inputs">
          <label htmlFor="edit-product-name">Nome do Produto*</label>
          <input
            id="edit-product-name"
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="editProduct-inputs">
          <label htmlFor="edit-product-category">Categoria*</label>
          <select
            id="edit-product-category"
            name="categoryId"
            value={formData.categoryId || ''}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecione uma categoria
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="editProduct-inputs">
          <label htmlFor="edit-product-qtd">Quantidade*</label>
          <input
            id="edit-product-qtd"
            type="number"
            name="qtd"
            value={formData.qtd ?? 0}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <div className="modal-actions-products">
          <div className="modal-actions-wrapper">
            <button type="submit" className="save-button-product" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} className="cancel-button-product">
              Cancelar
            </button>
          </div>
        </div>

        <button type="button" className="delete-button" onClick={handleDeleteClick}>
          Deletar
        </button>
      </form>
    </Modal>
  );
}