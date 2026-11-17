import React, { useMemo, useState } from 'react';
import { Pencil, Search, Trash2, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useUserMutations } from '../../hooks/useUsers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './style.css';

const formatInteger = (value) => Math.round(Number(value || 0)).toLocaleString('pt-BR');

const ROLE_LABELS = {
  USER: 'USER (Operacional)',
  ADMIN: 'ADMIN (Administrador)',
};

function Users() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, isError } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'USER',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'USER',
  });

  const { createUserMutation, updateUserMutation, deleteUserMutation } = useUserMutations({
    onCreateSuccess: () => {
      setIsCreateOpen(false);
      setCreateForm({ name: '', username: '', password: '', role: 'USER' });
    },
    onUpdateSuccess: () => {
      setEditingUser(null);
    },
    onDeleteSuccess: () => {
      setConfirmationProps({ isOpen: false });
      setEditingUser(null);
    },
  });

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      username: u.username || '',
      password: '',
      role: u.role || 'USER',
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createUserMutation.mutate({
      name: createForm.name.trim(),
      username: createForm.username.trim(),
      password: createForm.password,
      role: createForm.role,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      name: editForm.name.trim(),
      username: editForm.username.trim(),
      password: editForm.password.trim() || null,
      role: editForm.role,
    });
  };

  const handleDeleteRequest = (u) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja excluir o usuário "${u.name}" (@${u.username})?`,
      confirmButtonClass: 'confirm-button-delete',
      onConfirm: () => deleteUserMutation.mutateAsync(u.id),
    });
  };

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--ledger-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-tabular text-[0.72rem] font-semibold uppercase tracking-widest text-[var(--ledger-accent)]">
            Administração
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ledger-ink)] sm:text-[1.75rem]">
              Gerenciar Usuários
            </h2>
            {!isLoading && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono-tabular rounded-md border border-[var(--ledger-border)] bg-[var(--ledger-surface)] px-2 py-0.5 text-xs font-semibold text-[var(--ledger-ink-muted)]">
                  {formatInteger(users.length)}{' '}
                  {users.length === 1 ? 'usuário' : 'usuários'}
                </span>
                <span className="font-mono-tabular rounded-md border border-amber-300/70 bg-[var(--ledger-amber-soft)] px-2 py-0.5 text-xs font-semibold text-amber-900">
                  {formatInteger(adminCount)}{' '}
                  {adminCount === 1 ? 'admin' : 'admins'}
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-[var(--ledger-ink-muted)]">
            Controle credenciais de acesso e permissões operacionais da equipe.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="ledger-btn-primary self-start sm:self-auto"
        >
          <UserPlus className="size-4" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-3.5 sm:p-4">
        <div className="ledger-search-wrapper max-w-md">
          <Search className="ledger-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou login..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ledger-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Limpar busca de usuários"
              className="ledger-search-clear"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] py-16 text-sm text-[var(--ledger-ink-subtle)]">
          <Spinner className="size-6 text-[var(--ledger-accent)]" />
          <span>Carregando usuários...</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-[var(--ledger-danger-soft)] p-5 text-sm font-medium text-[var(--ledger-danger)]">
          Erro ao carregar usuários.
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-6 py-12 text-center">
          <UsersIcon className="size-7 text-[var(--ledger-ink-subtle)]" />
          <p className="text-sm font-semibold text-[var(--ledger-ink)]">
            Nenhum usuário encontrado.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[0.7rem] font-bold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
                    <th className="px-5 py-3.5">Nome</th>
                    <th className="px-5 py-3.5">Login</th>
                    <th className="px-5 py-3.5">Perfil</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ledger-border)]">
                  {filteredUsers.map((u) => {
                    const isSelf = u.username === currentUser?.username;
                    return (
                      <tr
                        key={u.id}
                        className="transition-colors hover:bg-[var(--ledger-surface-hover)]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--ledger-ink)]">{u.name}</span>
                            {isSelf && (
                              <span className="rounded-md bg-[var(--ledger-accent-soft)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--ledger-accent)]">
                                Você
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="font-mono-tabular px-5 py-3.5 text-xs text-[var(--ledger-ink-muted)]">
                          @{u.username}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono-tabular text-[0.7rem] font-bold uppercase tracking-wider ${
                              u.role === 'ADMIN'
                                ? 'border-amber-300/80 bg-[var(--ledger-amber-soft)] text-amber-900'
                                : 'border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-muted)]'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--ledger-border-strong)] bg-[var(--ledger-surface)] px-2.5 text-xs font-semibold text-[var(--ledger-ink-muted)] transition-colors hover:bg-[var(--ledger-surface-muted)] hover:text-[var(--ledger-ink)]"
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

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredUsers.map((u) => {
              const isSelf = u.username === currentUser?.username;
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--ledger-border)] bg-[var(--ledger-surface)] p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-[var(--ledger-ink)]">{u.name}</p>
                      {isSelf && (
                        <span className="rounded bg-[var(--ledger-accent-soft)] px-1.5 py-0.5 text-[0.65rem] font-bold text-[var(--ledger-accent)]">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="font-mono-tabular mt-0.5 text-xs text-[var(--ledger-ink-subtle)]">
                      @{u.username}
                    </p>
                    <span
                      className={`mt-2 inline-flex items-center rounded border px-2 py-0.5 font-mono-tabular text-[0.68rem] font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'border-amber-300/80 bg-[var(--ledger-amber-soft)] text-amber-900'
                          : 'border-[var(--ledger-border)] bg-[var(--ledger-bg)] text-[var(--ledger-ink-muted)]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--ledger-border-strong)] bg-[var(--ledger-bg)] px-3.5 text-xs font-semibold text-[var(--ledger-ink)] active:scale-95"
                  >
                    <Pencil className="size-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Novo Usuário">
        <form className="ledger-form" onSubmit={handleCreateSubmit}>
          <div className="ledger-field">
            <label htmlFor="create-name">Nome Completo</label>
            <input
              id="create-name"
              className="ledger-input"
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Maria Souza"
              required
              autoFocus
            />
          </div>

          <div className="ledger-form-row">
            <div className="ledger-field">
              <label htmlFor="create-username">Login (Usuário)</label>
              <input
                id="create-username"
                className="ledger-input mono"
                type="text"
                value={createForm.username}
                onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Ex: maria.souza"
                required
              />
            </div>

            <div className="ledger-field">
              <label htmlFor="create-role">Perfil de Acesso</label>
              <Select
                value={createForm.role}
                onValueChange={(val) =>
                  setCreateForm((p) => ({ ...p, role: val ? String(val) : 'USER' }))
                }
              >
                <SelectTrigger id="create-role" className="w-full">
                  <SelectValue>{(val) => ROLE_LABELS[val] || val}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{ROLE_LABELS.USER}</SelectItem>
                  <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="ledger-field">
            <label htmlFor="create-password">Senha Inicial</label>
            <input
              id="create-password"
              className="ledger-input"
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div className="ledger-form-actions">
            <button
              type="button"
              className="ledger-btn-secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ledger-btn-primary"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={`Editar Usuário · @${editingUser?.username || ''}`}
      >
        <form className="ledger-form" onSubmit={handleEditSubmit}>
          <div className="ledger-form-row">
            <div className="ledger-field">
              <label htmlFor="edit-name">Nome Completo</label>
              <input
                id="edit-name"
                className="ledger-input"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="ledger-field">
              <label htmlFor="edit-username">Login (Usuário)</label>
              <input
                id="edit-username"
                className="ledger-input mono"
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="ledger-form-row">
            <div className="ledger-field">
              <label htmlFor="edit-role">Perfil</label>
              <Select
                value={editForm.role}
                disabled={editingUser?.username === currentUser?.username}
                onValueChange={(val) =>
                  setEditForm((p) => ({ ...p, role: val ? String(val) : 'USER' }))
                }
              >
                <SelectTrigger id="edit-role" className="w-full">
                  <SelectValue>{(val) => ROLE_LABELS[val] || val}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">{ROLE_LABELS.USER}</SelectItem>
                  <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ledger-field">
              <label htmlFor="edit-password">Nova Senha (opcional)</label>
              <input
                id="edit-password"
                className="ledger-input"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Deixe vazio para manter"
                minLength={6}
              />
            </div>
          </div>

          {editingUser?.username !== currentUser?.username && (
            <div className="ledger-danger-zone">
              <span>Remover usuário do sistema</span>
              <button
                type="button"
                className="ledger-btn-danger"
                onClick={() => handleDeleteRequest(editingUser)}
              >
                <Trash2 className="size-4" />
                <span>Excluir Usuário</span>
              </button>
            </div>
          )}

          <div className="ledger-form-actions">
            <button
              type="button"
              className="ledger-btn-secondary"
              onClick={() => setEditingUser(null)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ledger-btn-primary"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmationProps.isOpen}
        onClose={() => setConfirmationProps({ isOpen: false })}
        onConfirm={confirmationProps.onConfirm}
        title={confirmationProps.title}
        confirmButtonClass={confirmationProps.confirmButtonClass}
      >
        {confirmationProps.message}
      </ConfirmationModal>
    </div>
  );
}

export default Users;
