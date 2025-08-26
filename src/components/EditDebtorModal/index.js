import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; // Reutilizando nosso modal genérico!
import './style.css'

export default function EditDebtorModal({ debtor, onSave, onClose}) {
    const [formData, setFormData] = useState({ ...debtor });

    useEffect(() => {
        setFormData({ ...debtor });
    }, [debtor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <form className='editDebtor-form' onSubmit={handleSubmit}>
                <h2>Editar Pagamento Pendente</h2>

                <div className="editDebtor-inputs">
                    <label>Cliente*</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="editDebtor-inputs">
                    <label>Descrição</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="editDebtor-inputs">
                    <label>Valor*</label>
                    <input
                        type="number"
                        name="value"
                        step="0.01"
                        value={formData.value}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>

                <div className="modal-actions-debtors">
                    <button type="submit" className="save-button-debtors">Salvar</button>
                    <button type="button" onClick={onClose} className="cancel-button-debtors">Cancelar</button>
                </div>
            </form>
        </Modal>
    );
}