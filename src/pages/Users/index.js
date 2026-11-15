import React, { useState, useMemo } from 'react';
import { UsersRound, Shield, Plus, SquarePen, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers, useUserMutations } from '../../hooks/useUsers';
import './style.css';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

  // Form states para novo usuário
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');

  // Form states para edição de usuário
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('USER');

  const { data: users = [], isLoading } = useUsers();

  const { createUserMutation, updateUserMutation, deleteUserMutation } = useUserMutations({
    onCreateSuccess: () => {
      setIsCreateOpen(false);
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('USER');
    },
    onUpdateSuccess: () => {
      setEditingUser(null);
      setEditPassword('');
    },
    onDeleteSuccess: () => setConfirmationProps({ isOpen: false }),
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

  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'ADMIN').length,
    [users]
  );

  const openEditModal = (target) => {
    setEditingUser(target);
    setEditName(target.name || '');
    setEditUsername(target.username || '');
    setEditPassword('');
    setEditRole(target.role || 'USER');
  };

  const requestDeleteConfirmation = (target) => {
    setConfirmationProps({
      isOpen: true,
      title: 'Confirmar Exclusão de Conta',
      message: `Deseja excluir permanentemente o usuário "${target.name}" (@${target.username})? Todos os produtos, categorias, movimentações e devedores dessa conta serão removidos.`,
      onConfirm: () => deleteUserMutation.mutate(target.id),
      confirmButtonClass: 'confirm-button-delete',
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await createUserMutation.mutateAsync({
      name: newName.trim(),
      username: newUsername.trim(),
      password: newPassword,
      role: newRole,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    await updateUserMutation.mutateAsync({
      id: editingUser.id,
      name: editName.trim(),
      username: editUsername.trim(),
      password: editPassword.trim() ? editPassword : null,
      role: editRole,
    });
  };

  return (
    <div className="users-page">
      <div className="users-container">
        <div className="stats-group-users">
          <div className="stat-card">
            <div>
              <p>Total de Contas</p>
              <span>{users.length}</span>
            </div>
            <div className="icon-wrapper blue">
              <UsersRound size={28} />
            </div>
          </div>
          <div className="stat-card">
            <div>
              <p>Contas Root (ADMIN)</p>
              <span>{adminCount}</span>
            </div>
            <div className="icon-wrapper purple">
              <Shield size={28} />
            </div>
          </div>
        </div>

        <div className="users-toolbar">
          <input
            type="text"
            placeholder="Pesquisar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="users-add-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} />
            Novo Usuário
          </button>
        </div>

        <div className="users-list">
          <table className="users-list-table">
            <thead>
              <tr>
                <th className="col-user-name">Nome</th>
                <th className="col-user-username">Usuário</th>
                <th className="col-user-role">Perfil</th>
                <th className="col-user-action">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Carregando usuários...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.username === currentUser?.username;
                  return (
                    <tr key={u.id}>
                      <td data-label="Nome" className="col-user-name">
                        {u.name} {isSelf && <span className="self-tag">(Você)</span>}
                      </td>
                      <td data-label="Usuário" className="col-user-username">
                        @{u.username}
                      </td>
                      <td data-label="Perfil" className="col-user-role">
                        <span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                          {u.role === 'ADMIN' ? 'ADMIN (Root)' : 'USER'}
                        </span>
                      </td>
                      <td data-label="Ações" className="col-user-action">
                        <span className="users-table-icon-wrapper">
                          <button
                            type="button"
                            className="users-btn-edit"
                            onClick={() => openEditModal(u)}
                          >
                            <SquarePen size={16} /> Editar
                          </button>
                          <button
                            type="button"
                            className="users-btn-delete"
                            onClick={() => requestDeleteConfirmation(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                          >
                            <Trash2 size={16} /> Excluir
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Cadastrar Novo Usuário"
        >
          <form className="user-form" onSubmit={handleCreateSubmit}>
            <div className="add-inputs-wrapper">
              <label htmlFor="new-user-name">Nome*</label>
              <input
                id="new-user-name"
                type="text"
                placeholder="Nome completo ou comércio"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="add-inputs-wrapper">
              <label htmlFor="new-user-username">Nome de Usuário (Login)*</label>
              <input
                id="new-user-username"
                type="text"
                placeholder="Ex: joao.silva"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div className="add-inputs-wrapper">
              <label htmlFor="new-user-password">Senha Inicial* (mín. 6 caracteres)</label>
              <input
                id="new-user-password"
                type="password"
                placeholder="Digite a senha de acesso"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="add-inputs-wrapper">
              <label htmlFor="new-user-role">Perfil*</label>
              <select
                id="new-user-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="USER">USER (Usuário Comum)</option>
                <option value="ADMIN">ADMIN (Root)</option>
              </select>
            </div>
            <button
              className="add-button"
              type="submit"
              disabled={createUserMutation.isPending}
            >
              <Plus size={18} />
              {createUserMutation.isPending ? 'Cadastrando...' : 'Criar Usuário'}
            </button>
          </form>
        </Modal>

        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title="Editar Usuário"
        >
          {editingUser && (
            <form className="user-form" onSubmit={handleEditSubmit}>
              <div className="add-inputs-wrapper">
                <label htmlFor="edit-user-name">Nome*</label>
                <input
                  id="edit-user-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="add-inputs-wrapper">
                <label htmlFor="edit-user-username">Nome de Usuário*</label>
                <input
                  id="edit-user-username"
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
              <div className="add-inputs-wrapper">
                <label htmlFor="edit-user-password">Nova Senha (opcional, mín. 6 caracteres)</label>
                <input
                  id="edit-user-password"
                  type="password"
                  placeholder="Deixe vazio para manter a senha atual"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <div className="add-inputs-wrapper">
                <label htmlFor="edit-user-role">Perfil*</label>
                <select
                  id="edit-user-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={editingUser.username === currentUser?.username}
                >
                  <option value="USER">USER (Usuário Comum)</option>
                  <option value="ADMIN">ADMIN (Root)</option>
                </select>
              </div>
              <button
                className="add-button"
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          )}
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
    </div>
  );
}
