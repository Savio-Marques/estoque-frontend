import React from 'react';
import Modal from '../Modal'; // Reutilizamos nosso modal base!
import { AlertTriangle } from 'lucide-react'; // Um ícone para dar destaque
import './style.css';

// Props:
// - isOpen, onClose: Para controlar a visibilidade.
// - title: O título do modal (ex: "Confirmar Exclusão").
// - onConfirm: A função a ser executada se o usuário clicar em "Confirmar".
// - children: A mensagem/pergunta a ser exibida.
export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, children, confirmButtonClass}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="confirmation-modal">
        <div className="confirmation-icon">
          <AlertTriangle size={48} color="#F5A623" />
        </div>
        <h2 className="confirmation-title">{title}</h2>
        <div className="confirmation-message">
          {children}
        </div>
        <div className="confirmation-actions">
          <button onClick={onClose} className="cancel-button">
            Cancelar
          </button>
          <button onClick={onConfirm} className={`confirm-button ${confirmButtonClass || ''}`}>
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}