import React, { useState } from 'react';
import Modal from '../Modal';

export default function EditCategoryModal({ category, onSave, onClose }) {
    const [name, setName] = useState(category.name);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...category, name });
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <form className='add-container' onSubmit={handleSubmit}>
                <h2>Editar Categoria</h2>
                <div className="add-inputs-wrapper">
                    <label>Nome da categoria*</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <button className='add-button' type='submit'>
                    Salvar Alterações
                </button>
            </form>
        </Modal>
    );
}