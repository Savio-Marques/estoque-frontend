import React, { useState } from 'react';
import { PackagePlus } from 'lucide-react';

export default function AddProductForm({ categories = [], onSave }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [qtd, setQtd] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !categoryId) return;

    setIsSubmitting(true);
    try {
      await onSave({ name, categoryId: parseInt(categoryId, 10), qtd: parseInt(qtd, 10) });
      setName('');
      setCategoryId('');
      setQtd(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-container" onSubmit={handleSubmit}>
      <h2>Cadastro de produtos</h2>

      <div className="add-inputs-wrapper">
        <label htmlFor="product-name-input">Nome do Produto *</label>
        <input
          id="product-name-input"
          type="text"
          placeholder="Ex: Coca-Cola 2L"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="add-inputs-wrapper">
        <label htmlFor="product-category-select">Categoria *</label>
        <select
          id="product-category-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option className="extern-option" value="" disabled>
            Selecione uma categoria
          </option>
          {categories.map((cat) => (
            <option className="intern-option" key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="add-inputs-wrapper">
        <label htmlFor="product-qtd-input">Quantidade *</label>
        <input
          id="product-qtd-input"
          type="number"
          value={qtd}
          onChange={(e) => setQtd(e.target.value)}
          required
          min="0"
        />
      </div>

      <button className="add-button" type="submit" disabled={isSubmitting}>
        <PackagePlus size={20} />
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  );
}