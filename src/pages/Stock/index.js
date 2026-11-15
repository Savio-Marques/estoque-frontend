import React, { useState } from 'react';
import { Package, CircleAlert, Plus, SquarePen, Minus, X, CheckCircle } from 'lucide-react';
import EditProductModal from '../../components/EditProductModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import useDebounce from '../../hooks/useDebounce';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import './style.css';

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: products = [], isLoading } = useProducts({
    searchTerm: debouncedSearchTerm,
    stockFilter,
    categoryFilter,
  });

  const { data: categories = [] } = useCategories();

  const { updateProductMutation, deleteProductMutation } = useProductMutations({
    onUpdateSuccess: () => setEditingProduct(null),
    onDeleteSuccess: () => {
      setConfirmationProps({ isOpen: false });
      setEditingProduct(null);
    },
  });

  const handleQuantityChange = (product, amount) => {
    const newQuantity = product.qtd + amount;
    if (newQuantity < 0) return;

    updateProductMutation.mutate({
      ...product,
      qtd: newQuantity,
      _silentToast: true,
    });
  };

  const requestDeleteConfirmation = (product) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja deletar o produto "${product.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => deleteProductMutation.mutate(product.id),
    });
  };

  const statusReturn = (quantity, minQuantity = 5) => {
    const threshold = minQuantity ?? 5;
    if (quantity === 0) {
      return {
        icon: <X size={20} color="#D0021B" />,
        tag: <p className="product-status red">Sem estoque</p>,
      };
    }
    if (quantity > 0 && quantity <= threshold) {
      return {
        icon: <CircleAlert size={20} color="#F5A623" />,
        tag: <p className="product-status yellow">Estoque baixo</p>,
      };
    }
    return {
      icon: <CheckCircle size={20} color="#16A249" />,
      tag: <p className="product-status green">Disponível</p>,
    };
  };

  return (
    <div className="stock">
      <div className="stock-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-dropdown"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            aria-label="Filtrar por status do estoque"
          >
            <option value="all">Todos os produtos</option>
            <option value="low">Estoque Baixo</option>
            <option value="out_of_stock">Sem Estoque</option>
          </select>
          <select
            className="filter-dropdown"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="product-not-found">Carregando produtos...</p>
        ) : products.length > 0 ? (
          <ul>
            {products.map((stock) => {
              const statusResult = statusReturn(stock.qtd, stock.minQuantity);
              return (
                <li key={stock.id} className="product-card-container">
                  <div className="product-card">
                    <div className="product-header">
                      <div className="product-header-title">
                        <Package size={21} />
                        <h3>{stock.name}</h3>
                      </div>
                      {statusResult.icon}
                    </div>
                    <p className="product-categorie">{stock.categoryName || 'Sem categoria'}</p>
                    <div className="product-stock-container">
                      <div className="product-stock">
                        <span>Estoque:</span>
                        <span className="product-stock-number">{`${stock.qtd} un.`}</span>
                      </div>
                    </div>
                    {(stock.salePrice > 0 || stock.costPrice > 0) && (
                      <div className="product-prices">
                        <span className="product-price-item">
                          Venda:{' '}
                          <strong>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                              stock.salePrice ?? 0
                            )}
                          </strong>
                        </span>
                        <span className="product-price-cost">
                          Custo:{' '}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            stock.costPrice ?? 0
                          )}
                        </span>
                      </div>
                    )}
                    <div className="product-status-container">
                      <span>{statusResult.tag}</span>
                    </div>
                    <div className="add-remove">
                      <button
                        type="button"
                        className="product-add"
                        onClick={() => handleQuantityChange(stock, 1)}
                        aria-label={`Adicionar 1 unidade ao estoque de ${stock.name}`}
                      >
                        <Plus size={18} />
                        Adicionar
                      </button>
                      <button
                        type="button"
                        className="product-remove"
                        onClick={() => handleQuantityChange(stock, -1)}
                        disabled={stock.qtd <= 0}
                        aria-label={`Retirar 1 unidade do estoque de ${stock.name}`}
                      >
                        <Minus size={18} />
                        Retirar
                      </button>
                    </div>
                    <button
                      type="button"
                      className="product-edit"
                      onClick={() => setEditingProduct(stock)}
                      aria-label={`Editar produto ${stock.name}`}
                    >
                      <SquarePen size={18} />
                      Editar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="product-not-found">Nenhum produto encontrado com os filtros aplicados.</p>
        )}

        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            categories={categories}
            onSave={(data) => updateProductMutation.mutateAsync(data)}
            onClose={() => setEditingProduct(null)}
            onDeleteRequest={requestDeleteConfirmation}
          />
        )}

        <ConfirmationModal
          isOpen={confirmationProps.isOpen}
          onClose={() => setConfirmationProps({ isOpen: false })}
          onConfirm={confirmationProps.onConfirm}
          title={confirmationProps.title}
        >
          {confirmationProps.message}
        </ConfirmationModal>
      </div>
    </div>
  );
}
