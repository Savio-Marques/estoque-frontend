import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';

function ProfileModal({ isOpen, onClose, onLogout }) {
  const { user, updateUserName } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setFormError('Informe sua senha atual para alterar a senha.');
        return;
      }
      if (newPassword.length < 6) {
        setFormError('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setFormError('A confirmação de senha não confere.');
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
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao atualizar perfil.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil">
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
            onChange={(e) => {
              setName(e.target.value);
              if (formError) setFormError('');
            }}
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
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (formError) setFormError('');
                }}
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
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Repita a nova senha"
                />
              </div>
            </div>
          </div>
        </div>

        {onLogout && (
          <div className="ledger-danger-zone">
            <span>Encerrar sessão neste dispositivo</span>
            <button
              type="button"
              className="ledger-btn-danger"
              disabled={isSaving}
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              <LogOut className="size-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        )}

        <div className="ledger-form-actions">
          <button
            type="button"
            className="ledger-btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
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
