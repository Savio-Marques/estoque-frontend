import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Banknote, UsersRound, SquarePen, CircleCheck } from "lucide-react";
import './style_mobile.css';

export default function Debtors(){

    const { debtors } = useOutletContext();
    
    return(
        <div className='debtors'>
            <div className="debtors-container">
                <div className="stats-group-debtors">
                    <div className="stat-card-debtors">
                        <div>
                            <p>Valor total</p>
                            <span>R$ 365,34</span>
                        </div>
                        <div className="">
                            <Banknote color='blue' size={28} />
                        </div>
                    </div>
                    <div className="stat-card-debtors">
                        <div>
                            <p>Clientes pendentes</p>
                            <span>6</span>
                        </div>
                        <div className="">
                            <UsersRound color='orange' size={28} />
                        </div>
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
                    {debtors.map(debtor => (
                        <tr key={debtor.id}>
                            <td data-label="Cliente" className='col-table-name'><strong>{debtor.client}</strong></td>
                            <td data-label="Descrição" className='col-table-description'>{debtor.description}</td>
                            <td data-label="Valor" className='col-table-value'><strong>{`R$ ${debtor.value.toFixed(2).replace('.', ',')}`}</strong></td>
                            <td data-label="Data de entrada" className='col-table-date'>{debtor.dueDate}</td>
                            <td data-label="Ações" className='col-table-action'>
                                <span className='debtors-table-icon-wrapper'>
                                    <span className='debtors-table-pencil'><SquarePen size={17}/> Editar</span>
                                    <span className='debtors-table-check'><CircleCheck size={17}/> Pago</span>
                                </span>
                            </td>        
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>
            </div>
        </div>
    );
}