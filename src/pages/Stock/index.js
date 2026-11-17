import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Boxes,
  History,
  LayoutGrid,
  List,
  Minus,
  PackageX,
  Pencil,
  Plus,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { InsightCard } from '@/components/motion/insight-card';
import { NumberTicker } from '@/components/motion/number-ticker';
import { StatusBadge } from '@/components/spaceui/status-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import EditProductModal from '../../components/EditProductModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './style.css';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString('pt-BR');

function getProductStatusMeta(product) {
  const minQty = product.minQuantity ?? 5;
  if (product.qtd === 0) {
    return {
      status: 'error',
      label: 'Sem Estoque',
      badgeTone: 'bg-[var(--ledger-danger-soft)] text-[var(--ledger-danger)] border-red-200',
    };
  }
  if (minQty > 0 && product.qtd <= minQty) {
    return {
      status: 'warning',
      label: 'Estoque Baixo',
      badgeTone: 'bg-[var(--ledger-amber-soft)] text-amber-800 border-amber-300/70',
    };
  }
  return {
    status: 'online',
    label: 'Em Dia',
    badgeTone: 'bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)] border-[var(--ledger-accent)]/20',
  };
}

function getMarginPercent(costPrice, salePrice) {
  const cost = Number(costPrice || 0);
  const sale = Number(salePrice || 0);
  if (cost <= 0 || sale <= 0) return null;
  return ((sale - cost) / cost) * 100;
}

