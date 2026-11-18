import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  CategoryFieldWithCreate,
  ProductPricingHelper,
} from '../ProductFormPrimitives';

function AddProductForm({ categories = [], onSave, onCancel, isPending = false }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [qtd, setQtd] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || qtd === '') {
      toast.error('Por favor, preencha nome, categoria e quantidade.');
      return;
    }

    onSave({
      name: name.trim(),
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
          placeholder="Ex: Coca-Cola 2L"
          required
          autoFocus
        />
      </div>

      <CategoryFieldWithCreate
        id="add-product-category"
        categories={categories}
        value={categoryId}
        onChange={setCategoryId}
        autoOpenWhenEmpty
        disabled={isPending}
      />

      <div className="ledger-form-row">
        <div className="ledger-field">
          <label htmlFor="add-product-qtd">Quantidade Inicial</label>
          <input
            id="add-product-qtd"
            className="ledger-input mono"
            type="number"
            inputMode="numeric"
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
            inputMode="numeric"
            min="0"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            placeholder="5"
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
              inputMode="decimal"
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
              inputMode="decimal"
              step="0.01"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <ProductPricingHelper
        costPrice={costPrice}
        salePrice={salePrice}
        onApplySalePrice={setSalePrice}
      />

      <div className="ledger-form-actions">
        {onCancel && (
          <button
            type="button"
            className="ledger-btn-secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </button>
        )}
        <button type="submit" className="ledger-btn-primary" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar Produto'}
        </button>
      </div>
    </form>
  );
}

export default AddProductForm;
