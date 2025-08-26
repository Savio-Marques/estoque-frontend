import react from 'react';
import { useOutletContext } from 'react-router-dom';
import { Tag, SquarePen, Trash2 } from 'lucide-react';
import './style.css';

export default function Categories() {

    const { categories, onEditCategory, onDeleteCategory } = useOutletContext();

    return (
        <div className='categories'>
            <div className="categories-container">
                {/* 2. Renderização condicional */}
                {categories && categories.length > 0 ? (
                    <ul>
                        {/* 3. Mapeie a lista de categorias para renderizar os cards */}
                        {categories.map(category => (
                            <li key={category.id} className='categories-card'>
                                <div className="categories-title">
                                    <Tag size={21} />
                                    <h3>{category.name}</h3>
                                </div>
                                <div className="categories-button">
                                    <button
                                        className='categories-edit-button'
                                        onClick={() => onEditCategory(category)}
                                    >
                                        <SquarePen size={18} /> Editar
                                    </button>
                                    <button
                                        className='categories-delete-button'
                                        onClick={() => onDeleteCategory(category)}
                                    >
                                        <Trash2 size={18} /> Excluir
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Nenhuma categoria cadastrada.</p>
                )}
            </div>
        </div>
    )
}