import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes,
  BookOpen,
  Tags,
  Users as UsersIcon,
  History,
  Plus,
  UserCog,
  LogOut,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProductSummary, useProductMutations } from '../../hooks/useProducts';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from '@/components/ui/sheet';
import Modal from '../../components/Modal';
import AddProductForm from '../../components/AddProductForm';
import AddDebtorModal from '../../components/AddDebtorModal';
import ProfileModal from '../../components/ProfileModal';
import StockMovementsModal from '../../components/StockMovementsModal';
import { ledgerToast } from '../../components/LedgerToast';

function getInitials(name, username) {
  const source = (name || username || 'U').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function Dashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [prefilledDebtorName, setPrefilledDebtorName] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCloseModal = () => {
    setActiveModal(null);
    setNewCategoryName('');
    setPrefilledDebtorName('');
  };

  const handleOpenModal = (modalName, initialName = '') => {
    setIsMobileQuickMenuOpen(false);
    setPrefilledDebtorName(typeof initialName === 'string' ? initialName : '');
    setActiveModal(modalName);
  };

  const { data: summary } = useProductSummary();
  const { data: categories = [] } = useCategories({ enabled: activeModal === 'addProduct' });

  const { addCategoryMutation } = useCategoryMutations({
    onAddSuccess: () => {
      if (!location.pathname.includes('/categories')) {
        ledgerToast.success('Categoria salva');
      }
      handleCloseModal();
    },
  });

  const { addProductMutation } = useProductMutations({
    onAddSuccess: () => {
      if (!location.pathname.includes('/stock')) {
        ledgerToast.success('Produto salvo no estoque');
      }
      handleCloseModal();
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategoryMutation.mutate(newCategoryName.trim());
  };

  const handleSaveProduct = (productData) => {
    addProductMutation.mutate(productData);
  };

  const navItems = [
    { to: 'stock', label: 'Estoque', icon: Boxes },
    { to: 'debtors', label: 'Caderneta', icon: BookOpen },
    { to: 'categories', label: 'Categorias', icon: Tags },
    ...(user?.role === 'ADMIN' ? [{ to: 'users', label: 'Usuários', icon: UsersIcon }] : []),
  ];

  const userInitials = getInitials(user?.name, user?.username);

  return (
    <div className="min-h-screen bg-[var(--ledger-bg)] text-[var(--ledger-ink)] lg:flex">
      {/* Desktop Sidebar (>= lg) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col bg-[var(--ledger-sidebar-bg)] text-stone-100 border-r border-white/10">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25">
            <PackageCheck className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[0.95rem] font-bold tracking-tight text-white">
              Estoque &amp; Caderneta
            </h1>
            <p className="truncate text-[0.7rem] font-medium uppercase tracking-widest text-stone-400">
              Painel Operacional
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
              Módulos
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25'
                          : 'text-stone-300 hover:bg-white/[0.06] hover:text-white'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
              Ações Rápidas
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleOpenModal('addProduct')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.84rem] font-medium text-stone-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Plus className="size-4 text-emerald-400" />
                <span>Novo Produto</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('addPayment')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.84rem] font-medium text-stone-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Plus className="size-4 text-amber-400" />
                <span>Novo Lançamento</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('addCategory')}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.84rem] font-medium text-stone-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Plus className="size-4 text-stone-400" />
                <span>Nova Categoria</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMovementsOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.84rem] font-medium text-stone-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <History className="size-4 text-sky-400" />
                <span>Histórico de Estoque</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-3.5">
          <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 font-mono-tabular text-xs font-bold text-emerald-300">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || user?.username}
                </p>
                <p className="truncate font-mono-tabular text-[0.68rem] uppercase tracking-wider text-stone-400">
                  {user?.role || 'USER'}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-stone-200 transition-colors hover:bg-white/10"
              >
                <UserCog className="size-3.5" />
                <span>Perfil</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="size-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile & Tablet Sticky Topbar (< lg) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--ledger-sidebar-bg)] pt-[env(safe-area-inset-top,0px)] text-white lg:hidden">
        <div className="mx-auto flex h-14 max-w-[1380px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/25">
              <PackageCheck className="size-4 sm:size-[1.125rem]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm sm:text-[0.95rem] font-bold tracking-tight text-white">
                Estoque &amp; Caderneta
              </p>
              <p className="hidden truncate text-[0.65rem] font-medium uppercase tracking-widest text-stone-400 sm:block">
                Painel Operacional
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsMobileQuickMenuOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/15 px-2.5 sm:px-3 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 active:scale-95"
            >
              <Plus className="size-4 shrink-0" />
              <span>Novo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMovementsOpen(true)}
              title="Histórico de Estoque"
              aria-label="Histórico de Estoque"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 text-xs font-medium text-stone-200 transition-colors hover:bg-white/10"
            >
              <History className="size-4 shrink-0" />
              <span className="hidden md:inline">Histórico</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title="Meu Perfil"
              aria-label="Meu Perfil"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-2 sm:px-2.5 text-xs font-medium text-stone-200 transition-colors hover:bg-white/10"
            >
              <span className="font-mono-tabular flex size-5 shrink-0 items-center justify-center rounded bg-emerald-500/20 text-[0.65rem] font-bold text-emerald-300">
                {userInitials}
              </span>
              <span className="hidden max-w-[100px] truncate md:inline">
                {user?.name || 'Perfil'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 lg:pl-64">
        <main className="mx-auto w-full max-w-[1380px] px-4 pt-5 pb-28 sm:px-6 sm:pt-6 lg:px-8 lg:pt-7 lg:pb-10">
          <Outlet
            context={{
              summary,
              openModal: handleOpenModal,
              openMovements: () => setIsMovementsOpen(true),
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< lg) with iOS safe-area support */}
      <nav
        aria-label="Navegação principal"
        className="pb-safe-nav fixed inset-x-0 bottom-0 z-30 border-t border-[var(--ledger-border)] bg-[var(--ledger-surface)]/95 backdrop-blur-md lg:hidden"
      >
        <div className={`grid ${user?.role === 'ADMIN' ? 'grid-cols-4' : 'grid-cols-3'} min-h-[60px]`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-1.5 text-[0.7rem] font-semibold transition-colors ${
                    isActive
                      ? 'text-[var(--ledger-accent)]'
                      : 'text-[var(--ledger-ink-subtle)] hover:text-[var(--ledger-ink)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                        isActive ? 'bg-[var(--ledger-accent-soft)]' : ''
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Quick Create Sheet (Android / iOS thumb-friendly) */}
      <Sheet open={isMobileQuickMenuOpen} onOpenChange={setIsMobileQuickMenuOpen}>
        <SheetContent
          side="bottom"
          className="bg-[var(--ledger-surface)] border-t border-[var(--ledger-border)] text-[var(--ledger-ink)] [--sheet-close-top:1.4rem]"
        >
          <SheetHeader className="border-b border-[var(--ledger-border)] pb-3 max-sm:pt-7">
            <SheetTitle className="text-base font-bold text-[var(--ledger-ink)]">
              Cadastro Rápido
            </SheetTitle>
            <SheetDescription className="text-xs text-[var(--ledger-ink-subtle)]">
              Escolha o que deseja registrar agora
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="py-4 pb-6 space-y-2.5">
            <button
              type="button"
              onClick={() => handleOpenModal('addProduct')}
              className="flex w-full items-center gap-3.5 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-4 py-3.5 text-left transition-colors active:bg-[var(--ledger-surface-muted)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ledger-accent-soft)] text-[var(--ledger-accent)]">
                <Boxes className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--ledger-ink)]">Novo Produto</p>
                <p className="text-xs text-[var(--ledger-ink-subtle)]">
                  Adicionar item ao inventário de estoque
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal('addPayment')}
              className="flex w-full items-center gap-3.5 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-4 py-3.5 text-left transition-colors active:bg-[var(--ledger-surface-muted)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ledger-amber-soft)] text-amber-800">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--ledger-ink)]">
                  Novo Lançamento na Caderneta
                </p>
                <p className="text-xs text-[var(--ledger-ink-subtle)]">
                  Registrar venda fiada ou valor pendente
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenModal('addCategory')}
              className="flex w-full items-center gap-3.5 rounded-xl border border-[var(--ledger-border)] bg-[var(--ledger-bg)] px-4 py-3.5 text-left transition-colors active:bg-[var(--ledger-surface-muted)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-200/80 text-[var(--ledger-ink-muted)]">
                <Tags className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--ledger-ink)]">Nova Categoria</p>
                <p className="text-xs text-[var(--ledger-ink-subtle)]">
                  Criar grupo para organizar produtos
                </p>
              </div>
            </button>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Shared Creation Modals */}
      <Modal
        isOpen={activeModal === 'addCategory'}
        onClose={handleCloseModal}
        title="Adicionar Nova Categoria"
      >
        <form className="ledger-form" onSubmit={handleSaveCategory}>
          <div className="ledger-field">
            <label htmlFor="categoryName">Nome da Categoria</label>
            <input
              id="categoryName"
              className="ledger-input"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Bebidas, Biscoitos, Higiene..."
              required
              autoFocus
            />
          </div>
          <div className="ledger-form-actions">
            <button type="button" className="ledger-btn-secondary" onClick={handleCloseModal}>
              Cancelar
            </button>
            <button
              type="submit"
              className="ledger-btn-primary"
              disabled={addCategoryMutation.isPending}
            >
              {addCategoryMutation.isPending ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === 'addProduct'}
        onClose={handleCloseModal}
        title="Adicionar Novo Produto"
      >
        <AddProductForm
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={handleCloseModal}
          isPending={addProductMutation.isPending}
        />
      </Modal>

      <AddDebtorModal
        isOpen={activeModal === 'addPayment'}
        onClose={handleCloseModal}
        initialClientName={prefilledDebtorName}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLogout={handleLogout}
      />
      <StockMovementsModal isOpen={isMovementsOpen} onClose={() => setIsMovementsOpen(false)} />
    </div>
  );
}

export default Dashboard;
