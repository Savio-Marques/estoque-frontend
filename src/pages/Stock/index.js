import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, CircleAlert, Plus, SquarePen, Minus, X, CheckCircle } from 'lucide-react';
import './style.css';

export default function Stock() {
  const context = useOutletContext() || {};
  const {
    products = [],
    onEditProduct,
    onQuantityChange,
    searchTerm = '',
    setSearchTerm,
    stockFilter = 'all',
    setStockFilter,
  } = context;

  const statusReturn = (quantity) => {
    if (quantity === 0) {
      return {
        icon: <X size={20} color="#D0021B" />,
        tag: <p className="product-status red">Sem estoque</p>,
      };
    }
    if (quantity > 0 && quantity <= 5) {
      return {
        icon: <CircleAlert size={20} color="#F5A623" />,
        tag: <p className="product-status yellow">Estoque baixo</p>,
      };
    }
    if (quantity > 5) {
      return {
        icon: <CheckCircle size={20} color="#16A249" />,
        tag: <p className="product-status green">Disponível</p>,
      };
    }
    return { icon: null, tag: null };
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
          >
            <option value="all">Todos os produtos</option>
            <option value="low">Estoque Baixo</option>
            <option value="out_of_stock">Sem Estoque</option>
          </select>
        </div>

        {products.length > 0 ? (
          <ul>
            {products.map((stock) => {
              const statusResult = statusReturn(stock.qtd);
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
                    <div className="product-status-container">
                      <span>{statusResult.tag}</span>
                    </div>
                    <div className="add-remove">
                      <button
                        className="product-add"
                        onClick={() => onQuantityChange(stock.id, 1)}
                        aria-label={`Adicionar 1 unidade ao estoque de ${stock.name}`}
                      >
                        <Plus size={18} />
                        Adicionar
                      </button>
                      <button
                        className="product-remove"
                        onClick={() => onQuantityChange(stock.id, -1)}
                        aria-label={`Retirar 1 unidade do estoque de ${stock.name}`}
                      >
                        <Minus size={18} />
                        Retirar
                      </button>
                    </div>
                    <button
                      className="product-edit"
                      onClick={() => onEditProduct(stock)}
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
      </div>
    </div>
  );
}