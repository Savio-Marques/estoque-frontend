import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; // Reutilize seu componente de Modal genérico!
import './style.css';

export default function EditProductModal({ product, categories, onSave, onClose, onDeleteRequest }) {
    const [formData, setFormData] = useState({ ...product });

    useEffect(() => {
        setFormData({ ...product });
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = name === 'categoryId' || name === 'qtd' ? parseInt(value) : value;
        setFormData(prevData => ({ ...prevData, [name]: parsedValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleDeleteClick = () => {
        onDeleteRequest(product);
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <form className='editProduct-form' onSubmit={handleSubmit}>
                <h2 className='editProduct-title'>Editar Produto</h2>

                <div className="editProduct-inputs">
                    <label>Nome do Produto*</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="editProduct-inputs">
                    <label>Categoria*</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Selecione uma categoria</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="editProduct-inputs">
                    <label>Quantidade*</label>
                    <input
                        type="number"
                        name="qtd"
                        value={formData.qtd}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>
                <div className="modal-actions-products">
                    <div className="modal-actions-wrapper">
                        <button type="submit" className="save-button-product">Salvar</button>
                        <button type="button" onClick={onClose} className="cancel-button-product">Cancelar</button>
                    </div>
                </div>

                <button type='button' className='delete-button' onClick={handleDeleteClick}>Deletar</button>

            </form>
        </Modal>
    );
}