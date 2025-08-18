import { React, useState, useMemo } from 'react';
import { Package, LogOut, CircleAlert, X, CircleDollarSign, Plus, PackagePlus } from "lucide-react";
import { NavLink, Outlet } from 'react-router-dom';
import Modal from '../../components/Modal';
import './style.css';

const stockData = [
    { id: 1, product: 'Bolacha Richester', category: 'Biscoito', qtd: 4, status: 'Estoque Baixo' },
    { id: 2, product: 'Xilito Azul', category: 'Xilito', qtd: 10, status: 'Disponivel' },
    { id: 3, product: 'Pipoca Lipy', category: 'Xilito', qtd: 7, status: 'Disponivel' },
    { id: 4, product: 'Coca Cola 1L', category: 'Refrigerante', qtd: 14, status: 'Disponivel' },
    { id: 5, product: 'Nescau caixinha', category: 'Sucos', qtd: 0, status: 'Sem Estoque' },
    { id: 6, product: 'Kapo laranja', category: 'Sucos', qtd: 3, status: 'Estoque Baixo' },
    { id: 7, product: 'Cajuina', category: 'Refrigerantes', qtd: 3, status: 'Estoque Baixo' },
];

const debtorsData = [
    { id: 1, client: 'João Silva', description: 'iPhone 13 Pro Max 256GB Grafite', value: 6499.99, dueDate: '09/08/2024' },
    { id: 2, client: 'Maria Santos', description: 'Notebook Dell Inspiron 15', value: 2899.99, dueDate: '14/08/2024' },
    { id: 3, client: 'Pedro Oliveira', description: 'Smart TV Samsung 55" 4K', value: 2199.99, dueDate: '07/08/2024' },
];

export default function Dashboard() {
    const [products, setProducts] = useState(stockData);
    const [debtors, setDebtors] = useState(debtorsData);

    const lowStockCount = useMemo(() => {
        return products.filter(p => p.status === 'Estoque Baixo').length;
    }, [products]);

    const outOfStockCount = useMemo(() => {
        return products.filter(p => p.status === 'Sem Estoque').length;
    }, [products]);

    const [isMenuOpen, setMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'addProduct', 'addPayment', ou null

    const handleOpenModal = (modalName) => {
        setActiveModal(modalName);
        setMenuOpen(false); // Fecha o menu de opções ao abrir um modal
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    return (
        <div className="dashboard-container">
            <header>
                <div className="logo-container" >
                    <div className="logo">
                        <div className="package" >
                            <Package color='white' size={33} />
                        </div>
                        <div className="logo-text">
                            <h1>Gerenciamento de Estoque</h1>
                            <p>Sistema de controle de produtos e inventário</p>
                        </div>
                    </div>
                    <button type='button' className="logout-button">
                        <LogOut color='black' />
                    </button>
                </div>

                <div className="stats-group">
                    <div className="stat-card">
                        <div>
                            <p>Total de Produtos</p>
                            <span>{products.length}</span>
                        </div>
                        <div className="icon-wrapper blue">
                            <Package size={28} />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <p>Estoque Baixo</p>
                            <span className="yellow-text">{lowStockCount}</span>
                        </div>
                        <div className="icon-wrapper yellow">
                            <CircleAlert size={28} />
                        </div>
                    </div>
                    <div className="stat-card">
                        <div>
                            <p>Sem Estoque</p>
                            <span className="red-text">{outOfStockCount}</span>
                        </div>
                        <div className="icon-wrapper red">
                            <X size={28} />
                        </div>
                    </div>
                </div>
            </header>
            <main>
                <nav>
                    <div className="navigate-container">
                        <NavLink to='/dashboard/stock' className="navigate-button"><Package size={17} />Estoque</NavLink>
                        <NavLink to='/dashboard/debtors' className="navigate-button"><CircleDollarSign size={17} />Caderneta</NavLink>
                    </div>
                </nav>

                <div className="content-area">
                    <Outlet context={{ products: products, debtors: debtors }} />

                    <div className="fab-container">
                        {isMenuOpen && (
                            <div className="fab-options">
                                <button onClick={() => handleOpenModal('addProduct')}>
                                    Cadastro de estoque
                                    <div className="fab-icon-wrapper"><Package size={20} /></div>
                                </button>
                                <button onClick={() => handleOpenModal('addPayment')}>
                                    Cadastro de pendentes
                                    <div className="fab-icon-wrapper"><CircleDollarSign size={20} /></div>
                                </button>
                            </div>
                        )}
                        <button className="fab-button" onClick={() => setMenuOpen(!isMenuOpen)}>
                            <Plus size={25} />
                        </button>
                    </div>

                    {/* --- MODAIS GRANDES --- */}
                    <Modal isOpen={activeModal === 'addProduct'} onClose={handleCloseModal}>
                        <form className='add-container'>
                            <h2>Cadastro de estoque</h2>
                            <input type="text" id="" placeholder='Nome do produto' />
                            <input type="text" id="" placeholder='Categoria' />
                            <input type="number" id="" placeholder='Quantidade' />
                            <button className='add-button' type='button'>
                                <PackagePlus size={20} />
                                Cadastrar
                            </button>
                        </form>
                    </Modal>

                    <Modal isOpen={activeModal === 'addPayment'} onClose={handleCloseModal}>
                        <form className='add-container'>
                            <h2>Cadastro de pagamentos pendentes</h2>
                            <input type="text" id="" placeholder='Nome do cliente' />
                            <input type="text" id="" placeholder='Descrição (Opicional)' />
                            <input type="number" id="" placeholder='Valor' />
                            <button className='add-button' type='button'>
                                <CircleDollarSign size={20} />
                                Cadastrar
                            </button>
                        </form>
                    </Modal>
                </div>
            </main>
        </div>
    );
}