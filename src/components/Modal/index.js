import React from 'react';
import { X } from 'lucide-react';
import './style.css';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <X size={25} />
        </button>
        {children}
      </div>
    </div>
  );
}