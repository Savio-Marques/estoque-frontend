import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function AddProductForm({ categories = [], onSave }) {
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

  const selectedCategoryName = categories.find((c) => String(c.id) === String(categoryId))?.name;

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

      <div className="ledger-field">
        <label htmlFor="add-product-category">Categoria</label>
        <Select
          value={categoryId || null}
          onValueChange={(val) => setCategoryId(val ? String(val) : '')}
        >
          <SelectTrigger id="add-product-category" className="w-full">
            <SelectValue placeholder="Selecione uma categoria...">
              {() => selectedCategoryName || 'Selecione uma categoria...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <div className="ledger-form-actions">
        <button type="submit" className="ledger-btn-primary">
          Salvar Produto
        </button>
      </div>
    </form>
  );
}

export default AddProductForm;
