import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';

function ProfileModal({ isOpen, onClose }) {
  const { user, updateUserName } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error('Informe sua senha atual para alterar a senha.');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('A confirmação de senha não confere.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await api.put('/auth/me', {
        name,
        currentPassword: currentPassword || null,
        newPassword: newPassword || null,
      });
      updateUserName(response.data.name);
      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao atualizar perfil.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil">
      <form className="ledger-form" onSubmit={handleSubmit}>
        <div className="ledger-field">
          <label htmlFor="profile-username">Usuário</label>
          <input
            id="profile-username"
            className="ledger-input mono"
            type="text"
            value={user?.username || ''}
            disabled
          />
        </div>

        <div className="ledger-field">
          <label htmlFor="profile-name">Nome de Exibição</label>
          <input
            id="profile-name"
            className="ledger-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mt-1 border-t border-[var(--ledger-border)] pt-3">
          <p className="mb-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ledger-ink-subtle)]">
            Alterar Senha (Opcional)
          </p>

          <div className="ledger-form">
            <div className="ledger-field">
              <label htmlFor="profile-current-password">Senha Atual</label>
              <input
                id="profile-current-password"
                className="ledger-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Necessária apenas para trocar a senha"
              />
            </div>

            <div className="ledger-form-row">
              <div className="ledger-field">
                <label htmlFor="profile-new-password">Nova Senha</label>
                <input
                  id="profile-new-password"
                  className="ledger-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="ledger-field">
                <label htmlFor="profile-confirm-password">Confirmar Nova Senha</label>
                <input
                  id="profile-confirm-password"
                  className="ledger-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ledger-form-actions">
          <button type="button" className="ledger-btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button type="submit" className="ledger-btn-primary" disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProfileModal;
