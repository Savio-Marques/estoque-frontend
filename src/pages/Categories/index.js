import React, { useState } from 'react';
import { Tag, SquarePen, Trash2 } from 'lucide-react';
import EditCategoryModal from '../../components/EditCategoryModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import './style.css';

export default function Categories() {
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const { data: categories = [], isLoading } = useCategories();

  const { updateCategoryMutation, deleteCategoryMutation } = useCategoryMutations({
    onUpdateSuccess: () => setEditingCategory(null),
    onDeleteSuccess: () => setConfirmationProps({ isOpen: false }),
  });

  const requestDeleteCategoryConfirmation = (category) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja deletar a categoria "${category.name}"?`,
      onConfirm: () => deleteCategoryMutation.mutate(category.id),
    });
  };

  return (
    <div className="categories">
      <div className="categories-container">
        {isLoading ? (
          <div className="empty-state">
            <p className="product-not-found">Carregando categorias...</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <ul>
            {categories.map((category) => (
              <li key={category.id} className="categories-card">
                <div className="categories-title">
                  <Tag size={21} />
                  <h3>{category.name}</h3>
                </div>
                <div className="categories-button">
                  <button
                    type="button"
                    className="categories-edit-button"
                    onClick={() => setEditingCategory(category)}
                    aria-label={`Editar categoria ${category.name}`}
                  >
                    <SquarePen size={18} /> Editar
                  </button>
                  <button
                    type="button"
                    className="categories-delete-button"
                    onClick={() => requestDeleteCategoryConfirmation(category)}
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

        {editingCategory && (
          <EditCategoryModal
            category={editingCategory}
            onSave={(data) => updateCategoryMutation.mutateAsync(data)}
            onClose={() => setEditingCategory(null)}
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
