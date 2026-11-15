import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pencil, Plus, Tag, Tags, Trash2 } from 'lucide-react';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import { Spinner } from '@/components/ui/spinner';
import EditCategoryModal from '../../components/EditCategoryModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './style.css';

function Categories() {
  const outletContext = useOutletContext() || {};
  const { openModal } = outletContext;

  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const { data: categories = [], isLoading, isError } = useCategories();

  const { updateCategoryMutation, deleteCategoryMutation } = useCategoryMutations({
    onUpdateSuccess: () => setEditingCategory(null),
    onDeleteSuccess: () => setConfirmationProps({ isOpen: false }),
  });

  const handleSaveCategory = (updatedCat) => {
    updateCategoryMutation.mutate({ id: updatedCat.id, categoryData: updatedCat });
  };

  const handleDeleteRequest = (category) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Excluir Categoria',
      message: `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      onConfirm: () => {
        deleteCategoryMutation.mutate(category.id);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tabular text-[0.72rem] font-semibold uppercase tracking-widest text-[var(--ledger-accent)]">
            Taxonomia
          </span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
            Gerenciar Categorias
          </h2>
          <p className="mt-1 text-sm text-[var(--ledger-ink-muted)]">
            Organize os produtos do estoque em grupos claros para agilizar buscas e filtros.
          </p>
        </div>

        {openModal && (
          <button
            type="button"
            onClick={() => openModal('addCategory')}
            className="ledger-btn-primary self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>Nova Categoria</span>
          </button>
        )}
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] py-16 text-sm text-[var(--ledger-ink-subtle)]">
          <Spinner className="size-6 text-[var(--ledger-accent)]" />
          <span>Carregando categorias...</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--ledger-danger-soft)] p-5 text-sm font-medium text-[var(--ledger-danger)]">
          Erro ao carregar categorias.
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-16 text-center">
          <Tags className="size-8 text-[var(--ledger-ink-subtle)]" />
          <div>
            <p className="text-base font-bold text-[var(--ledger-ink)]">
              Nenhuma categoria cadastrada
            </p>
            <p className="mt-1 text-sm text-[var(--ledger-ink-subtle)]">
              Crie sua primeira categoria para começar a organizar o inventário.
            </p>
          </div>
          {openModal && (
            <button
              type="button"
              onClick={() => openModal('addCategory')}
              className="ledger-btn-primary mt-1"
            >
              <Plus className="size-4" />
              <span>Criar Categoria</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4 transition-all hover:border-[var(--ledger-border-strong)] hover:shadow-xs"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-accent)]">
                  <Tag className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.95rem] font-bold text-[var(--ledger-ink)]">
                    {cat.name}
                  </p>
                  <p className="font-mono-tabular text-[0.7rem] text-[var(--ledger-ink-subtle)]">
                    ID #{cat.id}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingCategory(cat)}
                  title="Editar categoria"
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-2.5 text-xs font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
                >
                  <Pencil className="size-3.5" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(cat)}
                  title="Excluir categoria"
                  aria-label={`Excluir categoria ${cat.name}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)] transition-colors hover:bg-[var(--ledger-danger)] hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditCategoryModal
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setEditingCategory(null)}
      />

      <ConfirmationModal
        isOpen={confirmationProps.isOpen}
        onClose={() => setConfirmationProps({ isOpen: false })}
        onConfirm={confirmationProps.onConfirm}
        title={confirmationProps.title}
      >
        {confirmationProps.message}
      </ConfirmationModal>
    </div>
  );
}

export default Categories;
