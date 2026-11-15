import React, { useState } from 'react';
import { Package, LogOut, CircleAlert, X, CircleDollarSign, Plus, Tag, History, User } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AddProductForm from '../../components/AddProductForm';
import Modal from '../../components/Modal';
import ProfileModal from '../../components/ProfileModal';
import StockMovementsModal from '../../components/StockMovementsModal';
import { useAuth } from '../../contexts/AuthContext';
import { useProductSummary, useProductMutations } from '../../hooks/useProducts';
import { useCategories, useCategoryMutations } from '../../hooks/useCategories';
import { useDebtorMutations } from '../../hooks/useDebtors';
import './style.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);

  const [categoryName, setCategoryName] = useState('');
  const [newDebtorClient, setNewDebtorClient] = useState('');
  const [newDebtorDescription, setNewDebtorDescription] = useState('');
  const [newDebtorValue, setNewDebtorValue] = useState('');

  // Busca apenas o sumário no topo do Dashboard; categorias só são buscadas aqui se abrir o modal de novo produto
  const {
    data: summary = { totalProduct: 0, lowStock: 0, noStock: 0, totalStockValue: 0, totalSaleValue: 0 },
  } = useProductSummary();
  const { data: categories = [] } = useCategories({ enabled: activeModal === 'addProduct' });

  const { addCategoryMutation } = useCategoryMutations({
    onAddSuccess: () => {
      setCategoryName('');
      setActiveModal(null);
    },
  });

  const { addProductMutation } = useProductMutations({
    onAddSuccess: () => {
      setActiveModal(null);
    },
  });

  const { addDebtorMutation } = useDebtorMutations({
    onAddSuccess: () => {
      setActiveModal(null);
      setNewDebtorClient('');
      setNewDebtorDescription('');
      setNewDebtorValue('');
    },
  });

  const handleOpenModal = (modalName) => {
    setActiveModal(modalName);
    setMenuOpen(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <header>
        <div className="logo-container">
          <div className="logo">
            <div className="package">
              <Package color="white" size={33} />
            </div>
            <div className="logo-text">
              <h1>Gerenciamento de Estoque</h1>
              <p>Sistema de controle de produtos e inventário</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="header-action-btn"
              onClick={() => setIsMovementsOpen(true)}
              title="Histórico de movimentações"
            >
              <History size={18} />
              <span>Histórico</span>
            </button>
            <button
              type="button"
              className="header-action-btn"
              onClick={() => setIsProfileOpen(true)}
              title="Meu Perfil"
            >
              <User size={18} />
              <span>{user?.name || 'Perfil'}</span>
            </button>
            <button type="button" className="logout-button" onClick={handleLogout} title="Sair do sistema">
              <LogOut color="black" />
            </button>
          </div>
        </div>

        <div className="stats-group">
          <div className="stat-card">
            <div>
              <p>Total de Produtos</p>
              <span>{summary.totalProduct}</span>
            </div>
            <div className="icon-wrapper blue">
              <Package size={28} />
            </div>
          </div>
          <div className="stat-card">
            <div>
              <p>Estoque Baixo</p>
              <span className="yellow-text">{summary.lowStock}</span>
            </div>
            <div className="icon-wrapper yellow">
              <CircleAlert size={28} />
            </div>
          </div>
          <div className="stat-card">
            <div>
              <p>Sem Estoque</p>
              <span className="red-text">{summary.noStock}</span>
            </div>
            <div className="icon-wrapper red">
              <X size={28} />
            </div>
          </div>
          <div className="stat-card">
            <div>
              <p>Valor em Estoque</p>
              <span className="green-text">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  summary.totalSaleValue ?? 0
                )}
              </span>
              <small className="stat-card-subvalue">
                Custo:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  summary.totalStockValue ?? 0
                )}
              </small>
            </div>
            <div className="icon-wrapper green">
              <CircleDollarSign size={28} />
            </div>
          </div>
        </div>
      </header>

      <main>
        <nav>
          <div className="navigate-container">
            <NavLink to="/dashboard/categories" className="navigate-button">
              <Tag size={17} />
              Categorias
            </NavLink>
            <NavLink to="/dashboard/stock" className="navigate-button">
              <Package size={17} />
              Estoque
            </NavLink>
            <NavLink to="/dashboard/debtors" className="navigate-button">
              <CircleDollarSign size={17} />
              Caderneta
            </NavLink>
          </div>
        </nav>

        <div className="content-area">
          <Outlet />

          <div className="fab-container">
            {isMenuOpen && (
              <div className="fab-options">
                <button type="button" onClick={() => handleOpenModal('addCategory')}>
                  Cadastro de categorias
                  <div className="fab-icon-wrapper">
                    <Tag size={20} />
                  </div>
                </button>
                <button type="button" onClick={() => handleOpenModal('addProduct')}>
                  Cadastro de estoque
                  <div className="fab-icon-wrapper">
                    <Package size={20} />
                  </div>
                </button>
                <button type="button" onClick={() => handleOpenModal('addPayment')}>
                  Cadastro de pendentes
                  <div className="fab-icon-wrapper">
                    <CircleDollarSign size={20} />
                  </div>
                </button>
              </div>
            )}
            <button
              type="button"
              className="fab-button"
              onClick={() => setMenuOpen(!isMenuOpen)}
              aria-label="Abrir menu de cadastro rápido"
            >
              <Plus size={25} />
            </button>
          </div>

          <Modal isOpen={activeModal === 'addCategory'} onClose={handleCloseModal}>
            <form
              className="add-container"
              onSubmit={(e) => {
                e.preventDefault();
                addCategoryMutation.mutate(categoryName);
              }}
            >
              <h2>Cadastro de categorias</h2>
              <div className="add-inputs-wrapper">
                <label htmlFor="new-category-name">Nome da categoria*</label>
                <input
                  id="new-category-name"
                  type="text"
                  placeholder="Ex: Refrigerantes, Biscoitos, Higiene..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>
              <button className="add-button" type="submit" disabled={addCategoryMutation.isPending}>
                <Tag size={20} />
                {addCategoryMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </Modal>

          <Modal isOpen={activeModal === 'addProduct'} onClose={handleCloseModal}>
            <AddProductForm
              categories={categories}
              onSave={(productData) => addProductMutation.mutateAsync(productData)}
            />
          </Modal>

          <Modal isOpen={activeModal === 'addPayment'} onClose={handleCloseModal}>
            <form
              className="add-container"
              onSubmit={(e) => {
                e.preventDefault();
                addDebtorMutation.mutate({
                  name: newDebtorClient,
                  description: newDebtorDescription,
                  value: parseFloat(newDebtorValue),
                });
              }}
            >
              <h2>Cadastro de pagamentos pendentes</h2>
              <div className="add-inputs-wrapper">
                <label htmlFor="new-debtor-client">Nome do cliente*</label>
                <input
                  id="new-debtor-client"
                  type="text"
                  placeholder="Ex: Maria"
                  value={newDebtorClient}
                  onChange={(e) => setNewDebtorClient(e.target.value)}
                  required
                />
              </div>
              <div className="add-inputs-wrapper">
                <label htmlFor="new-debtor-description">Descrição</label>
                <input
                  id="new-debtor-description"
                  type="text"
                  placeholder="Ex: 1 Coca Cola 1L, 4 Biscoitos Amori..."
                  value={newDebtorDescription}
                  onChange={(e) => setNewDebtorDescription(e.target.value)}
                />
              </div>
              <div className="add-inputs-wrapper">
                <label htmlFor="new-debtor-value">Valor*</label>
                <input
                  id="new-debtor-value"
                  type="number"
                  placeholder="Valor maior ou igual a 0"
                  value={newDebtorValue}
                  onChange={(e) => setNewDebtorValue(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <button className="add-button" type="submit" disabled={addDebtorMutation.isPending}>
                <CircleDollarSign size={20} />
                {addDebtorMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </Modal>

          <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          <StockMovementsModal isOpen={isMovementsOpen} onClose={() => setIsMovementsOpen(false)} />
        </div>
      </main>
    </div>
  );
}
