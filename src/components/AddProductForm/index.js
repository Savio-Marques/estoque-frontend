import {React, useState} from "react";
import { PackagePlus } from "lucide-react";

export default function AddProductForm({ categories, onSave }) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [qtd, setQtd] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name, categoryId: parseInt(categoryId), qtd: parseInt(qtd) });
    };

    return (
        <form className='add-container' onSubmit={handleSubmit}>
            <h2>Cadastro de produtos</h2>
            <div className="add-inputs-wrapper">
                <label>Nome do Produto *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="add-inputs-wrapper">
                <label>Categoria *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                    <option className="extern-option" value="" disabled>Selecione uma categoria</option>
                    {categories.map(cat => (
                        <option className="intern-option" key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="add-inputs-wrapper">
                <label>Quantidade *</label>
                <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} required min='0' />
            </div>
            <button className='add-button' type='save'>
                <PackagePlus size={20} />
                Cadastrar
            </button>
        </form>
    );
}