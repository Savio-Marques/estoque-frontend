import React, { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  Pencil,
  Plus,
  Search,
  Tag,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { Spinner } from '@/components/ui/spinner';
import EditCategoryModal from '../../components/EditCategoryModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const CATEGORY_SWATCHES = [
  {
    iconWrap: 'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)] border-[var(--ledger-accent)]/20',
    bar: 'bg-[var(--ledger-accent)]',
  },
  {
    iconWrap: 'bg-[var(--ledger-amber-soft)] text-amber-800 border-amber-300/60',
    bar: 'bg-[var(--ledger-amber)]',
  },
  {
    iconWrap: 'bg-sky-50 text-sky-700 border-sky-200',
    bar: 'bg-sky-600',
  },
  {
    iconWrap: 'bg-stone-100 text-[var(--ledger-ink-muted)] border-[var(--ledger-border-strong)]',
    bar: 'bg-stone-600',
  },
];

const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString('pt-BR');

function Categories() {
  const outletContext = useOutletContext() || {};
  const { openModal } = outletContext;

  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const { data: categories = [], isLoading, isError } = useCategories();
  const { data: products = [] } = useProducts();

  const { updateCategoryMutation, deleteCategoryMutation } = useCategoryMutations({
    onUpdateSuccess: () => setEditingCategory(null),
    onDeleteSuccess: () => setConfirmationProps({ isOpen: false }),
  });

  const statsByCategory = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const catId = product.categoryId || product.category?.id;
      if (!catId) return;
      const entry = map.get(catId) || { count: 0, totalUnits: 0 };
      entry.count += 1;
      entry.totalUnits += Number(product.qtd || 0);
      map.set(catId, entry);
    });
    return map;
  }, [products]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  const activeCategoriesCount = useMemo(
    () => categories.filter((c) => (statsByCategory.get(c.id)?.count || 0) > 0).length,
    [categories, statsByCategory]
  );

  const totalProductsCount = products.length;

  const handleSaveCategory = (updatedCat) => {
    updateCategoryMutation.mutate(updatedCat);
  };

  const handleDeleteRequest = (category) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Excluir Categoria',
      message: `Tem certeza que deseja excluir a categoria "${category.name}"?`,
      onConfirm: () => deleteCategoryMutation.mutateAsync(category.id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
              Gerenciar Categorias
            </h2>
            {!isLoading && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono-tabular rounded-md border border-[var(--ledger-border)] bg-[var(--ledger-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--ledger-ink-muted)]">
                  {formatInteger(categories.length)}{' '}
                  {categories.length === 1 ? 'categoria' : 'categorias'}
                </span>
                <span className="font-mono-tabular rounded-md border border-[var(--ledger-border)] bg-[var(--ledger-surface)] px-2 py-0.5 text-xs font-medium text-[var(--ledger-ink-subtle)]">
                  {formatInteger(activeCategoriesCount)} em uso ·{' '}
                  {formatInteger(totalProductsCount)} produtos
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 hidden text-sm text-[var(--ledger-ink-muted)] sm:block">
            Organize os produtos do estoque em grupos claros e acompanhe a distribuição por setor.
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

      {/* Search Filter */}
      {categories.length > 0 && (
        <div className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-3.5 sm:p-4">
          <div className="ledger-search-wrapper max-w-md">
            <Search className="ledger-search-icon" />
            <input
              type="text"
              placeholder="Filtrar categoria pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar filtro de categoria"
                className="ledger-search-clear"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

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
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-12 text-center">
          <Tags className="size-7 text-[var(--ledger-ink-subtle)]" />
          <p className="text-sm font-semibold text-[var(--ledger-ink)]">
            Nenhuma categoria encontrada para &ldquo;{searchTerm}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((cat, index) => {
            const swatch = CATEGORY_SWATCHES[index % CATEGORY_SWATCHES.length];
            const stats = statsByCategory.get(cat.id) || { count: 0, totalUnits: 0 };
            const sharePercent =
              totalProductsCount > 0 ? Math.round((stats.count / totalProductsCount) * 100) : 0;

            return (
              <article
                key={cat.id}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4.5 transition-all hover:border-[var(--ledger-border-strong)] hover:shadow-sm"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${swatch.iconWrap}`}
                      >
                        <Tag className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-[1.02rem] font-bold text-[var(--ledger-ink)]">
                          {cat.name}
                        </h3>
                        <span className="font-mono-tabular text-[0.7rem] font-medium text-[var(--ledger-ink-subtle)]">
                          CAT #{String(cat.id).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/dashboard/stock?category=${cat.id}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-2.5 py-1 text-[0.72rem] font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:border-[var(--ledger-accent)] hover:bg-[var(--ledger-accent-soft)] hover:text-[var(--ledger-accent)]"
                    >
                      <span>Ver itens</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  {/* Inventory Distribution Block */}
                  <div className="mt-4 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--ledger-ink-muted)]">
                        <strong className="font-mono-tabular text-[var(--ledger-ink)]">
                          {stats.count}
                        </strong>{' '}
                        {stats.count === 1 ? 'produto' : 'produtos'}
                      </span>
                      <span className="font-mono-tabular font-semibold text-[var(--ledger-ink-subtle)]">
                        {formatInteger(stats.totalUnits)} un. em estoque
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ledger-border)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${swatch.bar}`}
                        style={{ width: `${stats.count > 0 ? Math.max(sharePercent, 6) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Touch-Friendly Footer Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--ledger-border)] pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(cat)}
                    className="inline-flex h-10 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-3 text-xs font-semibold text-[var(--ledger-ink)] transition-colors hover:bg-[var(--ledger-surface-muted)] active:scale-95"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(cat)}
                    aria-label={`Excluir categoria ${cat.name}`}
                    className="inline-flex h-10 sm:h-9 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] px-3 text-xs font-semibold text-[var(--ledger-danger)] transition-colors hover:bg-[var(--ledger-danger)] hover:text-white active:scale-95"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <EditCategoryModal
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={() => setEditingCategory(null)}
        isPending={updateCategoryMutation.isPending}
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
