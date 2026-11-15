import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../Modal';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUserName } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/me', {
        name,
        currentPassword: currentPassword || null,
        newPassword: newPassword || null,
      });
      updateUserName(res.data.name);
      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Falha ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form className="add-container" onSubmit={handleSubmit}>
        <h2>Meu Perfil</h2>
        <div className="add-inputs-wrapper">
          <label htmlFor="profile-username">Usuário</label>
          <input id="profile-username" type="text" value={user?.username || ''} disabled />
        </div>
        <div className="add-inputs-wrapper">
          <label htmlFor="profile-name">Nome*</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="add-inputs-wrapper">
          <label htmlFor="profile-current-password">Senha Atual (apenas para trocar senha)</label>
          <input
            id="profile-current-password"
            type="password"
            placeholder="Deixe vazio para manter a senha"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="add-inputs-wrapper">
          <label htmlFor="profile-new-password">Nova Senha</label>
          <input
            id="profile-new-password"
            type="password"
            placeholder="Digite a nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button className="add-button" type="submit" disabled={isSubmitting}>
          <UserCheck size={20} />
          {isSubmitting ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </Modal>
  );
}
