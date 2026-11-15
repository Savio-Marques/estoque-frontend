import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Modal from '../Modal';
import './style.css';

function EditProductModal({ product, categories = [], onSave, onClose, onDeleteRequest }) {
  const [formData, setFormData] = useState({
    name: '',
    qtd: 0,
    costPrice: 0,
    salePrice: 0,
    minQuantity: 0,
    categoryId: '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        qtd: product.qtd ?? 0,
        costPrice: product.costPrice ?? 0,
        salePrice: product.salePrice ?? 0,
        minQuantity: product.minQuantity ?? 0,
        categoryId: String(product.categoryId || product.category?.id || ''),
      });
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...product,
      ...formData,
      qtd: parseInt(formData.qtd, 10),
      costPrice: parseFloat(formData.costPrice) || 0,
      salePrice: parseFloat(formData.salePrice) || 0,
      minQuantity: parseInt(formData.minQuantity, 10) || 0,
      categoryId: parseInt(formData.categoryId, 10),
    });
  };

  const selectedCategoryName = categories.find(
    (c) => String(c.id) === String(formData.categoryId)
  )?.name;

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} title={`Editar · ${product.name}`}>
      <form className="ledger-form" onSubmit={handleSubmit}>
        <div className="ledger-field">
          <label htmlFor="edit-product-name">Nome do Produto</label>
          <input
            id="edit-product-name"
            className="ledger-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="ledger-field">
          <label htmlFor="edit-product-category">Categoria</label>
          <Select
            value={formData.categoryId ? String(formData.categoryId) : null}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, categoryId: val ? String(val) : '' }))
            }
          >
            <SelectTrigger id="edit-product-category" className="w-full">
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
            <label htmlFor="edit-product-qtd">Quantidade em Estoque</label>
            <input
              id="edit-product-qtd"
              className="ledger-input mono"
              type="number"
              inputMode="numeric"
              name="qtd"
              min="0"
              value={formData.qtd}
              onChange={handleChange}
              required
            />
          </div>

          <div className="ledger-field">
            <label htmlFor="edit-product-min">Estoque Mínimo</label>
            <input
              id="edit-product-min"
              className="ledger-input mono"
              type="number"
              inputMode="numeric"
              name="minQuantity"
              min="0"
              value={formData.minQuantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="ledger-form-row">
          <div className="ledger-field">
            <label htmlFor="edit-product-cost">Preço de Custo</label>
            <div className="ledger-input-affix">
              <span className="affix-prefix">R$</span>
              <input
                id="edit-product-cost"
                className="ledger-input mono"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ledger-field">
            <label htmlFor="edit-product-sale">Preço de Venda</label>
            <div className="ledger-input-affix">
              <span className="affix-prefix">R$</span>
              <input
                id="edit-product-sale"
                className="ledger-input mono"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="ledger-danger-zone">
          <span>Remover item permanentemente</span>
          <button
            type="button"
            className="ledger-btn-danger"
            onClick={() => onDeleteRequest(product)}
          >
            <Trash2 className="size-4" />
            Excluir Produto
          </button>
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

export default EditProductModal;