function Stock() {
  const outletContext = useOutletContext() || {};
  const { summary, openModal, openMovements } = outletContext;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || '');
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('ledger_stock_view_mode');
      if (saved === 'list' || saved === 'grid') return saved;
    } catch (_e) {
      // ignore storage errors
    }
    return typeof window !== 'undefined' && window.innerWidth >= 768 ? 'list' : 'grid';
  });
  const [pendingQuantities, setPendingQuantities] = useState({});

  const debounceTimersRef = useRef({});
  const pendingProductUpdatesRef = useRef({});
  const baseQtdRef = useRef({});

  const handleViewModeChange = (nextMode) => {
    if (!nextMode) return;
    setViewMode(nextMode);
    try {
      localStorage.setItem('ledger_stock_view_mode', nextMode);
    } catch (_e) {
      // ignore storage errors
    }
  };

  const [confirmationProps, setConfirmationProps] = useState({
    isOpen: false,
    onConfirm: () => {},
    title: '',
    message: '',
  });

  useEffect(() => {
    const paramCat = searchParams.get('category') || '';
    if (paramCat !== categoryFilter) {
      setCategoryFilter(paramCat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCategoryChange = (value) => {
    const nextCat = value === 'all' || !value ? '' : String(value);
    setCategoryFilter(nextCat);
    if (nextCat) {
      setSearchParams({ category: nextCat }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const { data: products = [], isLoading, isError } = useProducts({
    searchTerm: debouncedSearch,
    stockFilter,
    categoryFilter,
  });

  const { data: categories = [] } = useCategories();

  const { updateProductMutation, deleteProductMutation } = useProductMutations({
    onUpdateSuccess: () => setEditingProduct(null),
    onDeleteSuccess: () => {
      setEditingProduct(null);
      setConfirmationProps({ isOpen: false });
    },
  });

  const updateProductMutateRef = useRef(updateProductMutation.mutate);
  updateProductMutateRef.current = updateProductMutation.mutate;

  useEffect(() => {
    const timers = debounceTimersRef.current;
    const pending = pendingProductUpdatesRef.current;
    const baseQtds = baseQtdRef.current;
    return () => {
      Object.keys(timers).forEach((id) => {
        clearTimeout(timers[id]);
        delete timers[id];
      });
      Object.keys(pending).forEach((id) => {
        const payload = pending[id];
        delete pending[id];
        delete baseQtds[id];
        if (payload) {
          updateProductMutateRef.current(payload);
        }
      });
    };
  }, []);

  const clearPendingProductState = (productId) => {
    if (debounceTimersRef.current[productId]) {
      clearTimeout(debounceTimersRef.current[productId]);
      delete debounceTimersRef.current[productId];
    }
    delete pendingProductUpdatesRef.current[productId];
    delete baseQtdRef.current[productId];
    setPendingQuantities((prev) => {
      if (prev[productId] === undefined) return prev;
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleSaveChanges = (updatedProduct) => {
    clearPendingProductState(updatedProduct.id);
    updateProductMutation.mutate(updatedProduct);
  };

  const handleQuantityChange = (product, amount) => {
    const currentProduct = pendingProductUpdatesRef.current[product.id] || product;
    const newQuantity = currentProduct.qtd + amount;
    if (newQuantity < 0) return;

    if (baseQtdRef.current[product.id] === undefined) {
      baseQtdRef.current[product.id] = currentProduct.qtd;
    }

    const nextProductPayload = {
      ...currentProduct,
      qtd: newQuantity,
      _silentToast: true,
      _baseQtd: baseQtdRef.current[product.id],
    };

    pendingProductUpdatesRef.current[product.id] = nextProductPayload;
    setPendingQuantities((prev) => ({ ...prev, [product.id]: newQuantity }));

    queryClient.setQueriesData({ queryKey: ['products'] }, (old) => {
      if (!Array.isArray(old)) return old;
      return old.map((item) =>
        item.id === product.id ? { ...item, qtd: newQuantity } : item
      );
    });

    if (debounceTimersRef.current[product.id]) {
      clearTimeout(debounceTimersRef.current[product.id]);
    }

    debounceTimersRef.current[product.id] = setTimeout(() => {
      delete debounceTimersRef.current[product.id];
      const finalPayload = pendingProductUpdatesRef.current[product.id];
      delete pendingProductUpdatesRef.current[product.id];
      delete baseQtdRef.current[product.id];

      if (finalPayload) {
        updateProductMutation.mutate(finalPayload, {
          onSettled: () => {
            if (!pendingProductUpdatesRef.current[product.id]) {
              setPendingQuantities((prev) => {
                if (prev[product.id] === undefined) return prev;
                const next = { ...prev };
                delete next[product.id];
                return next;
              });
            }
          },
        });
      }
    }, 450);
  };

  const displayedProducts = products.map((product) =>
    pendingQuantities[product.id] !== undefined
      ? { ...product, qtd: pendingQuantities[product.id] }
      : product
  );

  const handleDeleteRequest = (product) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: `Tem certeza de que deseja excluir o produto "${product.name}"?`,
      onConfirm: () => {
        deleteProductMutation.mutate(product.id);
      },
    });
  };

  const filterChips = [
    { key: 'all', label: 'Todos' },
    { key: 'low', label: 'Estoque Baixo' },
    { key: 'out_of_stock', label: 'Sem Estoque' },
  ];

  const selectedCategoryName = categoryFilter
    ? categories.find((c) => String(c.id) === String(categoryFilter))?.name
    : null;

  return (
    <div className="space-y-6">
      {/* Contextual Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tabular text-[0.72rem] font-semibold uppercase tracking-widest text-[var(--ledger-accent)]">
            Inventário
          </span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
            Controle de Estoque
          </h2>
          <p className="mt-1 text-sm text-[var(--ledger-ink-muted)]">
            Gerencie quantidades em tempo real, níveis mínimos e precificação dos itens.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {openMovements && (
            <button type="button" onClick={openMovements} className="ledger-btn-secondary">
              <History className="size-4 text-[var(--ledger-ink-muted)]" />
              <span>Histórico</span>
            </button>
          )}
          {openModal && (
            <button
              type="button"
              onClick={() => openModal('addProduct')}
              className="ledger-btn-primary"
            >
              <Plus className="size-4" />
              <span>Novo Produto</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Stock KPI Cards */}
      <div className="easeui-theme grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Total de Produtos"
          value={<NumberTicker value={Number(summary?.totalProduct || 0)} format={formatInteger} />}
          icon={<Boxes className="size-4 text-[var(--ledger-accent)]" />}
          className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] shadow-none"
        />

        <InsightCard
          label="Estoque Baixo"
          value={<NumberTicker value={Number(summary?.lowStock || 0)} format={formatInteger} />}
          icon={<AlertTriangle className="size-4 text-[var(--ledger-amber)]" />}
          className={`rounded-xl border bg-[var(--ledger-surface)] shadow-none ${
            Number(summary?.lowStock || 0) > 0
              ? 'border-amber-300/80'
              : 'border-[var(--ledger-border)]'
          }`}
        />

        <InsightCard
          label="Sem Estoque"
          value={<NumberTicker value={Number(summary?.noStock || 0)} format={formatInteger} />}
          icon={<PackageX className="size-4 text-[var(--ledger-danger)]" />}
          className={`rounded-xl border bg-[var(--ledger-surface)] shadow-none ${
            Number(summary?.noStock || 0) > 0
              ? 'border-red-300/80'
              : 'border-[var(--ledger-border)]'
          }`}
        />

        <InsightCard
          label="Custo em Estoque"
          value={
            <div className="flex flex-col">
              <NumberTicker
                value={Number(summary?.totalStockValue || 0)}
                format={formatCurrency}
                className="text-xl sm:text-2xl"
              />
              <span className="font-mono-tabular mt-1 text-[0.72rem] font-medium text-[var(--ledger-ink-subtle)]">
                Potencial de venda: {formatCurrency(summary?.totalSaleValue || 0)}
              </span>
            </div>
          }
          icon={<Wallet className="size-4 text-[var(--ledger-accent)]" />}
          className="rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] shadow-none"
        />
      </div>

      {/* Filter Toolbar + View Mode Switcher */}
      <div className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="ledger-search-wrapper min-w-0 flex-1 sm:max-w-md">
              <Search className="ledger-search-icon" />
              <input
                type="text"
                placeholder="Buscar produto por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ledger-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar busca"
                  className="ledger-search-clear"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Select value={categoryFilter || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger
                aria-label="Filtrar por categoria"
                className="w-full sm:w-56 shrink-0"
              >
                <SelectValue>
                  {() => selectedCategoryName || 'Todas as categorias'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Chips */}
            <div className="inline-flex flex-wrap items-center gap-1.5">
              {filterChips.map((chip) => {
                const active = stockFilter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setStockFilter(chip.key)}
                    className={`rounded-lg px-3 py-2 sm:py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[var(--ledger-sidebar-bg)] text-white'
                        : 'border border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-muted)] hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* HextaUI Tabs View Switcher */}
            <Tabs value={viewMode} onValueChange={handleViewModeChange} className="w-auto">
              <TabsList className="h-9 rounded-lg border border-[var(--ledger-border)] bg-[var(--ledger-bg)] p-0.5">
                <TabsTrigger
                  value="grid"
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold data-[active]:bg-[var(--ledger-surface)] data-[active]:text-[var(--ledger-ink)] data-[active]:shadow-xs"
                >
                  <LayoutGrid className="size-3.5" />
                  <span>Grade</span>
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold data-[active]:bg-[var(--ledger-surface)] data-[active]:text-[var(--ledger-ink)] data-[active]:shadow-xs"
                >
                  <List className="size-3.5" />
                  <span>Lista</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Product Listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] py-16 text-sm text-[var(--ledger-ink-subtle)]">
          <Spinner className="size-6 text-[var(--ledger-accent)]" />
          <span>Carregando produtos...</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--ledger-danger-soft)] p-5 text-sm font-medium text-[var(--ledger-danger)]">
          Erro ao carregar produtos. Verifique a conexão com o servidor.
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-16 text-center">
          <Boxes className="size-8 text-[var(--ledger-ink-subtle)]" />
          <div>
            <p className="text-base font-bold text-[var(--ledger-ink)]">
              Nenhum produto encontrado
            </p>
            <p className="mt-1 text-sm text-[var(--ledger-ink-subtle)]">
              Ajuste os filtros aplicados ou cadastre um novo item no estoque.
            </p>
          </div>
          {openModal && (
            <button
              type="button"
              onClick={() => openModal('addProduct')}
              className="ledger-btn-primary mt-1"
            >
              <Plus className="size-4" />
              <span>Adicionar Produto</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View: Technical Spec Cards */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedProducts.map((product) => {
            const statusMeta = getProductStatusMeta(product);
            const margin = getMarginPercent(product.costPrice, product.salePrice);
            const categoryLabel =
              product.categoryName || product.category?.name || 'Sem Categoria';

            return (
              <article
                key={product.id}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4 transition-all hover:border-[var(--ledger-border-strong)] hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate rounded-md border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-muted)]">
                      {categoryLabel}
                    </span>

                    <div className="spaceui-theme shrink-0">
                      <StatusBadge
                        status={statusMeta.status}
                        size="xs"
                        animated={product.qtd === 0}
                        className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold ${statusMeta.badgeTone}`}
                      >
                        {statusMeta.label}
                      </StatusBadge>
                    </div>
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-[1.02rem] font-bold leading-snug text-[var(--ledger-ink)]">
                    {product.name}
                  </h3>

                  <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 p-2.5">
                    <div>
                      <span className="block text-[0.66rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                        Custo
                      </span>
                      <span className="font-mono-tabular mt-0.5 block text-xs font-semibold text-[var(--ledger-ink-muted)]">
                        {formatCurrency(product.costPrice)}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[0.66rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                        Venda
                      </span>
                      <span className="font-mono-tabular mt-0.5 block text-xs font-bold text-[var(--ledger-ink)]">
                        {formatCurrency(product.salePrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[0.66rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                        {margin !== null ? 'Margem' : 'Mínimo'}
                      </span>
                      <span className="font-mono-tabular mt-0.5 block text-xs font-semibold text-[var(--ledger-accent)]">
                        {margin !== null
                          ? `${margin >= 0 ? '+' : ''}${margin.toFixed(0)}%`
                          : `${product.minQuantity ?? 5} un.`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Touch-friendly Stepper + Edit Strip */}
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--ledger-border)] pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product, -1)}
                      disabled={product.qtd <= 0}
                      aria-label={`Diminuir quantidade de ${product.name}`}
                      className="flex size-10 sm:size-8 items-center justify-center rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] transition-colors hover:bg-[var(--ledger-surface-muted)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="size-4 sm:size-3.5" />
                    </button>

                    <div className="min-w-[4.5rem] rounded-lg border border-[var(--ledger-border)] bg-[var(--ledger-surface)] px-2.5 py-1.5 sm:py-1 text-center">
                      <span className="font-mono-tabular text-sm font-bold text-[var(--ledger-ink)]">
                        {product.qtd}
                      </span>
                      <span className="ml-1 text-[0.7rem] font-medium text-[var(--ledger-ink-subtle)]">
                        un.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(product, 1)}
                      aria-label={`Aumentar quantidade de ${product.name}`}
                      className="flex size-10 sm:size-8 items-center justify-center rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] transition-colors hover:border-[var(--ledger-accent)] hover:bg-[var(--ledger-accent-soft)] hover:text-[var(--ledger-accent)] active:scale-95"
                    >
                      <Plus className="size-4 sm:size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {product.minQuantity > 0 && (
                      <span className="font-mono-tabular hidden text-[0.7rem] text-[var(--ledger-ink-subtle)] sm:inline">
                        mín {product.minQuantity}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingProduct(product)}
                      className="inline-flex h-10 sm:h-8 items-center gap-1.5 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-3 sm:px-2.5 text-xs font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
                    >
                      <Pencil className="size-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* List View: Dense Ledger Table */
        <div className="overflow-hidden rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[0.7rem] font-bold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Custo</th>
                  <th className="px-4 py-3 text-right">Venda</th>
                  <th className="px-4 py-3 text-center">Mínimo</th>
                  <th className="px-4 py-3 text-center">Quantidade</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ledger-border)]">
                {displayedProducts.map((product) => {
                  const statusMeta = getProductStatusMeta(product);
                  const categoryLabel =
                    product.categoryName || product.category?.name || 'Sem Categoria';

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-[var(--ledger-surface-hover)]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--ledger-ink)]">{product.name}</div>
                        <div className="text-xs text-[var(--ledger-ink-subtle)]">
                          {categoryLabel}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="spaceui-theme inline-block">
                          <StatusBadge
                            status={statusMeta.status}
                            size="xs"
                            animated={product.qtd === 0}
                            className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold ${statusMeta.badgeTone}`}
                          >
                            {statusMeta.label}
                          </StatusBadge>
                        </div>
                      </td>
                      <td className="font-mono-tabular px-4 py-3 text-right text-xs font-medium text-[var(--ledger-ink-muted)]">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="font-mono-tabular px-4 py-3 text-right text-xs font-bold text-[var(--ledger-ink)]">
                        {formatCurrency(product.salePrice)}
                      </td>
                      <td className="font-mono-tabular px-4 py-3 text-center text-xs text-[var(--ledger-ink-subtle)]">
                        {product.minQuantity ?? 5}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product, -1)}
                            disabled={product.qtd <= 0}
                            aria-label={`Diminuir quantidade de ${product.name}`}
                            className="flex size-8 sm:size-7 items-center justify-center rounded-md border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-surface-muted)] disabled:opacity-40"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="font-mono-tabular min-w-[2.5rem] text-center text-xs font-bold text-[var(--ledger-ink)]">
                            {product.qtd}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product, 1)}
                            aria-label={`Aumentar quantidade de ${product.name}`}
                            className="flex size-8 sm:size-7 items-center justify-center rounded-md border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] hover:border-[var(--ledger-accent)] hover:bg-[var(--ledger-accent-soft)] hover:text-[var(--ledger-accent)]"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-2.5 text-xs font-semibold text-[var(--ledger-ink-muted)] hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
                        >
                          <Pencil className="size-3.5" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditProductModal
        product={editingProduct}
        categories={categories}
        onSave={handleSaveChanges}
        onClose={() => setEditingProduct(null)}
        onDeleteRequest={handleDeleteRequest}
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

export default Stock;
