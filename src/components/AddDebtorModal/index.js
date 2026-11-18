import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Boxes,
  Minus,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useDebtors, useDebtorMutations } from '../../hooks/useDebtors';
import { useProducts } from '../../hooks/useProducts';
import Modal from '../Modal';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

function AddDebtorModal({ isOpen, onClose, initialClientName = '' }) {
  const location = useLocation();
  const pickerContainerRef = useRef(null);

  const [debtorName, setDebtorName] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [debtorValue, setDebtorValue] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deductFromStock, setDeductFromStock] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isValueManuallyEdited, setIsValueManuallyEdited] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDebtorName(initialClientName || '');
      setExtraNote('');
      setDebtorValue('');
      setSelectedItems([]);
      setDeductFromStock(true);
      setProductSearch('');
      setIsPickerOpen(false);
      setIsValueManuallyEdited(false);
      setFormError('');
    }
  }, [isOpen, initialClientName]);

  useEffect(() => {
    if (!isPickerOpen) return undefined;
    const handleClickOutside = (e) => {
      if (pickerContainerRef.current && !pickerContainerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const { data: debtorsData } = useDebtors({
    paid: false,
    enabled: Boolean(isOpen),
  });
  const { data: settledDebtorsData } = useDebtors({
    paid: true,
    enabled: Boolean(isOpen),
  });
  const { data: products = [], isLoading: isProductsLoading } = useProducts({
    enabled: Boolean(isOpen),
  });

  const existingDebtors = useMemo(
    () => debtorsData?.debtorDTOList || [],
    [debtorsData]
  );
  const settledDebtors = useMemo(
    () => settledDebtorsData?.debtorDTOList || [],
    [settledDebtorsData]
  );

  const matchedDebtor = useMemo(() => {
    const normalized = debtorName.trim().toLowerCase();
    if (!normalized) return null;
    return existingDebtors.find((d) => d.name?.trim().toLowerCase() === normalized) || null;
  }, [existingDebtors, debtorName]);

  const matchedSettledDebtor = useMemo(() => {
    const normalized = debtorName.trim().toLowerCase();
    if (!normalized || matchedDebtor) return null;
    return settledDebtors.find((d) => d.name?.trim().toLowerCase() === normalized) || null;
  }, [settledDebtors, debtorName, matchedDebtor]);

  const uniqueDebtorNames = useMemo(
    () =>
      Array.from(
        new Set(
          [...existingDebtors, ...settledDebtors]
            .map((d) => d.name?.trim())
            .filter(Boolean)
        )
      ),
    [existingDebtors, settledDebtors]
  );

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    const matches = term
      ? products.filter(
          (p) =>
            p.name?.toLowerCase().includes(term) ||
            p.categoryName?.toLowerCase().includes(term)
        )
      : products;

    return [...matches].sort((a, b) => {
      const aInStock = Number(a.qtd || 0) > 0 ? 0 : 1;
      const bInStock = Number(b.qtd || 0) > 0 ? 0 : 1;
      if (aInStock !== bInStock) return aInStock - bInStock;
      return (a.name || '').localeCompare(b.name || '', 'pt-BR');
    });
  }, [products, productSearch]);

  const selectedQuantityMap = useMemo(() => {
    const map = new Map();
    selectedItems.forEach((item) => {
      map.set(item.productId, item.quantity);
    });
    return map;
  }, [selectedItems]);

  const itemsSummaryText = useMemo(
    () => selectedItems.map((item) => `${item.quantity}x ${item.name}`).join(', '),
    [selectedItems]
  );

  const itemsTotalValue = useMemo(
    () =>
      Number(
        selectedItems
          .reduce((sum, item) => sum + Number(item.salePrice || 0) * item.quantity, 0)
          .toFixed(2)
      ),
    [selectedItems]
  );

  useEffect(() => {
    if (isValueManuallyEdited) return;
    if (selectedItems.length === 0) return;
    setDebtorValue(itemsTotalValue > 0 ? itemsTotalValue.toFixed(2) : '');
  }, [itemsTotalValue, selectedItems.length, isValueManuallyEdited]);

  const { addDebtorMutation, updateDebtorMutation } = useDebtorMutations({
    onAddSuccess: () => onClose?.(),
    onUpdateSuccess: () => onClose?.(),
  });

  const isPending = addDebtorMutation.isPending || updateDebtorMutation.isPending;

  const handleAddStockProduct = (product) => {
    const availableQtd = Number(product.qtd || 0);
    if (deductFromStock && availableQtd <= 0) return;

    setFormError('');
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (deductFromStock && existing.quantity >= availableQtd) {
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          salePrice: Number(product.salePrice || 0),
          availableQtd,
          quantity: 1,
        },
      ];
    });
    setProductSearch('');
    setIsPickerOpen(false);
  };

  const handleUpdateItemQuantity = (productId, delta) => {
    setFormError('');
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const nextQty = item.quantity + delta;
        if (nextQty < 1) return item;
        if (deductFromStock && nextQty > item.availableQtd) return item;
        return { ...item, quantity: nextQty };
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setFormError('');
    setSelectedItems((prev) => {
      const next = prev.filter((item) => item.productId !== productId);
      if (next.length === 0 && !isValueManuallyEdited) {
        setDebtorValue('');
      }
      return next;
    });
  };

  const handleRestoreItemsTotal = () => {
    setIsValueManuallyEdited(false);
    setDebtorValue(itemsTotalValue > 0 ? itemsTotalValue.toFixed(2) : '');
    setFormError('');
  };

  const parsedDebtorValue = parseFloat(debtorValue);
  const showRestoreTotalButton =
    selectedItems.length > 0 &&
    itemsTotalValue > 0 &&
    isValueManuallyEdited &&
    Math.abs((Number.isFinite(parsedDebtorValue) ? parsedDebtorValue : 0) - itemsTotalValue) >= 0.01;

  const hasStockConflict =
    deductFromStock && selectedItems.some((item) => item.quantity > item.availableQtd);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = debtorName.trim();
    if (!trimmedName) {
      setFormError('Informe o nome do cliente.');
      return;
    }

    if (Number.isNaN(parsedDebtorValue) || parsedDebtorValue < 0) {
      setFormError('Informe um valor devido válido.');
      return;
    }

    if (deductFromStock) {
      const insufficientItem = selectedItems.find(
        (item) => item.quantity > item.availableQtd
      );
      if (insufficientItem) {
        setFormError(
          `Quantidade de "${insufficientItem.name}" excede o estoque disponível (${insufficientItem.availableQtd} un.).`
        );
        return;
      }
    }

    const newDesc = [itemsSummaryText, extraNote.trim()]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 255);

    const stockItemsPayload = deductFromStock
      ? selectedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      : [];

    const isOutsideDebtorsView = !location.pathname.includes('/debtors');

    if (matchedDebtor) {
      const nextValue = Number((Number(matchedDebtor.value || 0) + parsedDebtorValue).toFixed(2));
      const combinedDesc = [matchedDebtor.description?.trim(), newDesc]
        .filter(Boolean)
        .join(' • ')
        .slice(0, 255);

      updateDebtorMutation.mutate({
        id: matchedDebtor.id,
        name: matchedDebtor.name,
        description: combinedDesc,
        value: nextValue,
        transactionNote: newDesc || 'Nova compra adicionada',
        stockItems: stockItemsPayload,
        deductFromStock,
        _customToast: `Valor somado ao saldo de ${matchedDebtor.name}`,
      });
      return;
    }

    addDebtorMutation.mutate({
      name: trimmedName,
      description: newDesc,
      value: parsedDebtorValue,
      stockItems: stockItemsPayload,
      deductFromStock,
      _customToast: isOutsideDebtorsView ? 'Lançamento salvo na caderneta' : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Lançamento na Caderneta">
      <form className="ledger-form" onSubmit={handleSubmit}>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] px-3 py-2.5 text-xs font-medium text-[var(--ledger-danger)]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Client Field */}
        <div className="ledger-field">
          <label htmlFor="debtorName">Nome do Cliente</label>
          <input
            id="debtorName"
            list="existing-debtors-datalist"
            className="ledger-input"
            type="text"
            value={debtorName}
            onChange={(e) => {
              setDebtorName(e.target.value);
              if (formError) setFormError('');
            }}
            placeholder="Ex: João da Silva"
            required
            autoFocus={!initialClientName}
          />
          <datalist id="existing-debtors-datalist">
            {uniqueDebtorNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          {matchedDebtor && (
            <div className="mt-1.5 rounded-xl border border-amber-300/80 bg-[var(--ledger-amber-soft)] px-3 py-2.5 text-xs text-amber-950">
              <p className="font-semibold">
                Cliente já possui saldo em aberto de{' '}
                <span className="font-mono-tabular font-bold">
                  {formatCurrency(matchedDebtor.value)}
                </span>
                .
              </p>
              <p className="mt-0.5 text-amber-900">
                Este lançamento será somado automaticamente à ficha existente de{' '}
                <strong>{matchedDebtor.name}</strong>.
              </p>
              {Number.isFinite(parsedDebtorValue) && parsedDebtorValue > 0 && (
                <p className="font-mono-tabular mt-1.5 border-t border-amber-300/60 pt-1.5 font-semibold text-amber-950">
                  Saldo atual: {formatCurrency(matchedDebtor.value)} &rarr; Novo total:{' '}
                  {formatCurrency(Number(matchedDebtor.value || 0) + parsedDebtorValue)}
                </p>
              )}
            </div>
          )}

          {matchedSettledDebtor && (
            <div className="mt-1.5 rounded-xl border border-[var(--ledger-accent)]/25 bg-[var(--ledger-accent-soft)]/70 px-3 py-2 text-xs text-[var(--ledger-ink)]">
              <p className="font-semibold text-[var(--ledger-accent)]">
                Cliente recorrente encontrado ({matchedSettledDebtor.name})
              </p>
              <p className="mt-0.5 text-[var(--ledger-ink-muted)]">
                A ficha anterior já quitada será reaberta mantendo todo o histórico de compras.
              </p>
            </div>
          )}
        </div>

        {/* Stock Product Picker */}
        <div ref={pickerContainerRef} className="ledger-field">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="debtor-product-search">Produtos do Estoque (opcional)</label>
            {selectedItems.length > 0 && (
              <span className="font-mono-tabular text-[0.72rem] font-semibold text-[var(--ledger-accent)]">
                {selectedItems.reduce((acc, i) => acc + i.quantity, 0)}{' '}
                {selectedItems.reduce((acc, i) => acc + i.quantity, 0) === 1
                  ? 'unidade'
                  : 'unidades'}
              </span>
            )}
          </div>

          <div className="relative">
            <div className="ledger-search-wrapper">
              <Search className="ledger-search-icon" />
              <input
                id="debtor-product-search"
                type="text"
                value={productSearch}
                onFocus={() => setIsPickerOpen(true)}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setIsPickerOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && isPickerOpen) {
                    e.stopPropagation();
                    setIsPickerOpen(false);
                  }
                }}
                placeholder="Buscar produto cadastrado para somar e baixar..."
                className="ledger-search-input"
              />
              {(productSearch || isPickerOpen) && (
                <button
                  type="button"
                  onClick={() => {
                    if (productSearch) {
                      setProductSearch('');
                    } else {
                      setIsPickerOpen(false);
                    }
                  }}
                  aria-label={productSearch ? 'Limpar busca de produto' : 'Fechar lista de produtos'}
                  className="ledger-search-clear"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {isPickerOpen && (
              <div className="mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] p-1 shadow-lg">
                {isProductsLoading ? (
                  <p className="px-3 py-3 text-center text-xs text-[var(--ledger-ink-subtle)]">
                    Carregando catálogo...
                  </p>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center gap-1 px-3 py-4 text-center">
                    <Boxes className="size-5 text-[var(--ledger-ink-subtle)]" />
                    <p className="text-xs font-medium text-[var(--ledger-ink-muted)]">
                      {products.length === 0
                        ? 'Nenhum produto cadastrado no estoque.'
                        : 'Nenhum produto encontrado para essa busca.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {filteredProducts.map((product) => {
                      const available = Number(product.qtd || 0);
                      const inCartQty = selectedQuantityMap.get(product.id) || 0;
                      const outOfStock = available <= 0;
                      const reachedMax = deductFromStock && inCartQty >= available;
                      const isDisabled = deductFromStock && (outOfStock || reachedMax);
                      const price = Number(product.salePrice || 0);

                      return (
                        <button
                          key={product.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleAddStockProduct(product)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--ledger-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-semibold text-[var(--ledger-ink)]">
                                {product.name}
                              </span>
                              {inCartQty > 0 && (
                                <span className="font-mono-tabular shrink-0 rounded bg-[var(--ledger-accent-soft)] px-1.5 py-0.5 text-[0.66rem] font-bold text-[var(--ledger-accent)]">
                                  {inCartQty}x
                                </span>
                              )}
                            </div>
                            <span className="text-[0.7rem] text-[var(--ledger-ink-subtle)]">
                              {product.categoryName || 'Estoque'} ·{' '}
                              <span
                                className={
                                  outOfStock ? 'font-semibold text-[var(--ledger-danger)]' : ''
                                }
                              >
                                {outOfStock ? 'Sem estoque' : `${available} un. disponíveis`}
                              </span>
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span
                              className={`font-mono-tabular text-xs font-bold ${
                                price > 0 ? 'text-[var(--ledger-ink)]' : 'text-amber-700'
                              }`}
                            >
                              {price > 0 ? formatCurrency(price) : 'Sem preço'}
                            </span>
                            <span className="inline-flex size-6 items-center justify-center rounded-md border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-accent)]">
                              <Plus className="size-3.5" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Items List */}
          {selectedItems.length > 0 && (
            <div className="mt-2 space-y-2 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)]/70 p-2.5">
              <div className="space-y-1.5">
                {selectedItems.map((item) => {
                  const exceedsStock = deductFromStock && item.quantity > item.availableQtd;
                  const remainingStock = Math.max(0, item.availableQtd - item.quantity);
                  const subtotal = Number(item.salePrice || 0) * item.quantity;

                  return (
                    <div
                      key={item.productId}
                      className={`rounded-lg border bg-[var(--ledger-surface)] px-2.5 py-2 ${
                        exceedsStock ? 'border-red-300' : 'border-[var(--ledger-border)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-[var(--ledger-ink)]">
                            {item.name}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem]">
                            {item.salePrice > 0 ? (
                              <span className="font-mono-tabular text-[var(--ledger-ink-muted)]">
                                {formatCurrency(item.salePrice)}/un.
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                                <AlertTriangle className="size-3" />
                                Sem preço de venda
                              </span>
                            )}
                            <span className="text-[var(--ledger-ink-subtle)]">&bull;</span>
                            {exceedsStock ? (
                              <span className="font-semibold text-[var(--ledger-danger)]">
                                Máx. disponível: {item.availableQtd} un.
                              </span>
                            ) : deductFromStock ? (
                              <span className="font-mono-tabular text-[var(--ledger-ink-subtle)]">
                                Estoque: {item.availableQtd} &rarr;{' '}
                                <strong className="text-[var(--ledger-ink)]">
                                  {remainingStock} un.
                                </strong>
                              </span>
                            ) : (
                              <span className="text-[var(--ledger-ink-subtle)]">
                                Sem baixa no estoque
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          aria-label={`Remover ${item.name}`}
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--ledger-ink-subtle)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-danger)]"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--ledger-border)]/70 pt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.productId, -1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            className="flex size-7 items-center justify-center rounded-md border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] transition-colors hover:bg-[var(--ledger-surface-muted)] disabled:opacity-40"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="font-mono-tabular min-w-[2.25rem] text-center text-xs font-bold text-[var(--ledger-ink)]">
                            {item.quantity}x
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item.productId, 1)}
                            disabled={deductFromStock && item.quantity >= item.availableQtd}
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            className="flex size-7 items-center justify-center rounded-md border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink)] transition-colors hover:border-[var(--ledger-accent)] hover:bg-[var(--ledger-accent-soft)] hover:text-[var(--ledger-accent)] disabled:opacity-40"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <span className="font-mono-tabular text-xs font-bold text-[var(--ledger-ink)]">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--ledger-border)] bg-[var(--ledger-surface)] px-2.5 py-2 text-xs text-[var(--ledger-ink)]">
                <input
                  type="checkbox"
                  checked={deductFromStock}
                  onChange={(e) => {
                    setDeductFromStock(e.target.checked);
                    if (formError) setFormError('');
                  }}
                  className="size-4 accent-[var(--ledger-accent)]"
                />
                <span className="font-medium">
                  Baixar itens automaticamente do estoque
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Description / Note */}
        {selectedItems.length > 0 ? (
          <div className="ledger-field">
            <label htmlFor="debtorDescription">Observação Adicional (opcional)</label>
            <div className="mb-1 rounded-lg border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-3 py-2 text-xs text-[var(--ledger-ink-muted)]">
              <span className="font-semibold text-[var(--ledger-ink)]">Itens na ficha:</span>{' '}
              {itemsSummaryText}
            </div>
            <input
              id="debtorDescription"
              className="ledger-input"
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="Ex: Entregue em casa, desconto combinado..."
              maxLength={180}
            />
          </div>
        ) : (
          <div className="ledger-field">
            <label htmlFor="debtorDescription">Descrição / Itens Avulsos</label>
            <textarea
              id="debtorDescription"
              className="ledger-textarea"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="Ex: 1 Coca-Cola 2L, 4 Biscoitos Amori..."
              maxLength={255}
            />
          </div>
        )}

        {/* Value Input */}
        <div className="ledger-field">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="debtorValue">
              {matchedDebtor ? 'Valor a Somar ao Saldo' : 'Valor Devido'}
            </label>
            {showRestoreTotalButton && (
              <button
                type="button"
                onClick={handleRestoreItemsTotal}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.72rem] font-semibold text-[var(--ledger-accent)] transition-colors hover:bg-[var(--ledger-accent-soft)]"
              >
                <RotateCcw className="size-3" />
                <span>Usar soma dos itens ({formatCurrency(itemsTotalValue)})</span>
              </button>
            )}
          </div>
          <div className="ledger-input-affix">
            <span className="affix-prefix">R$</span>
            <input
              id="debtorValue"
              className="ledger-input mono"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={debtorValue}
              onChange={(e) => {
                setDebtorValue(e.target.value);
                setIsValueManuallyEdited(true);
                if (formError) setFormError('');
              }}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="ledger-form-actions">
          <button
            type="button"
            className="ledger-btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="ledger-btn-primary"
            disabled={isPending || hasStockConflict}
          >
            {isPending ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddDebtorModal;
