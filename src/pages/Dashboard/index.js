import { React, useState, useEffect } from 'react';
import { Package, LogOut, CircleAlert, X, CircleDollarSign, Plus, Tag } from "lucide-react";
import { NavLink, Outlet } from 'react-router-dom';
import EditProductModal from '../../components/EditProductModal';
import EditDebtorModal from '../../components/EditDebtorModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EditCategoryModal from '../../components/EditCategoryModal';
import AddProductForm from '../../components/AddProductForm';
import Modal from '../../components/Modal';
import useDebounce from '../../hooks/useDebounce';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api';
import './style.css';



export default function Dashboard() {
    // Estados das Listas e Carregamento de produtos
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState({ totalProduct: 0, lowStock: 0, noStock: 0 });
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [editingCategory, setEditingCategory] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Estados das Listas e Carregamento de devedores
    const [debtors, setDebtors] = useState([]);
    const [debtorSummary, setDebtorSummary] = useState({ totalValue: 0, totalDebtors: 0 });
    const [debtorSearchTerm, setDebtorSearchTerm] = useState('');
    const debouncedDebtorSearchTerm = useDebounce(debtorSearchTerm, 500); // Debounce para devedores

    // Estados dos Modais de Edição
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingDebtor, setEditingDebtor] = useState(null);

    // Estados dos Modais de Adição e Menu Flutuante
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);

    // Estado do Modal de Confirmação
    const [confirmationProps, setConfirmationProps] = useState({ isOpen: false });

    // Estados dos Formulários de Adição de produtos
    const [category, setCategory] = useState('');

    // Estados dos Formulários de Adição de produtos
    const [newDebtorClient, setNewDebtorClient] = useState('');
    const [newDebtorDescription, setNewDebtorDescription] = useState('');
    const [newDebtorValue, setNewDebtorValue] = useState('');

    // Hooks e Constantes
    const token = localStorage.getItem('accessToken');

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

            let productsPromise;

            if (debouncedSearchTerm) {
                const productParams = new URLSearchParams({ name: debouncedSearchTerm });
                productsPromise = api.get(`/product/pesquisar?${productParams.toString()}`, authHeaders);
            } else {
                switch (stockFilter) {
                    case 'low':
                        productsPromise = api.get('/product/lowStock', authHeaders);
                        break;
                    case 'out_of_stock':
                        productsPromise = api.get('/product/noStock', authHeaders);
                        break;
                    case 'all':
                    default:
                        productsPromise = api.get('/product', authHeaders);
                        break;
                }
            }

            const debtorParams = new URLSearchParams();
            if (debouncedDebtorSearchTerm) {
                debtorParams.append('name', debouncedDebtorSearchTerm);
            }
            const debtorsPromise = api.get(`/debtor/pesquisar?${debtorParams.toString()}`, authHeaders);

            const [
                productsResponse,
                categoriesResponse,
                summaryResponse,
                debtorsResponse,
            ] = await Promise.all([
                productsPromise,
                api.get('/category', authHeaders),
                api.get('/product/summary', authHeaders),
                debtorsPromise,
            ]);

            let finalProducts = productsResponse.data.content || productsResponse.data || [];

            setProducts(finalProducts);
            setCategories(categoriesResponse.data);
            setSummary(summaryResponse.data);
            setDebtors(debtorsResponse.data.debtorDTOList || []);
            setDebtorSummary(debtorsResponse.data.summaryDebtorsDTO || { totalValue: 0, totalDebtors: 0 });

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchInitialData();
        }
    }, [debouncedSearchTerm, stockFilter, debouncedDebtorSearchTerm, token]);

    const handleOpenModal = (modalName) => {
        setActiveModal(modalName);
        setMenuOpen(false);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
    };

    const handleCloseEditModal = () => {
        setEditingProduct(null);
    };

    const handleOpenEditDebtorModal = (debtor) => {
        setEditingDebtor(debtor);
    };

    const handleCloseModals = () => {
        setEditingProduct(null);
        setEditingDebtor(null);
    };

    const handleCloseConfirmation = () => {
        setConfirmationProps({ isOpen: false });
    };

    const newCategory = async (e) => {
        e.preventDefault();
        const data = { name: category };
        try {
            await api.post('category', data, { headers: { Authorization: `Bearer ${token}` } });
            setCategory('');
            fetchInitialData();
            handleCloseModal();
            toast.success("Categoria adicionada com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao adicionar categoria.";
            toast.error(errorMessage);
            console.error("Erro ao adicionar categoria:", errorMessage);
        }
    };

    const handleOpenEditCategoryModal = (category) => {
        setEditingCategory(category);
    };

    const handleUpdateCategory = async (updatedCategory) => {
        try {
            await api.put(`/category/${updatedCategory.id}`, updatedCategory, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            setEditingCategory(null);
            toast.success("Categoria atualizada com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao atulizar categoria.";
            toast.error(errorMessage);
            console.error("Erro ao atualizar categoria:", errorMessage);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await api.delete(`/category/${categoryId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            handleCloseConfirmation();
            toast.success("Categoria deletada com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao deletar categoria.";
            toast.error(errorMessage);
            console.error("Erro ao deletar categoria:", errorMessage);
        }
    };

    const requestDeleteCategoryConfirmation = (category) => {
        setConfirmationProps({
            isOpen: true,
            title: 'Confirmar Exclusão',
            message: `Tem certeza que deseja deletar a categoria "${category.name}"?`,
            onConfirm: () => handleDeleteCategory(category.id),
        });
    };

    const handleAddProduct = async (productData) => {
        try {
            await api.post('/product', productData, { headers: { Authorization: `Bearer ${token}` } });

            fetchInitialData();

            handleCloseModal();
            toast.success("Produto adicionado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao adicionar produto.";
            toast.error(errorMessage);
            console.error("Erro ao adicionar produto:", errorMessage);
        }
    };

    const handleUpdateProduct = async (updatedProduct) => {
        try {
            await api.put(`/product/${updatedProduct.id}`, updatedProduct, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            handleCloseEditModal();
            toast.success("Produto atualizado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao atualizar produto.";
            toast.error(errorMessage);
            console.error("Erro ao atualizar produto:", errorMessage);
        }
    };

    const handleQuantityChange = async (productId, amount) => {
        const productToUpdate = products.find(p => p.id === productId);
        if (!productToUpdate) return;

        const newQuantity = productToUpdate.qtd + amount;
        if (newQuantity < 0) return;

        const updatedProduct = { ...productToUpdate, qtd: newQuantity };

        try {
            await api.put(`/product/${productId}`, updatedProduct, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
        } catch (error) {
            console.error("Erro ao alterar quantidade:", error);
            toast("Erro ao alterar quantidade");
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await api.delete(`/product/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            handleCloseConfirmation();
            handleCloseEditModal();
            toast.success("Produto deletado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao deletar produto.";
            toast.error(errorMessage);
            console.error("Erro ao deletar produto:", errorMessage);
        }
    };

    const requestDeleteConfirmation = (product) => {
        setConfirmationProps({
            isOpen: true,
            title: 'Confirmar Exclusão',
            message: `Tem certeza que deseja deletar o produto "${product.name}"? Esta ação não pode ser desfeita.`,
            onConfirm: () => handleDeleteProduct(product.id),
        });
    };

    //Debtors

    const handleAddDebtor = async (e) => {
        e.preventDefault();
        const data = {
            name: newDebtorClient,
            description: newDebtorDescription,
            value: parseFloat(newDebtorValue)
        };
        try {
            await api.post('/debtor', data, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            handleCloseModal();
            setNewDebtorClient('');
            setNewDebtorDescription('');
            setNewDebtorValue('');
            toast.success("Pagamaneto pendente adicionado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao adicionar pagamento pendente.";
            toast.error(errorMessage);
            console.error("Erro ao adicionar pagamento pendente:", errorMessage);
        }
    };

    const handleUpdateDebtor = async (updatedDebtor) => {
        try {
            await api.put(`/debtor/${updatedDebtor.id}`, updatedDebtor, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            setEditingDebtor(null);
            toast.success("Devedor atualizado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao atualizar devedor.";
            toast.error(errorMessage);
            console.error("Erro ao atualizar devedor:", errorMessage);
        }
    };


    const handleMarkAsPaid = async (debtorId) => {
        try {
            await api.delete(`/debtor/${debtorId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchInitialData();
            handleCloseConfirmation();
            toast.success("Pagamento debitado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Falha ao debitar pagamento.";
            toast.error(errorMessage);
            console.error("Erro ao debitar pagamento:", errorMessage);
        }
    };
    const requestMarkAsPaidConfirmation = (debtor) => {
        setConfirmationProps({
            isOpen: true,
            title: 'Confirmar Pagamento',
            message: `Você confirma o recebimento de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtor.value)} de ${debtor.name}?`,
            onConfirm: () => handleMarkAsPaid(debtor.id),
            confirmButtonClass: 'confirm-button-paid'
        });
    };



    // Renderização
    return (
        <div className="dashboard-container">
            <ToastContainer
                position="top-right"
                autoClose={5000} // Fecha após 5 segundos
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
                </div>
            </header>
            <main>
                <nav>
                    <div className="navigate-container">
                        <NavLink to='/dashboard/categories' className="navigate-button"><CircleDollarSign size={17} />Categorias</NavLink>
                        <NavLink to='/dashboard/stock' className="navigate-button"><Package size={17} />Estoque</NavLink>
                        <NavLink to='/dashboard/debtors' className="navigate-button"><CircleDollarSign size={17} />Caderneta</NavLink>

                    </div>
                </nav>
                <div className="content-area">
                    <Outlet context={{
                        products,
                        searchTerm,
                        setSearchTerm,
                        onEditProduct: handleOpenEditModal,
                        onQuantityChange: handleQuantityChange,
                        onAddProduct: handleAddProduct,
                        onDeleteProduct: requestDeleteConfirmation,
                        categories,
                        onEditCategory: handleOpenEditCategoryModal,
                        onDeleteCategory: requestDeleteCategoryConfirmation,
                        debtors,
                        debtorSummary: debtorSummary,
                        debtorSearchTerm,
                        setDebtorSearchTerm,
                        onEditDebtor: handleOpenEditDebtorModal,
                        onRequestMarkAsPaid: requestMarkAsPaidConfirmation,
                        stockFilter,
                        setStockFilter
                    }} />

                    {editingProduct && (
                        <EditProductModal
                            product={editingProduct}
                            categories={categories}
                            onSave={handleUpdateProduct}
                            onClose={handleCloseEditModal}
                            onDeleteRequest={requestDeleteConfirmation}
                        />
                    )}

                    <ConfirmationModal
                        isOpen={confirmationProps.isOpen}
                        onClose={handleCloseConfirmation}
                        onConfirm={confirmationProps.onConfirm}
                        title={confirmationProps.title}
                        confirmButtonClass={confirmationProps.confirmButtonClass}
                    >
                        {confirmationProps.message}
                    </ConfirmationModal>

                    {editingDebtor && (
                        <EditDebtorModal
                            debtor={editingDebtor}
                            onSave={handleUpdateDebtor}
                            onClose={handleCloseModals}
                        />
                    )}

                    {editingCategory && (
                        <EditCategoryModal
                            category={editingCategory}
                            onSave={handleUpdateCategory}
                            onClose={() => setEditingCategory(null)}
                        />
                    )}

                    <div className="fab-container">
                        {isMenuOpen && (
                            <div className="fab-options">
                                <button onClick={() => handleOpenModal('addCategory')}>
                                    Cadastro de categorias
                                    <div className="fab-icon-wrapper"><Tag size={20} /></div>
                                </button>
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

                    <Modal isOpen={activeModal === 'addCategory'} onClose={handleCloseModal}>
                        <form className='add-container' onSubmit={newCategory}>
                            <h2>Cadastro de categorias</h2>
                            <div className="add-inputs-wrapper">
                                <label>Nome da categoria*</label>
                                <input type="text" placeholder='Ex: Refrigerantes, Biscoitos, Higiene...' value={category} onChange={e => setCategory(e.target.value)} required />
                            </div>
                            <button className='add-button' type='submit'>
                                <Tag size={20} />
                                Cadastrar
                            </button>
                        </form>
                    </Modal>

                    <Modal isOpen={activeModal === 'addProduct'} onClose={handleCloseModal}>
                        <AddProductForm categories={categories} onSave={handleAddProduct} />
                    </Modal>

                    <Modal isOpen={activeModal === 'addPayment'} onClose={handleCloseModal}>
                        <form className='add-container' onSubmit={handleAddDebtor}>
                            <h2>Cadastro de pagamentos pendentes</h2>
                            <div className="add-inputs-wrapper">
                                <label>Nome do cliente*</label>
                                <input type="text" placeholder='Ex: Maria' value={newDebtorClient} onChange={e => setNewDebtorClient(e.target.value)} required />
                            </div>
                            <div className="add-inputs-wrapper">
                                <label>Descrição</label>
                                <input type="text" placeholder='Ex: 1 Coca Cola 1L, 4 Biscoitos Amori...' value={newDebtorDescription} onChange={e => setNewDebtorDescription(e.target.value)} required />
                            </div>
                            <div className="add-inputs-wrapper">
                                <label>Valor*</label>
                                <input type="number" placeholder='Valor maior ou igual a 0' value={newDebtorValue} onChange={e => setNewDebtorValue(e.target.value)} required min="0" step="0.01" />
                            </div>
                            <button className='add-button' type='submit'>
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