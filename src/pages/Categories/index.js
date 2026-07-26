import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Tag, SquarePen, Trash2 } from 'lucide-react';
import './style.css';

export default function Categories() {
  const context = useOutletContext() || {};
  const { categories = [], onEditCategory, onDeleteCategory } = context;

  return (
    <div className="categories">
      <div className="categories-container">
        {categories && categories.length > 0 ? (
          <ul>
            {categories.map((category) => (
              <li key={category.id} className="categories-card">
                <div className="categories-title">
                  <Tag size={21} />
                  <h3>{category.name}</h3>
                </div>
                <div className="categories-button">
                  <button
                    className="categories-edit-button"
                    onClick={() => onEditCategory(category)}
                    aria-label={`Editar categoria ${category.name}`}
                  >
                    <SquarePen size={18} /> Editar
                  </button>
                  <button
                    className="categories-delete-button"
                    onClick={() => onDeleteCategory(category)}
                    aria-label={`Excluir categoria ${category.name}`}
                  >
                    <Trash2 size={18} /> Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p className="product-not-found">Nenhuma categoria cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}