import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Banknote, UsersRound, SquarePen, CircleCheck } from "lucide-react";
import './style.css';

export default function Debtors(){

 const { 
        debtors = [], 
        debtorSummary = { totalValue: 0, totalDebtors: 0 }, 
        onEditDebtor, 
        onRequestMarkAsPaid,
        debtorSearchTerm,
        setDebtorSearchTerm,
    } = useOutletContext() || {};
        
    return(
        <div className='debtors'>
            <div className="debtors-container">
                <div className="stats-group-debtors">
                    <div className="stat-card-debtors">
                        <div>
                            <p>Valor total</p>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtorSummary.totalValue)}</span>
                        </div>
                        <div className="">
                            <Banknote color='blue' size={28} />
                        </div>
                    </div>
                    <div className="stat-card-debtors">
                        <div>
                            <p>Clientes pendentes</p>
                            <span>{debtorSummary.totalDebtors}</span>
                        </div>
                        <div className="">
                            <UsersRound color='orange' size={28} />
                        </div>
                    </div>
                </div>
            <div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Pesquisar clientes..."
                    value={debtorSearchTerm}
                    onChange={(e) => setDebtorSearchTerm(e.target.value)}
                />
            </div>  
            </div>  
            <div className="debtors-list">
                <div className='debtors-list-title'>
                    <h3>Pagamentos pendentes</h3>
                    <p>Lista de clientes com pagamentos em aberto</p>
                </div>
                <table className='debtors-list-table'>
                    <thead>
                        <tr>
                            <th className='col-table-name'>Cliente</th>
                            <th className='col-table-description'>Descrição</th>
                            <th className='col-table-value'>Valor</th>
                            <th className='col-table-date'>Data de entrada</th>
                            <th className='col-table-action'>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                            {debtors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhum pagamento pendente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                debtors.map(debtor => (
                                    <tr key={debtor.id}>
                                        <td data-label="Cliente" className='col-table-name'><strong>{debtor.name}</strong></td>
                                        <td data-label="Descrição" className='col-table-description'>{debtor.description}</td>
                                        <td data-label="Valor" className='col-table-value'><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debtor.value)}</strong></td>
                                        <td data-label="Data de entrada" className='col-table-date'>{new Date(debtor.date).toLocaleDateString('pt-BR')}</td>
                                        <td data-label="Ações" className='col-table-action'>
                                            <span className='debtors-table-icon-wrapper'>
                                                <button className='debtors-table-pencil' onClick={() => onEditDebtor(debtor)}><SquarePen size={17}/> Editar</button>
                                                <button className='debtors-table-check' onClick={() => onRequestMarkAsPaid(debtor)}><CircleCheck size={17}/> Pago</button>
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                </table>

            </div>
            </div>
        </div>
    );
}