import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Plus, TrendingUp, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const MARKUP_PRESETS = [
  { label: '+30%', factor: 1.3 },
  { label: '+50%', factor: 1.5 },
  { label: '+100%', factor: 2.0 },
];

export function CategoryFieldWithCreate({
  id,
  categories = [],
  value,
  onChange,
  autoOpenWhenEmpty = false,
  disabled = false,
}) {
  const { isLoading: isCategoriesLoading } = useCategories();
  const { addCategoryMutation } = useCategoryMutations();

  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [justCreatedCategory, setJustCreatedCategory] = useState(null);
  const inlineInputRef = useRef(null);

  const mergedCategories = useMemo(() => {
    if (!justCreatedCategory) return categories;
    const exists = categories.some((c) => String(c.id) === String(justCreatedCategory.id));
    return exists ? categories : [...categories, justCreatedCategory];
  }, [categories, justCreatedCategory]);

  useEffect(() => {
    if (
      autoOpenWhenEmpty &&
      !isCategoriesLoading &&
      mergedCategories.length === 0 &&
      !justCreatedCategory
    ) {
      setIsCreating(true);
    }
  }, [autoOpenWhenEmpty, isCategoriesLoading, mergedCategories.length, justCreatedCategory]);

  const handleOpenInlineCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      inlineInputRef.current?.focus();
    }, 20);
  };

  const handleCancelInlineCreate = () => {
    setNewCategoryName('');
    setIsCreating(false);
  };

  const handleCreateCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || addCategoryMutation.isPending) return;

    try {
      const created = await addCategoryMutation.mutateAsync(trimmed);
      if (created?.id != null) {
        setJustCreatedCategory(created);
        onChange(String(created.id));
      }
      setNewCategoryName('');
      setIsCreating(false);
    } catch (_err) {
      // Error toast is already handled by useCategoryMutations
    }
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateCategory();
    } else if (e.key === 'Escape' && mergedCategories.length > 0) {
      e.preventDefault();
      handleCancelInlineCreate();
    }
  };

  const selectedCategoryName = mergedCategories.find(
    (c) => String(c.id) === String(value)
  )?.name;

  return (
    <div className="ledger-field">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id}>Categoria</label>
        {!isCreating && (
          <button
            type="button"
            onClick={handleOpenInlineCreate}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-[var(--ledger-accent)] transition-colors hover:bg-[var(--ledger-accent-soft)] disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            <span>Nova categoria</span>
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="rounded-xl border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface-hover)] p-2.5">
          {mergedCategories.length === 0 && (
            <p className="mb-2 text-xs font-medium text-[var(--ledger-ink-muted)]">
              Nenhuma categoria cadastrada ainda. Crie a primeira para continuar:
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inlineInputRef}
              id={`${id}-new-name`}
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={handleInlineKeyDown}
              placeholder="Ex: Bebidas, Mercearia..."
              disabled={addCategoryMutation.isPending || disabled}
              className="ledger-input flex-1 bg-[var(--ledger-surface)]"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || addCategoryMutation.isPending || disabled}
              className="inline-flex h-[2.65rem] shrink-0 items-center justify-center gap-1.5 rounded-[0.625rem] bg-[var(--ledger-accent)] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--ledger-accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Check className="size-3.5" />
              <span>{addCategoryMutation.isPending ? 'Criando...' : 'Criar'}</span>
            </button>
            {mergedCategories.length > 0 && (
              <button
                type="button"
                onClick={handleCancelInlineCreate}
                disabled={addCategoryMutation.isPending}
                aria-label="Cancelar criação de categoria"
                title="Cancelar"
                className="inline-flex size-[2.65rem] shrink-0 items-center justify-center rounded-[0.625rem] border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <Select
          value={value ? String(value) : null}
          onValueChange={(val) => onChange(val ? String(val) : '')}
          disabled={disabled}
        >
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Selecione uma categoria...">
              {() => selectedCategoryName || 'Selecione uma categoria...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mergedCategories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function ProductPricingHelper({ costPrice, salePrice, onApplySalePrice }) {
  const cost = parseFloat(costPrice);
  const sale = parseFloat(salePrice);
  const hasCost = Number.isFinite(cost) && cost > 0;
  const hasSale = Number.isFinite(sale) && sale > 0;

  if (!hasCost && !hasSale) {
    return null;
  }

  const unitProfit = hasCost && hasSale ? sale - cost : null;
  const marginPct = hasCost && hasSale ? ((sale - cost) / cost) * 100 : null;

  return (
    <div className="space-y-2">
      {hasCost && onApplySalePrice && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[0.74rem] font-medium text-[var(--ledger-ink-subtle)]">
            Sugerir venda sobre custo:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {MARKUP_PRESETS.map((preset) => {
              const targetSale = Number((cost * preset.factor).toFixed(2));
              const isSelected = hasSale && Math.abs(sale - targetSale) < 0.01;

              return (
                <button
                  key={preset.label}
                  type="button"
                  title={`Definir venda em ${formatCurrency(targetSale)}`}
                  onClick={() => onApplySalePrice(targetSale.toFixed(2))}
                  className={`font-mono-tabular inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-[var(--ledger-accent)] bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)]'
                      : 'border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-muted)] hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {unitProfit !== null && marginPct !== null && (
        <>
          {sale < cost ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-[var(--ledger-danger-soft)] px-3 py-2.5 text-xs text-[var(--ledger-danger)]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-bold">Preço de venda abaixo do custo</p>
                <p className="mt-0.5">
                  Prejuízo estimado de{' '}
                  <strong className="font-mono-tabular">
                    {formatCurrency(Math.abs(unitProfit))}
                  </strong>{' '}
                  por unidade (
                  <span className="font-mono-tabular font-semibold">
                    {Math.round(marginPct)}%
                  </span>
                  ).
                </p>
              </div>
            </div>
          ) : sale === cost ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-300/80 bg-[var(--ledger-amber-soft)] px-3 py-2.5 text-xs text-amber-950">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--ledger-amber)]" />
              <p>
                <strong className="font-bold">Margem zerada (0%):</strong> o preço de venda está
                igual ao preço de custo, sem lucro bruto por unidade.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--ledger-accent)]/20 bg-[var(--ledger-accent-soft)]/60 px-3 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[var(--ledger-ink-muted)]">
                <TrendingUp className="size-3.5 text-[var(--ledger-accent)]" />
                <span>Lucro unitário:</span>
                <strong className="font-mono-tabular font-bold text-[var(--ledger-accent)]">
                  {formatCurrency(unitProfit)}
                </strong>
              </span>
              <span className="text-[var(--ledger-ink-muted)]">
                Margem:{' '}
                <strong className="font-mono-tabular font-bold text-[var(--ledger-accent)]">
                  +{Math.round(marginPct)}%
                </strong>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
