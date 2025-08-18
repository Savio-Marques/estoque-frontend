import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, CircleAlert, Plus, SquarePen, Minus, X, CheckCircle } from "lucide-react";
import './style.css';

export default function Stock() {
    const { products } = useOutletContext();

    const statusReturn = (quantity) => {
        if (quantity === 0) {
            return {
                icon: <X size={20} color="#D0021B" />,
                tag: <p className="product-status red">Sem estoque</p>
            };
        }
        if (quantity > 0 && quantity <= 5) {
            return {
                icon: <CircleAlert size={20} color="#F5A623" />,
                tag: <p className="product-status yellow">Estoque baixo</p>
            };
        }
        if (quantity > 5) {
            return {
                icon: <CheckCircle size={20} color="#16A249" />,
                tag: <p className="product-status green">Disponível</p>
            };
        }
        return { icon: null, tag: null };
    };

    return (
        <div className="stock">
            <div className="stock-container">
                <ul>
                    {products.map(stock => {
                        const statusResult = statusReturn(stock.qtd);
                        return (
                            <li className="product-card-container">
                                <div className="product-card">
                                    <div className="product-header">
                                        <div className="product-header-title">
                                            <Package size={21} />
                                            <h3>{stock.product}</h3>
                                        </div>
                                        {statusResult.icon}
                                    </div>
                                    <p className="product-categorie">{stock.category}</p>
                                    <div className="product-stock-container">
                                        <div className="product-stock">
                                            <span>Estoque:</span>
                                            <span className="product-stock-number">{`${stock.qtd} un.`}</span>
                                        </div>
                                    </div>
                                    <div className="product-status-container">
                                        <span>
                                            {statusResult.tag}
                                        </span>
                                    </div>
                                    <div className="add-remove">
                                        <button className="product-add">
                                            <Plus size={18} />
                                            Adicionar
                                        </button>
                                        <button className="product-remove">
                                            <Minus size={18} />
                                            Retirar
                                        </button>
                                    </div>
                                    <button className="product-edit">
                                        <SquarePen size={18} />
                                        Editar
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
}