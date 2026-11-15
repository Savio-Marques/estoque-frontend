import React, { useState } from 'react';
import { toast } from 'react-toastify';

function AddProductForm({ categories = [], onSave }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [qtd, setQtd] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !qtd) {
      toast.error('Por favor, preencha nome, categoria e quantidade.');
      return;
    }

    onSave({
      name,
      categoryId: parseInt(categoryId, 10),
      qtd: parseInt(qtd, 10),
      costPrice: parseFloat(costPrice) || 0,
      salePrice: parseFloat(salePrice) || 0,
      minQuantity: parseInt(minQuantity, 10) || 0,
    });
  };

  return (
    <form className="ledger-form" onSubmit={handleSubmit}>
      <div className="ledger-field">
        <label htmlFor="add-product-name">Nome do Produto</label>
        <input
          id="add-product-name"
          className="ledger-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Camisa Polo P"
          required
          autoFocus
        />
      </div>

      <div className="ledger-field">
        <label htmlFor="add-product-category">Categoria</label>
        <select
          id="add-product-category"
          className="ledger-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione uma categoria...
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="ledger-form-row">
        <div className="ledger-field">
          <label htmlFor="add-product-qtd">Quantidade Inicial</label>
          <input
            id="add-product-qtd"
            className="ledger-input mono"
            type="number"
            min="0"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="ledger-field">
          <label htmlFor="add-product-min">Estoque Mínimo</label>
          <input
            id="add-product-min"
            className="ledger-input mono"
            type="number"
            min="0"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="ledger-form-row">
        <div className="ledger-field">
          <label htmlFor="add-product-cost">Preço de Custo</label>
          <div className="ledger-input-affix">
            <span className="affix-prefix">R$</span>
            <input
              id="add-product-cost"
              className="ledger-input mono"
              type="number"
              step="0.01"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="ledger-field">
          <label htmlFor="add-product-sale">Preço de Venda</label>
          <div className="ledger-input-affix">
            <span className="affix-prefix">R$</span>
            <input
              id="add-product-sale"
              className="ledger-input mono"
              type="number"
              step="0.01"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="ledger-form-actions">
        <button type="submit" className="ledger-btn-primary">
          Salvar Produto
        </button>
      </div>
    </form>
  );
}

export default AddProductForm;
